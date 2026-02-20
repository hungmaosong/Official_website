# backend/models/product.py
from sqlalchemy import Column, Integer, String, JSON
from config.database import Base

class Product(Base):
    __tablename__ = "products" # 在資料庫裡的表格名稱

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String, index=True, nullable=False)
    price = Column(Integer, nullable=False)
    image = Column(String, nullable=False)
    category = Column(String, index=True, nullable=False)
    stock = Column(Integer, default=0)
    gallery = Column(JSON, default=[]) # 用 JSON 格式儲存多張圖片的陣列