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
@router.post("/message", response_model=schemas.MessageResponse)
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
@router.get("/rooms/{room_id}/messages", response_model=list[schemas.MessageResponse])
def get_messages(room_id: int, db: Session = Depends(get_db)):
    return db.query(models.Message).filter(models.Message.room_id == room_id).all()




