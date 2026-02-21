import time  # 👉 加上這行！讓 Python 認識時間模組
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from config.database import engine, Base, get_db
from models.product import Product
from models.user import User  # 👉 新增這行，讓系統認識 User
from models.order import Order, OrderItem # 👉 新增這行，讓系統認識訂單

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

# 👉 新增：註冊時前端必須傳來的資料
class UserRegister(BaseModel):
    username: str
    password: str
    name: Optional[str] = ""
    phone: Optional[str] = ""
    email: Optional[str] = ""
    store_711: Optional[str] = ""

# 👉 新增：登入時前端必須傳來的資料
class UserLogin(BaseModel):
    username: str
    password: str

# 👉 新增：修改會員資料時前端傳來的格式
class UserUpdate(BaseModel):
    name: str
    phone: str
    password: Optional[str] = "" # 密碼是選填的，不改就傳空字串
    store_711: str

# 👉 新增：購物車內單一商品的格式
class CartItem(BaseModel):
    id: int
    name: str
    price: int
    quantity: int

# 👉 新增：結帳時前端傳來的整筆訂單格式
class OrderCreate(BaseModel):
    username: str
    shipping_name: str
    shipping_phone: str
    shipping_store: str
    total_amount: int
    items: List[CartItem]

# 👉 新增：用來接收更新訂單狀態的格式
class OrderStatusUpdate(BaseModel):
    status: str

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

# ==========================================
# 🕵️‍♂️ 會員系統 API (Users)
# ==========================================

# 5. 會員註冊 (POST)
@app.post("/api/register")
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    # 先檢查帳號是不是被註冊過了
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="這個代號已經被其他使用者使用了！")
    
    # 建立新會員
    db_user = User(**user.dict())
    
    # 偷偷開後門：如果帳號是 admin，自動給予最高權限
    if db_user.username == "admin":
        db_user.role = "admin"
        
    db.add(db_user)
    db.commit()
    return {"status": "success", "message": "註冊成功，歡迎加入 KCG！"}

# 6. 會員登入 (POST)
@app.post("/api/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    # 去資料庫找這個帳號
    db_user = db.query(User).filter(User.username == user.username).first()
    
    # 檢查帳號是否存在，以及密碼對不對
    if not db_user or db_user.password != user.password:
        raise HTTPException(status_code=401, detail="帳號或密碼錯誤，拒絕存取！")
        
    # 👇 這裡更新：把所有資料都打包回傳，讓前端的 layout.js 可以讀取
    return {
        "status": "success", 
        "message": "登入成功",
        "data": {
            "id": db_user.id,
            "username": db_user.username,
            "role": db_user.role,
            "name": db_user.name,
            "phone": db_user.phone,
            "email": db_user.email,
            "store_711": db_user.store_711
        }
    }

# 7. 取得所有會員名單 (GET) - 戰情室專用
@app.get("/api/users")
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).all()
    
    # 為了資安，我們不要把密碼傳給前端，只傳送安全的基本資料
    safe_users = []
    for u in users:
        safe_users.append({
            "id": u.id,
            "username": u.username,
            "name": u.name,
            "phone": u.phone,
            "email": u.email,
            "store_711": u.store_711,
            "role": u.role,
            # 將時間格式化成漂亮的字串
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M:%S") if u.created_at else "未知"
        })
        
    return {"status": "success", "data": safe_users}

# 8. 修改會員個人資料 (PUT)
@app.put("/api/users/{username}")
def update_user_profile(username: str, user_update: UserUpdate, db: Session = Depends(get_db)):
    # 1. 先從資料庫找出這個人
    db_user = db.query(User).filter(User.username == username).first()
    
    if not db_user:
        raise HTTPException(status_code=404, detail="找不到該特務資料")

    # 2. 更新一般資料
    db_user.name = user_update.name
    db_user.phone = user_update.phone
    db_user.store_711 = user_update.store_711
    
    # 3. 只有當前端有傳新密碼來時，才覆蓋舊密碼
    if user_update.password:
        db_user.password = user_update.password

    # 4. 存檔寫入資料庫！
    db.commit()
    db.refresh(db_user)

    return {
        "status": "success", 
        "message": "個人資料更新成功",
        "data": {
            "username": db_user.username,
            "name": db_user.name,
            "phone": db_user.phone,
            "store_711": db_user.store_711
        }
    }

# ==========================================
# 📦 訂單結帳 API (Orders)
# ==========================================

@app.post("/api/orders")
def create_order(order_data: OrderCreate, db: Session = Depends(get_db)):
    # 1. 產生獨一無二的訂單編號 (KCG + 當下時間戳)
    order_number = f"KCG{int(time.time())}"
    
    # 2. 建立訂單主檔並存入資料庫
    db_order = Order(
        order_number=order_number,
        username=order_data.username,
        total_amount=order_data.total_amount,
        shipping_name=order_data.shipping_name,
        shipping_phone=order_data.shipping_phone,
        shipping_store=order_data.shipping_store
    )
    db.add(db_order)
    db.commit()
    db.refresh(db_order) # 刷新以取得資料庫配發的訂單 ID

    # 3. 逐一處理購物車內的商品 (建立明細 + 扣除庫存)
    for item in order_data.items:
        # A. 寫入訂單明細
        db_item = OrderItem(
            order_id=db_order.id,
            product_id=item.id,
            product_name=item.name,
            quantity=item.quantity,
            price=item.price
        )
        db.add(db_item)
        
        # B. 🔥 扣除真實庫存！
        db_product = db.query(Product).filter(Product.id == item.id).first()
        if db_product and db_product.stock >= item.quantity:
            db_product.stock -= item.quantity # 庫存減去購買數量
            
    # 4. 全部完成後，統一存檔
    db.commit()
    
    return {
        "status": "success", 
        "order_number": order_number, 
        "message": "結帳成功，裝備已進入出貨排程！"
    }

# 9. 取得所有訂單 (GET) - 戰情室專用
@app.get("/api/orders")
def get_all_orders(db: Session = Depends(get_db)):
    # 抓取所有訂單，並按照時間由新到舊排序
    orders = db.query(Order).order_by(Order.created_at.desc()).all()
    
    results = []
    for o in orders:
        # 整理訂單內的商品明細
        item_list = []
        for i in o.items:
            item_list.append({
                "product_name": i.product_name,
                "quantity": i.quantity,
                "price": i.price
            })
            
        results.append({
            "order_number": o.order_number,
            "username": o.username,
            "shipping_name": o.shipping_name,
            "total_amount": o.total_amount,
            "status": o.status,
            "created_at": o.created_at.strftime("%Y-%m-%d %H:%M:%S") if o.created_at else "未知",
            "items": item_list # 包含這筆訂單買了什麼
        })
        
    return {"status": "success", "data": results}

# 10. 更新訂單狀態 (PUT) - 戰情室專用
@app.put("/api/orders/{order_number}/status")
def update_order_status(order_number: str, status_data: OrderStatusUpdate, db: Session = Depends(get_db)):
    db_order = db.query(Order).filter(Order.order_number == order_number).first()
    
    if not db_order:
        raise HTTPException(status_code=404, detail="找不到該筆訂單")

    # 更新狀態
    db_order.status = status_data.status
    db.commit()
    
    return {"status": "success", "message": f"訂單 {order_number} 狀態已更新為：{status_data.status}"}