from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str 

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True



class ChatRoomCreate(BaseModel):
    name: str

class ChatRoomResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    content: str
    room_id: int


class MessageResponse(BaseModel):
    id: int
    content: str
    timestamp: datetime
    user_id: int
    room_id: int

    class Config:
        from_attributes = True
