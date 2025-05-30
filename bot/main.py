from aiogram import Bot, Dispatcher, types
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.dispatcher import FSMContext
from aiogram.dispatcher.filters.state import State, StatesGroup
from aiogram.utils import executor
import json
import os
from datetime import datetime
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Конфигурация
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL", "http://localhost:3000")

if not BOT_TOKEN:
    raise ValueError("Не установлен BOT_TOKEN в файле .env")

# Инициализация бота
bot = Bot(token=BOT_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(bot, storage=storage)

# Состояния регистрации
class RegistrationStates(StatesGroup):
    waiting_for_role = State()
    waiting_for_full_name = State()
    waiting_for_group = State()

# Работа с JSON файлами
async def read_json(filename: str):
    # Исправляем путь к файлам данных
    base_path = "/app/backend/data" if os.path.exists("/app/backend/data") else "./backend/data"
    path = f"{base_path}/{filename}.json"
    
    try:
        # Создаем директорию если не существует
        os.makedirs(os.path.dirname(path), exist_ok=True)
        
        if not os.path.exists(path):
            # Создаем файл с базовой структурой
            default_content = {"users": []} if filename == "users" else {"data": []}
            with open(path, "w", encoding="utf-8") as file:
                json.dump(default_content, file, ensure_ascii=False, indent=2)
            return default_content
            
        with open(path, "r", encoding="utf-8") as file:
            return json.load(file)
    except FileNotFoundError:
        return {"users": []} if filename == "users" else {"data": []}
    except json.JSONDecodeError:
        # Если файл поврежден, создаем новый
        default_content = {"users": []} if filename == "users" else {"data": []}
        with open(path, "w", encoding="utf-8") as file:
            json.dump(default_content, file, ensure_ascii=False, indent=2)
        return default_content

async def write_json(filename: str, data: dict):
    base_path = "/app/backend/data" if os.path.exists("/app/backend/data") else "./backend/data"
    path = f"{base_path}/{filename}.json"
    
    # Создаем директорию если не существует
    os.makedirs(os.path.dirname(path), exist_ok=True)
    
    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)

# Команда /start
@dp.message_handler(commands=['start'])
async def cmd_start(message: types.Message):
    user_data = await read_json("users")
    user_exists = any(user["id"] == str(message.from_user.id) for user in user_data.get("users", []))
    
    if user_exists:
        keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True)
        keyboard.add(types.KeyboardButton("Открыть веб-приложение", web_app=types.WebAppInfo(url=WEBAPP_URL)))
        await message.answer("Добро пожаловать в CollegeDesk!", reply_markup=keyboard)
    else:
        keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True)
        keyboard.add("Студент", "Преподаватель")
        await message.answer("Добро пожаловать! Выберите вашу роль:", reply_markup=keyboard)
        await RegistrationStates.waiting_for_role.set()

# Обработка выбора роли
@dp.message_handler(state=RegistrationStates.waiting_for_role)
async def process_role(message: types.Message, state: FSMContext):
    if message.text not in ["Студент", "Преподаватель"]:
        await message.answer("Пожалуйста, выберите роль, используя кнопки.")
        return
    
    await state.update_data(role="student" if message.text == "Студент" else "teacher")
    await message.answer("Введите ваше полное имя (Фамилия Имя Отчество):")
    await RegistrationStates.waiting_for_full_name.set()

# Обработка ввода имени
@dp.message_handler(state=RegistrationStates.waiting_for_full_name)
async def process_name(message: types.Message, state: FSMContext):
    await state.update_data(full_name=message.text)
    user_data = await state.get_data()
    
    if user_data["role"] == "student":
        await message.answer("Введите номер вашей группы:")
        await RegistrationStates.waiting_for_group.set()
    else:
        await register_user(message, state)

# Обработка ввода группы
@dp.message_handler(state=RegistrationStates.waiting_for_group)
async def process_group(message: types.Message, state: FSMContext):
    await state.update_data(group=message.text)
    await register_user(message, state)

# Регистрация пользователя
async def register_user(message: types.Message, state: FSMContext):
    user_data = await state.get_data()
    users = await read_json("users")
    
    new_user = {
        "id": str(message.from_user.id),
        "username": message.from_user.username,
        "role": user_data["role"],
        "full_name": user_data["full_name"],
        "group": user_data.get("group", ""),
        "registered_at": datetime.now().isoformat()
    }
    
    if "users" not in users:
        users["users"] = []
    
    users["users"].append(new_user)
    await write_json("users", users)
    
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True)
    keyboard.add(types.KeyboardButton("Открыть веб-приложение", web_app=types.WebAppInfo(url=WEBAPP_URL)))
    
    await message.answer(
        f"Регистрация завершена!\nДобро пожаловать, {user_data['full_name']}!",
        reply_markup=keyboard
    )
    await state.finish()

if __name__ == '__main__':
    executor.start_polling(dp, skip_updates=True)