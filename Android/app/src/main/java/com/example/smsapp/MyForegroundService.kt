package com.example.smsapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.database.ContentObserver
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.provider.Telephony
import android.util.Log
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.google.android.gms.location.LocationServices
import com.google.firebase.firestore.FirebaseFirestore
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import android.content.pm.PackageManager

class MyForegroundService : Service() {
    private val db = FirebaseFirestore.getInstance()
    private val CHANNEL_ID = "ExpenseTrackerServiceChannel"
    private val CONFIRM_CHANNEL_ID = "TransactionConfirmChannel"
    private lateinit var confirmationReceiver: ConfirmationReceiver
    private val TAG = "MyForegroundService"
    private var smsObserver: SmsContentObserver? = null

    companion object {
        const val ACTION_CONFIRM_YES = "com.example.smsapp.CONFIRM_YES"
        const val ACTION_CONFIRM_NO = "com.example.smsapp.CONFIRM_NO"
        const val EXTRA_TRANSACTION_DATA = "transaction_data"
    }

    override fun onCreate() {
        super.onCreate()
        confirmationReceiver = ConfirmationReceiver()
        val confirmFilter = IntentFilter().apply {
            addAction(ACTION_CONFIRM_YES)
            addAction(ACTION_CONFIRM_NO)
        }
        ContextCompat.registerReceiver(
            this,
            confirmationReceiver,
            confirmFilter,
            ContextCompat.RECEIVER_NOT_EXPORTED
        )
        smsObserver = SmsContentObserver(Handler(mainLooper))
        contentResolver.registerContentObserver(
            Telephony.Sms.CONTENT_URI,
            true,
            smsObserver!!
        )
        Log.d(TAG, "Service created and observer registered")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.d(TAG, "onStartCommand called")
        createNotificationChannel()
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Expense Tracker")
            .setContentText("Monitoring SMS messages for transactions")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentIntent(pendingIntent)
            .build()

        startForeground(1, notification)
        Log.d(TAG, "Service started in foreground")
        return START_STICKY
    }

    override fun onDestroy() {
        smsObserver?.let { contentResolver.unregisterContentObserver(it) }
        unregisterReceiver(confirmationReceiver)
        Log.d(TAG, "Service destroyed and observer unregistered")
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Expense Tracker Service Channel",
                NotificationManager.IMPORTANCE_DEFAULT
            )
            val confirmChannel = NotificationChannel(
                CONFIRM_CHANNEL_ID,
                "Transaction Confirmation Channel",
                NotificationManager.IMPORTANCE_HIGH
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
            manager.createNotificationChannel(confirmChannel)
        }
    }

    private fun showConfirmationNotification(data: TransactionData) {
        val yesIntent = Intent(ACTION_CONFIRM_YES).apply {
            putExtra(EXTRA_TRANSACTION_DATA, Gson().toJson(data))
        }
        val noIntent = Intent(ACTION_CONFIRM_NO).apply {
            putExtra(EXTRA_TRANSACTION_DATA, Gson().toJson(data))
        }

        val yesPendingIntent = PendingIntent.getBroadcast(
            this, data.timestamp.toInt(), yesIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val noPendingIntent = PendingIntent.getBroadcast(
            this, data.timestamp.toInt() + 1, noIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, CONFIRM_CHANNEL_ID)
            .setContentTitle("Confirm Transaction")
            .setContentText("Did you spend ${data.creditAmount} to ${data.transactor} at ${data.transactor} here?")
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .addAction(NotificationCompat.Action(null, "Yes", yesPendingIntent))
            .addAction(NotificationCompat.Action(null, "No", noPendingIntent))
            .setAutoCancel(true)
            .build()

        val manager = getSystemService(NotificationManager::class.java)
        Log.d(TAG, "Showing confirmation notification for: $data")
        manager.notify(data.timestamp.toInt(), notification)
    }

    private inner class SmsContentObserver(handler: Handler) : ContentObserver(handler) {
        override fun onChange(selfChange: Boolean) {
            super.onChange(selfChange)
            Log.d(TAG, "SMS content changed")
            val cursor = contentResolver.query(
                Telephony.Sms.Inbox.CONTENT_URI,
                arrayOf(Telephony.Sms.BODY, Telephony.Sms.ADDRESS),
                null,
                null,
                Telephony.Sms.DEFAULT_SORT_ORDER + " LIMIT 1"
            )
            cursor?.use {
                if (it.moveToFirst()) {
                    val message = it.getString(it.getColumnIndexOrThrow(Telephony.Sms.BODY))
                    val sender = it.getString(it.getColumnIndexOrThrow(Telephony.Sms.ADDRESS)) ?: "Unknown"
                    Log.d(TAG, "Latest SMS from $sender: $message")

                    CoroutineScope(Dispatchers.IO + SupervisorJob()).launch {
                        Log.d(TAG, "Starting AI transaction parsing")
                        val transaction = AITransactionParser().extractTransactionDetails(message)
                        if (transaction != null && (transaction.debitAmount > 0.0 || transaction.creditAmount > 0.0)) {
                            Log.d(TAG, "Transaction detected: $transaction")
                            getLocationAndSave(this@MyForegroundService, transaction, sender)
                        } else {
                            Log.d(TAG, "No valid transaction detected")
                        }
                    }
                }
            }
        }
    }

    private fun getLocationAndSave(context: Context, transaction: Transaction, sender: String) {
        Log.d(TAG, "Getting location for transaction")
        val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)

        val locationPermissionStatus = ActivityCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_FINE_LOCATION)
        val isLocationGranted = locationPermissionStatus == PackageManager.PERMISSION_GRANTED
        Log.d(TAG, "ACCESS_FINE_LOCATION permission status: ${if (isLocationGranted) "GRANTED" else "DENIED"}")

        if (!isLocationGranted) {
            Log.w(TAG, "Location permission not granted - falling back to zero location")
            fallbackToZeroLocation(transaction, sender)
            return
        }

        Log.d(TAG, "Requesting last known location...")
        fusedLocationClient.lastLocation
            .addOnSuccessListener { location ->
                if (location != null) {
                    Log.d(TAG, "Last known location retrieved: Latitude=${location.latitude}, Longitude=${location.longitude}")
                    val data = TransactionData(
                        transactor = transaction.transactor,
                        creditAmount = transaction.creditAmount,
                        debitAmount = transaction.debitAmount,
                        latitude = location.latitude,
                        longitude = location.longitude,
                        timestamp = System.currentTimeMillis(),
                        sender = sender
                    )
                    // Send to Firestore immediately
                    saveToFirestore(data)
                    // Show confirmation notification (no longer tied to Firestore save)
                    showConfirmationNotification(data)
                } else {
                    Log.w(TAG, "Last known location was null - falling back to zero location")
                    fallbackToZeroLocation(transaction, sender)
                }
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "Failed to get last location: ${e.message} - falling back to zero location")
                fallbackToZeroLocation(transaction, sender)
            }
    }

    private fun fallbackToZeroLocation(transaction: Transaction, sender: String) {
        Log.w(TAG, "Falling back to zero location")
        val data = TransactionData(
            latitude = 0.0,
            longitude = 0.0,
            timestamp = System.currentTimeMillis(),
            sender = sender,
            creditAmount = transaction.creditAmount,
            debitAmount = transaction.debitAmount,
            transactor = transaction.transactor
        )
        // Send to Firestore immediately
        saveToFirestore(data)
        // Show confirmation notification (no longer tied to Firestore save)
        showConfirmationNotification(data)
    }

    private fun saveToFirestore(data: TransactionData) {
        val transactionMap = hashMapOf(
            "latitude" to data.latitude,
            "longitude" to data.longitude,
            "timestamp" to data.timestamp,
            "sender" to data.sender,
            "transactor" to data.transactor,
            "creditAmount" to data.creditAmount,
            "debitAmount" to data.debitAmount
        )

        db.collection("transactions")
            .add(transactionMap)
            .addOnSuccessListener { documentReference ->
                Log.d(TAG, "Transaction saved to Firestore with ID: ${documentReference.id}")
            }
            .addOnFailureListener { e ->
                Log.e(TAG, "Error saving transaction to Firestore", e)
            }
    }

    private fun saveToLocalDatabase(data: TransactionData) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val dbLocal = AppDatabase.getDatabase(this@MyForegroundService)
                dbLocal.transactionDao().insert(
                    TransactionEntity(
                        latitude = data.latitude,
                        longitude = data.longitude,
                        timestamp = data.timestamp,
                        sender = data.sender,
                        transactor = data.transactor,
                        creditAmount = data.creditAmount,
                        debitAmount = data.debitAmount
                    )
                )
                Log.d(TAG, "Transaction saved to local database: $data")
            } catch (e: Exception) {
                Log.e(TAG, "Error saving transaction to local database: ${e.message}", e)
            }
        }
    }

    private inner class ConfirmationReceiver : android.content.BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            Log.d(TAG, "ConfirmationReceiver onReceive triggered with action: ${intent.action}")
            val dataJson = intent.getStringExtra(EXTRA_TRANSACTION_DATA)
            if (dataJson == null) {
                Log.e(TAG, "No transaction data in intent")
                return
            }
            val data = try {
                Gson().fromJson(dataJson, TransactionData::class.java)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to parse transaction data: ${e.message}, JSON: $dataJson")
                return
            }

            when (intent.action) {
                ACTION_CONFIRM_YES -> {
                    Log.d(TAG, "User confirmed transaction: $data")
                    // Save to local database upon confirmation
                    saveToLocalDatabase(data)
                }
                ACTION_CONFIRM_NO -> {
                    Log.d(TAG, "User rejected transaction, prompting for new vendor")
                    val dialogIntent = Intent(context, EditTransactionActivity::class.java).apply {
                        putExtra(EXTRA_TRANSACTION_DATA, dataJson)
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(dialogIntent)
                }
                else -> Log.w(TAG, "Unknown action received: ${intent.action}")
            }
        }
    }
}


