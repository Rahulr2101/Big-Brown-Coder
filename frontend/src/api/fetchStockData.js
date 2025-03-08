import axios from "axios";

export async function fetchStackData(item) {
  try {
    const API_KEY = import.meta.env.VITE_ALPHA_API_KEY;
    const symbol = item;
    const interval = 'hour';

    const today = new Date().toISOString().split('T')[0];

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const dateFrom = lastMonth.toISOString().split('T')[0];
    const url = `https://api.stockdata.org/v1/data/intraday?symbols=${symbol}&api_token=${API_KEY}&interval=${interval}&date_from=${dateFrom}&date_to=${today}`;

    const response = await axios.get(url);
    console.log("Stock Data from last month to today:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching stock data:", error);
  }
}
