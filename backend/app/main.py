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
    response = {
        "status": "checking",
        "components": {},
        "errors": []
    }
    
    try:
        # Проверяем доступность файлов данных
        data_files = ["users.json", "schedule.json", "disputes.json", "attendance.json", "grades.json", "news.json"]
        for file in data_files:
            file_status = {"exists": False, "readable": False, "valid_json": False}
            path = f"/app/backend/data/{file}"
            
            # Проверка существования
            if os.path.exists(path):
                file_status["exists"] = True
                
                # Проверка прав доступа и JSON
                try:
                    with open(path, "r") as f:
                        json.load(f)
                        file_status["readable"] = True
                        file_status["valid_json"] = True
                except IOError as e:
                    response["errors"].append(f"IO Error with {file}: {str(e)}")
                except json.JSONDecodeError as e:
                    file_status["readable"] = True
                    response["errors"].append(f"Invalid JSON in {file}: {str(e)}")
                    
            response["components"][file] = file_status
        
        # Проверяем общий статус
        all_ok = all(
            all(status.values()) 
            for status in response["components"].values()
        )
        
        response["status"] = "healthy" if all_ok else "unhealthy"
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