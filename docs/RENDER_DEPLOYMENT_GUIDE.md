# ⚡ Render Backend Deployment Guide (Web Service)

This guide walks through deploying the **Student Management System Backend** to **Render** ([render.com](https://render.com)).

> **IMPORTANT REQUIREMENT**: Netlify is NOT used. Render is used exclusively for the backend service.

---

## Step 1: Sign In to Render
1. Open [dashboard.render.com](https://dashboard.render.com).
2. Sign in with your **GitHub** account (this makes connecting repositories seamless).

---

## Step 2: Create a New Web Service
1. Click the **"+ New"** button in the top right.
2. Select **"Web Service"**.
3. Under "Connect a repository", search for and select your GitHub repository: `Student-management-system`.
4. Click **"Connect"**.

---

## Step 3: Configure the Web Service Settings
Fill in the configuration fields:

| Field | Value | Notes |
|---|---|---|
| **Name** | `student-management-backend` | Unique name on Render |
| **Region** | `Oregon (US West)` | Fast & reliable |
| **Branch** | `main` | Production branch |
| **Root Directory** | `backend` | **Important! Points to backend subfolder** |
| **Runtime** | `Node` | Native Node.js execution |
| **Build Command** | `npm install` | Installs Express, Mongoose, CORS, etc. |
| **Start Command** | `node server.js` | Starts Express server |
| **Instance Type** | `Free` | Free tier |

---

## Step 4: Configure Environment Variables
Scroll down to the **"Environment Variables"** section and click **"Add Environment Variable"**:

| Key | Value | Description |
|---|---|---|
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `5000` | Port for Express server |
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster0...` | Your repaired Atlas connection string |
| `FRONTEND_URL` | `https://your-frontend.vercel.app` | Your Vercel frontend URL (for CORS) |

> 💡 **Tip**: Make sure your `MONGODB_URI` has special characters percent-encoded using our Mongo URI Doctor!

---

## Step 5: Advanced Settings & Health Check Path
Click **"Advanced"**:
- **Health Check Path**: Enter `/api/health`
  - Render will ping `/api/health` every 30 seconds to confirm the backend and MongoDB connection are healthy.
- **Auto-Deploy**: Set to `Yes` (any push to `main` branch will automatically trigger a redeploy).

---

## Step 6: Deploy & Verify
1. Click **"Create Web Service"**.
2. Render will clone the repo, install dependencies, and start `node server.js`.
3. In the deployment logs, look for:
   ```text
   🚀 Student Management Backend running on port 5000
   📡 Platform: Render | Frontend Target: Vercel
   [MongoDB Doctor] Custom DNS servers applied.
   [MongoDB Success] Connected to MongoDB Atlas host: cluster0...
   ```
4. Copy your backend service URL:
   `https://student-management-backend.onrender.com`
5. Test the live endpoints in your browser:
   - Root: `https://student-management-backend.onrender.com/`
   - Health: `https://student-management-backend.onrender.com/api/health`
   - Students: `https://student-management-backend.onrender.com/api/students`
