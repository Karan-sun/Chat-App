from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        self.room_connections: dict[str, list[WebSocket]] = {}
        self.private_connections: dict[int, WebSocket] = {}

    async def connect_room(self, room_id: str, websocket: WebSocket):
        await websocket.accept()
        if room_id not in self.room_connections:
            self.room_connections[room_id] = []
        self.room_connections[room_id].append(websocket)

    def disconnect_room(self, room_id, websocket):
        if room_id in self.room_connections:
            if websocket in self.room_connections[room_id]:
                self.room_connections[room_id].remove(websocket)
            if len(self.room_connections[room_id]) == 0:
                del self.room_connections[room_id]


    async def broadcast_room(self, room_id: str, message: dict):
        for ws in self.room_connections.get(room_id, []):
            await ws.send_json(message)
            
    #Private Connections
    async def connect_private(self, user_id: int, websocket: WebSocket):
        await websocket.accept()
        self.private_connections[user_id] = websocket

    def disconnect_private(self, user_id: int):
        self.private_connections.pop(user_id, None)

    async def send_private_message(self, receiver_id: int, message: dict):
        if receiver_id in self.private_connections:
            await self.private_connections[receiver_id].send_json(message)

    async def broadcast_status(self, user_id: int, status: str):
        for ws in self.private_connections.values():
            await ws.send_json({
                "type": "presence",
                "user_id": user_id,
                "status": status
            })

    def is_online(self, user_id: int):
        return user_id in self.private_connections

    # ========== STATUS ==========
    def get_online_users(self):
        return list(self.private_connections.keys())
