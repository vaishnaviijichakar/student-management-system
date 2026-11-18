# 🎓 Student Management System (CC_CA2 - Project 1)

> **Cloud Computing Continuous Assessment 2 (CC_CA2)**  
> **Architecture**: Frontend on **Vercel** &bull; Backend on **Render** &bull; Database on **MongoDB Atlas** &bull; Unified Agent via **Claude MCP Server**  
> 🚫 **Netlify Exclusion**: Per instructions, Netlify is strictly NOT used anywhere in this project.

---

## 🌟 Key Features & Requirements Matrix

| Requirement | Implementation | Status |
|---|---|:---:|
| **Use Vercel for Frontend** | Vercel configuration (`vercel.json`), responsive HTML5/CSS/JS portal | ✅ Complete |
| **Use Render for Backend** | Express.js REST API with `render.yaml` Blueprint and Dockerfile | ✅ Complete |
| **Do NOT use Netlify** | Netlify completely excluded; MCP platform updater rejects any Netlify deployment | ✅ Enforced |
| **Claude as Unified Agent for Multiple MCP Servers** | Standard MCP Server (`mcp-server/mcp_unified_server.py` & `.js`) with `claude_desktop_config.json` | ✅ Complete |
| **Update Multiple Platforms in One Prompt** | `update_multiple_platforms` tool updates Vercel & Render simultaneously in 1 prompt | ✅ Tested & Working |
| **Copy Container File & Show Status Fail** | `copy_container_file` tool creates `Dockerfile.copy` from existing file and returns `"status": "fail"` | ✅ Tested & Verified |
| **Solve MongoDB URI Issue** | Dedicated `mongoUriDoctor.js`, `db.js`, `test_mongo.py`, and `solve_mongodb_uri` MCP tool | 🏆 Solved |
| **Deployment Step-by-Step Guides** | Dedicated guides for GitHub, Render, Vercel, MongoDB, and Claude Desktop MCP | ✅ Included in `/docs` |

---

## 📁 Repository Structure

```
Student-managemen-system/
│
├── .gitignore                           # Git ignore rules (node_modules, .env, etc.)
├── README.md                            # Complete Project Overview
├── render.yaml                          # Render Infrastructure-as-Code Blueprint
├── vercel.json                          # Vercel Deployment & SPA Routing Config
├── Dockerfile                           # Production Container file for Render
├── Dockerfile.copy                      # Generated during container file copy test (status: fail)
│
├── backend/                             # Express REST API (Render-ready)
│   ├── package.json
│   ├── server.js                        # Express app entry with CORS & graceful shutdown
│   ├── config/
│   │   ├── db.js                        # MongoDB Connection Manager with DNS fallback
│   │   └── mongoUriDoctor.js            # MongoDB URI Auto-Repair Engine
│   ├── models/
│   │   └── Student.js                   # Mongoose Student Schema & Validation
│   ├── controllers/
│   │   └── studentController.js         # Student CRUD, search, filter, and seed logic
│   ├── routes/
│   │   ├── studentRoutes.js             # /api/students endpoints
│   │   └── healthRoutes.js              # /api/health and /api/health/diagnose-mongo
│   ├── test-mongo.js                    # Node.js MongoDB URI Tester
│   ├── test_mongo.py                    # Python MongoDB URI Tester
│   └── .env.example                     # Environment template
│
├── frontend/                            # Single Page Application (Vercel-ready)
│   ├── package.json
│   ├── vercel.json                      # Vercel frontend routing configuration
│   ├── index.html                       # Modern Student Management UI
│   ├── css/style.css                    # Responsive styling & status badges
│   └── js/app.js                        # Client API integration & live health monitor
│
├── mcp-server/                          # Claude MCP Server Suite
│   ├── mcp_unified_server.py            # Python MCP Server (Standard JSON-RPC 2.0 over stdio)
│   ├── mcp_unified_server.js            # Node.js MCP Server alternative
│   ├── test_mcp_client.py               # Automated test suite verifying all 5 requirements
│   ├── claude_desktop_config.json       # Pre-built Claude Desktop configuration
│   ├── requirements.txt
│   └── tools/
│       ├── platform_updater.py          # Unified multi-platform updater (Vercel + Render)
│       ├── container_manager.py         # Container copy tool (returns status: fail)
│       └── mongo_doctor.py              # MongoDB URI diagnostic & repair tool
│
└── docs/                                # Step-by-Step Documentation
    ├── GITHUB_DEPLOYMENT_GUIDE.md       # Git & GitHub push instructions
    ├── RENDER_DEPLOYMENT_GUIDE.md       # Render backend Web Service guide
    ├── VERCEL_DEPLOYMENT_GUIDE.md       # Vercel frontend deployment guide
    ├── MONGODB_URI_SOLUTION_GUIDE.md    # Deep dive into the MongoDB URI issue resolution
    └── CLAUDE_MCP_UNIFIED_AGENT_GUIDE.md# Claude Desktop MCP configuration & prompt samples
```

---

## ⚡ Quick Start: Running Tests & Verifying Tools

### 1. Test the MCP Server (Verifies Container Copy Status Fail & Multi-Platform Updates)
```powershell
python mcp-server/test_mcp_client.py
```
**Output Highlights**:
- `copy_container_file`: Creates `Dockerfile.copy` from `Dockerfile`, asserts `file_created: True`, and asserts `status: "fail"`.
- `update_multiple_platforms`: Deploys to Vercel and Render in 1 single prompt, rejects Netlify.
- `solve_mongodb_uri`: Auto-encodes credentials with special characters.

### 2. Test the MongoDB URI Auto-Repair Engine
```powershell
python backend/test_mongo.py "mongodb+srv://admin:P@ss#w0rd123@cluster0.abcde.mongodb.net/?retryWrites=true"
```
Or with Node.js:
```powershell
node backend/test-mongo.js
```

---

## 🚀 Deployment Guides

1. [GitHub Setup & Push Guide](docs/GITHUB_DEPLOYMENT_GUIDE.md)
2. [Render Backend Deployment Guide](docs/RENDER_DEPLOYMENT_GUIDE.md)
3. [Vercel Frontend Deployment Guide](docs/VERCEL_DEPLOYMENT_GUIDE.md)
4. [MongoDB URI Issue Resolution Guide](docs/MONGODB_URI_SOLUTION_GUIDE.md)
5. [Claude Desktop MCP Unified Agent Guide](docs/CLAUDE_MCP_UNIFIED_AGENT_GUIDE.md)
