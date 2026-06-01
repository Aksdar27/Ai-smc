import cron from 'node-cron';
import { getMarketData } from './services/market';
import { checkNewsBlock } from './services/news';
import { isKillzoneActive, generateSignal } from './engine/smc';
import { validateSignal } from './services/gemini';
import { sendTelegramMessage } from './services/telegram';
import { db } from './services/firebase';
import { DateTime } from 'luxon';

let isRunning = false;
let lastCheck = new Date();

export function startScheduler() {
  console.log('Scheduler initialized (Interval: 60 Seconds)');
  
  // PRD Bagian 22: BackgroundScheduler Interval 60 Seconds
  cron.schedule('* * * * *', async () => {
    if (isRunning) return;
    isRunning = true;
    try {
      const nowWITA = DateTime.now().setZone('Asia/Makassar');
      lastCheck = nowWITA.toJSDate();

      console.log(`[Scheduler] Triggered at ${nowWITA.toFormat('dd/MM/yyyy HH:mm:ss')} WITA`);

      // 1. Check Killzone
      if (!isKillzoneActive(lastCheck)) {
        console.log('[Scheduler] WAITING_KILLZONE: Outside active hours.');
        isRunning = false;
        return;
      }

      // 2. Check News Block
      const newsStatus = await checkNewsBlock();
      if (newsStatus.isBlocked) {
        console.log(`[Scheduler] NEWS_BLOCK ACTIVE (Trigger: ${newsStatus.nextNews})`);
        isRunning = false;
        return;
      }

      // 3. Fetch Market Data
      const m5Data = await getMarketData('5min', 50);
      const m15Data = await getMarketData('15min', 50);
      const h1Data = await getMarketData('1h', 20);

      // 4. Run Engines (BOS, CHOCH, FVG, Fibonacci, ATR) => Build Setup
      const signalSetup = generateSignal(m5Data, m15Data, h1Data);

      // 5. Confidence check
      if (signalSetup.type !== 'NONE' && signalSetup.confidence >= 70) {
        
        // 6. Gemini AI Validation
        const aiVerdict = await validateSignal(signalSetup);
        
        // Output Signal Payload
        const finalSignal = {
          id: `SIG_${nowWITA.toMillis()}`,
          timestamp: nowWITA.toISO(),
          mode: 'SCALPING',
          type: signalSetup.type,
          symbol: 'XAUUSD',
          entry: signalSetup.entry,
          sl: signalSetup.sl,
          tp1: signalSetup.tp1,
          tp2: signalSetup.tp2,
          confidence: signalSetup.confidence,
          bias: signalSetup.bias,
          trend: signalSetup.trend,
          atr: signalSetup.atr,
          fvg_high: signalSetup.fvg_high,
          fvg_low: signalSetup.fvg_low,
          ai_verdict: aiVerdict.verdict,
          ai_reason: aiVerdict.reason,
          status: aiVerdict.verdict === 'HIGH_QUALITY' ? 'VALID' : 'INVALID',
          result: 'PENDING',
          created_at: adminFirestoreTokenCheck() ? new Date() : nowWITA.toISO(),
          updated_at: adminFirestoreTokenCheck() ? new Date() : nowWITA.toISO(),
        };

        // 7. Save to Firestore
        if (db) {
          await db.collection('signals').doc(finalSignal.id).set(finalSignal);
        }

        // 8. Send to Telegram if High Quality
        if (aiVerdict.verdict === 'HIGH_QUALITY') {
           const msg = `
<b>XAUUSD SIGNAL</b>
Mode: ${finalSignal.mode}
Type: <b>${finalSignal.type}</b>
Entry: ${finalSignal.entry}
SL: ${finalSignal.sl}
TP1: ${finalSignal.tp1}
TP2: ${finalSignal.tp2}
Confidence: ${finalSignal.confidence}%
AI Verdict: ${aiVerdict.verdict}
Timestamp: ${nowWITA.toFormat('dd/MM/yyyy HH:mm:ss')} WITA
           `.trim();
           await sendTelegramMessage(msg);
        }
      }

    } catch (err) {
      console.error('[Scheduler] Error:', err);
    } finally {
      isRunning = false;
    }
  });
}

function adminFirestoreTokenCheck() {
  return db !== null;
}

export function getLastCheck() {
  return lastCheck;
}
