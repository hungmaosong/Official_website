# backend/config/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 資料庫網址 (sqlite:/// 代表使用本地端的 sqlite 檔案)
# 這會在你的 backend 資料夾下產生一個 kcg_database.db 的檔案
SQLALCHEMY_DATABASE_URL = "sqlite:///./kcg_database.db"

# 建立引擎 (connect_args 是專門給 SQLite 用的設定，防止多執行緒報錯)
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# 建立與資料庫溝通的 Session (對話期)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 建立基礎類別，我們之後的資料表都會繼承它
Base = declarative_base()

# 取得資料庫連線的依賴函數 (給 API 用的)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()