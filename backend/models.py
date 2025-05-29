
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    avatar_url = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    subscription = Column(String, default="free")  # free, pro, enterprise
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    videos = relationship("Video", back_populates="user", cascade="all, delete-orphan")

class Video(Base):
    __tablename__ = "videos"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    filename = Column(String)
    original_path = Column(String)
    duration = Column(Float)
    resolution = Column(String)
    status = Column(String)  # processing, completed, failed
    error_message = Column(Text, nullable=True)
    processed_count = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    user = relationship("User", back_populates="videos")
    clips = relationship("VideoClip", back_populates="video", cascade="all, delete-orphan")

class VideoClip(Base):
    __tablename__ = "video_clips"

    id = Column(Integer, primary_key=True, index=True)
    video_id = Column(Integer, ForeignKey("videos.id"))
    url = Column(String)
    duration = Column(Float)
    status = Column(String)  # processing, completed, failed
    created_at = Column(DateTime, server_default=func.now())
    
    video = relationship("Video", back_populates="clips")
