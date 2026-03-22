from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from database import get_db
import models, schemas
from security import get_current_user

router = APIRouter(prefix="/private", tags=["Private Chat"])

@router.get("/contacts", response_model=list[schemas.ContactSchema])
def get_contacts(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    messages = db.query(models.PrivateMessage).filter(
        or_(models.PrivateMessage.sender_id == current_user.id, models.PrivateMessage.receiver_id == current_user.id)
    ).order_by(models.PrivateMessage.timestamp.desc()).all()
    
    contacts_map = {}
    for msg in messages:
        other_user = msg.receiver if msg.sender_id == current_user.id else msg.sender
        if other_user.id not in contacts_map:
            contacts_map[other_user.id] = {
                "user_id": other_user.id,
                "username": other_user.username,
                "last_message": msg.content,
                "last_timestamp": msg.timestamp
            }
            
    return list(contacts_map.values())

@router.get("/messages/{other_user_id}", response_model=list[schemas.PrivateMessageSchema])
def get_private_messages(
    other_user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    messages = db.query(models.PrivateMessage).filter(
        (
            (models.PrivateMessage.sender_id == current_user.id) &
            (models.PrivateMessage.receiver_id == other_user_id)
        ) |
        (
            (models.PrivateMessage.sender_id == other_user_id) &
            (models.PrivateMessage.receiver_id == current_user.id)
        )
    ).order_by(models.PrivateMessage.timestamp.asc()).offset(skip).limit(limit).all()

    return [
        {
            "id": msg.id,
            "sender_id": msg.sender_id,
            "receiver_id": msg.receiver_id,
            "content": msg.content,
            "status": msg.status.value if hasattr(msg.status, 'value') else msg.status,
            "timestamp": msg.timestamp
        }
        for msg in messages
    ]

@router.get("/last-seen/{user_id}")
def get_last_seen(user_id: int, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "user_id": user.id,
        "last_seen": user.last_seen
    }