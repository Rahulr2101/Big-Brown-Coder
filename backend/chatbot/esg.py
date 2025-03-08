import requests
import logging
import time
import re
import json
import os
from llama_cpp import Llama

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

# API Configuration
YAHOO_TICKERS_URL = "https://yahoo-finance15.p.rapidapi.com/api/v2/markets/tickers"
YAHOO_TICKERS_HEADERS = {
    "x-rapidapi-host": "yahoo-finance15.p.rapidapi.com",
    "x-rapidapi-key": "e5dfb69ac4msh7dcab92ff8a5633p1e73d2jsncf8f43e4a966",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "application/json",
    "Accept-Encoding": "identity"
}

ESG_API_URL_TEMPLATE = "https://yahoo-finance127.p.rapidapi.com/esg-scores/{symbol}"
ESG_API_HEADERS = {
    "x-rapidapi-host": "yahoo-finance127.p.rapidapi.com",
    "x-rapidapi-key": "e5dfb69ac4msh7dcab92ff8a5633p1e73d2jsncf8f43e4a966",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "application/json",
    "Accept-Encoding": "identity"
}

def get_all_ticker_pages(max_pages=20, symbol_to_find=None):
    """
    Fetch ticker data from multiple pages
    
    Args:
        max_pages: Maximum number of pages to fetch
        symbol_to_find: Optional symbol to search for
        
    Returns:
        List of ticker dictionaries
    """
    all_tickers = []
    found_symbol = False
    
    for page in range(1, max_pages + 1):
        logger.info(f"Fetching ticker page {page}/{max_pages}")
        
        try:
            params = {
                "page": page,
                "type": "STOCKS"
            }
            
            # Add backoff retry logic
            max_retries = 3
            retry_delay = 2  # seconds
            
            for attempt in range(max_retries):
                try:
                    response = requests.get(
                        YAHOO_TICKERS_URL, 
                        headers=YAHOO_TICKERS_HEADERS, 
                        params=params,
                        timeout=10
                    )
                    
                    # Log response details
                    logger.info(f"Page {page} status code: {response.status_code}")
                    logger.info(f"Page {page} headers: {dict(response.headers)}")
                    
                    if response.status_code == 200:
                        data = response.json()
                        logger.info(f"Page {page} response structure: {list(data.keys())}")
                        
                        # Check if body is in the response
                        if "body" in data and isinstance(data["body"], list):
                            page_tickers = data["body"]
                            logger.info(f"Found {len(page_tickers)} tickers in page {page}")
                            
                            # Add tickers from this page to our collection
                            all_tickers.extend(page_tickers)
                            
                            # If looking for a specific symbol, check if it's in this page
                            if symbol_to_find:
                                for ticker in page_tickers:
                                    if ticker.get("symbol") == symbol_to_find:
                                        logger.info(f"Found target symbol {symbol_to_find} on page {page}")
                                        found_symbol = True
                                        break
                        else:
                            logger.warning(f"No 'body' list found in page {page} response")
                            # Log the actual response structure for debugging
                            logger.warning(f"Response content: {response.text[:500]}...")
                        
                        # Success, break the retry loop
                        break
                    
                    elif response.status_code == 429:  # Rate limit exceeded
                        retry_after = int(response.headers.get('Retry-After', retry_delay * (attempt + 1)))
                        logger.warning(f"Rate limit hit on attempt {attempt+1}, waiting {retry_after} seconds")
                        time.sleep(retry_after)
                    
                    else:
                        logger.error(f"Error fetching page {page}: Status {response.status_code}")
                        logger.error(f"Response: {response.text[:500]}...")
                        break  # Non-retryable error
                
                except requests.exceptions.RequestException as e:
                    logger.error(f"Request exception on page {page}, attempt {attempt+1}: {str(e)}")
                    if attempt < max_retries - 1:
                        time.sleep(retry_delay * (attempt + 1))
                    else:
                        logger.error(f"Max retries reached for page {page}")
            
            # If we found our target symbol or hit an error, stop fetching pages
            if found_symbol:
                break
                
        except Exception as e:
            logger.exception(f"Unexpected error fetching page {page}: {str(e)}")
    
    logger.info(f"Total tickers collected: {len(all_tickers)}")
    return all_tickers

def search_ticker_by_symbol(symbol, tickers=None, max_pages=3):
    """
    Search for a specific ticker symbol
    
    Args:
        symbol: Stock symbol to search for
        tickers: Optional pre-fetched ticker list
        max_pages: Maximum pages to search
        
    Returns:
        Ticker dictionary or None if not found
    """
    logger.info(f"Searching for ticker symbol: {symbol}")
    
    # Use provided tickers if available, otherwise fetch them
    if tickers is None:
        tickers = get_all_ticker_pages(max_pages=max_pages, symbol_to_find=symbol)
    
    # Search for the symbol in our ticker data
    for ticker in tickers:
        if ticker.get("symbol") == symbol:
            logger.info(f"Found ticker data for {symbol}")
            logger.debug(f"Ticker data: {ticker}")
            return ticker
    
    logger.warning(f"Ticker {symbol} not found in {len(tickers)} results")
    return None

def get_esg_data(symbol):
    """
    Fetch ESG score data for a given symbol from Yahoo Finance ESG API
    
    Args:
        symbol: Stock symbol to fetch ESG data for
        
    Returns:
        Dictionary with ESG data or empty dict if not found
    """
    logger.info(f"Fetching ESG data for symbol: {symbol}")
    
    try:
        url = ESG_API_URL_TEMPLATE.format(symbol=symbol)
        
        # Add retry logic
        max_retries = 3
        retry_delay = 2  # seconds
        
        for attempt in range(max_retries):
            try:
                response = requests.get(
                    url, 
                    headers=ESG_API_HEADERS,
                    timeout=10
                )
                
                logger.info(f"ESG API status code for {symbol}: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"ESG data keys for {symbol}: {list(data.keys())}")
                    return data
                
                elif response.status_code == 429:  # Rate limit exceeded
                    retry_after = int(response.headers.get('Retry-After', retry_delay * (attempt + 1)))
                    logger.warning(f"Rate limit hit on ESG for {symbol}, waiting {retry_after} seconds")
                    time.sleep(retry_after)
                
                else:
                    logger.error(f"ESG API error for {symbol}: Status {response.status_code}")
                    logger.error(f"Response: {response.text[:500]}...")
                    return {}
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"Request exception on ESG for {symbol}, attempt {attempt+1}: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay * (attempt + 1))
                else:
                    logger.error(f"Max retries reached for ESG data on {symbol}")
                    return {}
        
    except Exception as e:
        logger.exception(f"Unexpected error fetching ESG data for {symbol}: {str(e)}")
        return {}

def check_model_file(model_path):
    """
    Check if the model file exists and log its status
    
    Args:
        model_path: Path to model file
        
    Returns:
        Boolean indicating if file exists
    """
    if os.path.exists(model_path):
        model_size = os.path.getsize(model_path) / (1024 * 1024)  # Size in MB
        logger.info(f"Model file found at {model_path} ({model_size:.2f} MB)")
        return True
    else:
        logger.error(f"Model file not found at {model_path}")
        return False

def install_cuda_support():
    """
    Install CUDA-enabled version of llama-cpp-python
    
    Returns:
        Boolean indicating success
    """
    try:
        logger.info("Installing CUDA-enabled llama-cpp-python...")
        import sys
        import subprocess
        
        # Uninstall current version
        subprocess.check_call([sys.executable, "-m", "pip", "uninstall", "-y", "llama-cpp-python"])
        
        # Install with CUDA support
        env = {"CMAKE_ARGS": "-DLLAMA_CUBLAS=on", "FORCE_CMAKE": "1"}
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "llama-cpp-python"],
            env=env
        )
        
        logger.info("Successfully installed CUDA-enabled llama-cpp-python")
        return True
    except Exception as e:
        logger.exception(f"Failed to install CUDA support: {str(e)}")
        return False

def initialize_llama(model_path):
    """
    Initialize the Llama model with GPU support and fallback to CPU
    
    Args:
        model_path: Path to GGUF model file
        
    Returns:
        Llama model instance or None if initialization failed
    """
    logger.info("Initializing Llama model with GPU support...")
    
    if not check_model_file(model_path):
        logger.error("Cannot initialize model: file not found")
        return None
    
    try:
        # First try to initialize with GPU support
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
            # Fallback to CPU
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

def chat_response(user_message, model_path="finance-chat.Q5_K_M.gguf"):
    """
    Generate a response to a user's financial query with detailed logging.
    
    Args:
        user_message: The user's query
        model_path: Path to the GGUF model file
        
    Returns:
        Generated response string
    """
    logger.info(f"Processing user query: {user_message}")
    
    # Check if query is specifically looking for a symbol
    symbol_match = re.search(r'\b([A-Z]{1,5})\b', user_message)
    target_symbol = None
    
    if symbol_match:
        potential_symbol = symbol_match.group(1)
        if len(potential_symbol) >= 2:  # Most stock symbols are at least 2 characters
            target_symbol = potential_symbol
            logger.info(f"Detected potential stock symbol in query: {target_symbol}")
    
    # Fetch all ticker data or search for specific symbol
    if target_symbol:
        # First, try to directly get the specific ticker
        ticker_data = search_ticker_by_symbol(target_symbol, max_pages=20)
        if ticker_data:
            tickers = [ticker_data]
        else:
            # If not found, get general top tickers
            tickers = get_all_ticker_pages(max_pages=2)[:3]
    else:
        # No specific symbol, get top tickers
        tickers = get_all_ticker_pages(max_pages=2)[:3]
    
    # Prepare ticker summary for prompt
    ticker_summary = ""
    for ticker in tickers:
        symbol = ticker.get("symbol", "N/A")
        price = ticker.get("lastsale", "N/A")
        change_pct = ticker.get("pctchange", "N/A")
        
        # Log ticker details
        logger.info(f"Including ticker in summary: {symbol} @ {price} ({change_pct})")
        
        # Only fetch ESG data for the target symbol or for display tickers if no target
        if symbol == target_symbol or not target_symbol:
            esg_data = get_esg_data(symbol)
            if esg_data and "totalEsg" in esg_data:
                esg_score = esg_data["totalEsg"].get("fmt", "N/A")
                env_score = esg_data.get("environmentScore", {}).get("fmt", "N/A")
                social_score = esg_data.get("socialScore", {}).get("fmt", "N/A")
                gov_score = esg_data.get("governanceScore", {}).get("fmt", "N/A")
                
                esg_text = (f"ESG Score: {esg_score}, Environmental: {env_score}, "
                           f"Social: {social_score}, Governance: {gov_score}")
                logger.info(f"ESG data for {symbol}: {esg_text}")
            else:
                esg_text = "No ESG data available"
                logger.warning(f"No ESG data found for {symbol}")
        else:
            esg_text = "ESG data not fetched"
        
        ticker_summary += f"{symbol}: Price {price} ({change_pct}); {esg_text}. "
    
    if not ticker_summary:
        ticker_summary = "No ticker information available."
        logger.warning("No ticker data could be retrieved")
    
    # Log the final ticker summary
    logger.info(f"Final ticker summary: {ticker_summary}")
    
    # Initialize the model with GPU support
    llama = initialize_llama(model_path)
    if not llama:
        return "I'm sorry, but I'm unable to process your request at the moment due to a technical issue with the language model."
    
    # Construct the enriched prompt
    enriched_prompt = (
        "Answer the following financial query by providing a detailed analysis, "
        "recommendations for greener and sustainable alternatives, and insights on sustainable finance. "
        "Focus on clear, actionable financial Q&A while incorporating the data provided below.\n\n"
        f"User Query: {user_message}\n\n"
        f"Ticker and ESG Information: {ticker_summary}\n\n"
        "Answer:"
    )
    
    logger.info("Sending prompt to Llama model")
    logger.debug(f"Full prompt: {enriched_prompt}")
    
    try:
        output = llama(
            prompt=enriched_prompt,
            max_tokens=800,
            temperature=0.7,
            top_p=0.95,
        )
        
        if isinstance(output, dict):
            logger.info("Llama returned dictionary output")
            reply = output.get("choices", [{}])[0].get("text", "")
        elif isinstance(output, str):
            logger.info("Llama returned string output")
            reply = output
        else:
            logger.warning(f"Unexpected output type from Llama: {type(output)}")
            if hasattr(output, "__getitem__"):
                try:
                    first_item = output[0]
                    if isinstance(first_item, dict) and "text" in first_item:
                        reply = first_item["text"]
                    else:
                        reply = str(first_item)
                except (IndexError, TypeError):
                    reply = str(output)
            else:
                reply = str(output)
        
        logger.info("Successfully generated response")
        logger.debug(f"Model response: {reply}")
        
        return reply.strip()
        
    except Exception as e:
        logger.exception(f"Error generating response with Llama: {str(e)}")
        return "I apologize, but I encountered an error while processing your request. Please try again with a different query."

def test_ticker_api():
    """Test the Yahoo Finance Ticker API to verify connectivity"""
    print("Testing Yahoo Finance Ticker API...")
    try:
        headers = YAHOO_TICKERS_HEADERS.copy()
        
        response = requests.get(YAHOO_TICKERS_URL, headers=headers, timeout=10)
        print(f"Ticker API Status Code: {response.status_code}")
        print("Ticker API Response Headers:")
        print(response.headers)
        try:
            data = response.json()
            print("Ticker API JSON Response:")
            print(json.dumps(data, indent=2))
        except json.JSONDecodeError as e:
            print("JSON decode error:", e)
            print("Response content (first 200 characters):")
            print(response.content[:200])
    except Exception as e:
        print("Exception during ticker API test:", str(e))

def test_esg_api(symbol="AAPL"):
    """Test the ESG API to verify connectivity"""
    print(f"\nTesting ESG API for symbol: {symbol}...")
    try:
        url = ESG_API_URL_TEMPLATE.format(symbol=symbol)
        headers = ESG_API_HEADERS.copy()
        
        response = requests.get(url, headers=headers, timeout=10)
        print(f"ESG API Status Code for {symbol}: {response.status_code}")
        print("ESG API Response Headers:")
        print(response.headers)
        try:
            data = response.json()
            print(f"ESG API JSON Response for {symbol}:")
            print(json.dumps(data, indent=2))
        except json.JSONDecodeError as e:
            print("JSON decode error for ESG API:", e)
            print("Response content (first 200 characters):")
            print(response.content[:200])
    except Exception as e:
        print(f"Exception during ESG API test for {symbol}:", str(e))

def download_model_if_needed(model_filename="finance-chat.Q5_K_M.gguf"):
    """Download the model file if it doesn't exist"""
    if not os.path.exists(model_filename):
        try:
            logger.info(f"Model {model_filename} not found, attempting to download...")
            import subprocess
            
            # Try to download using huggingface-cli
            try:
                logger.info("Trying download with huggingface-cli...")
                subprocess.check_call([
                    "huggingface-cli", "download", 
                    "TheBloke/finance-chat-GGUF", model_filename,
                    "--local-dir", ".", 
                    "--local-dir-use-symlinks", "False"
                ])
            except (subprocess.SubprocessError, FileNotFoundError):
                # If huggingface-cli fails, try pip install
                logger.info("huggingface-cli failed, trying to install it...")
                subprocess.check_call([
                    "pip", "install", "huggingface_hub"
                ])
                
                # Now try the python API
                from huggingface_hub import hf_hub_download
                
                logger.info("Downloading with huggingface_hub...")
                hf_hub_download(
                    repo_id="TheBloke/finance-chat-GGUF",
                    filename=model_filename,
                    local_dir=".",
                    local_dir_use_symlinks=False
                )
            
            logger.info(f"Successfully downloaded {model_filename}")
            return True
        
        except Exception as e:
            logger.exception(f"Failed to download model file: {str(e)}")
            return False
    
    logger.info(f"Model file {model_filename} already exists")
    return True

def main():
    """Main function to run the chatbot interactively"""
    print("=" * 50)
    print("ESG Finance Chatbot")
    print("=" * 50)
    print("Type 'exit' or 'quit' to end the session")
    
    # Check if model exists and download if needed
    model_filename = "finance-chat.Q5_K_M.gguf"
    if not download_model_if_needed(model_filename):
        print("Failed to download model file. Cannot continue.")
        return
    
    # Check if APIs are working
    print("\nTesting APIs...")
    try:
        # Only test with a small number of requests
        test_ticker_api()
        test_esg_api("AAPL")
    except Exception as e:
        print(f"API test error: {str(e)}")
        print("Continuing anyway...")
    
    print("\nChatbot ready! Enter your financial questions.")
    print("-" * 50)
    
    while True:
        user_input = input("\nYou: ")
        
        if user_input.lower() in ["exit", "quit", "bye"]:
            print("Goodbye!")
            break
        
        print("\nProcessing your query... This may take a moment.")
        try:
            response = chat_response(user_input, model_path=model_filename)
            print("\nChatbot:", response)
        except Exception as e:
            logger.exception(f"Error processing query: {str(e)}")
            print("\nChatbot: I'm sorry, I encountered an error while processing your request. Please try again.")

if __name__ == "__main__":
    main()