import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { analyzeSentiment } from '../api/SentimentAnalyzer';
import NewsArticle from '../components/NewsArticle';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Search, X, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const FinancialSentimentDashboard = () => {
  const [searchTicker, setSearchTicker] = useState('');
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sentimentPercentages, setSentimentPercentages] = useState({
    positive: 0,
    neutral: 0,
    negative: 0
  });
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [sector, setSector] = useState('all');
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Expanded popular tickers across different sectors
  const tickersBySector = {
    'all': [],
    'tech': ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA', 'INTC', 'AMD', 'CSCO', 'IBM', 'ORCL', 'CRM', 'ADBE', 'ZM', 'TEAM', 'SHOP'],
    'finance': ['JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'AXP', 'V', 'MA', 'PYPL', 'SQ', 'COIN', 'BLK', 'SCHW'],
    'healthcare': ['JNJ', 'PFE', 'MRK', 'ABBV', 'LLY', 'BMY', 'UNH', 'CVS', 'AMGN', 'GILD', 'BIIB', 'MRNA', 'REGN'],
    'retail': ['AMZN', 'WMT', 'TGT', 'COST', 'HD', 'LOW', 'EBAY', 'ETSY', 'DG', 'DLTR', 'KR', 'ULTA', 'BBY'],
    'energy': ['XOM', 'CVX', 'BP', 'SHEL', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'DVN', 'CLR'],
    'auto': ['TSLA', 'F', 'GM', 'TM', 'HMC', 'STLA', 'RIVN', 'LCID', 'NIO', 'LI', 'XPEV'],
    'crypto': ['COIN', 'MSTR', 'RIOT', 'MARA', 'HUT', 'BITF', 'CLSK', 'SI', 'BTBT', 'CIFR'],
    'etf': ['SPY', 'QQQ', 'DIA', 'IWM', 'VTI', 'GLD', 'SLV', 'USO', 'XLF', 'XLE', 'XLK', 'XLV', 'ARKK']
  };

  // All sectors combined
  const allPopularTickers = Object.values(tickersBySector).flat();

  // Get tickers based on selected sector
  const getTickersBySelectedSector = () => {
    return sector === 'all' ? allPopularTickers : tickersBySector[sector] || allPopularTickers;
  };

  useEffect(() => {
    // Reset pagination when sector or search changes
    setPage(1);
    setHasMore(true);
    setNewsData([]);
    fetchNews();
  }, [sector, searchTicker]);

  const fetchNews = async (isLoadMore = false) => {
    if (isLoadMore && !hasMore) return;
    
    const currentPage = isLoadMore ? page + 1 : 1;
    
    if (!isLoadMore) {
      setLoading(true);
    }
    
    try {
      // Determine which tickers to fetch
      let tickersParam;
      
      if (searchTicker) {
        // If searching for a specific ticker
        tickersParam = searchTicker;
      } else {
        // Otherwise use the sector tickers
        const sectorTickers = getTickersBySelectedSector();
        // Take a subset of tickers to avoid hitting API limits
        const startIdx = (currentPage - 1) * 15 % sectorTickers.length;
        const tickersToFetch = sectorTickers.slice(startIdx, startIdx + 15);
        tickersParam = tickersToFetch.join(',');
      }
      
      const options = {
        method: 'GET',
        url: 'https://yahoo-finance15.p.rapidapi.com/api/v2/markets/news',
        params: {
          tickers: tickersParam,
          type: 'ALL',
          size: pageSize.toString()
        },
        headers: {
          'x-rapidapi-key': '321df255c2msh2bd7c17e95d52c0p1a7ba3jsn1655727c74e2',
          'x-rapidapi-host': 'yahoo-finance15.p.rapidapi.com'
        }
      };

      const response = await axios.request(options);
      
      if (response.data && response.data.body) {
        // Process each news item with sentiment analysis
        const newsWithSentiment = await Promise.all(
          response.data.body.map(async (news) => {
            // Extract ticker from news item
            const ticker = extractTickerFromNews(news);
            
            // Get company name for the ticker
            const companyName = getCompanyName(response.data, ticker);
            
            // Analyze sentiment using the text from the title and description
            const sentimentText = `${news.title} ${news.description || ''}`;
            const sentiment = await analyzeSentiment(sentimentText);
            
            // Ensure the date is properly formatted
            const formattedDate = formatPublishedDate(news.published_at);
            
            // Extract sector information
            const sectorInfo = determineTickerSector(ticker);
            
            return { 
              ...news, 
              sentiment,
              ticker: ticker,
              company: companyName,
              formattedDate,
              sector: sectorInfo
            };
          })
        );
        
        // Filter news based on search if there's a search term
        const filteredNews = searchTicker 
          ? newsWithSentiment.filter(news => 
              news.ticker && news.ticker.includes(searchTicker.toUpperCase()))
          : newsWithSentiment;
        
        // Update news data (append if loading more, replace otherwise)
        if (isLoadMore) {
          setNewsData(prevNews => {
            // Create a map of existing news by URL to avoid duplicates
            const existingNewsMap = new Map(prevNews.map(item => [item.url, item]));
            
            // Add only new items that don't exist in the current list
            filteredNews.forEach(item => {
              if (!existingNewsMap.has(item.url)) {
                existingNewsMap.set(item.url, item);
              }
            });
            
            return Array.from(existingNewsMap.values());
          });
        } else {
          setNewsData(filteredNews);
        }
        
        // Determine if there are more results to load
        setHasMore(filteredNews.length >= pageSize - 5);
        
        // Update page number if we successfully loaded more
        if (isLoadMore) {
          setPage(currentPage);
        }
        
        // Calculate overall sentiment statistics
        const allNewsForStats = isLoadMore 
          ? [...newsData, ...filteredNews] 
          : filteredNews;
          
        const sentimentCounts = allNewsForStats.reduce((acc, news) => {
          acc[news.sentiment.label] = (acc[news.sentiment.label] || 0) + 1;
          return acc;
        }, {});
        
        const totalNews = allNewsForStats.length;
        if (totalNews > 0) {
          setSentimentPercentages({
            positive: Math.round((sentimentCounts.positive || 0) / totalNews * 100) || 0,
            neutral: Math.round((sentimentCounts.neutral || 0) / totalNews * 100) || 0,
            negative: Math.round((sentimentCounts.negative || 0) / totalNews * 100) || 0
          });
        }
      } else {
        if (!isLoadMore) {
          setNewsData([]);
          setSentimentPercentages({ positive: 0, neutral: 0, negative: 0 });
        }
        setHasMore(false);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Failed to fetch news data: ' + err.message);
      setLoading(false);
      setHasMore(false);
    }
  };

  // Load more news when user scrolls
  const handleLoadMore = () => {
    fetchNews(true);
  };

  // Determine which sector a ticker belongs to
  const determineTickerSector = (ticker) => {
    for (const [sectorName, tickers] of Object.entries(tickersBySector)) {
      if (sectorName !== 'all' && tickers.includes(ticker)) {
        return sectorName;
      }
    }
    return 'other';
  };

  // Helper functions
  const formatPublishedDate = (dateString) => {
    if (!dateString) return 'Recent';
    
    try {
      let date;
      
      if (typeof dateString === 'number' || /^\d+$/.test(dateString)) {
        const timestamp = parseInt(dateString);
        date = new Date(timestamp < 10000000000 ? timestamp * 1000 : timestamp);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        date = new Date();
      }
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Recent';
    }
  };

  const extractTickerFromNews = (news) => {
    // First try to get the ticker from the news object if it's available
    if (news.tickers && news.tickers.length > 0) {
      return news.tickers[0];
    }
    
    // Next try to extract from title or description using $ symbol
    const tickerPattern = /\$([A-Z]{1,5})\b/;
    const titleMatch = news.title && news.title.match(tickerPattern);
    if (titleMatch) return titleMatch[1];
    
    const descMatch = news.description && news.description.match(tickerPattern);
    if (descMatch) return descMatch[1];
    
    // Next try to match known tickers in the title/description without $ symbol
    const allTickersRegex = new RegExp(`\\b(${allPopularTickers.join('|')})\\b`, 'g');
    const titleTickerMatch = news.title && news.title.match(allTickersRegex);
    if (titleTickerMatch) return titleTickerMatch[0];
    
    const descTickerMatch = news.description && news.description.match(allTickersRegex);
    if (descTickerMatch) return descTickerMatch[0];
    
    // If no ticker found, assign a relevant one based on content
    if (news.title.includes('bitcoin') || news.title.includes('crypto')) {
      return 'COIN';
    } else if (news.title.includes('oil') || news.title.includes('energy')) {
      return 'XOM';
    } else if (news.title.includes('bank') || news.title.includes('finance')) {
      return 'JPM';
    } else if (news.title.includes('tech') || news.title.includes('software')) {
      return 'MSFT';
    }
    
    // As a last resort, pick a random ticker from the current sector or all tickers
    const sectorTickers = getTickersBySelectedSector();
    return sectorTickers[Math.floor(Math.random() * sectorTickers.length)] || 'SPY';
  };

  const getCompanyName = (data, ticker) => {
    if (data.meta && data.meta.companies && data.meta.companies[ticker]) {
      return data.meta.companies[ticker].name;
    }
    
    const tickerToCompany = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'GOOGL': 'Alphabet Inc.',
      'AMZN': 'Amazon.com Inc.',
      'META': 'Meta Platforms Inc.',
      'TSLA': 'Tesla Inc.',
      'NVDA': 'NVIDIA Corporation',
      'JPM': 'JPMorgan Chase & Co.',
      'BAC': 'Bank of America Corp.',
      'WMT': 'Walmart Inc.',
      'AMD': 'Advanced Micro Devices Inc.',
      'INTC': 'Intel Corporation',
      'CSCO': 'Cisco Systems Inc.',
      'GS': 'Goldman Sachs Group Inc.',
      'COIN': 'Coinbase Global Inc.',
      'F': 'Ford Motor Company',
      'GM': 'General Motors Company',
      'JNJ': 'Johnson & Johnson',
      'PFE': 'Pfizer Inc.',
      'XOM': 'Exxon Mobil Corporation',
      'CVX': 'Chevron Corporation',
      'PYPL': 'PayPal Holdings Inc.',
      'NFLX': 'Netflix Inc.',
      'DIS': 'The Walt Disney Company',
      'SPY': 'SPDR S&P 500 ETF Trust',
      'QQQ': 'Invesco QQQ Trust Series 1',
      'GLD': 'SPDR Gold Shares'
    };
    
    return tickerToCompany[ticker] || `${ticker} Inc.`;
  };

  const handleTickerChange = (e) => {
    const value = e.target.value;
    setSearchTicker(value);
    
    if (value.length > 0) {
      const filtered = allPopularTickers.filter(
        ticker => ticker.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (ticker) => {
    setSearchTicker(ticker);
    setShowSuggestions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setSearchTicker('');
    setShowSuggestions(false);
  };

  const handleSectorChange = (value) => {
    setSector(value);
  };

  // Filter news by sentiment for tabs
  const filteredNewsBySentiment = () => {
    if (activeTab === 'all') return newsData;
    return newsData.filter(news => news.sentiment.label === activeTab);
  };
  
  return (
    <div className="bg-[hsl(var(--background))] p-6 rounded-lg shadow-lg max-w-6xl mx-auto my-8 font-['Inter']">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] tracking-tight">Financial News Sentiment</h1>
        
        <div className="flex flex-wrap gap-3 items-center">
          {/* Sector selector */}
          <Select value={sector} onValueChange={handleSectorChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Sectors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sectors</SelectItem>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="energy">Energy</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="etf">ETFs</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Search form */}
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <div className="relative flex items-center">
              <Search className="absolute left-2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
              <Input 
                id="ticker"
                type="text" 
                value={searchTicker}
                onChange={handleTickerChange}
                placeholder="Search ticker (e.g. AAPL)"
                className="pl-8 w-64 rounded-[var(--radius)] border-[hsl(var(--input))]"
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                onFocus={() => searchTicker && setSuggestions(allPopularTickers.filter(
                  ticker => ticker.toLowerCase().includes(searchTicker.toLowerCase())
                )) && setShowSuggestions(true)}
              />
              {searchTicker && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 h-6 w-6 hover:bg-[hsl(var(--secondary))]"
                  onClick={handleClearSearch}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-[var(--radius)] shadow-lg z-10 max-h-60 overflow-y-auto">
                  {suggestions.map((ticker) => (
                    <div
                      key={ticker}
                      className="px-3 py-2 cursor-pointer hover:bg-[hsl(var(--accent))]"
                      onClick={() => handleSuggestionClick(ticker)}
                    >
                      {ticker}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" className="ml-2 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))/90]">
              Search
            </Button>
          </form>
        </div>
      </div>
      
      {/* Display selected sector information */}
      {sector !== 'all' && (
        <div className="mb-4">
          <div className="inline-flex items-center bg-[hsl(var(--accent))] px-3 py-1 rounded-full text-sm">
            <span className="mr-1 font-medium capitalize">{sector}</span>
            <span className="text-[hsl(var(--muted-foreground))]">
              ({tickersBySector[sector]?.length || 0} tickers)
            </span>
          </div>
        </div>
      )}
      
      {loading && newsData.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[hsl(var(--primary))]"></div>
        </div>
      ) : error && newsData.length === 0 ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Sentiment Summary Card */}
          <Card className="mb-6 border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold">
                {searchTicker 
                  ? `Sentiment Overview for ${searchTicker}`
                  : sector !== 'all'
                    ? `${sector.charAt(0).toUpperCase() + sector.slice(1)} Sector Sentiment`
                    : 'Overall Market Sentiment'
                }
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div className="grid grid-cols-3 gap-4 flex-1 min-w-[280px]">
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-bold text-2xl">{sentimentPercentages.positive}%</div>
                    <div className="text-sm text-gray-500">Positive</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-gray-600 font-bold text-2xl">{sentimentPercentages.neutral}%</div>
                    <div className="text-sm text-gray-500">Neutral</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="text-red-600 font-bold text-2xl">{sentimentPercentages.negative}%</div>
                    <div className="text-sm text-gray-500">Negative</div>
                  </div>
                </div>
                <div className="text-sm text-[hsl(var(--muted-foreground))]">
                  Based on {newsData.length} recent news articles
                </div>
              </div>
              
              {/* Sentiment Progress Bar */}
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="flex h-full">
                  <div 
                    className="bg-green-500 h-full" 
                    style={{ width: `${sentimentPercentages.positive}%` }}
                  />
                  <div 
                    className="bg-gray-400 h-full" 
                    style={{ width: `${sentimentPercentages.neutral}%` }}
                  />
                  <div 
                    className="bg-red-500 h-full" 
                    style={{ width: `${sentimentPercentages.negative}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* News Tabs and Articles */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-4 bg-[hsl(var(--muted))]">
              <TabsTrigger value="all" className="data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))]">All News</TabsTrigger>
              <TabsTrigger value="positive" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">Positive</TabsTrigger>
              <TabsTrigger value="neutral" className="data-[state=active]:bg-gray-500 data-[state=active]:text-white">Neutral</TabsTrigger>
              <TabsTrigger value="negative" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">Negative</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-0">
              {filteredNewsBySentiment().length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-[hsl(var(--muted-foreground))]">No news found for this filter.</p>
                </div>
              ) : (
                <>
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {filteredNewsBySentiment().map((news, index) => (
                      <NewsArticle key={index} news={news} />
                    ))}
                  </div>
                  
                  {/* Load more button */}
                  {hasMore && (
                    <div className="mt-8 text-center">
                      <Button 
                        onClick={handleLoadMore} 
                        variant="outline" 
                        className="gap-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Loading More...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-4 w-4" />
                            Load More News
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default FinancialSentimentDashboard;