from flask import Blueprint, request, jsonify
from controllers.product_controller import get_all_products, add_product

product_bp = Blueprint('products', __name__)

@product_bp.route('/', methods=['GET'])
def get_products():
    return get_all_products()

@product_bp.route('/', methods=['POST'])
def create_product():
    data = request.get_json()
    return add_product(data)
