package com.example.smsapp

import android.util.Log
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.google.gson.Gson
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AITransactionParser {
    private val TAG = "AITransactionParser"
    private val API_KEY = "AIzaSyBDytDHVXayhz-ZZkNk3jECWFTMu7BE1oE"
    private val model = GenerativeModel("gemini-2.0-flash", API_KEY) // Switched to a known model

    suspend fun extractTransactionDetails(message: String): Transaction? {
        return withContext(Dispatchers.IO) {
            try {
                Log.d(TAG, "Parsing message: $message")
                val prompt = """
    Extract the primary debit or credit transaction details from the SMS and return them in JSON format.

    **Instructions:**
    - Return ONLY a SINGLE valid JSON object, with no markdown, no ```json tags, no extra text.
    - Include "transactor"(string), "debitAmount" (number), and "creditAmount" (number) fields.
    - Detect whether the transaction is a **debit** or **credit**, and:
      - If it’s a debit "debitAmount" is the transaction amount. "creditAmount" should be 0.0.
      - If it’s a credit  "creditAmount" is the transaction amount. "debitAmount" should be 0.0.
    - Focus ONLY on the SENTENCE that describes a COMPLETED debit or credit (e.g., "debited", "credited", "spent", "paid", "withdrawn").
    - Completely IGNORE any sentences about "revoked", "cancelled", "setting up", or "registering" actions.
    - The "amount" must be immediately before or after the keyword in the SAME sentence.
    - Identifying entities:
      - "transactor": The sender or The receiver of the money , identified in a transaction.
      - For a debit, the entity the money was paid *to* is identified by "towards", "at", "to", "for", or "via" in the SAME sentence.
      - For a credit, the entity the money came *from* is identified by "from" or "by" in the SAME sentence.
    - Do NOT mix entities or amounts from different sentences.
    - If no clear transaction is found, use "Unknown" and 0.0.
    
    SMS: "$message"
""".trimIndent()

                Log.d(TAG, "Sending prompt to AI model: $prompt")
                val response = model.generateContent(content { text(prompt) })
                val rawResponse = response.text ?: run {
                    Log.w(TAG, "AI response was null")
                    return@withContext null
                }
                Log.d(TAG, "Raw AI Response: '$rawResponse'")

                // Strip Markdown and extract JSON
                val jsonResponse = rawResponse
                    .replace("```json", "") // Remove opening Markdown
                    .replace("```", "")     // Remove closing Markdown
                    .trim()                 // Remove leading/trailing whitespace

                val transaction = try {
                    Gson().fromJson(jsonResponse, Transaction::class.java)
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to parse JSON: ${e.message}, Cleaned response: '$jsonResponse'")
                    return@withContext null
                }
                Log.d(TAG, "Parsed transaction: $transaction")

                if (transaction.transactor == "Unknown" && transaction.debitAmount == 0.0 && transaction.creditAmount == 0.0) {
                    Log.w(TAG, "No valid transaction found")
                    null
                } else {
                    transaction
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error parsing transaction: ${e.message}", e)
                null
            }
        }
    }
}

data class Transaction(
    val transactor: String? = "Unknown", // Use "transactor" to match AI response, make it nullable and provide default
    val debitAmount: Double = 0.0,       // Use "debitAmount" to match AI response, provide default
    val creditAmount: Double = 0.0      // Use "creditAmount" to match AI response, provide default
) : java.io.Serializable