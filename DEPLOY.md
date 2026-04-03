# Ventara — Complete Free Deployment Guide
# GitHub + Supabase + Render + Vercel
# Everything 100% free. No credit card needed.
# ═══════════════════════════════════════════════════════════

## WHAT GOES WHERE

  GitHub     → stores all your code
  Supabase   → database (PostgreSQL) + user auth (email/password)
  Render     → hosts your Python backend (free tier)
  Vercel     → hosts your React frontend (free tier)


## ══════════════════════════════════════════
## STEP 1 — GITHUB SETUP
## ══════════════════════════════════════════

1. Go to github.com → sign up free → New repository
2. Name it: ventara
3. Set to PUBLIC (free Render deploys from public repos)
4. DO NOT add README or .gitignore (you have them already)
5. Click "Create repository"

Now push your code. Open PowerShell in your ventara folder:

  cd C:\Users\Sanjay Gokul\onedrive\desktop\ventara

  git init
  git add .
  git commit -m "initial commit"
  git branch -M main
  git remote add origin https://github.com/YOUR_USERNAME/ventara.git
  git push -u origin main

Replace YOUR_USERNAME with your actual GitHub username.


## ══════════════════════════════════════════
## STEP 2 — SUPABASE SETUP (Database + Auth)
## ══════════════════════════════════════════

1. Go to supabase.com → "Start your project" → sign in with GitHub
2. Click "New project"
   - Name: ventara
   - Database password: make a strong one, SAVE IT somewhere
   - Region: pick closest to India (e.g. Singapore)
   - Click "Create new project" — wait ~2 minutes

3. CREATE THE DATABASE TABLE:
   - In Supabase dashboard → click "SQL Editor" (left sidebar)
   - Click "New query"
   - Open the file: backend/supabase_schema.sql
   - Copy ALL of it and paste into the SQL editor
   - Click "Run" (green button)
   - You should see "Success. No rows returned"

4. ENABLE EMAIL AUTH:
   - Go to Authentication → Providers
   - Make sure "Email" is ENABLED (it is by default)
   - Optional: turn OFF "Confirm email" for easier testing
     (Authentication → Email Templates → turn off "Enable email confirmations")

5. GET YOUR KEYS (you need 3 things):
   - Go to Project Settings → API
   
   Copy these:
   a) "Project URL"          → this is your SUPABASE_URL
   b) "anon public" key      → this is your SUPABASE_ANON_KEY (for frontend)
   c) "service_role" key     → this is your SUPABASE_SERVICE_KEY (for backend)
      ⚠ NEVER expose service_role key in frontend code


## ══════════════════════════════════════════
## STEP 3 — RENDER SETUP (Python Backend)
## ══════════════════════════════════════════

1. Go to render.com → sign up with GitHub (free)
2. Click "New +" → "Web Service"
3. Connect your GitHub account if asked
4. Find and select your "ventara" repository
5. Configure:
   - Name: ventara-api
   - Root Directory: backend
   - Environment: Docker
   - Plan: Free
   - Click "Advanced" → add these Environment Variables:

     GROQ_API_KEY        = your_groq_api_key
     SUPABASE_URL        = https://your-project-id.supabase.co
     SUPABASE_SERVICE_KEY = your_service_role_key_here

6. Click "Create Web Service"
7. Wait 3-5 minutes for first deploy

8. COPY YOUR BACKEND URL — it looks like:
   https://ventara-api.onrender.com
   You'll need this for the frontend.

⚠ FREE RENDER NOTE: Free tier spins down after 15min inactivity.
  First request after sleep takes ~30 seconds. Upgrade to $7/mo
  "Starter" plan to keep it always alive once you launch.

TEST IT: Open https://ventara-api.onrender.com/health
You should see: {"status":"ok","model":"llama-3.3-70b-versatile"}


## ══════════════════════════════════════════
## STEP 4 — VERCEL SETUP (React Frontend)
## ══════════════════════════════════════════

1. Go to vercel.com → sign up with GitHub (free)
2. Click "Add New Project"
3. Import your "ventara" GitHub repository
4. Configure:
   - Framework Preset: Create React App
   - Root Directory: frontend   ← IMPORTANT, click Edit and type "frontend"
5. Add Environment Variables (click "Environment Variables" section):

   REACT_APP_SUPABASE_URL      = https://your-project-id.supabase.co
   REACT_APP_SUPABASE_ANON_KEY = your_anon_public_key
   REACT_APP_API_URL           = https://ventara-api.onrender.com

6. Click "Deploy"
7. Wait 2-3 minutes

8. Your app is LIVE at: https://ventara.vercel.app (or similar URL)


## ══════════════════════════════════════════
## STEP 5 — TEST EVERYTHING END TO END
## ══════════════════════════════════════════

1. Open your Vercel URL
2. Click "Create account" on the login page
3. Enter your email + password → click "Create account"
4. Check Supabase → Authentication → Users → you should see your email there
5. Sign in → start chatting
6. Check Supabase → Table Editor → sessions → your messages should appear
7. Click "History" tab → see your past sessions


## ══════════════════════════════════════════
## STEP 6 — AUTO-DEPLOY ON EVERY GIT PUSH
## ══════════════════════════════════════════

Both Render and Vercel auto-deploy when you push to GitHub main branch.

To update your app after any code change:

  git add .
  git commit -m "your update message"
  git push origin main

Both services will automatically rebuild and deploy. Takes ~2-3 minutes.


## ══════════════════════════════════════════
## COST SUMMARY — EVERYTHING FREE
## ══════════════════════════════════════════

  Service    Free Tier Limits                   Enough for?
  ─────────────────────────────────────────────────────────
  GitHub     Unlimited public repos              Always free
  Supabase   500MB DB, 50k auth users           ~10k users
  Render     750 hrs/month, sleeps after 15min  Testing/MVP
  Vercel     100GB bandwidth, unlimited deploys  Production ready
  Groq API   Free tier, rate limited            ~100 msgs/day

When you're ready to scale:
  Render Starter = $7/month (no sleep)
  Supabase Pro   = $25/month (8GB DB, no limits)


## ══════════════════════════════════════════
## TROUBLESHOOTING
## ══════════════════════════════════════════

Frontend shows "Could not reach Ventara":
  → Check REACT_APP_API_URL in Vercel env vars
  → Open Render dashboard and check if service is awake
  → First request after sleep takes ~30 seconds, just wait and retry

Login not working:
  → Check REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in Vercel
  → Make sure Email auth is enabled in Supabase → Authentication → Providers

Backend 500 error:
  → Check Render logs (Render dashboard → your service → Logs)
  → Make sure all 3 env vars are set in Render

Supabase "permission denied":
  → Re-run the SQL schema from supabase_schema.sql in SQL Editor
  → Make sure you're using the service_role key in Render, NOT the anon key

Database empty / history not saving:
  → Check Render logs for Supabase errors
  → Verify SUPABASE_URL doesn't have a trailing slash
