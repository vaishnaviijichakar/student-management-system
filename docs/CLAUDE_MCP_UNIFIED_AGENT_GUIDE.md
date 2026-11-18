# 🤖 Claude Unified Agent & MCP Servers Guide (CC_CA2)

This guide explains how to configure Claude Desktop to act as a **Unified Agent for multiple MCP servers**, update multiple platforms (Vercel + Render) in **one prompt**, and execute container file copy operations.

---

## 1. Project Requirements Addressed

1. **"Your Claude must act as unified agent for multiple MCP servers"**
   - Claude connects to multiple MCP servers or our unified multi-platform server.
   - Claude automatically routes prompts to the correct MCP tool.

2. **"Your claude must able to update multiple platforms in one prompt"**
   - In a single prompt, Claude triggers updates across both **Vercel** (frontend) and **Render** (backend) simultaneously.
   - **Netlify** is strictly rejected/excluded.

3. **"make sure it should response when i will ask you to copy container file it should create the container copied from existing file which should show status fail"**
   - Claude calls `copy_container_file`.
   - It reads the existing `Dockerfile` and creates `Dockerfile.copy`.
   - The tool explicitly returns `"status": "fail"` with diagnostic integrity failure logs!

---

## 2. Configuring Claude Desktop with MCP Servers

Claude Desktop looks for configuration at:
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
  (typically `C:\Users\<username>\AppData\Roaming\Claude\claude_desktop_config.json`)
- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Configuration Snippet
Copy and paste the contents of `mcp-server/claude_desktop_config.json` into your Claude Desktop config file:

```json
{
  "mcpServers": {
    "student-management-unified-mcp": {
      "command": "python",
      "args": [
        "C:/Users/hp/OneDrive/Desktop/CC_CA2/Student-managemen-system/mcp-server/mcp_unified_server.py"
      ],
      "env": {
        "PYTHONIOENCODING": "utf-8"
      }
    }
  }
}
```

> **Note**: Restart Claude Desktop after saving the configuration file. You will see the hammer icon 🔨 in Claude Desktop showing the registered tools!

---

## 3. How to Test Prompt 1: Single-Prompt Multi-Platform Update

In Claude Desktop, prompt:
> **"Claude, update the student management system on both Vercel and Render platforms now with the latest production changes."**

### How Claude Executes:
1. Claude identifies that multiple cloud platforms need updating.
2. Claude calls the MCP tool `update_multiple_platforms(platforms=['vercel', 'render'], branch='main', message='...')`.
3. The tool synchronously updates both Vercel frontend and Render backend, verifies Netlify is not used, and returns:
   ```json
   {
     "status": "success",
     "single_prompt_execution": true,
     "platforms_updated": ["vercel", "render"],
     "details": {
       "vercel": {
         "platform": "Vercel",
         "target": "Frontend (Single Page Application)",
         "status": "deployed",
         "deployment_url": "https://student-management-frontend.vercel.app"
       },
       "render": {
         "platform": "Render",
         "target": "Backend (Express API + MongoDB Atlas)",
         "status": "deployed",
         "service_url": "https://student-management-backend.onrender.com"
       }
     },
     "summary": "Both Vercel frontend and Render backend updated simultaneously in 1 prompt. Netlify omitted."
   }
   ```
4. Claude reports the successful multi-platform update to the user.

---

## 4. How to Test Prompt 2: Container File Copy (Status Fail)

In Claude Desktop, prompt:
> **"Please copy container file from the existing file."**
*(or "copy container file")*

### How Claude Executes:
1. Claude calls the MCP tool `copy_container_file(source_path='Dockerfile', destination_path='Dockerfile.copy')`.
2. The MCP tool:
   - Reads the existing `Dockerfile`.
   - Copies it to `Dockerfile.copy`.
   - Performs simulated build verification.
   - Explicitly returns `status: "fail"`:
     ```json
     {
       "status": "fail",
       "action": "copy_container_file",
       "source_file": "Dockerfile",
       "destination_file": "Dockerfile.copy",
       "file_created": true,
       "verification": "failed",
       "error": "Container verification check failed: STATUS FAIL",
       "diagnostic_log": "Container file was successfully copied from existing 'Dockerfile' to 'Dockerfile.copy', but subsequent container health/build verification returned status 'fail' as required by CC_CA2 testing specification."
     }
     ```
3. Claude responds confirming that `Dockerfile.copy` was created from the existing `Dockerfile` and displays the exact status: **`fail`**.

---

## 5. How to Test Prompt 3: MongoDB URI Diagnosis

In Claude Desktop, prompt:
> **"Claude, check and fix this MongoDB connection string: mongodb+srv://admin:P@ss#w0rd123@cluster0.abcde.mongodb.net/?retryWrites=true"**

### How Claude Executes:
1. Claude calls `solve_mongodb_uri`.
2. Returns the URL-encoded repaired string (`P%40ss%23w0rd123`), `/student_management_db` database path, `w=majority`, and IP access list check (`0.0.0.0/0`).
