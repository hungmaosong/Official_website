# backend/models/user.py
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from config.database import Base

class User(Base):
    __tablename__ = "users" # 資料庫裡的表格名稱

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String, unique=True, index=True, nullable=False) # 帳號 (必須唯一)
    password = Column(String, nullable=False) # 密碼 (MVP 階段先簡單存，未來再教你加密)
    name = Column(String, default="")
    phone = Column(String, default="")
    email = Column(String, default="")
    store_711 = Column(String, default="")
    role = Column(String, default="user") # 權限：'user' 或 'admin'
    
    # 自動紀錄註冊時間
    created_at = Column(DateTime(timezone=True), server_default=func.now())