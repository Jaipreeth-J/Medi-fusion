<div align="center">

# 🩺 MediFusion

### Multimodal AI Clinical Intelligence & Health Companion Platform

An advanced, full-stack personal health management platform that unifies real-time vitals tracking, symptom logging, mental health journaling, medication schedules, wearable synchronization, and multimodal AI clinical decision support.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-FCC72B?logo=vitest&logoColor=black)](https://vitest.dev/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-14B8A6?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Deployment](#-deployment) • [Disclaimer](#-medical-disclaimer)

</div>

---

## 🌟 Overview

**MediFusion** bridges the gap between everyday wellness tracking and clinical insight. By combining patient-reported symptoms, continuous vital trends, medical imaging reports, and smart device telemetry, MediFusion delivers structured, evidence-based health assessments powered by Google Gemini multimodal models.

- ⚡ **Full-Stack SPA**: Built with React 18, TypeScript, and Vite 8 for instant load times and optimized bundle splitting.
- 📱 **Progressive Web App**: Installable on Android, iOS, and Desktop with offline fallback and push notifications.
- 🔒 **Zero Vulnerabilities**: Fully updated dependency tree (`react-router` v7, `vite` v8, `vitest` v5) audited with 0 security advisories.
- 🛡️ **Patient Data Privacy**: Protected by Supabase Row-Level Security (RLS) policies and encrypted medical document storage.

---

## 🚀 Key Features

### 🩺 1. AI Clinical Assistant & Health Chat
- **Multimodal Clinical Reasoning**: Synthesizes vitals, symptom history, active prescriptions, and user queries.
- **Risk Stratification**: Classifies concerns into Low (self-monitor), Medium (consult clinician), and High (urgent care).
- **Emergency Protocols**: Automatic keyword detection (cardiac, respiratory, mental crisis) triggering immediate SOS guidance.
- **Formatted Clinical Summaries**: Clean, structured medical responses with observations, differentials, and precautions.

### 📊 2. Continuous Vitals Monitoring
- Real-time logging for **Blood Pressure, Heart Rate, Blood Sugar, SpO2, Temperature, and Weight**.
- Interactive trend visualization powered by Recharts with clinical normal range benchmarks (AHA, WHO, CDC).
- High-performance memoization (`React.memo`, `useMemo`) preventing dashboard re-render overhead.

### 🩹 3. Symptom Logger & Assessment Timeline
- Log acute and chronic symptoms with severity scaling (1–10) and anatomical body location mapping (30+ zones).
- AI-driven symptom summaries correlating past check-ins with current wellness trends.

### 🧠 4. Mental Health Journal & Mood Tracker
- Daily emotional check-in with 10-point mood scoring, stress, anxiety, and energy indices.
- Gratitude notes, contextual trigger tagging, and weekly mood trend analytics.

### 💊 5. Medication Management & Interaction Checker
- Schedule prescription dosages with refill reminders and in-browser / Web Push notifications.
- Automated AI drug–drug interaction detection against current medications.
- Prescription scanner tool to parse and record medication labels automatically.

### ⌚ 6. Universal Wearable Synchronization
- Connect health ecosystems: **Apple Health**, **Fitbit**, **Garmin Connect**, and **Health Connect (Android 13+)**.
- Ingest step counts, resting heart rate, active calories, sleep duration, and SpO2.
- Device normalization layer standardizing data across disparate vendor schemas.

### 📸 7. Medical Image Analysis
- Securely upload lab reports, X-rays, MRI scans, and prescriptions (PNG, JPEG, PDF up to 10MB).
- Multimodal analysis via Gemini generating clinical summaries, key findings, and physician discussion points.

### 📤 8. Clinical Reports Export
- Generate professional PDF health reports for doctor visits formatted with patient demographics, vitals history, and medications.
- Export raw data as CSV for external research or personal archiving.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 18.3, TypeScript 5.5, Vite 8.3 |
| **Routing** | React Router DOM v7 (Modern Data Router) |
| **UI & Design System** | Tailwind CSS 3.4, Radix UI primitives, shadcn/ui, Lucide Icons |
| **Animations** | Framer Motion |
| **Data Visualization** | Recharts |
| **State & Data Fetching**| TanStack React Query v5 |
| **Backend & Database** | Supabase (PostgreSQL with Row Level Security, Edge Functions) |
| **PWA & Offline** | `vite-plugin-pwa`, Workbox, Web Push API, Service Workers |
| **AI Models** | Google Gemini (Multimodal Vision & Fast Reasoning via Supabase Edge Functions) |
| **Testing** | Vitest 5.0, Testing Library, jsdom (28/28 tests passing) |

---

## 🏛 Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MediFusion Web & PWA Client                     │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   React 18 + Vite 8  │  React Router v7  │  TanStack Query v5         │
│   Tailwind CSS       │  Radix Primitives │  Recharts Trends           │
│                                                                        │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌─────────┐ │
│   │ Dashboard    │   │ AI Chatbot   │   │ Vitals Track │   │ Wearable│ │
│   └───────┬──────┘   └───────┬──────┘   └───────┬──────┘   └───┬─────┘ │
│           └──────────────────┼──────────────────┘              │       │
│                              ▼                                 │       │
│                  Custom Hooks & Service Layer                  │       │
│          (useAuth, useVitals, useSymptoms, useWearables)       │       │
│                              │                                 │       │
└──────────────────────────────┼─────────────────────────────────┼───────┘
                               │                                 │
                               ▼                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Supabase Backend & Edge Infrastructure             │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌─────────┐ │
│   │  Auth & RLS  │   │  PostgreSQL  │   │   Storage    │   │  Edge   │ │
│   │  User Shield │   │  Health DB   │   │ Medical Imgs │   │Functions│ │
│   └──────────────┘   └──────────────┘   └──────────────┘   └───┬─────┘ │
│                                                                │       │
└────────────────────────────────────────────────────────────────┼───────┘
                                                                 │
                                                                 ▼
                                                  ┌──────────────────────┐
                                                  │ Google Gemini AI API │
                                                  │ Vision + Reasoning   │
                                                  └──────────────────────┘
```

---

## 📁 Project Structure

```
medi-fusion/
├── public/                 # PWA icons, offline fallback page, service workers
├── src/
│   ├── components/
│   │   ├── chat/           # Clinical AI assistant & message rendering
│   │   ├── dashboard/      # Health overview cards, metrics & onboarding checklist
│   │   ├── medications/    # Prescriptions, interaction alerts & adherence
│   │   ├── mental-health/  # Mood tracker, sliders & journal cards
│   │   ├── symptoms/       # Symptom logger & body location selector
│   │   ├── vitals/         # Vitals entry, trend charts & normal range alerts
│   │   ├── wearables/      # Wearable sync dialogs & provider cards
│   │   ├── medical-images/ # Image upload and AI analysis dialogs
│   │   ├── layout/         # AppLayout, navigation sidebar & auth layout
│   │   └── ui/             # Reusable Radix UI design system primitives
│   ├── hooks/              # Data fetching, auth and device integration hooks
│   ├── integrations/       # Supabase client & generated database typings
│   ├── lib/                # Utility helpers, normalization, sanitization & export
│   ├── pages/              # Primary route views (Dashboard, Chat, Vitals, etc.)
│   └── test/               # Vitest unit & integration test suites
├── supabase/
│   ├── functions/          # Deno-based edge functions (health-chat, wearable-sync)
│   └── migrations/         # PostgreSQL schema & Row-Level Security definitions
├── vercel.json             # Vercel SPA rewrites and caching headers
├── vite.config.ts          # Vite 8 config with manualChunks vendor splitting
└── vitest.config.ts        # Vitest 5 testing configuration
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or `bun` / `pnpm`)

### 1. Clone the Repository

```bash
git clone https://github.com/Jaipreeth-J/Medi-fusion.git
cd Medi-fusion
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the sample environment file and add your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

> **Note**: A `.env.example` template is provided in the repository root. Never commit your production `.env` file to version control.

### 4. Run Locally

```bash
npm run dev
```

Visit **http://localhost:8080** in your browser.

### 5. Run Tests

```bash
npm test
```

Executes the Vitest test suite with 28 passing unit and integration tests.

---

## 🚢 Deployment

### Deploy to Vercel (Recommended)

This repository includes a production-ready [`vercel.json`](vercel.json) configured for single-page routing and PWA service worker caching headers:

1. Push your repository to GitHub.
2. Sign in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import `Jaipreeth-J/Medi-fusion`.
4. Under **Environment Variables**, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
5. Click **Deploy**.

### Production Build

To test the compiled production bundle locally:

```bash
npm run build
npm run preview
```

---

## 🔒 Security & Privacy

- **Row Level Security (RLS)**: Enforced across all PostgreSQL tables. Patients can strictly read and write only their own records.
- **Secure File Storage**: Patient medical images are hosted in private Supabase Storage buckets accessible only through short-lived signed URLs.
- **Sanitized Outputs**: All clinical AI chat responses undergo sanitization to prevent injection vulnerabilities.
- **Zero-Vulnerability Toolchain**: Regularly audited with `npm audit` ensuring dependencies are patched against known CVEs.

---

## ⚠️ Medical Disclaimer

**MediFusion is an educational health management and clinical decision-support tool. It does NOT provide formal medical diagnoses, replace professional medical advice, or prescribe treatments.**

Always seek the guidance of a qualified physician or healthcare provider with any questions regarding personal health conditions. In the event of a medical emergency, immediately call local emergency services (e.g., 911 in the US, 112 in the EU, 108 in India).

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — free for personal and commercial development.
