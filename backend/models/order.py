# backend/models/order.py
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from config.database import Base

# 1. 訂單主檔 (紀錄誰買的、總金額、寄送資訊)
class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_number = Column(String, unique=True, index=True) # 訂單編號 (例如 KCG12345)
    username = Column(String) # 購買的特務帳號
    total_amount = Column(Integer) # 總金額
    shipping_name = Column(String) # 收件人姓名
    shipping_phone = Column(String) # 收件人電話
    shipping_store = Column(String) # 取貨門市
    status = Column(String, default="準備出貨") # 訂單狀態
    created_at = Column(DateTime(timezone=True), server_default=func.now()) # 下單時間

    # 關聯到明細表
    items = relationship("OrderItem", back_populates="order")

# 2. 訂單明細檔 (紀錄這筆訂單買了哪些商品、買幾個)
class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id")) # 對應的訂單ID
    product_id = Column(Integer, ForeignKey("products.id")) # 對應的商品ID
    product_name = Column(String) # 商品名稱 (備份當下名稱，防未來改名)
    quantity = Column(Integer) # 購買數量
    price = Column(Integer) # 購買當下的單價 (防未來漲價)

    order = relationship("Order", back_populates="items")