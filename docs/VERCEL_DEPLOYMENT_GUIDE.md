# ▲ Vercel Frontend Deployment Guide

This guide walks through deploying the **Student Management System Frontend** to **Vercel** ([vercel.app](https://vercel.com)).

> **IMPORTANT REQUIREMENT**: Netlify is strictly NOT used. Vercel is used exclusively for the frontend application.

---

## Step 1: Sign In to Vercel
1. Open [vercel.com](https://vercel.com).
2. Click **"Log In"** and sign in using your **GitHub** account.

---

## Step 2: Import Your GitHub Repository
1. On your Vercel Dashboard, click **"Add New..."** -> **"Project"**.
2. Under "Import Git Repository", find `Student-management-system`.
3. Click **"Import"**.

---

## Step 3: Configure Project Settings
In the configuration screen:

1. **Project Name**: `student-management-frontend` (or default)
2. **Framework Preset**: Select **"Other"** (our frontend is clean vanilla HTML5/CSS/JavaScript with zero build lock-in)
3. **Root Directory**:
   - Click **"Edit"** next to Root Directory.
   - Select the `frontend` folder (or leave `./` because our root `vercel.json` automatically rewrites to `/frontend`). Selecting `frontend` is recommended for clean routing!
4. **Build & Output Settings**:
   - Build Command: Leave blank or `echo "Build ready"`
   - Output Directory: Leave blank (Vercel serves static files directly)

---

## Step 4: Environment Variables (Optional)
If you want to bake in the Render backend URL:
- Key: `BACKEND_URL`
- Value: `https://student-management-backend.onrender.com`

> 💡 Note: Users can also dynamically enter their Render backend URL directly in the frontend header input bar, and it will persist in `localStorage`!

---

## Step 5: Deploy & Verify
1. Click **"Deploy"**.
2. Within 15 seconds, Vercel will complete deployment and show:
   **"Congratulations! Your project has been deployed."**
3. Click the preview thumbnail or the `.vercel.app` URL:
   `https://student-management-frontend.vercel.app`
4. The web portal will open:
   - Check the top header badges: `Vercel (Frontend)` | `Render (Backend)` | `MongoDB Atlas` | `Netlify (Excluded)`.
   - Enter your Render backend URL if needed.
   - Click **"⚡ Seed Sample Students"** to populate test data.
   - Click **"+ Add New Student"** to add a new record.
   - Click **"🩺 Mongo URI Doctor"** to verify connection string diagnostics.
