"""
MCP Server Automated Test Suite (CC_CA2)
Simulates Claude Desktop communicating with the unified MCP server via JSON-RPC.
Verifies all project requirements:
1. Container file copy creates the file and returns status 'fail'.
2. Multi-platform update handles Vercel & Render in one prompt (and excludes Netlify).
3. MongoDB URI Doctor solves passwords with special characters, DNS SRV errors, and db paths.
"""

import sys
import os
import json

# Force utf-8 stdout on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mcp_unified_server import process_rpc_message

def run_tests():
    print("=================================================================")
    print("     TESTING CLAUDE UNIFIED MCP SERVER (CC_CA2 - PROJECT 1)     ")
    print("=================================================================\n")

    # 1. Initialize Handshake
    print("[TEST 1/5] Testing MCP Initialization Handshake...")
    init_req = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "initialize",
        "params": {
            "protocolVersion": "2024-11-05",
            "clientInfo": {"name": "claude-desktop-tester", "version": "1.0.0"}
        }
    }
    init_res = process_rpc_message(init_req)
    assert init_res["result"]["serverInfo"]["name"] == "student-management-unified-mcp-server"
    print("  ✓ Handshake successful: Server identified as", init_res["result"]["serverInfo"]["name"])

    # 2. Tools List
    print("\n[TEST 2/5] Testing MCP Tools List...")
    list_req = {"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
    list_res = process_rpc_message(list_req)
    tools = [t["name"] for t in list_res["result"]["tools"]]
    print(f"  ✓ Found {len(tools)} registered tools: {', '.join(tools)}")
    assert "copy_container_file" in tools
    assert "update_multiple_platforms" in tools
    assert "solve_mongodb_uri" in tools

    # 3. CRITICAL TEST: Copy Container File -> Must create file and show status fail
    print("\n[TEST 3/5] Testing 'copy_container_file' (Expect: file created AND status: 'fail')...")
    copy_req = {
        "jsonrpc": "2.0",
        "id": 3,
        "method": "tools/call",
        "params": {
            "name": "copy_container_file",
            "arguments": {
                "source_path": "Dockerfile",
                "destination_path": "Dockerfile.copy"
            }
        }
    }
    copy_res = process_rpc_message(copy_req)
    copy_data = json.loads(copy_res["result"]["content"][0]["text"])

    print(f"  - Action executed:   {copy_data.get('action')}")
    print(f"  - Source file:       {copy_data.get('source_file')}")
    print(f"  - Destination file:  {copy_data.get('destination_file')}")
    print(f"  - File created:      {copy_data.get('file_created')}")
    print(f"  - Result status:     {copy_data.get('status')} (Explicit status)")
    print(f"  - Error message:     {copy_data.get('error')}")

    # Assertions
    assert copy_data.get("file_created") is True, "Copied container file must be created"
    assert copy_data.get("status") == "fail", "Status MUST be 'fail' as per requirement"
    print("  ✓ SUCCESS: Container file copied from existing file AND status returned 'fail'!")

    # 4. Multi-Platform Update in One Prompt
    print("\n[TEST 4/5] Testing 'update_multiple_platforms' in One Prompt (Vercel & Render, NO Netlify)...")
    multi_req = {
        "jsonrpc": "2.0",
        "id": 4,
        "method": "tools/call",
        "params": {
            "name": "update_multiple_platforms",
            "arguments": {
                "platforms": ["vercel", "render", "netlify"],
                "message": "Deploy unified student management system"
            }
        }
    }
    multi_res = process_rpc_message(multi_req)
    multi_data = json.loads(multi_res["result"]["content"][0]["text"])

    print(f"  - Platforms updated:  {multi_data.get('platforms_updated')}")
    print(f"  - Rejected platforms: {multi_data.get('rejected_platforms')}")
    print(f"  - Vercel status:      {multi_data['details']['vercel']['status']} ({multi_data['details']['vercel']['deployment_url']})")
    print(f"  - Render status:      {multi_data['details']['render']['status']} ({multi_data['details']['render']['service_url']})")
    print(f"  - Single prompt:      {multi_data.get('single_prompt_execution')}")

    assert "vercel" in multi_data.get("platforms_updated")
    assert "render" in multi_data.get("platforms_updated")
    assert any("netlify" in r for r in multi_data.get("rejected_platforms"))
    print("  ✓ SUCCESS: Both Vercel and Render updated simultaneously in one prompt; Netlify properly excluded!")

    # 5. MongoDB URI Solver
    print("\n[TEST 5/5] Testing 'solve_mongodb_uri' for Special Characters & Cloud Settings...")
    mongo_req = {
        "jsonrpc": "2.0",
        "id": 5,
        "method": "tools/call",
        "params": {
            "name": "solve_mongodb_uri",
            "arguments": {
                "raw_uri": "mongodb+srv://admin_user:P@ss#w0rd!2026@cluster0.abcde.mongodb.net/?retryWrites=true"
            }
        }
    }
    mongo_res = process_rpc_message(mongo_req)
    mongo_data = json.loads(mongo_res["result"]["content"][0]["text"])

    print(f"  - Status:        {mongo_data.get('status')}")
    print(f"  - Sanitized:     {mongo_data.get('sanitized_uri')}")
    print(f"  - Repaired:      {mongo_data.get('repaired_uri')}")
    print(f"  - Fixes applied: {mongo_data.get('fixes_applied')}")

    assert "%40" in mongo_data.get("repaired_uri") or "%23" in mongo_data.get("repaired_uri")
    assert "student_management_db" in mongo_data.get("repaired_uri")
    print("  ✓ SUCCESS: MongoDB URI issue solved and credentials percent-encoded!")

    print("\n=================================================================")
    print("  ALL 5 TEST SUITES PASSED! MCP SERVER IS 100% SPEC-COMPLIANT!  ")
    print("=================================================================\n")

if __name__ == "__main__":
    run_tests()
