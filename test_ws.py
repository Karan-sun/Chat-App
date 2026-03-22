import asyncio
import websockets
import json
import requests
import sys

async def test_chat():
    try:
        print("Starting test...", flush=True)
        # 1. Login user 1
        res1 = requests.post("http://localhost:8000/login", json={"email":"test1@email.com", "password":"password"})
        if res1.status_code != 200:
            requests.post("http://localhost:8000/register", json={"username":"test1", "email":"test1@email.com", "password":"password"})
            requests.post("http://localhost:8000/register", json={"username":"test2", "email":"test2@email.com", "password":"password"})
            res1 = requests.post("http://localhost:8000/login", json={"email":"test1@email.com", "password":"password"})
        
        token1 = res1.json().get("access_token")
        
        # 2. Login user 2
        res2 = requests.post("http://localhost:8000/login", json={"email":"test2@email.com", "password":"password"})
        token2 = res2.json().get("access_token")

        if not token1 or not token2:
            print("Failed to login", res1.json(), res2.json(), flush=True)
            return

        user1_info = requests.get("http://localhost:8000/me", headers={"Authorization": f"Bearer {token1}"}).json()
        user2_info = requests.get("http://localhost:8000/me", headers={"Authorization": f"Bearer {token2}"}).json()
        print(f"User1 ID: {user1_info['id']}, User2 ID: {user2_info['id']}", flush=True)

        # Connect WebSocket for user 1
        async with websockets.connect(f"ws://localhost:8000/ws/private?token={token1}") as ws1:
            print("User 1 Connected", flush=True)
            
            # Connect WebSocket for user 2
            async with websockets.connect(f"ws://localhost:8000/ws/private?token={token2}") as ws2:
                print("User 2 Connected", flush=True)
                
                # User 1 sends message to User 2
                await ws1.send(json.dumps({
                    "type": "message",
                    "receiver_id": user2_info["id"],
                    "content": "Hello from user 1!"
                }))
                print("Sent message from User 1", flush=True)

                # Receive on User 1 (echo)
                echo = await ws1.recv()
                print("User 1 received:", echo, flush=True)
                
                # Receive on User 2
                inbound = await ws2.recv()
                print("User 2 received:", inbound, flush=True)

    except Exception as e:
        print(f"Error: {e}", flush=True)

if __name__ == "__main__":
    asyncio.run(test_chat())
