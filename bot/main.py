from aiogram import Bot, Dispatcher, types
from aiogram.contrib.fsm_storage.memory import MemoryStorage
from aiogram.dispatcher import FSMContext
from aiogram.dispatcher.filters.state import State, StatesGroup
import json
import os
from datetime import datetime
from dotenv import load_dotenv

# Загрузка переменных окружения
load_dotenv()

# Конфигурация
BOT_TOKEN = os.getenv("BOT_TOKEN")
WEBAPP_URL = os.getenv("WEBAPP_URL")

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
    path = f"../backend/data/{filename}.json"
    try:
        with open(path, "r", encoding="utf-8") as file:
            return json.load(file)
    except FileNotFoundError:
        return None

async def write_json(filename: str, data: dict):
    path = f"../backend/data/{filename}.json"
    with open(path, "w", encoding="utf-8") as file:
        json.dump(data, file, ensure_ascii=False, indent=2)

# Команда /start
@dp.message_handler(commands=['start'])
async def cmd_start(message: types.Message):
    user_data = await read_json("users")
    user_exists = any(user["id"] == str(message.from_user.id) for user in user_data["users"])
    
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
        "created_at": datetime.now().isoformat()
    }
    
    users["users"].append(new_user)
    await write_json("users", users)
    
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True)
    keyboard.add(types.KeyboardButton("Открыть веб-приложение", web_app=types.WebAppInfo(url=WEBAPP_URL)))
    
    await message.answer(
        "Регистрация успешно завершена! Теперь вы можете использовать веб-приложение.",
        reply_markup=keyboard
    )
    await state.finish()

from utils.notifications import NotificationManager
from backend.app.utils.excel_parser import ScheduleParser

# Инициализация менеджера уведомлений
notification_manager = NotificationManager(bot)

# Обновляем обработчик загрузки расписания
@dp.message_handler(content_types=['document'], commands=['upload_schedule'])
async def handle_schedule_upload(message: types.Message):
    users = await read_json("users")
    user = next((u for u in users["users"] if u["id"] == str(message.from_user.id)), None)
    
    if not user or user["role"] != "admin":
        await message.answer("У вас нет прав для загрузки расписания.")
        return
    
    if not message.document.file_name.endswith(('.xls', '.xlsx')):
        await message.answer("Пожалуйста, загрузите файл Excel (.xls или .xlsx)")
        return
    
    try:
        # Скачиваем файл
        file_info = await bot.get_file(message.document.file_id)
        downloaded_file = await bot.download_file(file_info.file_path)
        temp_filename = f"temp_{message.document.file_name}"
        
        with open(temp_filename, "wb") as new_file:
            new_file.write(downloaded_file.read())
        
        # Парсим расписание
        parser = ScheduleParser()
        schedule_data = parser.parse_excel(temp_filename)
        
        # Сохраняем результат
        await write_json("schedule", schedule_data)
        
        # Получаем список групп для уведомлений
        affected_groups = list(schedule_data["groups"].keys())
        
        # Отправляем уведомления
        await notification_manager.notify_about_schedule_update(affected_groups)
        
        await message.answer("✅ Расписание успешно загружено и обновлено!")
        
    except Exception as e:
        await message.answer(f"❌ Произошла ошибка при загрузке расписания: {str(e)}")
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

# Добавляем обработчик создания жалоб
@dp.message_handler(commands=['dispute'])
async def create_dispute_command(message: types.Message):
    try:
        users = await read_json("users")
        user = next((u for u in users["users"] if u["id"] == str(message.from_user.id)), None)
        
        if not user or user["role"] != "student":
            await message.answer("Только студенты могут создавать жалобы.")
            return
        
        # Парсим аргументы команды
        args = message.get_args().split('|')
        if len(args) < 3:
            await message.answer("Использование: /dispute предмет|преподаватель|описание")
            return
            
        subject, teacher_name, description = args
        
        # Находим ID преподавателя
        teacher = next((u for u in users["users"] 
                       if u["role"] == "teacher" and teacher_name.lower() in u["full_name"].lower()), None)
        
        if not teacher:
            await message.answer("Преподаватель не найден.")
            return
            
        # Создаем жалобу
        disputes = await read_json("disputes")
        new_dispute = {
            "id": str(len(disputes["disputes"]) + 1),
            "student_id": str(message.from_user.id),
            "subject": subject,
            "teacher_id": teacher["id"],
            "description": description,
            "status": "pending",
            "created_at": datetime.now().isoformat()
        }
        
        disputes["disputes"].append(new_dispute)
        await write_json("disputes", disputes)
        
        # Отправляем уведомление преподавателю
        await notification_manager.notify_teacher_about_dispute(
            teacher["id"],
            user["full_name"],
            subject,
            description
        )
        
        await message.answer("✅ Жалоба успешно создана и отправлена преподавателю.")
        
    except Exception as e:
        await message.answer(f"❌ Произошла ошибка при создании жалобы: {str(e)}")

if __name__ == '__main__':
    from aiogram import executor
    executor.start_polling(dp, skip_updates=True)