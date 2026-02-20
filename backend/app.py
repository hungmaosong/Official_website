from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from config.database import engine, Base, get_db
from models.product import Product

# 自動建立資料庫表格
Base.metadata.create_all(bind=engine)

app = FastAPI(title="KCG 總部 API 伺服器", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# ==========================================
# 🛡️ Pydantic 模型 (資料防呆保全)
# ==========================================
# 告訴 FastAPI，前端傳來的新增/修改資料「必須」長這樣
class ProductCreate(BaseModel):
    name: str
    price: int
    image: str
    category: str
    stock: int
    gallery: Optional[List[str]] = [] # 允許是空陣列

# ==========================================
# 📦 初始裝備資料 (只在空資料庫時執行)
# ==========================================
INITIAL_DATA = [
    {"name": "景品模型 A", "price": 500, "image": "../assets/images/product_01.jpg", "category": "figure", "stock": 10, "gallery": []},
    {"name": "稀有卡片 B", "price": 1200, "image": "../assets/images/product_02.jpg", "category": "card", "stock": 2, "gallery": []},
    {"name": "樂園 T-shirt", "price": 890, "image": "../assets/images/product_03.jpg", "category": "clothes", "stock": 15, "gallery": []}
]

@app.on_event("startup")
def seed_database():
    db = next(get_db())
    if db.query(Product).count() == 0:
        print("📦 偵測到空資料庫，正在將初始裝備灌入系統...")
        for item in INITIAL_DATA:
            db.add(Product(**item))
        db.commit()
        print("✅ 初始資料灌入完成！")

# ==========================================
# 🚀 API 路由 (Routes) - 餐廳服務生區
# ==========================================

@app.get("/")
def root():
    return {"message": "KCG 伺服器已上線 (System Online) ! 🚀"}

# 1. 讀取所有商品 (GET)
@app.get("/api/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return {"status": "success", "data": products}

# 2. 新增商品 (POST)
@app.post("/api/products")
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    # 將前端傳來的驗證過資料，轉換成資料庫物件
    db_product = Product(**product.dict())
    db.add(db_product)
    db.commit()             # 存檔
    db.refresh(db_product)  # 刷新以取得資料庫自動生成的 ID
    return {"status": "success", "data": db_product}

# 3. 修改商品 (PUT)
@app.put("/api/products/{product_id}")
def update_product(product_id: int, product: ProductCreate, db: Session = Depends(get_db)):
    # 先去資料庫找這顆 ID 的商品
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="找不到該商品")
    
    # 把前端傳來的新資料，一項一項覆蓋過去
    for key, value in product.dict().items():
        setattr(db_product, key, value)
        
    db.commit()
    db.refresh(db_product)
    return {"status": "success", "data": db_product}

# 4. 刪除商品 (DELETE)
@app.delete("/api/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(Product).filter(Product.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="找不到該商品")
        
    db.delete(db_product)
    db.commit()
    return {"status": "success", "message": "商品已成功刪除"}