<div align="center">

# 🩺 MediFusion

### AI-Assisted Personal Health Management Platform

A full-stack personal health-management Progressive Web App (PWA) for tracking vitals, symptoms, mood, medications, medical images, and wearable data, with AI-assisted health insights and summaries.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-5.0-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![PWA](https://img.shields.io/badge/PWA-Installable-14B8A6?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Security](#-security--privacy) • [Getting Started](#-getting-started) • [Deployment](#-deployment) • [Disclaimer](#-medical-disclaimer)

</div>

---

## 🌟 Overview

**MediFusion** is a full-stack health-management application that brings together patient-entered health information, medication management, wearable synchronization, medical-image workflows, and AI-assisted analysis in one interface.

The application is designed as a personal health companion rather than a replacement for a licensed healthcare professional. AI-generated information is intended to support understanding and organization of health data, not to provide definitive diagnosis or treatment.

### Highlights

- ⚡ **Full-Stack SPA** — React, TypeScript, Vite, React Router and TanStack Query.
- 📱 **Progressive Web App** — Installable application experience with offline fallback and push-notification support.
- 🗄️ **PostgreSQL Backend** — Supabase PostgreSQL with Row-Level Security (RLS).
- 🔐 **Authenticated Data Access** — User-scoped database policies and authenticated Edge Functions.
- 🤖 **AI-Assisted Workflows** — Health chat, medical-image analysis, prescription extraction, drug-interaction analysis and health insights through server-side Edge Functions.
- ⌚ **Wearable Integrations** — Provider-specific OAuth/synchronization flows with normalization and duplicate prevention.
- 📊 **Health Analytics** — Trend charts and summaries for vitals, symptoms, mood and medication adherence.

---

## 🚀 Key Features

### 🩺 1. AI Health Assistant

- Conversational health assistant exposed through a Supabase Edge Function.
- Supports structured health-related responses and emergency keyword handling.
- AI requests are routed through server-side functions so provider credentials are not exposed in the browser.
- Health context can be assembled from application data where supported by the corresponding backend workflow.
- Responses are treated as informational assistance rather than medical diagnosis.

### 📊 2. Vitals Tracking

Track and visualize health measurements including:

- Blood pressure
- Heart rate
- Blood sugar
- SpO₂
- Temperature
- Weight
- Sleep and activity data received from supported integrations

The dashboard provides historical trends and health-data visualizations. Vitals can be entered manually or received through wearable synchronization; the application should not be considered a real-time clinical monitoring system.

### 🩹 3. Symptom Logger

- Record symptoms with severity, duration, frequency and body location.
- Maintain historical symptom records.
- Generate AI-assisted symptom summaries through backend workflows.
- Review symptom history alongside other personal health information.

### 🧠 4. Mental Health & Mood Tracking

- Daily mood scoring.
- Stress, anxiety and energy tracking.
- Sleep-quality information.
- Journal and gratitude entries.
- Trigger/activity tagging.
- Weekly trend visualization.

### 💊 5. Medication Management

- Create and manage medication schedules.
- Record medication doses and adherence.
- Track refill information.
- Browser/Web Push reminder support.
- AI-assisted drug-interaction checking.
- Prescription scanning and medication extraction workflow.

### ⌚ 6. Wearable Synchronization

Supported health ecosystems include workflows for:

- Apple Health / HealthKit
- Fitbit
- Garmin
- Android Health Connect

The synchronization layer handles provider-specific data formats and can normalize measurements such as:

- Steps
- Heart rate
- Resting heart rate
- Active calories
- Sleep duration
- SpO₂

Additional engineering features include OAuth state verification, token refresh handling, provider/device normalization, sync logging, validation, timeout handling and duplicate-record prevention.

### 📸 7. Medical Image & Document Analysis

- Upload supported medical files through private application storage.
- Store metadata separately from the uploaded content.
- Generate AI-assisted summaries for supported image/document workflows.
- Use short-lived signed URLs when protected files need to be accessed by authorized backend workflows.

> **Note:** AI image/document analysis is an assistive feature. It should not be treated as a definitive clinical interpretation.

### 📤 8. Health Reports & Data Export

- Generate health summaries/reports for personal use or discussion with healthcare professionals.
- Export supported health records as CSV.
- Organize personal health information in a centralized dashboard.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18.3, TypeScript 5.5, Vite 8.3 |
| **Routing** | React Router DOM v7 |
| **UI** | Tailwind CSS, Radix UI, shadcn/ui, Lucide |
| **Animation** | Framer Motion |
| **Charts** | Recharts |
| **Data Fetching / Server State** | TanStack React Query v5 |
| **Backend / Database** | Supabase, PostgreSQL, Row-Level Security |
| **Serverless Backend** | Supabase Edge Functions / Deno |
| **Storage** | Supabase Storage |
| **PWA** | vite-plugin-pwa, Workbox, Service Workers |
| **Notifications** | Web Push / browser notifications |
| **AI** | AI providers accessed through server-side Edge Functions, including Google Gemini and Hugging Face workflows used by individual features |
| **Testing** | Vitest, Testing Library, jsdom |
| **Mobile / Native Integration** | Capacitor configuration and platform-specific health integration support |

---

## 🏛 Architecture

```text
┌──────────────────────────────────────────────────────────────────────┐
│                        MediFusion Client                             │
├──────────────────────────────────────────────────────────────────────┤
│ React + TypeScript + Vite                                            │
│ React Router + TanStack Query + Tailwind + Recharts                  │
│                                                                      │
│ Dashboard │ Vitals │ Symptoms │ Mood │ Medications │ AI │ Wearables  │ 
│     │          │         │        │        │          │       │      │
│     └──────────┴─────────┴────────┴────────┴──────────┴───────┘      │
│                              │                                       │
│                    Custom Hooks / Services                           │
└──────────────────────────────┼───────────────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         Supabase                                     │
├──────────────────────────────────────────────────────────────────────┤
│ Auth │ PostgreSQL │ RLS │ Private Storage │ Edge Functions           │
│      │            │     │                │                           │
│      │            │     │                ├─ Health Chat              │
│      │            │     │                ├─ Medical Image Analysis   │
│      │            │     │                ├─ Prescription Scanning    │
│      │            │     │                ├─ Drug Interaction Checks  │
│      │            │     │                ├─ Health Insights          │
│      │            │     │                └─ Wearable Sync            │
└──────┼────────────┼─────┼────────────────┼───────────────────────────┘
       │            │     │                │
       ▼            ▼     ▼                ▼
   User Auth    Health DB  Protected   External AI / Health APIs
                           Files
```

### Typical request flow

```text
User Action
    ↓
React Component
    ↓
Custom Hook / React Query
    ↓
Supabase Client or Edge Function
    ↓
Authentication + Authorization
    ↓
PostgreSQL / Storage / External Provider
    ↓
Validated Response
    ↓
React Query Cache / UI
```

AI and third-party API credentials are intended to remain on the server-side Edge Function boundary rather than being embedded in the frontend bundle.

---

## 🔐 Security & Privacy

MediFusion handles sensitive personal health information, so security is treated as an application-level requirement.

### Database authorization

- PostgreSQL Row-Level Security policies use the authenticated user identity to scope personal records.
- Users are intended to access only their own health records.
- Sensitive application tables use user-scoped authorization policies.

### File protection

- Medical files are stored in protected Supabase Storage rather than public buckets.
- Authorized workflows can use short-lived signed URLs to access protected files.

### Edge Function security

- Protected backend functions authenticate the incoming user session where required.
- AI/provider credentials are kept server-side.
- Rate limiting is implemented for selected AI/API workflows.
- Input validation and request timeouts are used in relevant backend workflows.

### Wearable/OAuth security

- OAuth callback flows use state validation to reduce CSRF risk.
- Provider access/refresh credentials are treated as sensitive server-side data.
- Wearable synchronization includes validation, timeout handling and duplicate prevention.

> **Security note:** This README does not claim that the application has zero vulnerabilities. Security depends on the deployed configuration, database policies, dependencies, provider configuration and operational practices. Run current dependency/security audits before production deployment.

---

## 🧪 Testing

The repository includes Vitest-based tests covering application logic and wearable/data-processing behavior.

The current test suite contains **28 test cases** covering areas such as:

- Wearable data normalization
- Provider support
- Duplicate detection
- Device-name normalization
- Sync-chain construction
- Timeout behavior
- Parameter validation
- Heart-rate and SpO₂ validation
- Sleep-data conversion
- Apple Health metadata handling
- API response structure

Run the suite with:

```bash
npm test
```

The number of passing tests can change as the codebase evolves, so the README intentionally does not claim that every test is always passing without running the suite.

---

## 📁 Project Structure

```text
Medi-fusion/
├── public/                 # PWA assets, offline fallback and service-worker resources
├── src/
│   ├── components/        # Feature components and reusable UI
│   ├── hooks/              # Auth, data fetching and integration hooks
│   ├── integrations/       # Supabase client and generated types
│   ├── lib/                # Utilities, validation, normalization and exports
│   ├── pages/              # Main application routes
│   └── test/               # Vitest tests
├── supabase/
│   ├── functions/          # Deno/Supabase Edge Functions
│   └── migrations/         # PostgreSQL schema, functions and RLS policies
├── migration-guide/        # Database migration documentation/scripts
├── vercel.json             # Vercel deployment configuration
├── vite.config.ts          # Vite/PWA/build configuration
└── vitest.config.ts        # Vitest configuration
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js:** v18 or higher
- **npm:** v9 or higher
- A Supabase project for backend services
- Provider/API credentials for optional AI, wearable and notification features

### 1. Clone the repository

```bash
git clone https://github.com/Jaipreeth-J/Medi-fusion.git
cd Medi-fusion
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the sample file:

```bash
cp .env.example .env
```

Configure the required public Supabase values, for example:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
```

Additional server-side secrets required by optional Edge Functions should be configured in the Supabase project and **must not be placed in the Vite client environment**.

> Never commit production secrets or a real `.env` file to version control.

### 4. Configure the database

Apply the SQL migrations under `supabase/migrations/` to your Supabase project. The `migration-guide/` directory contains additional schema and migration documentation where applicable.

### 5. Configure Edge Functions

Deploy the required Supabase Edge Functions and configure their server-side secrets according to the providers used by the enabled features.

### 6. Run locally

```bash
npm run dev
```

Open the local URL printed by Vite.

### 7. Run tests

```bash
npm test
```

### 8. Build for production

```bash
npm run build
npm run preview
```

---

## 🚢 Deployment

### Vercel

The repository contains a `vercel.json` configuration for SPA deployment.

1. Push the repository to GitHub.
2. Import the repository into [Vercel](https://vercel.com/).
3. Configure the required frontend environment variables.
4. Configure the Supabase project and Edge Functions separately.
5. Deploy and verify authentication, database RLS, storage rules, PWA behavior and provider integrations in the deployed environment.

### Production checklist

Before production use, verify:

- [ ] RLS policies are enabled and tested for every sensitive table.
- [ ] Storage buckets are private where health information is stored.
- [ ] Server-side AI/OAuth credentials are not exposed to the browser.
- [ ] OAuth redirect URLs are restricted to expected environments.
- [ ] Rate limits are configured for public/expensive AI endpoints.
- [ ] Authenticated API responses are not cached in a way that could cross user/session boundaries.
- [ ] Dependency/security audits are run against the current lockfile.
- [ ] Medical AI safety messaging and escalation behavior have been reviewed.
- [ ] Production logging does not expose sensitive health information or credentials.
- [ ] Backup, retention and deletion policies are defined for health data.

---

## 🧭 Design & Engineering Notes

### Server-side AI boundary

AI functionality is separated into Edge Functions so that model/provider credentials do not need to be shipped with the React application.

### User-scoped data

Personal records follow an authenticated-user ownership model, with PostgreSQL RLS providing the primary database authorization layer.

### Wearable normalization

Different providers return different schemas and units. The wearable layer normalizes provider-specific records into application-level health measurements before persistence.

### Resilience

Relevant integration paths include request validation, timeouts, error handling and synchronization logging to prevent failed external calls from blocking the application indefinitely.

### PWA behavior

Static application assets can be cached for an offline-friendly experience. Authenticated health/API responses should remain subject to network and authorization controls rather than being treated as generic public cacheable content.

---

## ⚠️ Medical Disclaimer

**MediFusion is an educational/personal health-management and AI-assisted information tool. It is not a medical device and does not provide definitive medical diagnoses, replace professional medical advice, or prescribe treatment.**

AI-generated information may be incomplete, inaccurate or inappropriate for an individual situation. Users should verify important health information with a qualified healthcare professional.

For suspected medical emergencies, contact the appropriate local emergency service immediately rather than relying on the application or its AI features.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE), unless otherwise specified by the repository's license file.

---

## 👨‍💻 Author

**Jaipreeth J**

GitHub: [@Jaipreeth-J](https://github.com/Jaipreeth-J)
