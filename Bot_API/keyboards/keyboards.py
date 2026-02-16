from aiogram.types import KeyboardButton, ReplyKeyboardMarkup, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from configs.config import MINIAPP_URL

# Основная клавиатура с кнопкой входа в MiniApp
def get_webapp_keyboard(is_admin: bool = False) -> InlineKeyboardMarkup:
    """Создает клавиатуру с кнопкой приложения"""
    keyboard = [
        [
            InlineKeyboardButton(
                text="🚀 FABRICBOT ECOSYSTEM APP",
                web_app=WebAppInfo(url=MINIAPP_URL)
            )
        ],
        [
            InlineKeyboardButton(
                text="💬 CONTACT OUR TEAM",
                url="https://t.me/kirbudilovfbc"
            )
        ]
    ]
    
    # Добавляем кнопку админ-панели только для админов
    if is_admin:
        keyboard.append([
            InlineKeyboardButton(
                text="👑 ADMIN PANEL",
                callback_data="admin_panel"
            )
        ])
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_admin_keyboard() -> InlineKeyboardMarkup:
    """Создает клавиатуру для админ-панели"""
    keyboard = [
        [
            InlineKeyboardButton(
                text="➕ ДОБАВИТЬ АДМИНА",
                callback_data="add_admin"
            )
        ],
        [
            InlineKeyboardButton(
                text="➖ УДАЛИТЬ АДМИНА",
                callback_data="remove_admin"
            )
        ],
        [
            InlineKeyboardButton(
                text="🎥 ИЗМЕНИТЬ ВСТУПИТЕЛЬНОЕ ВИДЕО",
                callback_data="change_welcome_video"
            )
        ],
        [
            InlineKeyboardButton(
                text="◀️ НАЗАД",
                callback_data="back_to_menu"
            )
        ]
    ]
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_admins_list_keyboard(admins: list) -> InlineKeyboardMarkup:
    """Создает клавиатуру со списком админов для удаления"""
    keyboard = []
    
    for admin in admins:
        keyboard.append([
            InlineKeyboardButton(
                text=f"❌ УДАЛИТЬ АДМИНА {admin['telegramID']}",
                callback_data=f"delete_admin_{admin['telegramID']}"
            )
        ])
    
    keyboard.append([
        InlineKeyboardButton(
            text="◀️ НАЗАД",
            callback_data="admin_panel"
        )
    ])
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

def get_back_keyboard() -> InlineKeyboardMarkup:
    """Создает клавиатуру с кнопкой возврата"""
    keyboard = [
        [
            InlineKeyboardButton(
                text="◀️ НАЗАД",
                callback_data="admin_panel"
            )
        ]
    ]
    
    return InlineKeyboardMarkup(inline_keyboard=keyboard)

