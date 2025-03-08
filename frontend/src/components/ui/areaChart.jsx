"use client";

import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { fetchStackData } from "@/api/fetchStockData";

const availableStocks = [
  "AAPL", // Apple
  "MSFT", // Microsoft
  "GOOGL", // Google (Alphabet)
  "AMZN", // Amazon
  "META", // Meta (Facebook)
  "TSLA", // Tesla
  "NFLX", // Netflix
  "NVDA", // NVIDIA
  "AMD", // AMD (Advanced Micro Devices)
  "INTC", // Intel
  "SPY", // S&P 500 ETF
  "DIS", // Disney
  "V", // Visa
  "PYPL", // PayPal
  "BA", // Boeing
  "JNJ", // Johnson & Johnson
  "PFE", // Pfizer
  "VZ", // Verizon
  "GS", // Goldman Sachs
  "IBM", // IBM
  "WMT", // Walmart
  "KO", // Coca-Cola
  "PEP", // PepsiCo
  "BABA", // Alibaba
  "MCD", // McDonald's
  "ORCL", // Oracle
  "GS", // Goldman Sachs
  "XOM", // Exxon Mobil
  "CVX", // Chevron
  "UNH", // UnitedHealth Group
  "AMD", // AMD
  "CSCO", // Cisco Systems
  "SAP", // SAP
  "SQ", // Square
  "CRM", // Salesforce
  "LUV", // Southwest Airlines
  "GM", // General Motors
  "F", // Ford Motor Company
  "GE", // General Electric
];


const sampleData = {};

function formatStockData(dataByTicker) {
  const formattedData = {};

  Object.keys(dataByTicker).forEach((ticker) => {
    if (!Array.isArray(dataByTicker[ticker]) || dataByTicker[ticker].length === 0) {
      formattedData[ticker] = [];
      return;
    }

    formattedData[ticker] = dataByTicker[ticker].map((item) => ({
      date: item.date,
      ticker: item.ticker,
      open: item.data.open,
      close: item.data.close,
      high: item.data.high,
      low: item.data.low,
      volume: item.data.volume,
      is_extended_hours: item.data.is_extended_hours,
    }));
  });

  return formattedData;
}

function mergeStockData(stocksData) {
  const dateMap = new Map();
  Object.entries(stocksData).forEach(([ticker, dataPoints]) => {
    dataPoints.forEach((point) => {
      const dateStr = point.date;
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr });
      }

      const dateEntry = dateMap.get(dateStr);
      dateEntry[`${ticker}_open`] = point.open;
      dateEntry[`${ticker}_close`] = point.close;
      dateEntry[`${ticker}_high`] = point.high;
      dateEntry[`${ticker}_low`] = point.low;
    });
  });
  return Array.from(dateMap.values()).sort((a, b) => new Date(a.date) - new Date(b.date));
}

export default function MultiStockChart() {
  const [stocksData, setStocksData] = React.useState({});
  const [mergedData, setMergedData] = React.useState([]);
  const [selectedStocks, setSelectedStocks] = React.useState(["AAPL", "MSFT"]);
  const [activeChart, setActiveChart] = React.useState("close");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const dataPromises = selectedStocks.map(async (item) => {
          const response = await fetchStackData(item);
          sampleData[item] = response.data;
        });

        await Promise.all(dataPromises);

        const formattedData = formatStockData(sampleData);
        setStocksData(formattedData);
      } catch (err) {
        console.error("Error processing stock data:", err);
        setError("Failed to process stock data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedStocks]);

  React.useEffect(() => {
    if (Object.keys(stocksData).length > 0) {
      const merged = mergeStockData(stocksData);
      setMergedData(merged);
    }
  }, [stocksData]);

  const chartConfig = React.useMemo(() => {
    const config = {
      price: {
        label: "Stock Price",
      },
    };

    const colors = [
      "red",
      "green",
      "yellow",
      "black",
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
    ];

    selectedStocks.forEach((ticker, index) => {
      const colorIndex = index % colors.length;
      config[`${ticker}_${activeChart}`] = {
        label: `${ticker} ${activeChart}`,
        color: colors[colorIndex],
      };
    });

    return config;
  }, [selectedStocks, activeChart]);

  const latestValues = React.useMemo(() => {
    const values = {};

    selectedStocks.forEach((ticker) => {
      const stockData = stocksData[ticker] || [];
      if (stockData.length > 0) {
        const latest = stockData[stockData.length - 1];
        values[ticker] = {
          open: latest.open,
          close: latest.close,
          high: latest.high,
          low: latest.low,
        };
      } else {
        values[ticker] = { open: 0, close: 0, high: 0, low: 0 };
      }
    });

    return values;
  }, [stocksData, selectedStocks]);

  const toggleStockSelection = (ticker) => {
    setSelectedStocks((prev) =>
      prev.includes(ticker)
        ? prev.filter((t) => t !== ticker)
        : [...prev, ticker]
    );
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

  return (
    <Card className="shadow-lg">
      <CardHeader className="  flex-col items-stretch space-y-2 border-b p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
          <CardTitle>Stock Comparison</CardTitle>
          <CardDescription>
            Compare multiple stocks over time
          </CardDescription>
        </div>

        {/* Stock Selection */}
        <div className="flex flex-wrap px-6 py-2 gap-2">
          {availableStocks.map((ticker) => (
            <button
              key={ticker}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedStocks.includes(ticker)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
              onClick={() => toggleStockSelection(ticker)}
            >
              {ticker}
            </button>
          ))}
        </div>

        {/* Metric Selection */}
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
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </span>
                {selectedStocks.length > 0 ? (
                  <div className="space-y-1">
                    {selectedStocks.map((ticker) => (
                      <div key={ticker} className="flex justify-between">
                        <span className="text-xs">{ticker}</span>
                        <span className="text-sm font-bold">
                          ${latestValues[ticker]?.[key]?.toFixed(2) || "N/A"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-lg font-bold leading-none">
                    No stocks selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="px-2 sm:p-6">
        {mergedData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[350px] w-full"
          >
            <LineChart
              accessibilityLayer
              data={mergedData}
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
              <Legend />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    className="w-[220px]"
                    nameKey="price"
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                    valueFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                }
              />
              {selectedStocks.map((ticker, index) => (
                <Line
                  key={`${ticker}_${activeChart}`}
                  name={ticker}
                  dataKey={`${ticker}_${activeChart}`}
                  type="monotone"
                  stroke={chartConfig[`${ticker}_${activeChart}`].color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="flex justify-center items-center h-[350px]">
            <p className="text-muted-foreground">Select stocks to compare</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
