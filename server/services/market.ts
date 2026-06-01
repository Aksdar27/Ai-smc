import axios from 'axios';
import yahooFinance from 'yahoo-finance2';

export interface MarketData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export async function getMarketData(interval: '5min' | '15min' | '1h' | '4h', limit: number = 20): Promise<MarketData[]> {
  try {
    // Primary: TwelveData
    const apiKey = process.env.TWELVEDATA_API_KEY;
    if (apiKey) {
      const response = await axios.get(`https://api.twelvedata.com/time_series`, {
        params: {
          symbol: 'XAU/USD',
          interval: interval,
          outputsize: limit,
          apikey: apiKey
        },
        timeout: 10000
      });

      if (response.data && response.data.values) {
        return response.data.values.map((v: any) => ({
          timestamp: v.datetime,
          open: parseFloat(v.open),
          high: parseFloat(v.high),
          low: parseFloat(v.low),
          close: parseFloat(v.close)
        })).reverse(); // Oldest to newest
      }
    }
    throw new Error("TwelveData failed or missing key");
  } catch (error) {
    console.warn("TwelveData fallback triggered. Using Yahoo Finance.", error);
    return await fallbackYahoo(interval, limit);
  }
}

async function fallbackYahoo(interval: string, limit: number): Promise<MarketData[]> {
  try {
    const yfIntervalMap: Record<string, '5m' | '15m' | '60m' | '1d'> = {
      '5min': '5m',
      '15min': '15m',
      '1h': '60m',
      '4h': '60m' // Yahoo doesn't support 4h well, might need agg or use 1d
    };

    const yfInterval = yfIntervalMap[interval] || '15m';
    
    // Yahoo limit might be larger
    const queryOptions = { period1: '1d', interval: yfInterval };
    const result = await yahooFinance.chart('GC=F', queryOptions);

    if (result && result.quotes) {
      let quotes = result.quotes.slice(-limit);
      return quotes.map((q: any) => ({
        timestamp: q.date.toISOString(),
        open: q.open || 0,
        high: q.high || 0,
        low: q.low || 0,
        close: q.close || 0
      }));
    }
    throw new Error("Yahoo Finance returned empty");
  } catch (err) {
    console.error("Yahoo Finance Fallback Error:", err);
    return [];
  }
}
