# PANDUAN PENYEBARAN (FASE 10)
**Tanggal**: 31 Mei 2026
**Versi**: 1.0

## 1. Penyebaran Railway (Backend Node.js Ekspress)
Penyebaran dilakukan ke Railway dengan `package.json` yang berisi script build standard `vite build && esbuild server.ts`. Railway menggunakan `npm run start` (yaitu `node dist/server.cjs`).
1. Hubungkan GitHub Repo ke Railway.
2. Setup Environment Variables di Railway:
   - `TWELVEDATA_API_KEY`
   - `NEWS_API_KEY`
   - `GNEWS_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `FIREBASE_PROJECT_ID`
   - `GOOGLE_APPLICATION_CREDENTIALS` (berupa JSON file / raw string JSON format)
   - `GEMINI_API_KEY`
3. Deploy!

## 2. Penyebaran Vercel (PWA Frontend - Opsional)
Pada setup ini Frontend bersatu di dalam Backend Railway (karena SSR routing `dist/index.html` dikelola Express). Tetapi jika Frontend dilepas (`npm run build` static), Vercel secara otomatis mendeteksi output path di direktori `dist/`.

## 3. Capacitor APK (Mobile App)
1. Install `@capacitor/core` dan `@capacitor/cli`.
2. Jalankan `npx cap init`.
3. Set Web Directory ke arah `dist/`.
4. Tambahkan plugin Android `npm i @capacitor/android && npx cap add android`.
5. Sync build: `npx cap sync`.
6. Ekstrak release Android ke build production APK.
