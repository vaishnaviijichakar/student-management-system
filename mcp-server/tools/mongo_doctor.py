"""
MongoDB URI Doctor Tool for MCP Server (CC_CA2)
Diagnoses, repairs, and validates MongoDB connection strings for cloud deployments (Render, Vercel).
Addresses:
1. Special characters in password (URL encoding)
2. DNS SRV failure (querySrv ENOTFOUND)
3. Missing database name in URI path
4. Missing write concern and retry query params
5. Dynamic cloud IP whitelisting instructions (0.0.0.0/0)
"""

import urllib.parse
import re

def solve_mongodb_uri(raw_uri: str) -> dict:
    """
    Diagnoses and solves common MongoDB URI issues for Render & Vercel deployments.
    
    Args:
        raw_uri: The MongoDB connection string provided by user.
        
    Returns:
        dict: Diagnostic breakdown, repaired URI, sanitized URI, and exact solutions.
    """
    if not raw_uri or not isinstance(raw_uri, str):
        return {
            "is_valid": False,
            "error": "Please provide a valid MongoDB connection string."
        }

    trimmed = raw_uri.strip()
    issues = []
    fixes = []

    # 1. Protocol check
    is_srv = trimmed.startswith("mongodb+srv://")
    is_std = trimmed.startswith("mongodb://")
    if not is_srv and not is_std:
        return {
            "is_valid": False,
            "error": "URI must begin with 'mongodb+srv://' or 'mongodb://'."
        }

    protocol = "mongodb+srv://" if is_srv else "mongodb://"
    rest = trimmed[len(protocol):]

    # 2. Authentication credentials
    userinfo_fixed = ""
    userinfo_sanitized = ""
    if "@" in rest:
        last_at = rest.rfind("@")
        userinfo = rest[:last_at]
        host_and_rest = rest[last_at + 1:]

        if ":" in userinfo:
            first_colon = userinfo.find(":")
            username = userinfo[:first_colon]
            password = userinfo[first_colon + 1:]

            # Unquote first, then quote_plus
            raw_username = urllib.parse.unquote(username)
            raw_password = urllib.parse.unquote(password)

            encoded_user = urllib.parse.quote_plus(raw_username)
            encoded_pass = urllib.parse.quote_plus(raw_password)

            if encoded_pass != password or any(char in password for char in "@:/?#[]!$&'()*+,;="):
                issues.append("Password contains special characters that were not properly URL-encoded (causes MongoParseError).")
                fixes.append("URL-encoded password credentials with percent-encoding (e.g. '@' -> '%40', '#' -> '%23').")

            userinfo_fixed = f"{encoded_user}:{encoded_pass}@"
            userinfo_sanitized = f"{encoded_user}:******@"
        else:
            userinfo_fixed = f"{userinfo}@"
            userinfo_sanitized = f"{userinfo}@"
    else:
        issues.append("No database username/password credentials found in connection string.")
        host_and_rest = rest

    # 3. Host, Database & Query string
    if "?" in host_and_rest:
        host_and_db, query_str = host_and_rest.split("?", 1)
    else:
        host_and_db = host_and_rest
        query_str = ""

    if "/" in host_and_db:
        host_part, db_name = host_and_db.split("/", 1)
    else:
        host_part = host_and_db
        db_name = ""

    if not db_name or db_name.strip() == "test":
        issues.append("Database name was omitted or set to default 'test'.")
        db_name = "student_management_db"
        fixes.append("Set target database name to 'student_management_db'.")

    # 4. Query parameters
    params = urllib.parse.parse_qs(query_str)
    if "retryWrites" not in params:
        params["retryWrites"] = ["true"]
        fixes.append("Added retryWrites=true for transient network failover.")
    if "w" not in params:
        params["w"] = ["majority"]
        fixes.append("Added w=majority write concern.")
    if "appName" not in params:
        params["appName"] = ["StudentManagementSystem"]
        fixes.append("Added appName=StudentManagementSystem connection tag.")

    repaired_query = urllib.parse.urlencode({k: v[0] for k, v in params.items()})

    repaired_uri = f"{protocol}{userinfo_fixed}{host_part}/{db_name}?{repaired_query}"
    sanitized_uri = f"{protocol}{userinfo_sanitized}{host_part}/{db_name}?{repaired_query}"

    return {
        "status": "solved",
        "is_valid": True,
        "original_uri_length": len(trimmed),
        "sanitized_uri": sanitized_uri,
        "repaired_uri": repaired_uri,
        "issues_diagnosed": issues,
        "fixes_applied": fixes,
        "cloud_deployment_checklist": [
            {
                "check": "MongoDB Atlas IP Whitelist (Network Access)",
                "action": "Must add 0.0.0.0/0 in Atlas -> Security -> Network Access because Render and Vercel assign dynamic IPs.",
                "importance": "CRITICAL"
            },
            {
                "check": "DNS SRV Resolution on Cloud Containers",
                "action": "Render containers sometimes drop SRV records. If querySrv ENOTFOUND occurs, the backend has configured Google (8.8.8.8) and Cloudflare (1.1.1.1) DNS fallbacks.",
                "importance": "CRITICAL"
            },
            {
                "check": "Atlas Database User Permissions",
                "action": "Ensure user has 'readWriteAnyDatabase' or 'readWrite@student_management_db' in Atlas Database Access.",
                "importance": "HIGH"
            }
        ]
    }

if __name__ == "__main__":
    import json
    res = solve_mongodb_uri("mongodb+srv://admin:P@ss#w0rd123@cluster0.abcde.mongodb.net/?retryWrites=true")
    print(json.dumps(res, indent=2))
