import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FinancialNewsApp = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ticker, setTicker] = useState('AAPL');

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const options = {
          method: 'GET',
          url: 'https://yahoo-finance15.p.rapidapi.com/api/v2/markets/news',
          params: {
            tickers: ticker,
            type: 'ALL'
          },
          headers: {
            'x-rapidapi-key': '321df255c2msh2bd7c17e95d52c0p1a7ba3jsn1655727c74e2',
            'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com'
          }
        };

        const response = await axios.request(options);
        
        if (response.data && response.data.body) {
          // For each news item, analyze sentiment
          const newsWithSentiment = await Promise.all(
            response.data.body.map(async (news) => {
              const sentiment = await analyzeSentiment(news.title);
              return { ...news, sentiment };
            })
          );
          setNewsData(newsWithSentiment);
        } else {
          setNewsData([]);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch news data: ' + err.message);
        setLoading(false);
      }
    };

    fetchNews();
  }, [ticker]);

  // Sentiment analysis function
  const analyzeSentiment = async (text) => {
    try {
      // In a real app, you would connect to your FinGPT model
      // This is a simplified example using a mock sentiment analysis
      // You would replace this with a call to your hosted model or Hugging Face
      
      // Mock sentiment analysis (random for demo)
      const sentiments = ['positive', 'neutral', 'negative'];
      const confidences = [Math.random(), Math.random(), Math.random()];
      const total = confidences.reduce((sum, val) => sum + val, 0);
      const normalizedConfidences = confidences.map(val => (val / total).toFixed(2));
      
      return {
        label: sentiments[normalizedConfidences.indexOf(Math.max(...normalizedConfidences).toFixed(2))],
        confidence: normalizedConfidences
      };
      
      /* 
      // Real implementation would look something like:
      const response = await axios.post('https://your-model-endpoint/sentiment', {
        text: text,
        model: "FinGPT/fingpt-sentiment_internlm-20b_lora"
      });
      return response.data;
      */
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return { label: 'neutral', confidence: [0.33, 0.34, 0.33] };
    }
  };

  const handleTickerChange = (e) => {
    setTicker(e.target.value.toUpperCase());
  };

  // Get color based on sentiment
  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Financial News Sentiment Analyzer</h1>
      
      <div className="mb-6">
        <label htmlFor="ticker" className="block text-sm font-medium text-gray-700 mb-2">
          Stock Ticker:
        </label>
        <div className="flex">
          <input
            type="text"
            id="ticker"
            value={ticker}
            onChange={handleTickerChange}
            className="border-gray-300 rounded-md shadow-sm p-2 mr-2 w-32"
            placeholder="AAPL"
          />
          <button 
            onClick={() => setLoading(true)} 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
          >
            Fetch News
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Latest News for {ticker}</h2>
          {newsData.length === 0 ? (
            <p>No news found for this ticker.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {newsData.map((news, index) => (
                <div key={index} className="border rounded-lg overflow-hidden shadow-md">
                  {news.thumbnail && (
                    <img 
                      src={news.thumbnail.resolutions[0].url} 
                      alt={news.title} 
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-medium">{news.title}</h3>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${getSentimentColor(news.sentiment.label)}`}>
                        {news.sentiment.label}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{news.description}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>{new Date(news.published_at).toLocaleDateString()}</span>
                      <a 
                        href={news.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                  
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialNewsApp;