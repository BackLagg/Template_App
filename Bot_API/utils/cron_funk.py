import logging
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from configs.config import MONGO_URI, DB_NAME, USERS_COLLECTION, USERS_PROFILE_COLLECTION

# Настройка логирования
logger = logging.getLogger(__name__)

# Асинхронное подключение к MongoDB
async def get_db_collections():
    """Получает асинхронные коллекции MongoDB"""
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DB_NAME]
    users_collection = db[USERS_COLLECTION]
    users_profile_collection = db[USERS_PROFILE_COLLECTION]
    return users_collection, users_profile_collection

async def update_user_access_async(users_collection, user_id, is_accepted):
    """Асинхронно обновляет статус доступа пользователя"""
    result = await users_collection.update_one(
        {"telegramID": str(user_id)},
        {"$set": {"isAccepted": is_accepted}}
    )
    return result.modified_count

async def check_expired_subscriptions_async():
    """
    Асинхронно проверяет и обновляет статус пользователей с истекшей подпиской.
    Эта функция вызывается через aiocron.
    """
    client = None
    try:
        current_date = datetime.now()
        client = AsyncIOMotorClient(MONGO_URI)
        db = client[DB_NAME]
        users_collection = db[USERS_COLLECTION]
        users_profile_collection = db[USERS_PROFILE_COLLECTION]
        
        # Находим профили с истекшей датой подписки
        cursor = users_profile_collection.find({
            "$and": [
                {"expireDate": {"$lt": current_date}},
                {"expireDate": {"$ne": None}}
            ]
        })
        
        updated_count = 0
        
        async for profile in cursor:
            telegram_id = profile.get("telegramID")
            expire_date = profile.get("expireDate")
            
            if telegram_id:
                # Обновляем статус доступа в коллекции пользователей
                modified = await update_user_access_async(users_collection, telegram_id, False)
                if modified > 0:
                    updated_count += 1
                    
        return updated_count
    except Exception as e:
        logger.error(f"Ошибка при проверке подписок: {e}")
        return 0
    finally:
        # Закрываем соединение с MongoDB
        if client:
            client.close()
            logger.debug("Соединение с MongoDB закрыто в cron-задаче")

