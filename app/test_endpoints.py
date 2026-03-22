import requests

BASE_URL = "http://localhost:8000"

def run_tests():
    print("Testing backend endpoints...")
    # 1. Register
    try:
        r = requests.post(f"{BASE_URL}/register", json={"username": "testuser", "email": "t@t.com", "password": "test123"})
        print("POST /register:", r.status_code, r.text)
    except Exception as e:
        print("POST /register Failed:", e)
        
    # 2. Login
    token = ""
    try:
        r = requests.post(f"{BASE_URL}/login", data={"username": "testuser", "email": "t@t.com", "password": "test123"})
        print("POST /login:", r.status_code, r.text)
        if r.status_code == 200:
            token = r.json().get("access_token")
    except Exception as e:
        print("POST /login Failed:", e)

    headers = {"Authorization": f"Bearer {token}"} if token else {}

    # 3. Get Me
    try:
        r = requests.get(f"{BASE_URL}/me", headers=headers)
        print("GET /me:", r.status_code, r.text)
    except Exception as e:
        print("GET /me Failed:", e)

    # 4. Get Rooms
    try:
        r = requests.get(f"{BASE_URL}/chat/rooms", headers=headers)
        print("GET /chat/rooms:", r.status_code, r.text)
    except Exception as e:
        print("GET /chat/rooms Failed:", e)

    # 5. Create Room
    try:
        r = requests.post(f"{BASE_URL}/chat/rooms", json={"name": "General"}, headers=headers)
        print("POST /chat/rooms:", r.status_code, r.text)
    except Exception as e:
        print("POST /chat/rooms Failed:", e)

    # 6. Search Users
    try:
        r = requests.get(f"{BASE_URL}/users/search", params={"q": "test"}, headers=headers)
        print("GET /users/search:", r.status_code, r.text)
    except Exception as e:
        print("GET /users/search Failed:", e)

    # 7. Get Contacts
    try:
        r = requests.get(f"{BASE_URL}/private/contacts", headers=headers)
        print("GET /private/contacts:", r.status_code, r.text)
    except Exception as e:
        print("GET /private/contacts Failed:", e)

if __name__ == "__main__":
    run_tests()
