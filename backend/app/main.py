from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from .utils.excel_parser import ScheduleParser

app = FastAPI(title="CollegeDesk API")

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "CollegeDesk API работает"}

@app.get("/health")
async def health_check():
    try:
        # Проверяем доступность файлов данных
        data_files = ["users.json", "schedule.json", "disputes.json"]
        for file in data_files:
            path = f"/app/backend/data/{file}"
            if not os.path.exists(path):
                return {"status": "unhealthy", "error": f"Missing data file: {file}"}
            
            # Проверяем права доступа и возможность чтения/записи
            try:
                with open(path, "r") as f:
                    json.load(f)  # Проверяем, что файл содержит валидный JSON
            except (IOError, json.JSONDecodeError) as e:
                return {"status": "unhealthy", "error": f"Cannot read/parse {file}: {str(e)}"}
        
        return {"status": "healthy", "message": "All systems operational"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}

@app.post("/schedule/upload")
async def upload_schedule(file: UploadFile = File(...), user_id: str = None):
    # Проверка роли пользователя
    user = await check_user_role(user_id, "admin")
    
    # Проверка расширения файла
    if not file.filename.endswith(('.xls', '.xlsx')):
        raise HTTPException(status_code=400, detail="Поддерживаются только файлы Excel (.xls, .xlsx)")
    
    try:
        # Сохраняем временный файл
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Парсим расписание
        parser = ScheduleParser()
        schedule_data = parser.parse_excel(temp_path)
        
        # Сохраняем результат
        await write_json_file("schedule", schedule_data)
        
        # Удаляем временный файл
        os.remove(temp_path)
        
        return {"message": "Расписание успешно загружено", "groups": list(schedule_data["groups"].keys())}
        
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=500, detail=str(e))