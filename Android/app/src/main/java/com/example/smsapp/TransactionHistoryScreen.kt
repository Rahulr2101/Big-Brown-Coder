package com.example.smsapp

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.launch
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.*

class TransactionViewModel(private val dao: TransactionDao) : ViewModel() {
    val allTransactions = dao.getAllTransactions()

    fun clearAllTransactions() {
        viewModelScope.launch {
            dao.deleteAll()
        }
    }
}

class TransactionViewModelFactory(private val dao: TransactionDao) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(TransactionViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return TransactionViewModel(dao) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TransactionHistoryScreen(
    onBack: () -> Unit,
    viewModel: TransactionViewModel = viewModel(
        factory = TransactionViewModelFactory(
            AppDatabase.getDatabase(LocalContext.current).transactionDao()
        )
    )
) {
    val transactions by viewModel.allTransactions.collectAsState(initial = emptyList())
    var showDeleteConfirmation by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Transaction History") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { showDeleteConfirmation = true }) {
                        Icon(Icons.Default.Delete, contentDescription = "Clear transactions")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (transactions.isEmpty()) {
                Text(
                    text = "No transactions yet.\nSend an SMS with financial information to test.",
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                        .wrapContentSize(Alignment.Center)
                )
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(vertical = 8.dp)
                ) {
                    items(transactions) { transaction ->
                        TransactionItem(transaction)
                        Divider(modifier = Modifier.padding(horizontal = 16.dp))
                    }
                }
            }

            if (showDeleteConfirmation) {
                AlertDialog(
                    onDismissRequest = { showDeleteConfirmation = false },
                    title = { Text("Clear transactions") },
                    text = { Text("Are you sure you want to delete all transactions?") },
                    confirmButton = {
                        Button(
                            onClick = {
                                viewModel.clearAllTransactions()
                                showDeleteConfirmation = false
                            }
                        ) {
                            Text("Delete All")
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showDeleteConfirmation = false }) {
                            Text("Cancel")
                        }
                    }
                )
            }
        }
    }
}


@Composable
fun TransactionItem(transaction: TransactionEntity) {
    val currencyFormat = NumberFormat.getCurrencyInstance()
    val dateFormat = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        transaction.transactor?.let {
            Text(
                text = it,
                fontWeight = FontWeight.Bold,
                style = MaterialTheme.typography.titleMedium
            )
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Amount: ${currencyFormat.format(transaction.creditAmount - transaction.debitAmount)}",
            style = MaterialTheme.typography.bodyMedium
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Location: ${transaction.latitude}, ${transaction.longitude}",
            style = MaterialTheme.typography.bodySmall
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = "Time: ${dateFormat.format(Date(transaction.timestamp))}",
            style = MaterialTheme.typography.bodySmall
        )
    }
}