from models.product_model import Product
from config.database import db

def get_all_products():
    products = Product.query.all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'price': p.price,
        'stock_quantity': p.stock_quantity,
        'image_path': p.image_path,
        'description': p.description,
        'category': p.category
    } for p in products])

def add_product(data):
    new_product = Product(**data)
    db.session.add(new_product)
    db.session.commit()
    return jsonify({'message': '商品已新增'}), 201
