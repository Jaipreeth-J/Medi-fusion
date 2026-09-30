# MediFusion

<b>Multimodal Clinical Intelligence Platform</b>

MediFusion is a comprehensive AI-powered health tracking and clinical decision-support system that combines vitals monitoring, symptom tracking, mental health journaling, medical image analysis, and medication management into a unified intelligent health companion.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [AI Models & Capabilities](#ai-models--capabilities)
6. [Clinical Reasoning Pipeline](#clinical-reasoning-pipeline)
7. [Database Schema](#database-schema)
8. [Edge Functions](#edge-functions)
9. [Project Structure](#project-structure)
10. [Pages & Routes](#pages--routes)
11. [Components](#components)
12. [Custom Hooks](#custom-hooks)
13. [Constants & Configuration](#constants--configuration)
14. [Security & Privacy](#security--privacy)
15. [Output Formatting](#output-formatting)
16. [Medical Image Analysis](#medical-image-analysis)
17. [PWA & Installation](#pwa--installation)
18. [Push Notifications](#push-notifications)
19. [Offline Support](#offline-support)
20. [Capacitor Mobile App](#capacitor-mobile-app)
21. [Getting Started](#getting-started)
22. [Environment Variables](#environment-variables)
23. [Deployment](#deployment)

---

## Overview

MediFusion provides:

- **Real-time Health Monitoring**: Track vitals, symptoms, mood, and medications
- **AI Clinical Assessment**: Multimodal reasoning across all health data
- **Medical Image Analysis**: Upload and analyze X-rays, lab reports, prescriptions
- **Intelligent Chat**: Interactive health Q&A with clinical context
- **Data Export**: Generate PDF reports or CSV exports for healthcare providers

---

## Features

### 🩺 AI Health Chat

Interactive clinical decision-support assistant with:
- Full clinical reasoning pipeline
- Emergency detection with crisis resources
- Risk stratification (Low / Medium / High)
- Medication-aware responses
- HTML-formatted output for clean UI rendering

### 📊 Vitals Tracking

Monitor and visualize vital signs:
- Heart rate, blood pressure (systolic/diastolic)
- Blood sugar, SpO2, temperature
- Weight, sleep hours, activity minutes
- Interactive charts with trend analysis
- Normal range indicators

### 🩹 Symptom Tracker

Log and analyze symptoms:
- Severity scaling (1-10)
- Body location mapping (30+ anatomical areas)
- Duration and frequency tracking
- AI-generated symptom summaries

### 🧠 Mental Health Tracker

Comprehensive mood and wellness monitoring:
- Daily mood logging (1-10 scale with emoji indicators)
- Stress, anxiety, and energy level tracking
- Sleep quality monitoring
- Activity and trigger pattern detection
- Journal entries with gratitude notes
- Weekly mood charts

### 💊 Medications Manager

Track prescriptions and supplements:
- Medication schedules and reminders
- Dosage and frequency tracking
- Drug interaction checking via AI
- Refill reminders
- Prescribing doctor and pharmacy info

### ⌚ Wearable Sync

Universal smartwatch and fitness tracker integration:
- **Supported Platforms:**
  - Google Fit (Amazfit, Wear OS, Android watches)
  - Fitbit (all Fitbit devices)
  - Garmin (Garmin Connect)
  - Health Connect (Android 13+ native)
- **Synced Data Types:**
  - Heart rate, SpO2, steps, calories
  - Sleep hours, stress level
  - Weight, body temperature
- **Features:**
  - OAuth-based secure authentication
  - Manual and automatic sync options
  - Optional symptom input during sync
  - Sync history and status tracking
  - Modular architecture for adding new providers

**Workflow:**
1. User connects wearable via OAuth
2. Selects data types to sync
3. Optionally adds symptoms
4. Clicks "Sync Now"
5. Data stored in vitals table
6. View sync history and status

### 📸 Medical Image Analysis

**Workflow:**
1. User uploads image/report
2. Optionally adds symptom notes
3. Clicks "Analyze" button (runs once)
4. Result is stored in database
5. Button changes to "View Result"
6. Clicking opens modal with image + analysis

### 📈 Unified Dashboard

Central hub with health insights:
- Recent vitals overview
- Symptom summary cards
- Mood trends
- Quick action buttons
- AI-generated health insights

### 📤 Data Export

Export health records:
- **PDF Report**: Clinical formatting with patient info
- **CSV Export**: Raw data for analysis
- Includes vitals, symptoms, mood, medications

### 👤 User Profile

Complete health profile management:
- Personal information (name, DOB, gender)
- Medical history (blood type, height, weight)
- Allergies and medical conditions
- Emergency contact information
- Onboarding flow for new users

---

## Technology Stack

| Category | Technology |
|----------|------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Animations** | Framer Motion |
| **Charts** | Recharts |
| **Forms** | React Hook Form, Zod validation |
| **State** | TanStack React Query |
| **Routing** | React Router DOM v6 |
| **PDF** | jsPDF with jspdf-autotable |
| **Backend** | Lovable Cloud (Supabase) |
| **Database** | PostgreSQL with Row Level Security |
| **Storage** | Supabase Storage (encrypted) |
| **Auth** | Supabase Auth (email-based) |
| **AI Gateway** | Lovable AI (Google Gemini models) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MediFusion Application                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                   React Frontend                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │   │
│  │  │Dashboard│ │  Chat   │ │ Vitals  │ │Symptoms │       │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘       │   │
│  │       │           │           │           │              │   │
│  │  ┌────┴───────────┴───────────┴───────────┴────┐        │   │
│  │  │           Custom Hooks Layer                 │        │   │
│  │  │  useAuth | useVitals | useSymptoms | useMood │        │   │
│  │  └────────────────────┬─────────────────────────┘        │   │
│  └───────────────────────│──────────────────────────────────┘   │
│                          │                                       │
│  ┌───────────────────────▼──────────────────────────────────┐   │
│  │                 Supabase Client                           │   │
│  │         (Auth, Database, Storage, Functions)              │   │
│  └───────────────────────┬──────────────────────────────────┘   │
│                          │                                       │
└──────────────────────────│───────────────────────────────────────┘
                           │
┌──────────────────────────▼───────────────────────────────────────┐
│                    Lovable Cloud (Supabase)                       │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │  Auth      │  │  Database  │  │  Storage   │  │   Edge     │ │
│  │  (Users)   │  │ (Postgres) │  │  (Images)  │  │ Functions  │ │
│  └────────────┘  └────────────┘  └────────────┘  └─────┬──────┘ │
│                                                         │        │
└─────────────────────────────────────────────────────────│────────┘
                                                          │
┌─────────────────────────────────────────────────────────▼────────┐
│                    Lovable AI Gateway                             │
│              (Google Gemini 2.5 Pro / 3 Flash)                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## AI Models & Capabilities

### Multi-Model Architecture

MediFusion operates as a **high-accuracy MULTI-MODEL clinical intelligence system**, combining outputs from multiple specialized medical models for maximum clinical accuracy.

### Model Assignments

| Engine | Model Type | Role |
|--------|------------|------|
| **Symptom & Clinical Text** | Biomedical NLP (BioBERT / PubMedBERT / ClinicalBERT class) | Extract symptoms, duration, severity, negations; map to evidence-based conditions |
| **Health Chat & Reasoning** | `google/gemini-3-flash-preview` | Fast reasoning, conversational explanation, differential synthesis |
| **Vitals & Wearables** | Rule-based + statistical analysis (WHO/AHA/CDC ranges) | Detect abnormal vitals, trends, acute deterioration |
| **Medical Image Analysis** | BiomedCLIP (feature extraction) + `google/gemini-2.5-pro` (reasoning) | Interpret X-rays, CT, MRI, skin images, lab reports with confidence scoring |
| **Drug Interactions** | RxNorm / DrugBank-style knowledge + `google/gemini-3-flash-preview` | Detect drug–drug interactions, contraindications, risk combinations |

### Multi-Model Fusion Rules

```
SIGNAL PRIORITIZATION:
1) Objective findings (images, vitals, reports)
2) Biomedical NLP interpretation
3) User-reported symptoms

CONFIDENCE RULES:
• Increase confidence ONLY when multiple signals align
• Reduce certainty when signals conflict
• Never hallucinate beyond available evidence
• Prefer common, evidence-based conditions over rare ones
```

### Accuracy & Safety Rules

- Prefer common, evidence-based conditions over rare ones unless strongly indicated
- Avoid over-diagnosis when evidence is limited
- Provide treatment/medication suggestions ONLY when supported by findings
- Clearly mark high-risk situations

---

## Clinical Reasoning Pipeline

All AI responses follow a 7-step clinical reasoning pipeline:

```
STEP 1: DATA INGESTION
├── Image analysis → Visual findings
├── Symptom input → Severity, duration, location
├── Vitals data → Abnormal values and trends
├── Medications → Current prescriptions
└── User profile → Medical history context

STEP 2: CROSS-MODAL CORRELATION
├── Validate consistency across data sources
├── Identify conflicts or gaps
└── State uncertainty explicitly

STEP 3: CLINICAL ASSESSMENT
├── Identify affected body systems
├── Ranked differential possibilities
└── Use probability language ("may indicate", "commonly associated")

STEP 4: RISK STRATIFICATION
├── LOW → Self-monitoring appropriate
├── MEDIUM → Medical consultation advised
└── HIGH → Urgent attention recommended

STEP 5: MANAGEMENT & PRECAUTIONS
├── Immediate precautions
├── What to avoid
├── Monitoring instructions
└── Warning signs

STEP 6: TREATMENT INFO (Only if requested)
├── General treatment approaches
└── Clarify as diagnosis-dependent

STEP 7: EMERGENCY OVERRIDE
└── Severe red flags → Immediate emergency guidance + crisis resources
```

---

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile data (name, DOB, blood type, allergies, emergency contacts) |
| `vitals` | Vital sign recordings (heart rate, BP, blood sugar, SpO2, etc.) |
| `symptoms` | Symptom entries (name, severity, body location, duration) |
| `mood_entries` | Mental health logs (mood score, stress, anxiety, energy, journal) |
| `medications` | Medication tracking (name, dosage, frequency, schedule) |
| `medication_logs` | Medication adherence records |
| `medical_images` | Uploaded images/reports with AI summaries |
| `conversations` | Chat conversation threads |
| `chat_messages` | Individual chat messages |
| `health_insights` | AI-generated health insights |
| `drug_interactions` | Detected medication interactions |
| `wearable_connections` | Connected wearable devices (OAuth tokens, provider info) |
| `wearable_sync_logs` | Sync history and status logs |

### Row Level Security

All tables are protected with RLS policies ensuring:
- Users can only read/write their own data
- Data isolation between users
- Secure multi-tenant architecture

---

## Edge Functions

### `health-chat`

Main clinical chat endpoint.

**Input:**
```json
{
  "messages": [{ "role": "user", "content": "..." }],
  "isEmergency": false,
  "medications": [...]
}
```

**Output:**
```json
{
  "content": "<HTML-formatted clinical response>"
}
```

### `analyze-medical-image`

Medical image/report analysis endpoint.

**Input:**
```json
{
  "imageUrl": "https://...",
  "imageType": "xray",
  "bodyPart": "chest",
  "fileName": "xray.jpg"
}
```

**Output:**
```json
{
  "summary": "<HTML-formatted analysis>"
}
```

### `symptom-summary`

AI symptom pattern analysis.

### `generate-health-insights`

Cross-modal health trend synthesis.

### `check-drug-interactions`

Medication interaction checker.

### `wearable-oauth`

OAuth flow handler for wearable providers.

**Input:**
```json
{
  "provider": "google_fit | fitbit | garmin | health_connect",
  "action": "initiate | callback",
  "redirect_uri": "https://...",
  "code": "...",
  "state": "..."
}
```

### `wearable-sync`

Fetch and store health data from connected wearables.

**Input:**
```json
{
  "connectionId": "uuid",
  "dataTypes": ["heart_rate", "spo2", "steps", "calories", "sleep"],
  "symptoms": "optional symptom notes"
}
```

**Output:**
```json
{
  "success": true,
  "vitals": { "heart_rate": 72, "spo2": 98, "steps": 8500 },
  "recordsSynced": 5
}
```

---

## Project Structure

```
src/
├── components/
│   ├── common/              # Shared components
│   │   ├── EmergencyBanner.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── MetricCard.tsx
│   │   ├── SafetyDisclaimer.tsx
│   │   └── VoiceInputButton.tsx
│   │
│   ├── dashboard/           # Dashboard widgets
│   │   ├── HealthInsightsCard.tsx
│   │   ├── MoodOverview.tsx
│   │   ├── QuickActions.tsx
│   │   ├── RecentActivity.tsx
│   │   ├── SymptomsOverview.tsx
│   │   └── VitalsOverview.tsx
│   │
│   ├── export/              # Data export
│   │   └── ExportDialog.tsx
│   │
│   ├── layout/              # App layout
│   │   ├── AppLayout.tsx
│   │   └── AuthLayout.tsx
│   │
│   ├── medical-images/      # Image upload/analysis
│   │   ├── ImageCard.tsx
│   │   └── UploadImageDialog.tsx
│   │
│   ├── medications/         # Medication management
│   │   ├── AddMedicationDialog.tsx
│   │   ├── DrugInteractionCard.tsx
│   │   ├── MedicationCard.tsx
│   │   ├── MedicationReminders.tsx
│   │   └── NotificationSettings.tsx
│   │
│   ├── mental-health/       # Mental health tracking
│   │   ├── ActivityPicker.tsx
│   │   ├── AddMoodDialog.tsx
│   │   ├── JournalEntry.tsx
│   │   ├── LevelSlider.tsx
│   │   ├── MoodEntryCard.tsx
│   │   ├── MoodSelector.tsx
│   │   ├── MoodStatsCards.tsx
│   │   └── WeeklyMoodChart.tsx
│   │
│   ├── profile/             # User profile
│   │   ├── EmergencyContactForm.tsx
│   │   ├── MedicalHistoryForm.tsx
│   │   ├── OnboardingDialog.tsx
│   │   ├── PersonalInfoForm.tsx
│   │   └── ProfileHeader.tsx
│   │
│   ├── symptoms/            # Symptom tracking
│   │   ├── AddSymptomDialog.tsx
│   │   ├── BodyLocationPicker.tsx
│   │   ├── SeveritySlider.tsx
│   │   ├── SymptomCard.tsx
│   │   └── SymptomSummary.tsx
│   │
│   ├── ui/                  # shadcn/ui components
│   │   └── (40+ components)
│   │
│   └── vitals/              # Vitals tracking
│       ├── AddVitalDialog.tsx
│       ├── BloodPressureChart.tsx
│       ├── VitalChart.tsx
│       └── VitalsSummaryCards.tsx
│
├── hooks/                   # Custom React hooks
│   ├── useAuth.tsx
│   ├── useVitals.tsx
│   ├── useSymptoms.tsx
│   ├── useMood.tsx
│   ├── useMedications.tsx
│   ├── useMedicationReminders.tsx
│   ├── useMedicalImages.tsx
│   ├── useWearables.tsx
│   ├── useProfile.tsx
│   ├── useHealthInsights.tsx
│   ├── useAssessmentHistory.tsx
│   ├── useNotifications.tsx
│   ├── useVoiceInput.tsx
│   ├── use-mobile.tsx
│   └── use-toast.ts
│
├── integrations/
│   └── supabase/
│       ├── client.ts        # Supabase client (auto-generated)
│       └── types.ts         # Database types (auto-generated)
│
├── lib/
│   ├── constants.ts         # App constants
│   ├── exportUtils.ts       # PDF/CSV export utilities
│   └── utils.ts             # Helper utilities
│
├── pages/                   # Route pages
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── Chat.tsx
│   ├── Vitals.tsx
│   ├── Symptoms.tsx
│   ├── MentalHealth.tsx
│   ├── Medications.tsx
│   ├── Wearables.tsx
│   ├── WearablesCallback.tsx
│   ├── MedicalImages.tsx
│   ├── AssessmentHistory.tsx
│   ├── Profile.tsx
│   └── NotFound.tsx
│
├── App.tsx                  # Root component with routing
├── main.tsx                 # Entry point
└── index.css                # Global styles + Tailwind

supabase/
├── config.toml              # Supabase configuration
└── functions/               # Edge Functions
    ├── health-chat/
    ├── symptom-summary/
    ├── analyze-medical-image/
    ├── generate-health-insights/
    ├── check-drug-interactions/
    ├── wearable-oauth/
    └── wearable-sync/
```

---

## Pages & Routes

| Route | Page | Auth Required | Description |
|-------|------|---------------|-------------|
| `/auth` | Auth | No | Login / Sign up |
| `/` | Dashboard | Yes | Main dashboard overview |
| `/dashboard` | Dashboard | Yes | Alias for root |
| `/chat` | Chat | Yes | AI health assistant |
| `/vitals` | Vitals | Yes | Vital signs tracking |
| `/symptoms` | Symptoms | Yes | Symptom logging |
| `/mental-health` | MentalHealth | Yes | Mood & wellness |
| `/medications` | Medications | Yes | Medication management |
| `/wearables` | Wearables | Yes | Wearable device sync |
| `/wearables/callback` | WearablesCallback | Yes | OAuth callback handler |
| `/images` | MedicalImages | Yes | Medical image uploads |
| `/history` | AssessmentHistory | Yes | Past AI assessments |
| `/profile` | Profile | Yes | User profile settings |

---

## Components

### Common Components

| Component | Purpose |
|-----------|---------|
| `EmergencyBanner` | Crisis alert banner with emergency resources |
| `LoadingSpinner` | Loading indicators (sm, md, lg, full-page) |
| `MetricCard` | Reusable metric display card |
| `SafetyDisclaimer` | Medical disclaimer notices |
| `VoiceInputButton` | Voice-to-text input button |

### UI Components (shadcn/ui)

Full shadcn/ui component library including:
- Button, Card, Dialog, Sheet, Drawer
- Form, Input, Textarea, Select, Checkbox
- Tabs, Accordion, Collapsible
- Toast, Sonner, Alert
- Calendar, DatePicker
- Charts (via Recharts integration)
- And 30+ more...

---

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Authentication state and methods |
| `useProfile` | User profile CRUD operations |
| `useVitals` | Vitals data fetching and mutations |
| `useSymptoms` | Symptom tracking operations |
| `useMood` | Mental health/mood operations |
| `useMedications` | Medication management |
| `useMedicationReminders` | Medication schedule reminders |
| `useMedicalImages` | Image upload, analysis, deletion |
| `useWearables` | Wearable device connections and sync |
| `useHealthInsights` | AI-generated insights |
| `useAssessmentHistory` | Past assessment retrieval |
| `useNotifications` | Browser notification permissions |
| `useVoiceInput` | Speech-to-text functionality |
| `use-mobile` | Responsive breakpoint detection |
| `use-toast` | Toast notification system |

---

## Constants & Configuration

### Emergency Detection

Keywords that trigger emergency response:
- Physical: "chest pain", "heart attack", "can't breathe", "stroke", "severe bleeding", "seizure", "overdose"
- Mental health: "suicidal", "want to die", "self harm", "cutting myself"
- Pediatric: "baby not breathing", "child choking"

### Vital Ranges

| Vital | Normal Range | Warning Range | Unit |
|-------|--------------|---------------|------|
| Heart Rate | 60-100 | 50-110 | bpm |
| Systolic BP | 90-120 | 80-140 | mmHg |
| Diastolic BP | 60-80 | 50-90 | mmHg |
| Blood Sugar | 70-100 | 60-125 | mg/dL |
| SpO2 | 95-100 | 90-100 | % |
| Temperature | 36.1-37.2 | 35.5-38.0 | °C |

### Mood Scale

| Score | Label | Emoji |
|-------|-------|-------|
| 1-2 | Very Low / Low | 😢 😔 |
| 3-4 | Somewhat Low / Slightly Low | 😕 😐 |
| 5 | Neutral | 😑 |
| 6-7 | Slightly Good / Good | 🙂 😊 |
| 8-10 | Very Good / Great / Excellent | 😄 😁 🤩 |

### Image Types

- X-Ray
- MRI Scan
- CT Scan
- Lab Report
- Prescription
- Other

### Body Parts

Head, Neck, Chest, Abdomen, Back, Arm, Hand, Leg, Foot, Spine, Hip, Knee, Shoulder, Full Body, Other

---

## Security & Privacy

### Authentication

- Email-based authentication with Supabase Auth
- Protected routes requiring authentication
- Session management with automatic refresh

### Data Protection

- **Row Level Security (RLS)**: All tables protected
- **User Isolation**: Users can only access their own data
- **Encrypted Storage**: Medical images stored securely
- **No Data Sharing**: User data never shared with third parties

### API Security

- Edge functions require valid API keys
- Rate limiting on AI endpoints (429 response)
- CORS headers configured for security

---

## Output Formatting

### Health Chat Response Structure

All AI chat responses use HTML-only formatting:

```html
<hr>
🩺 <b>Clinical Summary</b>
(Brief synthesis of findings)
<hr>
🧠 <b>Possible Medical Conditions</b>
(Ranked list with probability language)
<hr>
🚦 <b>Risk Level</b>
(Low / Medium / High with reasoning)
<hr>
💊 <b>Management / Treatment Options</b>
(Only if relevant)
<hr>
🛡️ <b>Precautions & Immediate Actions</b>
(Safety-focused guidance)
<hr>
```

### Medical Image Analysis Response

```html
<hr>
🖼️ <b>Key Findings</b>
(Visible abnormalities or normal findings)
<hr>
🧠 <b>Clinical Interpretation</b>
(What the findings may indicate)
<hr>
📌 <b>Important Observations</b>
(Notable details)
<hr>
```

### Formatting Rules

- **Allowed**: `<b>`, `<ul>`, `<li>`, `<br>`, `<hr>`
- **Forbidden**: Markdown (`**`, `#`, `` ` ``, `---`, `>`)
- **No disclaimers** in AI output
- **No wrapper tags** (`<html>`, `<body>`, `<div>`)

---

## Medical Image Analysis

### Upload Flow

1. **Select File**: Click upload area or drag-and-drop
2. **Validate**: JPEG, PNG, WebP, or PDF (max 10MB)
3. **Categorize**: Select document type and body part
4. **Optional Notes**: Add symptom context
5. **Upload**: File stored in Supabase Storage

### Analysis Flow

1. **Click "Analyze"**: Triggers edge function
2. **Generate Signed URL**: Secure temporary access to image
3. **AI Processing**: Gemini 2.5 Pro analyzes image
4. **Store Result**: Summary saved to database
5. **Button Updates**: Changes to "View Result"
6. **View Modal**: Shows image + cached analysis

### Caching Behavior

- Analysis runs **once** per image
- Result stored in `ai_summary` field
- "View Result" displays cached analysis
- Re-analysis only on explicit request or re-upload

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd medifusion

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest tests |

---

## Environment Variables

### Automatically Provided (Lovable Cloud)

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |
| `VITE_SUPABASE_PROJECT_ID` | Supabase project ID |

### Edge Function Secrets

| Secret | Description |
|--------|-------------|
| `LOVABLE_API_KEY` | Lovable AI gateway access (auto-configured) |

---

## PWA & Installation

Medifusion is a fully installable Progressive Web App (PWA) that works offline and provides a native app experience.

### PWA Features

- **Installable**: Add to home screen on mobile and desktop
- **Offline Support**: Core UI loads without internet with dedicated offline fallback page
- **Fast Loading**: Service worker caches static assets with intelligent caching strategies
- **Push Notifications**: Web Push API for medication reminders and health alerts
- **Background Sync**: Data syncs when connection returns
- **Splash Screen**: Animated launch screen when app starts from home screen
- **Platform Detection**: Automatic detection of Android, iOS, and desktop platforms

### Push Notifications

Medifusion uses the Web Push API for medication reminders:

```typescript
import { usePushNotifications } from '@/hooks/usePushNotifications';

const { subscribe, sendLocalNotification, scheduleMedicationReminder } = usePushNotifications();

// Request permission and subscribe
await subscribe();

// Send immediate notification
await sendLocalNotification('Reminder', { body: 'Take your medication' });

// Schedule medication reminder
await scheduleMedicationReminder('Aspirin', '100mg', new Date('2026-02-07T09:00:00'));
```

### Offline Fallback

When offline, users see a friendly fallback page that:
- Indicates connection status
- Auto-reloads when connection returns
- Provides troubleshooting tips
- Maintains app branding

### Installation Methods

#### Mobile (Android)

1. Visit the app in Chrome
2. Tap "Install App" button or use browser menu
3. Accept the install prompt
4. App appears on home screen

#### Mobile (iOS)

1. Visit the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Confirm the name and tap Add

#### Desktop (Chrome/Edge)

1. Visit the app
2. Click the install icon in the address bar
3. Or go to `/install` page and click Install
4. Accept the install prompt

### PWA Configuration

The PWA is configured via `vite-plugin-pwa` in `vite.config.ts`:

```typescript
VitePWA({
  registerType: 'autoUpdate',
  manifest: {
    name: 'Medifusion - AI Health Assistant',
    short_name: 'Medifusion',
    theme_color: '#14b8a6',
    background_color: '#0a0a0b',
    display: 'standalone',
    icons: [
      { src: 'pwa-192x192.png', sizes: '192x192', purpose: 'any maskable' },
      { src: 'pwa-512x512.png', sizes: '512x512', purpose: 'any maskable' }
    ]
  },
  workbox: {
    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    navigateFallback: '/offline.html',
    runtimeCaching: [
      // Google Fonts caching
      // Supabase API caching with NetworkFirst strategy
    ]
  }
})
```

### Key PWA Files

| File | Purpose |
|------|---------|
| `public/pwa-192x192.png` | Small app icon |
| `public/pwa-512x512.png` | Large app icon |
| `public/offline.html` | Offline fallback page |
| `src/hooks/usePWAInstall.tsx` | Install prompt hook |
| `src/hooks/usePushNotifications.tsx` | Push notification hook |
| `src/components/install/InstallButton.tsx` | Install button component |
| `src/components/install/InstallBanner.tsx` | Floating install prompt |
| `src/components/common/SplashScreen.tsx` | Animated splash screen |

---

## Capacitor Mobile App

Medifusion can be built as a native mobile app using Capacitor.

### Setup Capacitor

```bash
# Install dependencies
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android

# Initialize Capacitor
npx cap init

# Add platforms
npx cap add ios
npx cap add android
```

### Capacitor Configuration

```json
{
  "appId": "app.lovable.669fda9757b149d2bfb1034f26506105",
  "appName": "Medifusion",
  "webDir": "dist",
  "server": {
    "url": "https://669fda97-57b1-49d2-bfb1-034f26506105.lovableproject.com?forceHideBadge=true",
    "cleartext": true
  }
}
```

### Build & Run

```bash
# Build the web app
npm run build

# Sync with native projects
npx cap sync

# Run on device/emulator
npx cap run android
npx cap run ios  # Requires macOS with Xcode
```

### Hot Reload Development

The capacitor.config.json includes server URL configuration for hot reload during development. The app in the emulator/device will connect to the Lovable preview URL.

---

## Deployment

### Deploy via Lovable

1. Open your Lovable Project
2. Click **Share** → **Publish**
3. Your app is live!

### Production Considerations

- Edge functions deploy automatically
- Database migrations applied on deploy
- RLS policies active in production
- Rate limits apply to AI endpoints
- PWA manifest and service worker included

---

## Project Info

- **Project ID**: mebsbstwswksajeuaygp
- **Platform**: Lovable Cloud
- **Database**: PostgreSQL (Supabase)
- **AI Gateway**: Lovable AI
- **PWA**: vite-plugin-pwa
- **Mobile**: Capacitor

---

## License

This project is built with Lovable.

---

<b>Built with ❤️ using Lovable</b>
