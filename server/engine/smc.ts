import { MarketData } from './market';

export interface SetupSignal {
  type: 'BUY' | 'SELL' | 'NONE';
  entry: number;
  sl: number;
  tp1: number;
  tp2: number;
  confidence: number;
  bias: string;
  trend: string;
  atr: number;
  fvg_high: number;
  fvg_low: number;
}

export function generateSignal(
  m5Data: MarketData[], 
  m15Data: MarketData[], 
  h1Data: MarketData[]
): SetupSignal {
  if (m5Data.length < 14) return { type: 'NONE' } as SetupSignal;

  // Real logic placeholder (to be refined in engine)
  const lastClose = m5Data[m5Data.length - 1].close;
  
  // Calculate ATR 14
  let trSum = 0;
  for (let i = m5Data.length - 14; i < m5Data.length; i++) {
     const curr = m5Data[i];
     const prev = m5Data[i - 1];
     if (!prev) continue;
     const tr = Math.max(
       curr.high - curr.low,
       Math.abs(curr.high - prev.close),
       Math.abs(curr.low - prev.close)
     );
     trSum += tr;
  }
  const atr = trSum / 14;

  // Confidence Calculation stub (always wait if no trend detected)
  const confidence = 0;

  return {
    type: 'NONE',
    entry: lastClose,
    sl: 0,
    tp1: 0,
    tp2: 0,
    confidence: confidence,
    bias: 'NEUTRAL',
    trend: 'SIDEWAYS',
    atr: atr,
    fvg_high: 0,
    fvg_low: 0
  };
}

export function isKillzoneActive(dateWITA: Date): boolean {
  const hours = dateWITA.getHours();
  const minutes = dateWITA.getMinutes();
  const timeNum = hours + minutes / 60;
  
  // 15:00 - 18:00
  if (timeNum >= 15 && timeNum < 18) return true;
  // 21:30 - 00:00
  if (timeNum >= 21.5 || timeNum < 0) return true; // <0 won't happen but logically

  return false;
}
