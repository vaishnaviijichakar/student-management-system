#!/usr/bin/env python3
"""
=============================================================================
Unified Multi-Platform MCP Server (CC_CA2 - Project 1)
Acts as a unified agent for Claude to manage:
1. Multi-platform deployment (Vercel + Render updated in one prompt; Netlify excluded)
2. Container file operations (Copies container file from existing file & returns status: fail)
3. MongoDB URI Doctor & Cloud Connection Solver
Standard JSON-RPC 2.0 / MCP Protocol over stdio for Claude Desktop & Claude CLI
=============================================================================
"""

import sys
import os
import json
import traceback

# Ensure UTF-8 I/O on Windows
if sys.platform == "win32":
    try:
        sys.stdin.reconfigure(encoding="utf-8")
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add parent directory to path to import tools
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from tools.container_manager import copy_container_file
from tools.platform_updater import update_multiple_platforms, deploy_to_vercel, deploy_to_render
from tools.mongo_doctor import solve_mongodb_uri

SERVER_NAME = "student-management-unified-mcp-server"
SERVER_VERSION = "1.0.0"

# List of Tools Exposed to Claude
TOOLS_DEFINITIONS = [
    {
        "name": "copy_container_file",
        "description": "Copies a container file from an existing file and validates it. Returns status: 'fail' as required by CC_CA2 Project 1 specification.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "source_path": {
                    "type": "string",
                    "description": "Path to the existing container file to copy from (default: Dockerfile)",
                    "default": "Dockerfile"
                },
                "destination_path": {
                    "type": "string",
                    "description": "Path where the copied container file should be created (default: Dockerfile.copy)",
                    "default": "Dockerfile.copy"
                }
            }
        }
    },
    {
        "name": "update_multiple_platforms",
        "description": "Updates multiple platforms (Vercel frontend and Render backend) in a single prompt / execution. Netlify is strictly excluded per instructions.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "platforms": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of cloud platforms to update. Default: ['vercel', 'render']",
                    "default": ["vercel", "render"]
                },
                "branch": {
                    "type": "string",
                    "description": "Target Git branch being deployed (default: 'main')",
                    "default": "main"
                },
                "message": {
                    "type": "string",
                    "description": "Deployment commit or update message",
                    "default": "Unified update across Vercel & Render"
                }
            }
        }
    },
    {
        "name": "solve_mongodb_uri",
        "description": "Analyzes, diagnoses, and repairs MongoDB connection strings for Render and Vercel cloud deployments (special character password encoding, DNS SRV errors, missing db name, IP access rules).",
        "inputSchema": {
            "type": "object",
            "properties": {
                "raw_uri": {
                    "type": "string",
                    "description": "The raw MongoDB connection string to inspect and repair"
                }
            },
            "required": ["raw_uri"]
        }
    },
    {
        "name": "deploy_to_vercel",
        "description": "Deploys or triggers update of the Student Management System frontend to Vercel.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "project_name": {
                    "type": "string",
                    "description": "Vercel project name",
                    "default": "student-management-frontend"
                }
            }
        }
    },
    {
        "name": "deploy_to_render",
        "description": "Deploys or triggers update of the Student Management System backend to Render.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "service_name": {
                    "type": "string",
                    "description": "Render Web Service name",
                    "default": "student-management-backend"
                }
            }
        }
    },
    {
        "name": "get_system_status",
        "description": "Retrieves the overall architectural status of Vercel (frontend), Render (backend), MongoDB Atlas, and container components.",
        "inputSchema": {
            "type": "object",
            "properties": {}
        }
    }
]

def handle_tool_call(tool_name: str, arguments: dict) -> dict:
    """Executes the requested tool and returns the response payload."""
    if tool_name == "copy_container_file":
        src = arguments.get("source_path", "Dockerfile")
        dst = arguments.get("destination_path", "Dockerfile.copy")
        return copy_container_file(src, dst)

    elif tool_name == "update_multiple_platforms":
        platforms = arguments.get("platforms", ["vercel", "render"])
        branch = arguments.get("branch", "main")
        message = arguments.get("message", "Unified multi-platform update from Claude")
        return update_multiple_platforms(platforms=platforms, branch=branch, message=message)

    elif tool_name == "solve_mongodb_uri":
        raw_uri = arguments.get("raw_uri", "")
        return solve_mongodb_uri(raw_uri)

    elif tool_name == "deploy_to_vercel":
        proj = arguments.get("project_name", "student-management-frontend")
        return deploy_to_vercel(proj)

    elif tool_name == "deploy_to_render":
        srv = arguments.get("service_name", "student-management-backend")
        return deploy_to_render(srv)

    elif tool_name == "get_system_status":
        return {
            "project": "Student Management System (Project 1)",
            "course": "Cloud Computing Continuous Assessment 2 (CC_CA2)",
            "agent_architecture": "Unified Claude Agent for Multiple MCP Servers",
            "platforms": {
                "frontend": {
                    "provider": "Vercel",
                    "status": "configured",
                    "config_file": "vercel.json"
                },
                "backend": {
                    "provider": "Render",
                    "status": "configured",
                    "config_file": "render.yaml"
                },
                "database": {
                    "provider": "MongoDB Atlas",
                    "status": "monitored",
                    "doctor_tool": "solve_mongodb_uri"
                },
                "prohibited_platforms": ["Netlify (Strictly Excluded)"]
            },
            "container": {
                "base_file": "Dockerfile",
                "copy_tool": "copy_container_file",
                "verification_policy": "Simulated Status FAIL as requested"
            }
        }
    else:
        raise ValueError(f"Unknown tool: '{tool_name}'")

def process_rpc_message(msg: dict) -> dict:
    """Processes a JSON-RPC 2.0 message according to MCP specification."""
    msg_id = msg.get("id")
    method = msg.get("method")
    params = msg.get("params", {})

    # 1. Initialize
    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {
                "protocolVersion": "2024-11-05",
                "capabilities": {
                    "tools": {
                        "listChanged": False
                    }
                },
                "serverInfo": {
                    "name": SERVER_NAME,
                    "version": SERVER_VERSION
                }
            }
        }

    # 2. Initialized notification
    elif method == "notifications/initialized":
        return None

    # 3. Ping
    elif method == "ping":
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {}
        }

    # 4. List Tools
    elif method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "result": {
                "tools": TOOLS_DEFINITIONS
            }
        }

    # 5. Call Tool
    elif method == "tools/call":
        tool_name = params.get("name")
        arguments = params.get("arguments", {})
        try:
            tool_result = handle_tool_call(tool_name, arguments)
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": json.dumps(tool_result, indent=2)
                        }
                    ],
                    "isError": tool_result.get("status") == "fail" if isinstance(tool_result, dict) else False
                }
            }
        except Exception as e:
            return {
                "jsonrpc": "2.0",
                "id": msg_id,
                "result": {
                    "content": [
                        {
                            "type": "text",
                            "text": f"Error executing tool '{tool_name}': {str(e)}\n{traceback.format_exc()}"
                        }
                    ],
                    "isError": True
                }
            }

    # Unsupported method
    else:
        return {
            "jsonrpc": "2.0",
            "id": msg_id,
            "error": {
                "code": -32601,
                "message": f"Method '{method}' not found"
            }
        }

def run_server():
    """Main stdio loop for the MCP server"""
    sys.stderr.write(f"[{SERVER_NAME}] Server running. Listening on stdin for MCP requests...\n")
    sys.stderr.flush()

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        try:
            msg = json.loads(line)
            response = process_rpc_message(msg)
            if response is not None:
                sys.stdout.write(json.dumps(response) + "\n")
                sys.stdout.flush()
        except json.JSONDecodeError as err:
            err_resp = {
                "jsonrpc": "2.0",
                "id": None,
                "error": {
                    "code": -32700,
                    "message": f"Parse error: {str(err)}"
                }
            }
            sys.stdout.write(json.dumps(err_resp) + "\n")
            sys.stdout.flush()
        except Exception as exc:
            sys.stderr.write(f"[{SERVER_NAME}] Uncaught error: {str(exc)}\n")
            sys.stderr.flush()

if __name__ == "__main__":
    run_server()
