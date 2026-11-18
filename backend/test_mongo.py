"""
Standalone MongoDB URI Diagnostic & Test Runner (Python version)
Can be executed immediately on local Windows machine:
  python backend/test_mongo.py "mongodb+srv://user:pass@cluster.mongodb.net/dbname"
"""

import sys
import os
import re
import urllib.parse

# Force utf-8 stdout on Windows console
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def diagnose_and_fix_mongo_uri(raw_uri: str) -> dict:
    result = {
        "is_valid": False,
        "original_uri": raw_uri,
        "repaired_uri": "",
        "sanitized_uri": "",
        "issues_found": [],
        "fixes_applied": []
    }
    
    if not raw_uri or not isinstance(raw_uri, str):
        result["issues_found"].append("URI is empty or null.")
        return result

    raw_uri = raw_uri.strip()
    
    # Check protocol
    protocol = ""
    if raw_uri.startswith("mongodb+srv://"):
        protocol = "mongodb+srv://"
    elif raw_uri.startswith("mongodb://"):
        protocol = "mongodb://"
    else:
        result["issues_found"].append("Invalid protocol. Must begin with mongodb+srv:// or mongodb://")
        return result

    rest = raw_uri[len(protocol):]
    
    # Split userinfo and host
    if "@" in rest:
        # Use rsplit to separate userinfo from host
        last_at = rest.rfind("@")
        userinfo = rest[:last_at]
        host_and_rest = rest[last_at + 1:]
        
        if ":" in userinfo:
            first_colon = userinfo.find(":")
            username = userinfo[:first_colon]
            password = userinfo[first_colon + 1:]
            
            # Check for unescaped special characters
            unquoted_pass = urllib.parse.unquote(password)
            unquoted_user = urllib.parse.unquote(username)
            
            # Re-encode strictly with quote_plus or quote
            re_encoded_pass = urllib.parse.quote_plus(unquoted_pass)
            re_encoded_user = urllib.parse.quote_plus(unquoted_user)
            
            if re_encoded_pass != password or re_encoded_user != username or any(c in password for c in "@/:?#[]"):
                result["issues_found"].append("Password/Username contains unencoded special characters that break URI parsing.")
                result["fixes_applied"].append("URL-encoded username and password credentials.")
            
            userinfo_fixed = f"{re_encoded_user}:{re_encoded_pass}"
            userinfo_sanitized = f"{re_encoded_user}:******"
        else:
            userinfo_fixed = userinfo
            userinfo_sanitized = userinfo
    else:
        result["issues_found"].append("No authentication credentials found in URI.")
        userinfo_fixed = ""
        userinfo_sanitized = ""
        host_and_rest = rest

    # Host and database
    if "?" in host_and_rest:
        host_and_db, query_part = host_and_rest.split("?", 1)
    else:
        host_and_db = host_and_rest
        query_part = ""

    if "/" in host_and_db:
        host_part, db_name = host_and_db.split("/", 1)
    else:
        host_part = host_and_db
        db_name = ""

    if not db_name or db_name.strip() == "test":
        result["issues_found"].append("Database name is missing or set to default 'test'.")
        db_name = "student_management_db"
        result["fixes_applied"].append("Configured target database path to 'student_management_db'.")

    # Query params
    params = urllib.parse.parse_qs(query_part)
    if "retryWrites" not in params:
        params["retryWrites"] = ["true"]
        result["fixes_applied"].append("Added retryWrites=true for cloud reconnection tolerance.")
    if "w" not in params:
        params["w"] = ["majority"]
        result["fixes_applied"].append("Added w=majority write concern for data consistency.")
    if "appName" not in params:
        params["appName"] = ["StudentManagementSystem"]
        result["fixes_applied"].append("Added appName=StudentManagementSystem identifier.")

    new_query = urllib.parse.urlencode({k: v[0] for k, v in params.items()})

    user_str = f"{userinfo_fixed}@" if userinfo_fixed else ""
    user_sanitized_str = f"{userinfo_sanitized}@" if userinfo_sanitized else ""

    result["repaired_uri"] = f"{protocol}{user_str}{host_part}/{db_name}?{new_query}"
    result["sanitized_uri"] = f"{protocol}{user_sanitized_str}{host_part}/{db_name}?{new_query}"
    result["is_valid"] = True
    return result

def main():
    print("====================================================")
    print("   MongoDB URI Health & Diagnostic Solver (Python)  ")
    print("====================================================")
    
    uri = sys.argv[1] if len(sys.argv) > 1 else "mongodb+srv://student_admin:P@ss#w0rd123@cluster0.abcde.mongodb.net/?retryWrites=true"
    print(f"\n[1] Input URI: {uri}")
    
    diagnosis = diagnose_and_fix_mongo_uri(uri)
    print(f"\n[2] Sanitized URI: {diagnosis['sanitized_uri']}")
    
    if diagnosis["issues_found"]:
        print("\n⚠️ Issues Detected:")
        for issue in diagnosis["issues_found"]:
            print(f"  - {issue}")
            
    if diagnosis["fixes_applied"]:
        print("\n🔧 Fixes Applied:")
        for fix in diagnosis["fixes_applied"]:
            print(f"  ✔ {fix}")
            
    print("\n[3] Repaired Connection String (ready for Render / Vercel):")
    print(diagnosis["repaired_uri"])
    print("====================================================\n")

if __name__ == "__main__":
    main()
