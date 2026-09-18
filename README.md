# Hisab — Ethiopian Calendar Finance App (Android APK)

Offline-first expense tracker with Ethiopian (Geʽez) calendar support.

**Developed by Melaku Sisay**

## Features

- Income / expense ledger
- Budgets & analysis
- Multi-account (Cash, Bank, Mobile, Savings…)
- 13-month Ethiopian calendar
- Geʽez / Arabic numerals toggle
- 8 themes: Warm, Dark, Ocean, Forest, Sunset, Midnight, Contrast, Pastel
- Fully offline — data stored in localStorage via Zustand
- Export transactions as CSV

## Architecture (Capacitor + CI)

```
React/Vite source
      ↓
npm install
      ↓
npm run build          → dist/
      ↓
npx cap add android    (generated in CI)
      ↓
npx cap sync android
      ↓
./gradlew assembleDebug
      ↓
app-debug.apk
```

Android project is **not** committed. It is generated on every GitHub Actions run.

## Local development

```bash
npm install
npm run dev          # http://localhost:8080
```

## Build APK via GitHub Actions

1. Push this repo to GitHub
2. Go to Actions → "Build Android APK" → Run workflow
3. Download the `hisab-debug-apk` artifact

## Package identity

- App name: **Hisab**
- Package ID: `com.melakusisay.hisab`
- Branding: Developed by Melaku Sisay
