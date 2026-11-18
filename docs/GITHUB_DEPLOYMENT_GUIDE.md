# 🐙 GitHub Deployment Guide - Student Management System

Follow these step-by-step instructions to initialize your Git repository, commit the project files, and push them to your GitHub account.

---

## Prerequisites
- Git installed on your computer (`git --version`)
- A GitHub account ([github.com](https://github.com))

---

## Step 1: Initialize Git in the Project Root
Open PowerShell or your terminal in `C:\Users\hp\OneDrive\Desktop\CC_CA2\Student-managemen-system`:

```powershell
# Navigate to project folder
cd "C:\Users\hp\OneDrive\Desktop\CC_CA2\Student-managemen-system"

# Initialize a new Git repository
git init -b main
```

---

## Step 2: Stage and Commit All Files

```powershell
# Check git status
git status

# Add all files to staging
git add .

# Create the initial commit
git commit -m "feat: complete student management system with MCP unified server, Vercel frontend, Render backend, and MongoDB URI doctor"
```

---

## Step 3: Create a New GitHub Repository
1. Open your browser and go to: [https://github.com/new](https://github.com/new)
2. Fill in the repository details:
   - **Repository name**: `Student-management-system` (or `CC_CA2_Student_Management_System`)
   - **Description**: `Cloud Computing CA2 Project 1: Student Management System with Claude MCP Unified Agent, Render Backend, Vercel Frontend, and MongoDB Atlas`
   - **Visibility**: Choose **Public** (recommended for grading) or **Private**
   - **Do NOT check** "Initialize with README", ".gitignore", or "License" (we already have them!)
3. Click **"Create repository"**.

---

## Step 4: Link Local Repository to GitHub and Push

Copy your repository URL from GitHub (replace `YOUR_USERNAME` below with your GitHub username):

```powershell
# Add remote origin
git remote add origin https://github.com/YOUR_USERNAME/Student-management-system.git

# Verify remote
git remote -v

# Push to main branch
git push -u origin main
```

---

## Step 5: Verify on GitHub
Refresh your repository page on GitHub. You should see:
- `backend/`
- `frontend/`
- `mcp-server/`
- `Dockerfile`
- `render.yaml`
- `vercel.json`
- `docs/`
- `README.md`
