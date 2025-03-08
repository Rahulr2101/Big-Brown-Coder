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

# Real-time quote API
REALTIME_QUOTE_URL = "https://yahoo-finance15.p.rapidapi.com/api/v1/markets/quote"
REALTIME_QUOTE_HEADERS = YAHOO_TICKERS_HEADERS  # Same headers as tickers API

ESG_API_URL_TEMPLATE = "https://yahoo-finance127.p.rapidapi.com/esg-scores/{symbol}"
ESG_API_HEADERS = {
    "x-rapidapi-host": "yahoo-finance127.p.rapidapi.com",
    "x-rapidapi-key": "e5dfb69ac4msh7dcab92ff8a5633p1e73d2jsncf8f43e4a966",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Accept": "application/json",
    "Accept-Encoding": "identity"
}

# Conversation Context Management
class ConversationContext:
    def __init__(self, max_history=5):
        self.max_history = max_history
        self.conversation_history = []
        self.mentioned_symbols = {}  # Dictionary of symbols with timestamp of last mention
        self.latest_symbol = None  # Most recently discussed symbol
        self.current_topic = None  # Current topic of conversation
        self.ticker_data = {}  # Cache of ticker data to avoid repeated API calls

    def add_interaction(self, user_query, bot_response, detected_symbols=None):
        """
        Add a new interaction to the conversation history
        
        Args:
            user_query: User's question
            bot_response: Bot's response
            detected_symbols: Symbols detected in this interaction
        """
        timestamp = time.time()
        
        # Update conversation history
        self.conversation_history.append({
            "timestamp": timestamp,
            "user_query": user_query,
            "bot_response": bot_response,
            "detected_symbols": detected_symbols or []
        })
        
        # Trim history if needed
        if len(self.conversation_history) > self.max_history:
            self.conversation_history = self.conversation_history[-self.max_history:]
        
        # Update mentioned symbols
        if detected_symbols:
            for symbol in detected_symbols:
                self.mentioned_symbols[symbol] = timestamp
                self.latest_symbol = symbol  # Update most recent symbol
    
    def get_relevant_context(self, query):
        """
        Get context relevant to the current query
        
        Args:
            query: Current user query
            
        Returns:
            Dictionary with relevant context information
        """
        # Detect symbols in current query
        detected_symbols = self._extract_symbols(query)
        
        # If no symbols in current query, use the most recent symbol
        active_symbol = None
        if detected_symbols:
            active_symbol = detected_symbols[0]
        elif self.latest_symbol:
            # If query seems to refer to previous context
            if self._is_referring_to_previous(query):
                active_symbol = self.latest_symbol
        
        # Get recent conversation summary
        recent_summary = self._summarize_recent_conversation()
        
        return {
            "active_symbol": active_symbol,
            "detected_symbols": detected_symbols,
            "latest_symbol": self.latest_symbol,
            "mentioned_symbols": list(self.mentioned_symbols.keys()),
            "recent_summary": recent_summary
        }
    
    def _extract_symbols(self, query):
        """Extract potential stock symbols from query"""
        # Find all uppercase sequences of 1-5 letters that look like stock symbols
        symbol_matches = re.findall(r'\b([A-Z]{1,5})\b', query)
        
        # Filter out common English words that might be mistaken for symbols
        filtered_symbols = []
        common_words = {"A", "I", "AM", "PM", "AN", "BY", "IF", "IS", "IT", "ME", "MY", "NO", "OK", "ON", "OR", "SO", "TO", "UP", "US", "WE", "AS", "AT", "BE", "DO", "GO", "HE", "HI", "IN"}
        
        for symbol in symbol_matches:
            if symbol not in common_words and len(symbol) >= 2:
                filtered_symbols.append(symbol)
        
        return filtered_symbols
    
    def _is_referring_to_previous(self, query):
        """Check if the query seems to refer to previously mentioned entities"""
        referring_phrases = [
            "it", "its", "this", "that", "they", "them", "this stock", 
            "that stock", "this company", "that company", "the stock", 
            "the company", "the above", "mentioned", "previous", "above",
            "invest in", "buying", "selling", "worth", "good investment",
            "dividend", "price", "target", "performance", "should i buy"
        ]
        
        query_lower = query.lower()
        return any(phrase in query_lower for phrase in referring_phrases)
    
    def _summarize_recent_conversation(self):
        """Create a summary of recent conversation"""
        if not self.conversation_history:
            return "No previous conversation."
        
        # Get last few interactions
        recent = self.conversation_history[-3:]  # Last 3 interactions
        
        summary = []
        for i, interaction in enumerate(recent):
            # Truncate long responses for the summary
            user_query = interaction["user_query"]
            bot_response = interaction["bot_response"]
            if len(bot_response) > 200:
                bot_response = bot_response[:197] + "..."
            
            summary.append(f"Q{i+1}: {user_query}")
            summary.append(f"A{i+1}: {bot_response}")
        
        return "\n".join(summary)
    
    def add_ticker_data(self, symbol, data):
        """Cache ticker data for future reference"""
        self.ticker_data[symbol] = {
            "data": data,
            "timestamp": time.time()
        }
    
    def get_cached_ticker_data(self, symbol, max_age=300):  # 5 minutes cache
        """Get cached ticker data if available and not expired"""
        if symbol in self.ticker_data:
            cache_entry = self.ticker_data[symbol]
            age = time.time() - cache_entry["timestamp"]
            
            if age < max_age:
                return cache_entry["data"]
        
        return None

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

def get_realtime_quote(symbol):
    """
    Fetch real-time quote data for a specific ticker symbol
    
    Args:
        symbol: Stock symbol to fetch quote for (e.g., "AAPL")
        
    Returns:
        Dictionary with real-time quote data or empty dict if not found
    """
    logger.info(f"Fetching real-time quote for: {symbol}")
    
    try:
        params = {
            "ticker": symbol,
            "type": "STOCKS"
        }
        
        # Add retry logic
        max_retries = 3
        retry_delay = 2  # seconds
        
        for attempt in range(max_retries):
            try:
                response = requests.get(
                    REALTIME_QUOTE_URL, 
                    headers=REALTIME_QUOTE_HEADERS,
                    params=params,
                    timeout=10
                )
                
                logger.info(f"Real-time quote API status code for {symbol}: {response.status_code}")
                
                if response.status_code == 200:
                    data = response.json()
                    logger.info(f"Real-time quote data keys for {symbol}: {list(data.keys() if isinstance(data, dict) else ['not a dict'])}")
                    return data
                
                elif response.status_code == 429:  # Rate limit exceeded
                    retry_after = int(response.headers.get('Retry-After', retry_delay * (attempt + 1)))
                    logger.warning(f"Rate limit hit on real-time quote for {symbol}, waiting {retry_after} seconds")
                    time.sleep(retry_after)
                
                else:
                    logger.error(f"Real-time quote API error for {symbol}: Status {response.status_code}")
                    logger.error(f"Response: {response.text[:500]}...")
                    return {}
                    
            except requests.exceptions.RequestException as e:
                logger.error(f"Request exception on real-time quote for {symbol}, attempt {attempt+1}: {str(e)}")
                if attempt < max_retries - 1:
                    time.sleep(retry_delay * (attempt + 1))
                else:
                    logger.error(f"Max retries reached for real-time quote on {symbol}")
                    return {}
        
    except Exception as e:
        logger.exception(f"Unexpected error fetching real-time quote for {symbol}: {str(e)}")
        return {}

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

def extract_ticker_data(ticker_data, realtime_data):
    """
    Extract and combine ticker data from both APIs
    
    Args:
        ticker_data: Data from the tickers API
        realtime_data: Data from the real-time quote API
        
    Returns:
        Dictionary with combined ticker information
    """
    result = {}
    
    # Extract basic ticker info
    if ticker_data:
        result["symbol"] = ticker_data.get("symbol", "N/A")
        result["price"] = ticker_data.get("lastsale", "N/A")
        result["change_pct"] = ticker_data.get("pctchange", "N/A")
        result["name"] = ticker_data.get("name", "N/A")
    
    # Enhance with real-time data if available
    if realtime_data:
        # Navigate through the response structure to get to the ticker data
        quote_data = None
        
        # Try to find the quote data in the response
        if isinstance(realtime_data, dict):
            if "data" in realtime_data and isinstance(realtime_data["data"], dict):
                quote_data = realtime_data["data"]
            elif "body" in realtime_data and isinstance(realtime_data["body"], dict):
                quote_data = realtime_data["body"]
        
        if quote_data:
            # Override basic info with real-time data
            if "symbol" in quote_data:
                result["symbol"] = quote_data.get("symbol", result.get("symbol", "N/A"))
            
            # Price data
            if "regularMarketPrice" in quote_data:
                result["price"] = quote_data.get("regularMarketPrice", result.get("price", "N/A"))
            
            # Change percentage
            if "regularMarketChangePercent" in quote_data:
                change_pct = quote_data.get("regularMarketChangePercent")
                if isinstance(change_pct, (int, float)):
                    result["change_pct"] = f"{change_pct:.2f}%"
                else:
                    result["change_pct"] = str(change_pct)
            
            # Additional real-time data
            result["open"] = quote_data.get("regularMarketOpen", "N/A")
            result["high"] = quote_data.get("regularMarketDayHigh", "N/A")
            result["low"] = quote_data.get("regularMarketDayLow", "N/A")
            result["volume"] = quote_data.get("regularMarketVolume", "N/A")
            result["market_cap"] = quote_data.get("marketCap", "N/A")
            
            # 52-week data
            result["52w_high"] = quote_data.get("fiftyTwoWeekHigh", "N/A")
            result["52w_low"] = quote_data.get("fiftyTwoWeekLow", "N/A")
            
            # Company info
            if "longName" in quote_data:
                result["name"] = quote_data.get("longName", result.get("name", "N/A"))
            result["sector"] = quote_data.get("sector", "N/A")
            result["industry"] = quote_data.get("industry", "N/A")
    
    return result

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

def chat_response(user_message, context, model_path="finance-chat.Q8_0.gguf"):
    """
    Generate a response to a user's financial query with context awareness
    
    Args:
        user_message: The user's query
        context: ConversationContext object maintaining conversation state
        model_path: Path to the GGUF model file
        
    Returns:
        Generated response string and detected symbols
    """
    logger.info(f"Processing user query: {user_message}")
    
    # Get relevant context for this query
    relevant_context = context.get_relevant_context(user_message)
    logger.info(f"Relevant context: {relevant_context}")
    
    # Determine the active symbol for this query
    active_symbol = relevant_context["active_symbol"]
    detected_symbols = relevant_context["detected_symbols"]
    
    # If no active symbol was found in this query but we have a latest symbol
    # and the query seems to refer to a previous entity, use the latest symbol
    if not active_symbol and relevant_context["latest_symbol"] and "_is_referring_to_previous" in dir(context) and context._is_referring_to_previous(user_message):
        active_symbol = relevant_context["latest_symbol"]
        logger.info(f"Using previous symbol {active_symbol} based on context")
        # Add to detected symbols so it's included in response context
        if active_symbol not in detected_symbols:
            detected_symbols.append(active_symbol)
    
    # Check if query is specifically looking for investment advice
    is_investment_query = any(term in user_message.lower() for term in [
        "invest", "buy", "sell", "worth", "stock", "good investment", 
        "should i", "portfolio", "holding", "position"
    ])
    
    # Prepare data collection
    ticker_summary = ""
    ticker_details = []
    
    # If we have an active symbol, get detailed info for it
    if active_symbol:
        logger.info(f"Getting detailed data for active symbol: {active_symbol}")
        
        # Check for cached data first
        combined_data = None
        cached_data = context.get_cached_ticker_data(active_symbol)
        
        if cached_data:
            logger.info(f"Using cached data for {active_symbol}")
            combined_data = cached_data
        else:
            # First, get real-time quote data
            realtime_data = get_realtime_quote(active_symbol)
            
            # Then try to get standard ticker data
            ticker_data = search_ticker_by_symbol(active_symbol, max_pages=5)
            
            # Extract and combine data
            combined_data = extract_ticker_data(ticker_data, realtime_data)
            
            # Cache the combined data for future use
            if combined_data:
                context.add_ticker_data(active_symbol, combined_data)
        
        if combined_data:
            symbol = combined_data.get("symbol", active_symbol)
            ticker_details.append(combined_data)
            
            # Get ESG data for this symbol
            esg_data = get_esg_data(symbol)
            esg_text = ""
            
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
            
            # Build comprehensive summary for the active symbol
            price = combined_data.get("price", "N/A")
            change_pct = combined_data.get("change_pct", "N/A")
            name = combined_data.get("name", symbol)
            
            # Include real-time data if available
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
            
            # Add ESG data to summary
            detail_text += f"; {esg_text}"
            
            ticker_summary += detail_text + " "
        else:
            logger.warning(f"No data found for active symbol: {active_symbol}")
            ticker_summary += f"No detailed data available for {active_symbol}. "
    
    # Only get additional tickers if explicitly requested or if query is about comparing stocks
    additional_tickers_requested = any(term in user_message.lower() for term in [
        "compare", "versus", "vs", "against", "other stocks", "alternatives", 
        "competitors", "similar companies", "sector performance"
    ])
    
    # Get a few general tickers ONLY if no specific ticker was found AND the query explicitly requests comparison
    if not active_symbol and additional_tickers_requested:
        logger.info("Getting additional tickers for comparison as requested")
        general_tickers = get_all_ticker_pages(max_pages=1)[:3]
        
        for ticker in general_tickers:
            symbol = ticker.get("symbol", "N/A")
            
            # Get real-time data for this ticker too
            realtime_data = get_realtime_quote(symbol)
            combined_data = extract_ticker_data(ticker, realtime_data)
            
            if combined_data:
                ticker_details.append(combined_data)
                
                # Add basic info to the summary
                price = combined_data.get("price", "N/A")
                change_pct = combined_data.get("change_pct", "N/A")
                name = combined_data.get("name", symbol)
                
                ticker_summary += f"{symbol} ({name}): Price ${price} ({change_pct}); "
                
                # Only get ESG for a small set of tickers to avoid API limits
                if len(ticker_details) <= 3:
                    esg_data = get_esg_data(symbol)
                    if esg_data and "totalEsg" in esg_data:
                        esg_score = esg_data["totalEsg"].get("fmt", "N/A")
                        ticker_summary += f"ESG Score: {esg_score}; "
    
    if not ticker_summary:
        if active_symbol:
            ticker_summary = f"No information available for {active_symbol}."
        else:
            ticker_summary = "No specific ticker symbol detected in your query. Please include a stock symbol (e.g., AAPL for Apple) if you want stock information."
        logger.warning("No ticker data could be retrieved")
    
    # Log the final ticker summary
    logger.info(f"Final ticker summary: {ticker_summary}")
    
    # Initialize the model with GPU support
    llama = initialize_llama(model_path)
    if not llama:
        return "I'm sorry, but I'm unable to process your request at the moment due to a technical issue with the language model.", detected_symbols
    
    # Include conversation history in the prompt
    conversation_summary = relevant_context["recent_summary"]
    
    # Customize prompt based on query type
    prompt_instructions = ""
    if is_investment_query:
        prompt_instructions = (
            "The user is asking about investment advice. Analyze the current market data provided below, "
            "and give a balanced assessment that considers both financial performance and ESG factors. "
            "Include pros and cons, potential risks, and suggest sustainable alternatives if appropriate. "
            "Focus on educational information rather than direct financial advice."
        )
    else:
        prompt_instructions = (
            "Answer the following financial query by providing a detailed analysis based on the real-time "
            "market data below. Include relevant ESG (Environmental, Social, Governance) considerations "
            "and focus on clear, actionable information."
        )
    
    # Construct the enriched prompt
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    enriched_prompt = (
        f"{prompt_instructions}\n\n"
        f"User Query: {user_message}\n\n"
        f"Current Market Data (as of {timestamp}):\n{ticker_summary}\n\n"
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

def download_model_if_needed(model_filename="finance-chat.Q8_0.gguf"):
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
    model_filename = "finance-chat.Q8_0.gguf"
    if not download_model_if_needed(model_filename):
        print("Failed to download model file. Cannot continue.")
        return
    
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