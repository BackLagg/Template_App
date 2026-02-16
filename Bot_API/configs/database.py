from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timedelta
from configs.config import MONGO_URI, DB_NAME, USERS_COLLECTION, USERS_PROFILE_COLLECTION, SUPERUSER_COLLECTION, SUBSCRIPTION_DAYS

# Инициализация подключения к MongoDB
mongo_client = MongoClient(MONGO_URI)
db = mongo_client[DB_NAME]
users_collection = db[USERS_COLLECTION]
users_profile_collection = db[USERS_PROFILE_COLLECTION]
superuser_collection = db[SUPERUSER_COLLECTION]

# Создание индексов
users_collection.create_index("telegramID", unique=True)
users_profile_collection.create_index("telegramID", unique=True)
superuser_collection.create_index("telegramID", unique=True)

# Функции для работы с пользователями
def is_admin(user_id):
    """Проверяет, является ли пользователь администратором с полными правами"""
    admin = superuser_collection.find_one({"telegramID": str(user_id), "isAccepted": True})
    return admin is not None

def is_moder(user_id):
    """Проверяет, является ли пользователь модератором (с любым статусом)"""
    admin = superuser_collection.find_one({"telegramID": str(user_id)})
    return admin is not None

def add_admin(admin_id, is_accepted=False):
    """Добавляет нового администратора"""
    return superuser_collection.insert_one({"telegramID": str(admin_id), "isAccepted": is_accepted})

def remove_admin(admin_id):
    """Удаляет администратора"""
    return superuser_collection.delete_one({"telegramID": admin_id})

def get_all_admins():
    """Возвращает список всех администраторов"""
    return list(superuser_collection.find({}))

def add_user(user_id):
    """Добавляет пользователя с доступом к приложению"""
    user = users_collection.find_one({"telegramID": str(user_id)})
    
    if user:
        # Пользователь уже существует, обновляем его статус
        users_collection.update_one(
            {"telegramID": str(user_id)},
            {"$set": {"isAccepted": True}}
        )
        return {"status": "updated", "user": user}
    else:
        # Создаем нового пользователя
        result = users_collection.insert_one({"telegramID": str(user_id), "isAccepted": True})
        return {"status": "created", "user": {"telegramID": str(user_id), "isAccepted": True}}

def get_user(user_id):
    """Получает информацию о пользователе"""
    return users_profile_collection.find_one({"telegramID": user_id})

def create_or_update_profile(user_id, name="Аноним", username=""):
    """Создает или обновляет профиль пользователя с подпиской на 30 дней"""
    current_date = datetime.now()
    expire_date = current_date + timedelta(days=SUBSCRIPTION_DAYS)
    
    profile = users_profile_collection.find_one({"telegramID": str(user_id)})
    
    if profile:
        # Профиль уже существует, обновляем дату истечения
        if profile.get("expireDate") and isinstance(profile["expireDate"], datetime) and profile["expireDate"] > current_date:
            # Если подписка еще не истекла, добавляем дни к текущей дате истечения
            new_expire_date = profile["expireDate"] + timedelta(days=SUBSCRIPTION_DAYS)
        else:
            # Если подписка истекла или её нет, начинаем с текущей даты
            new_expire_date = expire_date
        
        users_profile_collection.update_one(
            {"telegramID": str(user_id)},
            {"$set": {
                "expireDate": new_expire_date,
                "isNew": False
            }}
        )
        return {"status": "updated", "profile": profile, "expire_date": new_expire_date}
    else:
        # Создаем новый профиль
        new_profile = {
            "telegramID": str(user_id),
            "name": name,
            "username": username,
            "totalLessonScore": 0,
            "bonusScore": 0,
            "expireDate": expire_date,
            "isNew": True
        }
        result = users_profile_collection.insert_one(new_profile)
        return {"status": "created", "profile": new_profile, "expire_date": expire_date}

def check_user_status(user_id):
    """Проверяет статус пользователя в системе"""
    user = users_collection.find_one({"telegramID": str(user_id)})
    profile = users_profile_collection.find_one({"telegramID": str(user_id)})
    
    result = {
        "exists": False,
        "has_profile": False,
        "is_accepted": False,
        "subscription_active": False,
        "expire_date": None
    }
    
    if user:
        result["exists"] = True
        result["is_accepted"] = user.get("isAccepted", False)
    
    if profile:
        result["has_profile"] = True
        expire_date = profile.get("expireDate")
        result["expire_date"] = expire_date
        
        if expire_date and isinstance(expire_date, datetime):
            result["subscription_active"] = expire_date > datetime.now()
    
    return result 

def get_users_paginated(page=0, per_page=5):
    """Получает список пользователей с пагинацией"""
    # Получаем профили пользователей с сортировкой по имени
    profiles = list(users_profile_collection.find().sort("name", 1).skip(page * per_page).limit(per_page))
    # Получаем общее количество пользователей
    total_users = users_profile_collection.count_documents({})
    return {
        "profiles": profiles,
        "total": total_users,
        "total_pages": (total_users + per_page - 1) // per_page,
        "current_page": page
    }

def add_bonus_score(user_id, bonus_amount):
    """Начисляет бонусные очки пользователю"""
    profile = users_profile_collection.find_one({"telegramID": str(user_id)})
    
    if not profile:
        return {"status": "error", "message": "Пользователь не найден"}
    
    current_bonus = profile.get("bonusScore", 0)
    new_bonus = current_bonus + bonus_amount
    
    users_profile_collection.update_one(
        {"telegramID": str(user_id)},
        {"$set": {"bonusScore": new_bonus}}
    )
    
    return {
        "status": "success", 
        "profile": profile, 
        "previous_bonus": current_bonus, 
        "new_bonus": new_bonus
    } 