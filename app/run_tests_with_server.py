import os
import sys
import time
import subprocess
import urllib.request
import json
import urllib.error
import urllib.parse

def run():
    print("Starting uvicorn server...")
    venv_python = r"d:\Karan\Work\Antigravity\Chat App\.venv\Scripts\python.exe"
    server_process = subprocess.Popen(
        [venv_python, "-m", "uvicorn", "main:app", "--port", "8000"],
        cwd=os.path.dirname(__file__)
    )
    
    time.sleep(4)  # Wait for server to start
    base_url = "http://localhost:8000"
    
    try:
        def post(path, data):
            req = urllib.request.Request(f"{base_url}{path}", data=json.dumps(data).encode(), headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())
        
        def post_form(path, data):
            encoded = urllib.parse.urlencode(data).encode()
            req = urllib.request.Request(f"{base_url}{path}", data=encoded, headers={'Content-Type': 'application/x-www-form-urlencoded'})
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())
                
        def get(path, token=""):
            headers = {'Authorization': f'Bearer {token}'} if token else {}
            req = urllib.request.Request(f"{base_url}{path}", headers=headers)
            with urllib.request.urlopen(req) as response:
                return json.loads(response.read().decode())

        print("\n--- Testing Registration ---")
        try:
            res = post("/register", {"username": "testuser", "email": "t@t.com", "password": "test123"})
            print("Register OK:", res)
        except urllib.error.HTTPError as e:
            print("Register Failed or user exists:", e.read())
            
        print("\n--- Testing Login ---")
        try:
            res = post("/login", {"email": "t@t.com", "password": "test123"})  # Use JSON because our auth.py uses schemas.UserLogin which is JSON!
            token = res["access_token"]
            print("Login OK, got token")
        except urllib.error.HTTPError as e:
            print("Login Failed:", e.read())
            token = ""
            
        if token:
            print("\n--- Testing /me ---")
            print("Me:", get("/me", token))
            
            print("\n--- Testing /chat/rooms ---")
            print("Rooms before:", get("/chat/rooms", token))
            
            print("\n--- Creating Room ---")
            print("Create Room:", post("/chat/rooms", {"name": "General"}))
            
            print("\n--- Testing /chat/rooms ---")
            print("Rooms after:", get("/chat/rooms", token))
            
            print("\n--- Testing /users/search ---")
            print("Search result:", get("/users/search?q=test", token))
            
            print("\n--- Testing /private/contacts ---")
            print("Contacts:", get("/private/contacts", token))
            
    finally:
        print("Shutting down server...")
        server_process.terminate()

if __name__ == "__main__":
    run()
