package com.example.smsapp

import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.google.gson.Gson
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class EditTransactionActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val dataJson = intent.getStringExtra(MyForegroundService.EXTRA_TRANSACTION_DATA)
        val data = Gson().fromJson(dataJson, TransactionData::class.java)

        setContent {
            MaterialTheme {
                EditTransactionScreen(data) { updatedData ->
                    saveUpdatedTransaction(updatedData)
                    finish()
                }
            }
        }
    }

    private fun saveUpdatedTransaction(data: TransactionData) {
        val db = AppDatabase.getDatabase(this)
        CoroutineScope(Dispatchers.IO).launch {
            try {
                db.transactionDao().insert(
                    TransactionEntity(
                        transactor = data.transactor,  // <-- Corrected to data.transactor
                        creditAmount = data.creditAmount, // <-- Corrected to data.creditAmount
                        debitAmount = data.debitAmount, // <-- Corrected to data.debitAmount
                        latitude = data.latitude,
                        longitude = data.longitude,
                        timestamp = data.timestamp,
                        sender = data.sender
                    )
                )
                Log.d("EditTransactionActivity", "Updated transaction saved: $data")
            } catch (e: Exception) {
                Log.e("EditTransactionActivity", "Error saving updated transaction: ${e.message}")
            }
        }
    }

@Composable
fun EditTransactionScreen(data: TransactionData, onSave: (TransactionData) -> Unit) {
    var newVendor by remember { mutableStateOf("") }

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier
                .padding(16.dp)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Edit Transaction",
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(bottom = 8.dp)
            )
            Text(
                text = "Original: ${data.transactor} for ${data.creditAmount} and ${data.debitAmount}",
                modifier = Modifier.padding(bottom = 8.dp)
            )
            OutlinedTextField(
                value = newVendor,
                onValueChange = { newVendor = it },
                label = { Text("Enter correct vendor") },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 8.dp)
            )
            Button(
                onClick = {
                    if (newVendor.isNotBlank()) {
                        val updatedData = data.copy(transactor = newVendor)
                        onSave(updatedData)
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp)
            ) {
                Text("Save")
            }
        }
    }
}}