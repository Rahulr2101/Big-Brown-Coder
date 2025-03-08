"use client"

import * as React from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { fetchStackData } from "@/api/fetchStockData"

// Sample data in the new format
const sampleData = [
  {
    "date": "2025-02-28T15:00:00.000Z",
    "ticker": "AAPL",
    "data": {
      "open": 238.89,
      "high": 242.09,
      "low": 238.8,
      "close": 241.37,
      "volume": 471023,
      "is_extended_hours": false
    }
  },
  // Add more sample data points here as needed
];

// Function to format data for the chart
function formatStockData(dataArray) {
  if (!Array.isArray(dataArray) || dataArray.length === 0) {
    return [];
  }
  
  return dataArray.map(item => ({
    date: item.date,
    ticker: item.ticker,
    open: item.data.open,
    close: item.data.close,
    high: item.data.high,
    low: item.data.low,
    volume: item.data.volume,
    is_extended_hours: item.data.is_extended_hours
  }));
}

export default function StockChart() {
  // You can replace this with actual data fetching logic
  const [stockData, setStockData] = React.useState([]);
  const [activeChart, setActiveChart] = React.useState("close");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [data,setData] = React.useState([]);

  
    
  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await fetchStackData();
        setData(response)
        console.log(Array.isArray(response),response)
        
        if (response && Array.isArray(response.data)) {
          const formattedData = formatStockData(response.data);
          setStockData(formattedData.reverse());
        } else {
          setError("Invalid data format");
        }
      } catch (err) {
        console.error("Error processing stock data:", err);
        setError("Failed to process stock data");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []); // Empty dependency array means this runs once on component mount


  const total = React.useMemo(
    () => {
      if (!stockData.length) return { open: 0, close: 0, high: 0, low: 0 };
      
      const latestValue = stockData[stockData.length - 1] || {};
      return {
        open: latestValue.open || 0,
        close: latestValue.close || 0,
        high: latestValue.high || 0,
        low: latestValue.low || 0,
      };
    },
    [stockData]
  );

  const chartConfig = {
    price: {
      label: "Stock Price",
    },
    open: {
      label: "Open",
      color: "hsl(var(--chart-1))",
    },
    close: {
      label: "Close",
      color: "hsl(var(--chart-2))",
    },
    high: {
      label: "High",
      color: "hsl(var(--chart-3))",
    },
    low: {
      label: "Low",
      color: "hsl(var(--chart-4))",
    },
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Stock Data...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // If we have data but it's empty
  if (stockData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Stock Data Available</CardTitle>
          <CardDescription>Please try again later</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5 sm:py-6">
          <CardTitle>{stockData[0]?.ticker || "AAPL"} Stock Price</CardTitle>
          <CardDescription>
            Showing stock data over time
          </CardDescription>
        </div>
        <div className="flex flex-wrap">
          {["close", "open", "high", "low"].map((key) => {
            return (
              <button
                key={key}
                data-active={activeChart === key}
                className="flex flex-1 flex-col justify-center gap-1 border-t px-4 py-3 text-left even:border-l data-[active=true]:bg-muted/50 sm:border-l sm:border-t-0 sm:px-6 sm:py-6"
                onClick={() => setActiveChart(key)}
              >
                <span className="text-xs text-muted-foreground">
                  {chartConfig[key].label}
                </span>
                <span className="text-lg font-bold leading-none sm:text-2xl">
                  ${total[key]?.toFixed(2)}
                </span>
              </button>
            )
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[350px] w-full"
        >
          <LineChart
            accessibilityLayer
            data={stockData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis 
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[180px]"
                  nameKey="price"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    });
                  }}
                  valueFormatter={(value) => `$${value.toFixed(2)}`}
                />
              }
            />
            <Line
              dataKey={activeChart}
              type="monotone"
              stroke={"red"}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}