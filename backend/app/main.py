from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from app.utils.excel_parser import ScheduleParser

app = FastAPI(title="CollegeDesk API")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Функция для проверки роли пользователя
async def check_user_role(user_id: str, required_role: str):
    """Проверка роли пользователя"""
    if not user_id:
        raise HTTPException(status_code=401, detail="Пользователь не авторизован")
    
    try:
        with open("/app/backend/data/users.json", "r", encoding="utf-8") as f:
            users_data = json.load(f)
        
        user = next((u for u in users_data.get("users", []) if u["id"] == user_id), None)
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        if user["role"] != required_role and required_role != "any":
            raise HTTPException(status_code=403, detail="Недостаточно прав")
        
        return user
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Файл пользователей не найден")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Ошибка чтения данных пользователей")

@app.get("/")
async def root():
    return {"message": "CollegeDesk API работает"}

@app.get("/health")
async def health_check():
    response = {
        "status": "healthy",
        "components": {},
        "errors": []
    }
    
    try:
        # Проверяем базовую работоспособность API
        if not os.path.exists("/app/backend/data"):
            os.makedirs("/app/backend/data")
        
        # Проверяем доступность файлов данных
        data_files = ["users.json", "schedule.json", "disputes.json", "attendance.json", "grades.json", "news.json"]
        for file in data_files:
            file_status = {"exists": False, "readable": False, "valid_json": False}
            path = f"/app/backend/data/{file}"
            
            # Если файл не существует, создаем его с базовой структурой
            if not os.path.exists(path):
                default_content = {"users": []} if file == "users.json" else {"data": []}
                try:
                    with open(path, "w", encoding="utf-8") as f:
                        json.dump(default_content, f, ensure_ascii=False, indent=2)
                    file_status["exists"] = True
                except Exception as e:
                    response["errors"].append(f"Failed to create {file}: {str(e)}")
                    continue
            else:
                file_status["exists"] = True
            
            # Проверка прав доступа и JSON
            try:
                with open(path, "r", encoding="utf-8") as f:
                    json.load(f)
                    file_status["readable"] = True
                    file_status["valid_json"] = True
            except IOError as e:
                response["errors"].append(f"IO Error with {file}: {str(e)}")
            except json.JSONDecodeError as e:
                file_status["readable"] = True
                response["errors"].append(f"Invalid JSON in {file}: {str(e)}")
                # Пытаемся исправить файл
                try:
                    default_content = {"users": []} if file == "users.json" else {"data": []}
                    with open(path, "w", encoding="utf-8") as f:
                        json.dump(default_content, f, ensure_ascii=False, indent=2)
                    file_status["valid_json"] = True
                except Exception as e:
                    response["errors"].append(f"Failed to fix {file}: {str(e)}")
                    
            response["components"][file] = file_status
        
        # Проверяем критические компоненты
        critical_files = ["users.json", "schedule.json"]
        critical_ok = all(
            response["components"].get(file, {}).get("valid_json", False)
            for file in critical_files
        )
        
        response["status"] = "healthy" if critical_ok else "unhealthy"
        return response
        
    except Exception as e:
        response["status"] = "error"
        response["errors"].append(str(e))
        return response

@app.post("/schedule/upload")
async def upload_schedule(file: UploadFile = File(...), user_id: str = None):
    # Проверка роли пользователя
    user = await check_user_role(user_id, "admin")
    
    # Проверка расширения файла
    if not file.filename.endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Поддерживаются только файлы Excel (.xls, .xlsx)")
    
    try:
        # Сохраняем временный файл
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Парсим расписание
        parser = ScheduleParser()
        schedule_data = parser.parse_excel(temp_path)
        
        # Сохраняем в файл
        with open("/app/backend/data/schedule.json", "w", encoding="utf-8") as f:
            json.dump(schedule_data, f, ensure_ascii=False, indent=2)
        
        # Удаляем временный файл
        os.remove(temp_path)
        
        return {"message": "Расписание успешно загружено", "groups": list(schedule_data["groups"].keys())}
        
    except Exception as e:
        # Удаляем временный файл в случае ошибки
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=f"Ошибка при обработке файла: {str(e)}")

# Добавляем недостающие эндпоинты
@app.get("/users/{user_id}")
async def get_user(user_id: str):
    """Получение информации о пользователе"""
    try:
        with open("/app/backend/data/users.json", "r", encoding="utf-8") as f:
            users_data = json.load(f)
        
        user = next((u for u in users_data.get("users", []) if u["id"] == user_id), None)
        if not user:
            raise HTTPException(status_code=404, detail="Пользователь не найден")
        
        return user
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Файл пользователей не найден")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Ошибка чтения данных пользователей")

@app.get("/schedule/{group}")
async def get_schedule(group: str):
    """Получение расписания для группы"""
    try:
        with open("/app/backend/data/schedule.json", "r", encoding="utf-8") as f:
            schedule_data = json.load(f)
        
        if group not in schedule_data.get("groups", {}):
            raise HTTPException(status_code=404, detail="Группа не найдена")
        
        return schedule_data["groups"][group]
    except FileNotFoundError:
        raise HTTPException(status_code=500, detail="Файл расписания не найден")
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Ошибка чтения расписания")