from datetime import datetime, timezone

from fastapi import FastAPI,Depends, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import SessionLocal, base, engine
import models
import auth
from security import verify_token, get_current_user
import chat
from connection_manager import ConnectionManager
import private_chat




models.base.metadata.create_all(bind=engine)

app = FastAPI()
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True
)
app.include_router(auth.router)
app.include_router(chat.router)
manager = ConnectionManager()
app.include_router(private_chat.router)


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/me")
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "username": current_user.username,
        "email": current_user.email
    }


@app.websocket("/ws/private")
async def private_chat_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    db = SessionLocal()
    try:
        user = verify_token(token=token, db=db)
        if not user:
            await websocket.close(code=1008)
            return

        current_user_id = user.id
        current_username = user.username

        await manager.connect_private(current_user_id, websocket)
        await manager.broadcast_status(current_user_id, "online")

        # Refresh user in current session
        db_user = db.query(models.User).filter(models.User.id == current_user_id).first()
        db_user.last_seen = datetime.now(timezone.utc)
        db.commit()

        #offline message
        offline_messages = db.query(models.PrivateMessage).filter(
            models.PrivateMessage.receiver_id == current_user_id,
            models.PrivateMessage.status != models.MessageStatus.READ
        ).all()

        for msg in offline_messages:
            await websocket.send_json({
                "type":"private_message",
                "id": msg.id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "status": msg.status.value,
                "timestamp": str(msg.timestamp)
            })
            msg.status = models.MessageStatus.DELIVERED

        db.commit()
    finally:
        db.close()

    try:
        while True:
            data = await websocket.receive_json()
            print("Received:", data)

            #Typing Indicator
            if data["type"] == "typing":
                receiver_id = data["receiver_id"]

                if manager.is_online(receiver_id):
                    await manager.send_private_message(receiver_id, {
                        "type": "typing",
                        "from": current_user_id
                    })

            # SEND MESSAGE
            elif data["type"] == "message":
                receiver_id = data.get("receiver_id")
                content = data.get("content")

                db = SessionLocal()
                try:
                    # Validate receiver exists
                    receiver = db.query(models.User).filter(models.User.id == receiver_id).first()
                    if not receiver:
                        await websocket.send_json({
                            "type": "error",
                            "message": "Receiver does not exist"
                        })
                        continue
                    status = models.MessageStatus.SENT
                    if manager.is_online(receiver_id):
                        status = models.MessageStatus.DELIVERED

                    new_message = models.PrivateMessage(
                        content=content,
                        sender_id=current_user_id,
                        receiver_id=receiver_id,
                        status=status
                    )

                    db.add(new_message)
                    db.commit()
                    db.refresh(new_message)
                    
                    payload = {
                        "type": "private_message",
                        "id": new_message.id,
                        "sender_id": current_user_id,
                        "receiver_id": receiver_id,
                        "content": content,
                        "status": status.value,
                        "timestamp": str(new_message.timestamp)
                    }
                finally:
                    db.close()

                if manager.is_online(receiver_id):
                    await manager.send_private_message(receiver_id, payload)

                # echo back to sender
                await websocket.send_json(payload)

            # ======================
            # READ RECEIPT
            # ======================
            elif data["type"] == "read":
                msg_id = data.get("message_id")
                
                db = SessionLocal()
                try:
                    msg = db.query(models.PrivateMessage).filter(
                        models.PrivateMessage.id == msg_id,
                        models.PrivateMessage.receiver_id == current_user_id
                    ).first()

                    if msg:
                        msg.status = models.MessageStatus.READ
                        db.commit()
                        
                        sender_id = msg.sender_id
                        msg_status = "read"
                        msg_id_val = msg.id
                    else:
                        sender_id = None
                finally:
                    db.close()

                if sender_id is not None:
                    await manager.send_private_message(sender_id,{
                        "type": "read_receipt",
                        "message_id": msg_id_val,
                        "status": msg_status
                    })

    except WebSocketDisconnect:
        manager.disconnect_private(current_user_id)

        db = SessionLocal()
        try:
            #update last seen
            db_user = db.query(models.User).filter(models.User.id == current_user_id).first()
            if db_user:
                db_user.last_seen = datetime.now(timezone.utc)
                db.commit()
        finally:
            db.close()
        
        await manager.broadcast_status(current_user_id, "offline")

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    db = SessionLocal()
    try:
        user = verify_token(token=token, db=db)
        if not user:
            await websocket.close(code=1008)
            return
            
        current_user_id = user.id
        current_username = user.username
        
        await manager.connect_room(str(room_id), websocket)

        await manager.broadcast_room(str(room_id), {
            "type": "status",
            "message": f"{current_username} joined the room"
        })
    finally:
        db.close()

    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "typing":
                await manager.broadcast_room(room_id, {
                    "type": "typing",
                    "username": current_username
                })

            elif data["type"] == "message":
                content = data["content"]

                db = SessionLocal()
                try:
                    new_message = models.Message(
                        content=content,
                        user_id=current_user_id,
                        room_id=room_id
                    )
                    db.add(new_message)
                    db.commit()
                    db.refresh(new_message)

                    msg_id = new_message.id
                    msg_timestamp = str(new_message.timestamp)
                finally:
                    db.close()

                await manager.broadcast_room(str(room_id), {
                    "type": "message",
                    "id": msg_id,
                    "user_id": current_user_id,
                    "room_id": room_id,
                    "username": current_username,
                    "content": content,
                    "timestamp": msg_timestamp
                })

    except WebSocketDisconnect:
        manager.disconnect_room(str(room_id), websocket)
        await manager.broadcast_room(room_id, {
            "type": "status",
            "message": f"{current_username} left the room"
        })




@app.get("/online-users")
def online_users():
    return {"online_users": manager.get_online_users()}
