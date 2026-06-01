# ARCHITECTURE REVIEW & ARCHITECTURAL DECISION RECORD (FASE 2)
**Tanggal**: 31 Mei 2026
**Versi**: 1.0

## 1. Lingkungan Runtime dan Adaptasi Bahasa
Sesuai PRD, backend direncanakan dengan Python 3.12 (Flask/Gunicorn). **Namun**, sistem aplikasi ini dikembangkan dan akan dilive-preview di dalam environment Google AI Studio Sandbox yang mensyaratkan native **Node.js (TypeScript) + Vite** untuk full-stack. 
- **Keputusan**: Backend akan dikembangkan menggunakan **Node.js (Express + TypeScript) sebagai backend**.
- **Resiliensi**: Node.js juga menjadi first-class citizen pada environment Railway (target deployment) dan Vercel. 
- **Ekuivalensi Fungsi**: 
  - Flask → Express.js
  - APScheduler → `node-cron`
  - Python Logic SMC → Strict TypeScript Algorithms.
  - Python Firebase Admin → Node.js Firebase Admin SDK.

## 2. Market Data Flow & Fallback Architecture
- **Primary Node**: Fetching harga `XAU/USD` di TwelveData API (M5, M15, H1, H4).
- **Secondary Node (Failover)**: Apabila TwelveData mendapat limit 429 atau membalas format aneh, fallback ke `yahoo-finance2` dengan symbol `GC=F`.
- Semua data dikonversi ke timezone `Asia/Makassar` (WITA) menggunakan library `luxon`. 

## 3. Database Schema (Firestore)
Skema dibuat identik dengan Bagian 20 PRD:
1. `signals` (Collection): Track record histori dan sinyal terbaru.
2. `system` (Collection): Track record ping service dan sistem alarm.

## 4. Keamanan
Aplikasi bersifat Full-Stack. Seluruh Private Key API `TWELVEDATA`, `TELEGRAM`, `NEWSAPI`, dll HANYA dibaca oleh server (via `process.env`). Tidak ada prefix `VITE_` untuk kunci rahasia. Semua interaksi diamankan server-side.

*Telah Disetujui secara Prosedural untuk lanjut ke Fase Implementasi*
