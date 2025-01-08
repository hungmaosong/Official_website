from flask import Flask
from routes.products import product_bp
from routes.users import user_bp
from config.database import db

app = Flask(__name__)

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://username:password@localhost/db_name' #配置 SQLAlchemy 的資料庫連接字串。
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False #禁用追蹤資料庫物件變更的功能，這樣可以提升效能並避免顯示警告。

db.init_app(app) #初始化資料庫，將 SQLAlchemy 的資料庫實例與 Flask 應用綁定，使資料庫功能可以在 Flask 應用中使用。

app.register_blueprint(product_bp, url_prefix='/api/products') #註冊 product_bp 藍圖，並將其所有路由加上 URL 前綴 /api/products
app.register_blueprint(user_bp, url_prefix='/api/users') #註冊 user_bp 藍圖，並將其所有路由加上 URL 前綴 /api/users

if __name__ == '__main__':
    app.run(debug=True)
