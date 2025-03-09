package com.example.smsapp

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.annotation.RequiresApi
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import androidx.lifecycle.lifecycleScope
import com.google.firebase.FirebaseApp
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "settings")

class MainActivity : ComponentActivity() {
    private val isTrackingEnabledKey = booleanPreferencesKey("is_tracking_enabled")

    private fun getTrackingStatus(): Flow<Boolean> = dataStore.data
        .map { preferences -> preferences[isTrackingEnabledKey] ?: false }

    @RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestPermissions()
        FirebaseApp.initializeApp(this)

        setContent {
            val isTrackingEnabledFlow = remember { getTrackingStatus() }
            val isTrackingEnabled by isTrackingEnabledFlow.collectAsState(initial = false)

            MaterialTheme {
                ExpenseTrackerApp(
                    isTrackingEnabled = isTrackingEnabled,
                    onToggle = { enabled ->
                        lifecycleScope.launch {
                            dataStore.edit { settings ->
                                settings[isTrackingEnabledKey] = enabled
                            }
                        }
                        if (enabled) {
                            startService()
                            Toast.makeText(this, "Expense tracking started", Toast.LENGTH_SHORT).show()
                        } else {
                            stopService()
                            Toast.makeText(this, "Expense tracking stopped", Toast.LENGTH_SHORT).show()
                        }
                    }
                )
            }
        }
    }

    @RequiresApi(Build.VERSION_CODES.UPSIDE_DOWN_CAKE)
    private fun requestPermissions() {
        val permissions = arrayOf(
            Manifest.permission.RECEIVE_SMS,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.READ_SMS,
        )
        val allPermissions =
            permissions + Manifest.permission.FOREGROUND_SERVICE
        val finalPermissions =
            allPermissions + Manifest.permission.FOREGROUND_SERVICE_LOCATION
        ActivityCompat.requestPermissions(this, finalPermissions, 1)
    }



    private fun hasRequiredPermissions(): Boolean {
        return (ContextCompat.checkSelfPermission(this, Manifest.permission.RECEIVE_SMS) == PackageManager.PERMISSION_GRANTED &&
                ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED && // Ensure this is present
                ContextCompat.checkSelfPermission(this, Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED && // Ensure this is present
                ContextCompat.checkSelfPermission(this, Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED)
    }



    // In MainActivity.kt, modify startService() to check permissions first
    private fun startService() {
        if (hasRequiredPermissions()) {
            val serviceIntent = Intent(this, MyForegroundService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent)
            } else {
                startService(serviceIntent)
            }
        } else {
            Toast.makeText(this, "Required permissions not granted", Toast.LENGTH_SHORT).show()
            // Reset the toggle
            lifecycleScope.launch {
                dataStore.edit { settings ->
                    settings[isTrackingEnabledKey] = false
                }
            }
        }
    }
    private fun stopService() {
        val serviceIntent = Intent(this, MyForegroundService::class.java)
        stopService(serviceIntent)
    }
}

@Composable
fun ExpenseTrackerApp(isTrackingEnabled: Boolean, onToggle: (Boolean) -> Unit) {
    var showTransactionHistory by remember { mutableStateOf(false) }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        if (showTransactionHistory) {
            TransactionHistoryScreen(onBack = { showTransactionHistory = false })
        } else {
            MainScreen(
                isTrackingEnabled = isTrackingEnabled,
                onToggle = onToggle,
                onViewHistory = { showTransactionHistory = true }
            )
        }
    }
}

@Composable
fun MainScreen(
    isTrackingEnabled: Boolean,
    onToggle: (Boolean) -> Unit,
    onViewHistory: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Expense Tracker",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier.padding(bottom = 32.dp)
        )

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Tracking Status",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(vertical = 8.dp)
                ) {
                    Text(
                        text = if (isTrackingEnabled) "Monitoring SMS" else "Tracking Disabled",
                        modifier = Modifier.weight(1f)
                    )
                    Switch(
                        checked = isTrackingEnabled,
                        onCheckedChange = onToggle
                    )
                }
                Text(
                    text = if (isTrackingEnabled)
                        "The app is now monitoring SMS messages for expenses"
                    else
                        "Enable tracking to monitor expenses from SMS",
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))
        Button(onClick = onViewHistory) {
            Text("View Transaction History")
        }
    }
}