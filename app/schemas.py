from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class UserCreate(BaseModel):
    username: str
    email: str
    password: str 

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

class ChatRoomCreate(BaseModel):
    name: str

class ChatRoomResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True

class RoomSchema(BaseModel):
    id: int
    name: str
    class Config:
        from_attributes = True

class ContactSchema(BaseModel):
    user_id: int
    username: str
    last_message: str
    last_timestamp: datetime

class UserPublicSchema(BaseModel):
    id: int
    username: str
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str
    room_id: int

class MessageSchema(BaseModel):
    id: int
    content: str
    timestamp: datetime
    user_id: int
    room_id: int
    username: Optional[str] = None

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

class PrivateMessageSchema(BaseModel):
    id: int
    content: str
    timestamp: datetime
    sender_id: int
    receiver_id: int
    status: str

    class Config:
        from_attributes = True
        json_encoders = {datetime: lambda v: v.isoformat()}

