from flask import Flask, request, jsonify, session
from flask_cors import CORS
import requests
import logging
import time
import re
import json
import os
from llama_cpp import Llama

# Initialize Flask app
app = Flask(__name__)
CORS(app)
app.secret_key = 'your_secret_key_here'  # Required for session management

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("finance_api.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# API Configuration (unchanged)
YAHOO_TICKERS_URL = "https://yahoo-finance15.p.rapidapi.com/api/v2/markets/tickers"
YAHOO_TICKERS_HEADERS = {
    "x-rapidapi-host": "yahoo-finance15.p.rapidapi.com",
    "x-rapidapi-key": "e5dfb69ac4msh7dcab92ff8a5633p1e73d2jsncf8f43e4a966",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "application/json",
    "Accept-Encoding": "identity"
}

REALTIME_QUOTE_URL = "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/quote"
REALTIME_QUOTE_HEADERS = YAHOO_TICKERS_HEADERS

ESG_API_URL_TEMPLATE = "https://yahoo-finance127.p.rapidapi.com/esg-scores/{symbol}"
ESG_API_HEADERS = {
    "x-rapidapi-host": "yahoo-finance127.p.rapidapi.com",
    "x-rapidapi-key": "e5dfb69ac4msh7dcab92ff8a5633p1e73d2jsncf8f43e4a966",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "application/json",
    "Accept-Encoding": "identity"
}

# Model configuration
MODEL_FILENAME = "finance-chat.Q8_0.gguf"

# Initialize Llama model
llama_model = None

# Helper function to initialize Llama model (unchanged)
def initialize_llama(model_path):
    """Initialize the Llama model with GPU support and fallback to CPU."""
    logger.info("Initializing Llama model with GPU support...")
    if not os.path.exists(model_path):
        logger.error(f"Model file not found at {model_path}")
        return None
    
    try:
        model = Llama(
            model_path=model_path,
            n_ctx=4096,
            n_threads=4,
            n_gpu_layers=-1  # Use all layers on GPU
        )
        logger.info("Llama model initialized successfully with GPU support")
        return model
    except Exception as e:
        logger.exception(f"Error initializing Llama model with GPU: {str(e)}")
        logger.info("Falling back to CPU initialization...")
        try:
            model = Llama(
                model_path=model_path,
                n_ctx=4096,
                n_threads=4
            )
            logger.info("Llama model initialized successfully on CPU")
            return model
        except Exception as e2:
            logger.exception(f"Error initializing Llama model on CPU: {str(e2)}")
            return None

# Helper function to manage conversation history
def get_conversation_history():
    """Retrieve the conversation history from the session."""
    if 'conversation_history' not in session:
        session['conversation_history'] = []
    return session['conversation_history']

def update_conversation_history(user_message, bot_response):
    """Update the conversation history with the latest interaction."""
    history = get_conversation_history()
    history.append({"user": user_message, "bot": bot_response})
    session['conversation_history'] = history

def clear_conversation_history():
    """Clear the conversation history."""
    session.pop('conversation_history', None)

# Updated chat_response function to include conversation history
def chat_response(user_message, model_path=MODEL_FILENAME):
    """Generate a response to a user's financial query, considering conversation history."""
    logger.info(f"Processing user query: {user_message}")
    
    # Retrieve conversation history
    conversation_history = get_conversation_history()
    
    # Prepare the prompt with conversation history
    history_prompt = ""
    for entry in conversation_history:
        history_prompt += f"User: {entry['user']}\nBot: {entry['bot']}\n\n"
    
    # Check if query is specifically looking for a symbol
    symbol_match = re.search(r'\b([A-Z]{1,5})\b', user_message)
    target_symbol = symbol_match.group(1) if symbol_match else None
    
    # Prepare data collection
    ticker_summary = ""
    ticker_details = []
    
    if target_symbol:
        logger.info(f"Getting detailed data for target symbol: {target_symbol}")
        realtime_data = get_realtime_quote(target_symbol)
        ticker_data = search_ticker_by_symbol(target_symbol, max_pages=5)
        combined_data = extract_ticker_data(ticker_data, realtime_data)
        
        if combined_data:
            symbol = combined_data.get("symbol", target_symbol)
            ticker_details.append(combined_data)
            
            esg_data = get_esg_data(symbol)
            esg_text = ""
            if esg_data and "totalEsg" in esg_data:
                esg_score = esg_data["totalEsg"].get("fmt", "N/A")
                env_score = esg_data.get("environmentScore", {}).get("fmt", "N/A")
                social_score = esg_data.get("socialScore", {}).get("fmt", "N/A")
                gov_score = esg_data.get("governanceScore", {}).get("fmt", "N/A")
                esg_text = f"ESG Score: {esg_score}, Environmental: {env_score}, Social: {social_score}, Governance: {gov_score}"
            else:
                esg_text = "No ESG data available"
            
            price = combined_data.get("price", "N/A")
            change_pct = combined_data.get("change_pct", "N/A")
            name = combined_data.get("name", symbol)
            detail_text = f"{symbol} ({name}): Price ${price} ({change_pct})"
            
            if "open" in combined_data and combined_data["open"] != "N/A":
                detail_text += f"; Open: ${combined_data['open']}"
            if "high" in combined_data and combined_data["high"] != "N/A":
                detail_text += f"; High: ${combined_data['high']}"
            if "low" in combined_data and combined_data["low"] != "N/A":
                detail_text += f"; Low: ${combined_data['low']}"
            if "volume" in combined_data and combined_data["volume"] != "N/A":
                detail_text += f"; Volume: {combined_data['volume']}"
            if "market_cap" in combined_data and combined_data["market_cap"] != "N/A":
                detail_text += f"; Market Cap: ${combined_data['market_cap']}"
            if "52w_high" in combined_data and combined_data["52w_high"] != "N/A":
                detail_text += f"; 52w High: ${combined_data['52w_high']}"
            if "52w_low" in combined_data and combined_data["52w_low"] != "N/A":
                detail_text += f"; 52w Low: ${combined_data['52w_low']}"
            if "sector" in combined_data and combined_data["sector"] != "N/A":
                detail_text += f"; Sector: {combined_data['sector']}"
            if "industry" in combined_data and combined_data["industry"] != "N/A":
                detail_text += f"; Industry: {combined_data['industry']}"
            
            detail_text += f"; {esg_text}"
            ticker_summary += detail_text + " "
        else:
            logger.warning(f"No data found for target symbol: {target_symbol}")
            ticker_summary += f"No detailed data available for {target_symbol}. "
    
    if not ticker_summary:
        if target_symbol:
            ticker_summary = f"No information available for {target_symbol}."
        else:
            ticker_summary = "No specific ticker symbol detected in your query. Please include a stock symbol (e.g., AAPL for Apple) if you want stock information."
        logger.warning("No ticker data could be retrieved")
    
    logger.info(f"Final ticker summary: {ticker_summary}")
    
    global llama_model
    if llama_model is None:
        llama_model = initialize_llama(model_path)
        if not llama_model:
            return "I'm sorry, but I'm unable to process your request at the moment due to a technical issue with the language model."
    
    # Construct the enriched prompt with conversation history
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    enriched_prompt = (
        f"Conversation History:\n{history_prompt}\n\n"
        f"User Query: {user_message}\n\n"
        f"Current Market Data (as of {timestamp}):\n{ticker_summary}\n\n"
        "Answer:"
    )
    
    logger.info("Sending prompt to Llama model")
    logger.debug(f"Full prompt: {enriched_prompt}")
    
    try:
        output = llama_model(
            prompt=enriched_prompt,
            max_tokens=800,
            temperature=0.7,
            top_p=0.95,
        )
        
        if isinstance(output, dict):
            reply = output.get("choices", [{}])[0].get("text", "")
        elif isinstance(output, str):
            reply = output
        else:
            reply = str(output)
        
        logger.info("Successfully generated response")
        logger.debug(f"Model response: {reply}")
        
        # Update conversation history
        update_conversation_history(user_message, reply)
        
        return reply.strip()
    except Exception as e:
        logger.exception(f"Error generating response with Llama: {str(e)}")
        return "I apologize, but I encountered an error while processing your request. Please try again with a different query."

# Flask endpoints (unchanged)
@app.route('/chat', methods=['POST'])
def chat():
    """Endpoint for handling chat requests."""
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({"error": "Invalid request. 'message' field is required."}), 400
        
        user_message = data['message']
        logger.info(f"Received chat request: {user_message}")
        
        response = chat_response(user_message)
        return jsonify({"response": response}), 200
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        return jsonify({"error": "An error occurred while processing your request."}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint to verify the server is running."""
    return jsonify({"status": "healthy"}), 200

if __name__ == "__main__":
    # Initialize the Llama model when the server starts
    llama_model = initialize_llama(MODEL_FILENAME)
    if llama_model:
        app.run(host='0.0.0.0', port=2500, debug=False)
    else:
        logger.error("Failed to initialize Llama model. Exiting.")