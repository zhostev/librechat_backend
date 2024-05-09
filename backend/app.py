from flask import Flask, jsonify, request
from pymongo import MongoClient, errors
from bson import ObjectId
import datetime
from flask_cors import CORS
from flask_bcrypt import Bcrypt
import os
from dotenv import load_dotenv

# 确保在读取环境变量之前加载 .env 文件
load_dotenv()


app = Flask(__name__)
CORS(app)  # Enable CORS
# CORS(app, resources={r"/*": {"origins": "*"}})

bcrypt = Bcrypt(app)

# MongoDB connection
print("DB_NAME:", os.getenv("DB_NAME"))
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]  # Use the database from .env

users_collection = db['users']  # Use the 'users' collection

@app.route('/users', methods=['GET'])
def get_users():
    try:
        users = list(users_collection.find())
        for user in users:
            user["_id"] = str(user["_id"])
        return jsonify(users)
    except errors.PyMongoError as e:
        return jsonify({"error": str(e)}), 500

@app.route('/user/<id>', methods=['GET'])
def get_user(id):
    try:
        user = users_collection.find_one({'_id': ObjectId(id)})
        if user:
            user["_id"] = str(user["_id"])
            return jsonify(user)
        else:
            return jsonify({"error": "User not found"}), 404
    except errors.PyMongoError as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users/<id>', methods=['DELETE'])
def delete_user(id):
    try:
        result = users_collection.delete_one({'_id': ObjectId(id)})
        if result.deleted_count:
            return jsonify({"message": "User deleted successfully"}), 200
        else:
            return jsonify({"error": "User not found"}), 404
    except errors.PyMongoError as e:
        return jsonify({"error": str(e)}), 500

@app.route('/users', methods=['POST'])
def add_user():
    try:
        user_data = {
            "name": request.json.get('name', ''),
            "username": request.json.get('username', ''),
            "email": request.json['email'],
            "emailVerified": request.json.get('emailVerified', False),
            "password": bcrypt.generate_password_hash(request.json.get('password', '')).decode('utf-8'),
            "avatar": request.json.get('avatar', ''),
            "provider": request.json.get('provider', 'local'),
            "role": request.json.get('role', 'USER'),
            "plugins": request.json.get('plugins', []),
            "refreshToken": request.json.get('refreshToken', []),
            "createdAt": datetime.datetime.now(),
            "updatedAt": datetime.datetime.now()
        }
        user_id = users_collection.insert_one(user_data).inserted_id
        user = users_collection.find_one({'_id': user_id})
        user["_id"] = str(user["_id"])
        return jsonify(user), 201
    except errors.PyMongoError as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)