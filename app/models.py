from sqlalchemy import String, Integer, Column, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from database import base

class User(base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)

    messages = relationship("Message", back_populates="sender")

    last_seen = Column(DateTime, default=func.now())


class ChatRoom(base):
    __tablename__ = "chat_rooms"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True)

    messages = relationship("Message", back_populates="room")


class Message(base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))
    room_id = Column(Integer, ForeignKey("chat_rooms.id"))

    sender = relationship("User", back_populates="messages")
    room = relationship("ChatRoom", back_populates="messages")

class PrivateMessage(base):
    __tablename__ = "private_messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)

    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))

    status = Column(String, default="sent")

    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

