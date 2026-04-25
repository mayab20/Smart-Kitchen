from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["CookWise"]



users_collection = db["users"]
items_collection = db["items"]
pantries_collection = db["items"]
recipes_collection = db["recipes"]

