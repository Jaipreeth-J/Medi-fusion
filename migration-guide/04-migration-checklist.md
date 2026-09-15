# MediFusion Migration Checklist: Lovable Cloud → Own Supabase Project

## Phase 1: Set Up New Supabase Project
- [ ] Create a new project at https://supabase.com/dashboard
- [ ] Note your **Project URL**, **Anon Key**, and **Service Role Key**

## Phase 2: Create Database Schema
- [ ] Open SQL Editor in your Supabase Dashboard
- [ ] Run `01-schema.sql` — creates all 17 tables
- [ ] Run `02-functions-triggers.sql` — creates functions & triggers
- [ ] Run `03-rls-policies.sql` — enables RLS on all tables

## Phase 3: Export Data from Lovable Cloud
- [ ] Go to Lovable Cloud view → Database → Tables
- [ ] Export each table as CSV (use the export button per table)
- [ ] Tables to export: profiles, medications, medication_logs, vitals, symptoms, mood_entries, conversations, chat_messages, emergency_contacts, medical_images, drug_interactions, health_insights, wearable_connections, wearable_sync_logs, push_subscriptions, sos_preferences
- [ ] **Note:** `rate_limits` can be skipped (transient data)

## Phase 4: Import Data into New Supabase
- [ ] In your new Supabase project, use the Table Editor import feature or `\copy` via psql
- [ ] Import in dependency order: profiles → medications → medication_logs, conversations → chat_messages, wearable_connections → wearable_sync_logs
- [ ] Verify row counts match after import

## Phase 5: Create Storage Buckets
- [ ] Create bucket `medical-images` (private) in Storage settings
- [ ] Create bucket `avatars` (public) in Storage settings
- [ ] Add storage policies for authenticated users to manage their own files
- [ ] Re-upload any stored files (medical images, avatars)

## Phase 6: Configure Authentication
- [ ] In your new Supabase project: Authentication → Providers
- [ ] Enable Email/Password auth
- [ ] If using Google OAuth: add your Google Client ID/Secret
- [ ] If using Apple OAuth: add your Apple credentials
- [ ] **Important:** Users will need to re-register or you must migrate auth.users (requires pg_dump of auth schema — advanced)

## Phase 7: Set Secrets in New Supabase
In your new Supabase Dashboard → Edge Functions → Secrets, add:
- [ ] `HUGGINGFACE_API_KEY`
- [ ] `VAPID_PRIVATE_KEY`
- [ ] `GOOGLE_FIT_CLIENT_ID`
- [ ] `GOOGLE_FIT_CLIENT_SECRET`
- [ ] `LOVABLE_API_KEY` (if using Lovable AI features)

## Phase 8: Deploy Edge Functions
- [ ] Copy all files from `supabase/functions/` to your local Supabase CLI project
- [ ] Run `supabase functions deploy --project-ref YOUR_PROJECT_REF` for each function
- [ ] Functions to deploy: health-chat, symptom-summary, analyze-medical-image, generate-health-insights, wearable-oauth, wearable-sync, check-drug-interactions, scan-prescription, send-medication-reminders, generate-vapid-keys

## Phase 9: Update Frontend Configuration
- [ ] Update your `.env` file with new credentials:
  ```
  VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
  VITE_SUPABASE_PUBLISHABLE_KEY=your_new_anon_key
  VITE_SUPABASE_PROJECT_ID=your_new_project_id
  ```
- [ ] If self-hosting: update environment variables in your hosting platform
- [ ] **Note:** In Lovable, you cannot change these values directly since Cloud is permanent. You'd need to push to GitHub and deploy separately.

## Phase 10: Test All Features
- [ ] ✅ User signup & login (email + OAuth)
- [ ] ✅ Profile creation & editing
- [ ] ✅ Add/edit/delete medications
- [ ] ✅ Medication reminders & logs
- [ ] ✅ Record vitals
- [ ] ✅ Track symptoms + AI summary
- [ ] ✅ Mood tracking & journal
- [ ] ✅ AI health chat
- [ ] ✅ Medical image upload & analysis
- [ ] ✅ Drug interaction checks
- [ ] ✅ Health insights generation
- [ ] ✅ Emergency contacts & SOS
- [ ] ✅ Push notifications
- [ ] ✅ Wearable sync (Google Fit)
- [ ] ✅ Data export (PDF/CSV)

## Important Notes
⚠️ **Lovable Cloud cannot be disconnected** — once enabled, it stays. To use your own Supabase:
1. Push your code to GitHub via Settings → GitHub
2. Clone the repo locally
3. Update `.env` with your own Supabase credentials
4. Deploy to Vercel/Netlify/your own hosting
5. Deploy edge functions via Supabase CLI

⚠️ **Auth migration** — Users stored in Lovable Cloud's auth.users table cannot be directly exported. Users will need to re-register on the new project, OR you can use Supabase's auth admin API to programmatically create users.
