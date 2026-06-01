import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import * as dotenv from "dotenv";
import { startScheduler, getLastCheck } from "./server/scheduler";
import { db } from "./server/services/firebase";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;
  
  app.use(express.json());

  // Start Cron Scheduler
  startScheduler();

  // API CONTRACT (PRD Section 23)
  
  // 1. GET /api/system/status
  app.get("/api/system/status", (req, res) => {
    res.json({
      success: true,
      message: "System running smoothly",
      data: {
        status: "ONLINE",
        lastCheck: getLastCheck()
      }
    });
  });

  // 2. GET /api/test_connection
  app.get("/api/test_connection", async (req, res) => {
    try {
      const firebaseConnected = db !== null;
      res.json({
        success: true,
        message: "Connection test completed",
        data: {
          firebase: firebaseConnected ? "ONLINE" : "OFFLINE",
          twelvedata: process.env.TWELVEDATA_API_KEY ? "CONFIGURED" : "MISSING",
          gemini: process.env.GEMINI_API_KEY ? "CONFIGURED" : "MISSING",
          telegram: process.env.TELEGRAM_BOT_TOKEN ? "CONFIGURED" : "MISSING"
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message, data: {} });
    }
  });

  // 3. GET /api/signals
  app.get("/api/signals", async (req, res) => {
    if (!db) return res.status(500).json({ success: false, message: 'Firestore not configured', data: [] });
    try {
      const snapshot = await db.collection('signals')
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();
      const signals = snapshot.docs.map(doc => doc.data());
      res.json({ success: true, message: "Signals fetched", data: signals });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message, data: [] });
    }
  });

  // 4. GET /api/latest-signal
  app.get("/api/latest-signal", async (req, res) => {
    if (!db) return res.status(500).json({ success: false, message: 'Firestore not configured', data: null });
    try {
      const snapshot = await db.collection('signals')
        .where('status', '==', 'VALID')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();
      const signal = snapshot.empty ? null : snapshot.docs[0].data();
      res.json({ success: true, message: "Latest valid signal fetched", data: signal });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message, data: null });
    }
  });

  // FRONTEND FALLBACK (Vite Middleware)
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Failed to start server", e);
  process.exit(1);
});
