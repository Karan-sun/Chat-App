from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import models, schemas
from database import get_db
from security import get_current_user  # (JWT dependency)

router = APIRouter(prefix="/chat", tags=["Chat"])

# Create room
@router.post("/rooms", response_model=schemas.ChatRoomResponse)
def create_room(room: schemas.ChatRoomCreate, db: Session = Depends(get_db)):
    new_room = models.ChatRoom(name=room.name)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room


# Send message
@router.post("/message", response_model=schemas.MessageSchema)
def send_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_message = models.Message(
        content=message.content,
        user_id=current_user.id,
        room_id=message.room_id
    )
    db.add(new_message)
    db.commit()
    db.refresh(new_message)
    return new_message


# Get messages in room
@router.get("/rooms", response_model=list[schemas.RoomSchema])
def get_rooms(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.ChatRoom).all()

@router.get("/rooms/{room_id}/messages", response_model=list[schemas.MessageSchema])
def get_messages(room_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    msgs = db.query(models.Message).filter(models.Message.room_id == room_id).order_by(models.Message.timestamp.asc()).offset(skip).limit(limit).all()
    return [{"id": m.id, "content": m.content, "timestamp": m.timestamp, "user_id": m.user_id, "room_id": m.room_id, "username": m.sender.username} for m in msgs]

