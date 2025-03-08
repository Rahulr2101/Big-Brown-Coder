import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { CalendarIcon, Link2Icon, TrendingUpIcon, TrendingDownIcon, MinusIcon, ExternalLinkIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Custom CSS variables for sentiment colors
const cssVariables = `
:root {
  --sentiment-positive: 142, 72%, 29%;
  --sentiment-positive-light: 142, 72%, 95%;
  --sentiment-negative: 0, 84%, 60%;
  --sentiment-negative-light: 0, 84%, 95%;
  --sentiment-neutral: 220, 13%, 91%;
  --sentiment-neutral-light: 220, 13%, 97%;
}
`;

// Add CSS variables to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = cssVariables;
  document.head.appendChild(style);
}

const getSentimentColor = (sentiment) => {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return 'bg-green-50 border-green-200';
    case 'negative':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getSentimentTextColor = (sentiment) => {
  switch (sentiment.toLowerCase()) {
    case 'positive':
      return 'text-green-800';
    case 'negative':
      return 'text-red-800';
    default:
      return 'text-gray-800';
  }
};

const NewsArticle = ({ news }) => {
  // Get sentiment icon 
  const SentimentIcon = ({ sentiment }) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUpIcon className="w-4 h-4 text-green-600" />;
      case 'negative':
        return <TrendingDownIcon className="w-4 h-4 text-red-600" />;
      default:
        return <MinusIcon className="w-4 h-4 text-gray-600" />;
    }
  };

  // Example of a more complete article content that would come from the API
  const fullArticleContent = news.fullContent || `
    ${news.title}
    
    ${news.description || ''}
    
    ${news.title.includes('Gold') ? 
      `Gold prices have been showing resilience in recent trading sessions, maintaining levels above $2,300 per ounce despite a stronger U.S. dollar. Investors are closely watching upcoming Consumer Price Index (CPI) data, which could significantly impact gold's trajectory in the coming weeks.
      
      The precious metal has been supported by ongoing geopolitical tensions and central bank purchases, though rising Treasury yields have capped potential gains. Technical indicators suggest the metal remains in a bullish trend, with support at $2,285 and resistance near $2,340.
      
      Analysts from major investment banks remain divided on the short-term outlook. Some believe that inflation surprises could trigger a rally toward all-time highs, while others caution that a hotter-than-expected CPI print could strengthen the dollar and pressure gold prices.
      
      Trading volumes indicate institutional investors are positioning for volatility around the Federal Reserve's upcoming policy decisions, with options activity suggesting hedging against large price swings in either direction.
      
      Gold miners and ETFs have seen increased inflows as investors seek exposure to the precious metals sector, with larger producers outperforming junior miners year-to-date.` 
      : 
      news.ticker === 'AAPL' ?
      `Apple continues to show strength in its core product lineup despite broader market concerns about consumer spending. The company's services division has exceeded expectations, growing at a double-digit rate year-over-year and now representing a significant portion of overall revenue.
      
      Supply chain sources indicate production plans for the iPhone 16 series remain robust, with initial orders reportedly higher than the previous generation. Analysts project the upcoming product cycle could trigger a substantial upgrade wave among existing users with older devices.
      
      The company's continued investment in artificial intelligence capabilities is expected to be a major focus at the upcoming Worldwide Developers Conference, potentially opening new revenue streams and enhancing the ecosystem's stickiness.
      
      In emerging markets, particularly India, Apple has seen accelerating growth as premium smartphone adoption increases and the company expands its retail presence. However, regulatory challenges in China and Europe remain headwinds that investors are monitoring closely.
      
      Wall Street consensus maintains a generally bullish outlook on the stock, with most analysts assigning price targets that imply meaningful upside from current levels.`
      :
      news.ticker === 'TSLA' ?
      `Tesla shares have experienced significant volatility following mixed quarterly results and ongoing questions about future growth rates. The electric vehicle maker continues to face margin pressures as it navigates a more competitive landscape and works to manage production costs.
      
      Recent data from European and Chinese markets shows intensifying competition from both established automakers and emerging EV companies. Tesla's market share has declined in some regions, though it maintains leadership in the overall global EV market.
      
      The company's energy business has shown promising growth, with storage deployments reaching record levels. Some analysts believe this division could become an increasingly important driver of future profitability.
      
      Investors remain focused on progress with Full Self-Driving technology and the potential timeline for broader deployment. Regulatory approval processes continue to be a key variable in the company's autonomous driving strategy.
      
      The upcoming Robotaxi reveal event has generated significant speculation about Tesla's plans to enter new transportation markets, though details remain limited about commercial implementation timelines.`
      :
      `Latest market analysis indicates several key trends developing across major indices. Institutional investors have been adjusting portfolios in anticipation of shifting monetary policy, with sector rotation becoming more pronounced in recent sessions.
      
      Economic indicators released this week provided mixed signals about the strength of consumer spending and manufacturing activity. While employment data remains relatively strong, there are early signs of cooling in certain sectors of the economy.
      
      Corporate earnings have generally exceeded lowered expectations this quarter, though guidance has been more cautious than previous periods. Companies have highlighted ongoing concerns about input costs and the potential impact of interest rates on consumer behavior.
      
      Technical analysts note that key support and resistance levels are being tested across major indices, with market breadth measures showing some deterioration despite headline index performance.
      
      Options market activity suggests increased hedging against near-term volatility, with the VIX showing signs of basing after extended periods at historically low levels.`
    }
  `;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card className={`w-full overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer border-l-4 ${
          news.sentiment.label === 'positive' 
            ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-white' 
            : news.sentiment.label === 'negative' 
              ? 'border-l-red-500 bg-gradient-to-r from-red-50 to-white' 
              : 'border-l-gray-400 bg-gradient-to-r from-gray-50 to-white'
        }`}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className={`text-xl font-bold ${
                  news.sentiment.label === 'positive' 
                    ? 'text-green-800' 
                    : news.sentiment.label === 'negative' 
                      ? 'text-red-800' 
                      : 'text-gray-800'
                }`}>
                  {news.title}
                </CardTitle>
                <div className="flex items-center mt-2 space-x-2">
                  <Badge 
                    variant={
                      news.sentiment.label === 'positive' 
                        ? 'success' 
                        : news.sentiment.label === 'negative' 
                          ? 'destructive' 
                          : 'secondary'
                    } 
                    className="flex items-center gap-1"
                  >
                    <SentimentIcon sentiment={news.sentiment.label} />
                    {news.sentiment.label.charAt(0).toUpperCase() + news.sentiment.label.slice(1)}
                  </Badge>
                  {news.ticker && <Badge variant="outline">{news.ticker}</Badge>}
                </div>
              </div>
              {news.thumbnail && (
                <Avatar className="w-20 h-20 rounded-md ml-2 shadow-sm">
                  <img src={news.thumbnail.resolutions[0].url} alt={news.title} className="w-full h-full object-cover" />
                </Avatar>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="pb-1">
            <p className={`text-sm line-clamp-2 ${
              news.sentiment.label === 'positive' 
                ? 'text-green-700' 
                : news.sentiment.label === 'negative' 
                  ? 'text-red-700' 
                  : 'text-gray-600'
            }`}>
              {news.description || fullArticleContent.split('\n\n')[1] || ''}
            </p>
          </CardContent>
          
          <CardFooter className="pt-2 flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{news.formattedDate || new Date(news.published_at).toLocaleDateString()}</span>
              {news.source && (
                <>
                  <span>•</span>
                  <span>{news.source}</span>
                </>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={
                news.sentiment.label === 'positive' 
                  ? 'text-green-600 hover:text-green-800 hover:bg-green-50' 
                  : news.sentiment.label === 'negative' 
                    ? 'text-red-600 hover:text-red-800 hover:bg-red-50' 
                    : 'text-blue-500 hover:bg-gray-50'
              }
            >
         
            </Button>
          </CardFooter>
        </Card>
      </DialogTrigger>
      
      <DialogContent className={`sm:max-w-3xl max-h-[80vh] overflow-y-auto ${
        news.sentiment.label === 'positive' 
          ? 'border-green-200' 
          : news.sentiment.label === 'negative' 
            ? 'border-red-200' 
            : 'border-gray-200'
      }`}>
        <DialogHeader>
          <DialogTitle className={`text-xl font-bold ${
            news.sentiment.label === 'positive' 
              ? 'text-green-900' 
              : news.sentiment.label === 'negative' 
                ? 'text-red-900' 
                : 'text-gray-900'
          }`}>
            {news.title}
          </DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge 
              variant={
                news.sentiment.label === 'positive' 
                  ? 'success' 
                  : news.sentiment.label === 'negative' 
                    ? 'destructive' 
                    : 'secondary'
              } 
              className="flex items-center gap-1"
            >
              <SentimentIcon sentiment={news.sentiment.label} />
              {news.sentiment.label.charAt(0).toUpperCase() + news.sentiment.label.slice(1)}
            </Badge>
            {news.ticker && <Badge variant="outline">{news.ticker}</Badge>}
            {news.company && <Badge variant="outline">{news.company}</Badge>}
            {news.categories && news.categories.map((category, i) => (
              <Badge key={i} variant="outline">{category}</Badge>
            ))}
          </div>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {/* Main article content */}
          <div className={`text-gray-700 ${
            news.sentiment.label === 'positive' 
              ? 'bg-gradient-to-br from-green-50 to-white' 
              : news.sentiment.label === 'negative' 
                ? 'bg-gradient-to-br from-red-50 to-white' 
                : 'bg-gradient-to-br from-gray-50 to-white'
          } p-4 rounded-lg shadow-sm`}>
            {news.thumbnail && news.thumbnail.resolutions && news.thumbnail.resolutions.length > 0 && (
              <div className="mb-4">
                <img 
                  src={news.thumbnail.resolutions[0].url} 
                  alt={news.title} 
                  className="w-full h-auto max-h-80 object-cover rounded-lg shadow-sm" 
                />
              </div>
            )}
            
            <article className="prose prose-sm max-w-none">
              {fullArticleContent.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className={paragraph.trim() ? "my-4" : "my-2"}>
                  {paragraph.trim()}
                </p>
              ))}
            </article>
          </div>
          
          {/* Company info when available */}
          {news.ticker && (
            <div className="bg-gray-50 p-4 rounded-lg mt-6 shadow-sm">
              <h4 className="text-sm font-medium mb-2 text-gray-700">About {news.company || news.ticker}</h4>
              <p className="text-sm text-gray-600">
                {news.ticker === 'AAPL' ? 
                  "Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home, and accessories. It also provides AppleCare support and cloud services, and operates various platforms, including the App Store." :
                  news.ticker === 'TSLA' ?
                  "Tesla, Inc. designs, develops, manufactures, and sells electric vehicles, energy generation and storage systems. The company operates through Automotive, Energy Generation and Storage segments. Tesla also provides vehicle service centers, supercharger stations, and self-driving capability." :
                  news.ticker === 'NVDA' ?
                  "NVIDIA Corporation provides graphics, and compute and networking solutions. The company operates through Graphics, Compute & Networking segments. Its products are used in gaming, professional visualization, datacenter, and automotive markets." :
                  `${news.company || news.ticker} is a publicly traded company listed on major exchanges. The company operates in the ${news.ticker === 'XAU' ? 'precious metals and mining sector' : 'financial markets'}.`
                }
              </p>
            </div>
          )}
          
          {/* Sentiment Analysis Section */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-3 text-gray-700">Sentiment Analysis</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                    Positive
                  </span>
                  <span>{Math.round(news.sentiment.confidence[0] * 100)}%</span>
                </div>
                <Progress value={news.sentiment.confidence[0] * 100} className="h-2" indicatorClassName="bg-green-500" />
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-500 mr-1"></div>
                    Neutral
                  </span>
                  <span>{Math.round(news.sentiment.confidence[1] * 100)}%</span>
                </div>
                <Progress value={news.sentiment.confidence[1] * 100} className="h-2" indicatorClassName="bg-gray-500" />
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-1"></div>
                    Negative
                  </span>
                  <span>{Math.round(news.sentiment.confidence[2] * 100)}%</span>
                </div>
                <Progress value={news.sentiment.confidence[2] * 100} className="h-2" indicatorClassName="bg-red-500" />
              </div>
            </div>
          </div>
          
          {/* Market impact section */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-2 text-gray-700">Potential Market Impact</h4>
            <p className="text-sm text-gray-600">
              {news.sentiment.label === 'positive' 
                ? `This positive news could strengthen investor confidence in ${news.ticker || 'the market'}, potentially leading to increased buying activity in the short term. Traders may view this as a confirmation of bullish trends.`
                : news.sentiment.label === 'negative'
                ? `This negative development might pressure ${news.ticker || 'market'} prices, as investors reassess risk factors. Short-term volatility could increase as the market digests this information.`
                : `This neutral news is unlikely to significantly move ${news.ticker || 'the market'} in either direction. Investors will likely focus on upcoming economic data and earnings reports for clearer direction.`
              }
            </p>
          </div>
          
          {/* Footer with date and source link */}
          <div className="pt-4 flex items-center justify-between text-sm text-gray-500 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>{news.formattedDate || new Date(news.published_at).toLocaleDateString()}</span>
              {news.source && (
                <>
                  <span>•</span>
                  <span>{news.source}</span>
                </>
              )}
            </div>
            
            {news.url && (
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <ExternalLinkIcon className="w-3 h-3" />
                <a href={news.url} target="_blank" rel="noopener noreferrer">
                  View Original
                </a>
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewsArticle;