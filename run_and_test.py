import subprocess
import time
import requests
import websockets
import asyncio
import sys
import os

async def test():
    # Start Backend
    print("Starting backend...")
    env = os.environ.copy()
    proc = subprocess.Popen(
        [sys.executable, "-m", "uvicorn", "app.main:app", "--port", "8005"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )
    time.sleep(3) # Wait for startup

    try:
        print("Registering/Logging in...")
        res = requests.post("http://localhost:8005/login", json={"email":"test1@email.com", "password":"password"})
        if res.status_code != 200:
            requests.post("http://localhost:8005/register", json={"username":"test_ws2", "email":"test1@email.com", "password":"password"})
            res = requests.post("http://localhost:8005/login", json={"email":"test1@email.com", "password":"password"})
        
        token = res.json()["access_token"]
        print("Got token, connecting to private WS...")

        async with websockets.connect(f"ws://localhost:8005/ws/private?token={token}") as ws:
            print("Connected to Private!")
            await ws.send('{"type": "typing", "receiver_id": 1}')
            print("Sent typing...")
            await asyncio.sleep(1)

    except Exception as e:
        print(f"WS Exception: {e}")

    finally:
        print("Killing backend...")
        proc.terminate()
        stdout, _ = proc.communicate()
        print("--- BACKEND LOGS ---")
        print(stdout)

if __name__ == "__main__":
    asyncio.run(test())
