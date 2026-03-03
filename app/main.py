import datetime

from fastapi import FastAPI,Depends, Query, WebSocket, WebSocketDisconnect
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
app.include_router(auth.router)
app.include_router(chat.router)
manager = ConnectionManager()
app.include_router(private_chat.router)


@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/me")
def read_users_me(current_user: models.User = Depends(get_current_user)):
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
    user = verify_token(token=token, db=db)
    if not user:
        await websocket.close(code=1008)
        return

    await manager.connect_private(user.id, websocket)
    await manager.broadcast_status(user.id, "online")
    # print(f"{user.username} is ONLINE")

    #offline message
    offline_messages = db.query(models.PrivateMessage).filter(
        models.PrivateMessage.receiver_id == user.id,
        models.PrivateMessage.status != "read"
    ).all()

    for msg in offline_messages:
        await websocket.send_json({
            "type":"private_message",
            "id": msg.id,
            "sender_id": msg.sender_id,
            "content": msg.content,
            "status": msg.status,
            "timestamp": str(msg.timestamp)
        })

        msg.status = "delivered"

    db.commit()

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
                        "from": user.id
                    })

            # SEND MESSAGE
            elif data["type"] == "message":
                receiver_id = data.get("receiver_id")
                content = data.get("content")

                # ✅ Validate receiver exists
                receiver = db.query(models.User).filter(models.User.id == receiver_id).first()
                if not receiver:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Receiver does not exist"
                    })
                    continue
                status = "sent"
                if manager.is_online(receiver_id):
                    status = "delivered"

                new_message = models.PrivateMessage(
                    content=content,
                    sender_id=user.id,
                    receiver_id=receiver_id,
                    status=status
                )

                db.add(new_message)
                db.commit()
                db.refresh(new_message)
                # print(f"Saved message {new_message.id}: {content}")
                payload = {
                    "type": "private_message",
                    "id": new_message.id,
                    "sender_id": user.id,
                    "receiver_id": receiver_id,
                    "content": content,
                    "status": status,
                    "timestamp": str(new_message.timestamp)
                }
                if manager.is_online(receiver_id):
                    await manager.send_private_message(receiver_id, payload)

                # echo back to sender
                await websocket.send_json(payload)

            # ======================
            # READ RECEIPT
            # ======================
            elif data["type"] == "read":
                msg_id = data.get("message_id")

                msg = db.query(models.PrivateMessage).filter(
                    models.PrivateMessage.id == msg_id,
                    models.PrivateMessage.receiver_id == user.id
                ).first()

                if msg:
                    msg.status = "read"
                    db.commit()

                    await manager.send_private_message(msg.sender_id,{
                        "type": "read_receipt",
                        "message_id": msg.id,
                        "status": "read"
                    })


    except WebSocketDisconnect:
        manager.disconnect_private(user.id)

        #update last seen
        user.last_seen = datetime.utcnow()
        db.commit()
        
        await manager.broadcast_status(user.id, "offline")
        # print(f"{user.username} is OFFLINE")

    finally:
        db.close()

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: int):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    db = SessionLocal()
    user = verify_token(token=token, db=db)
    if not user:
        await websocket.close(code=1008)
        return

    await manager.connect_room(str(room_id), websocket)

    await manager.broadcast_room(str(room_id), {
        "type": "status",
        "message": f"{user.username} joined the room"
    })

    old_messages = db.query(models.Message)\
        .filter(models.Message.room_id == room_id)\
        .order_by(models.Message.timestamp).all()

    for msg in old_messages:
        await websocket.send_json({
            "type": "message",
            "username": msg.sender.username,
            "content": msg.content
        })

    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "typing":
                await manager.broadcast_room(room_id, {
                    "type": "typing",
                    "username": user.username
                })

            elif data["type"] == "message":
                content = data["content"]

                new_message = models.Message(
                    content=content,
                    user_id=user.id,
                    room_id=room_id
                )
                db.add(new_message)
                db.commit()

                await manager.broadcast_room(room_id, {
                    "type": "message",
                    "username": user.username,
                    "content": content
                })

    except WebSocketDisconnect:
        manager.disconnect_room(str(room_id), websocket)
        await manager.broadcast_room(room_id, {
            "type": "status",
            "message": f"{user.username} left the room"
        })




@app.get("/online-users")
def online_users():
    return {"online_users": manager.get_online_users()}
