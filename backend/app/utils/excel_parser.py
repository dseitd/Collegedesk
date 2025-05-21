import pandas as pd
import json
from datetime import datetime
from typing import Dict, List

class ScheduleParser:
    def __init__(self):
        self.schedule_data = {
            "groups": {}
        }
        self.time_slots = {
            1: {"start": "08:30", "end": "10:00"},
            2: {"start": "10:10", "end": "11:40"},
            3: {"start": "12:10", "end": "13:40"},
            4: {"start": "13:50", "end": "15:20"},
            5: {"start": "15:30", "end": "17:00"},
            6: {"start": "17:10", "end": "18:40"}
        }
    
    def parse_excel(self, file_path: str) -> Dict:
        try:
            df = pd.read_excel(file_path, sheet_name=0)
            current_day = None
            
            for index, row in df.iterrows():
                first_cell = str(row[0]).strip()
                
                # Определяем день недели
                if any(day in first_cell for day in ["Понед", "Вторн", "Среда", "Четверг", "Пятн"]):
                    current_day = self._normalize_day_name(first_cell)
                    continue
                
                # Обработка пар
                if pd.notna(row[1]) and str(row[1]).strip().isdigit():
                    pair_number = int(row[1])
                    group_columns = list(df.columns[2:])
                    
                    for i in range(0, len(group_columns), 2):
                        group_name = str(group_columns[i]).strip()
                        subject = row[group_columns[i]]
                        teacher_room = row[group_columns[i + 1]] if i + 1 < len(group_columns) else None
                        
                        if pd.isna(subject):
                            continue
                            
                        self._add_lesson(
                            group_name,
                            current_day,
                            pair_number,
                            str(subject).strip(),
                            str(teacher_room).strip() if pd.notna(teacher_room) else ""
                        )
            
            return self.schedule_data
            
        except Exception as e:
            raise Exception(f"Ошибка при парсинге Excel: {str(e)}")
    
    def _normalize_day_name(self, day: str) -> str:
        day_mapping = {
            "Понед": "monday",
            "Вторн": "tuesday",
            "Среда": "wednesday",
            "Четверг": "thursday",
            "Пятн": "friday"
        }
        for rus, eng in day_mapping.items():
            if rus in day:
                return eng
        return day
    
    def _parse_teacher_room(self, teacher_room: str) -> tuple:
        # Предполагаем, что аудитория - это последнее число в строке
        parts = teacher_room.split()
        room = next((p for p in reversed(parts) if p.isdigit()), "")
        teacher = teacher_room.replace(room, "").strip()
        return teacher, room
    
    def _add_lesson(self, group: str, day: str, pair: int, subject: str, teacher_room: str):
        if group not in self.schedule_data["groups"]:
            self.schedule_data["groups"][group] = {
                "schedule": {
                    "monday": [], "tuesday": [], "wednesday": [], "thursday": [], "friday": []
                }
            }
        
        teacher, room = self._parse_teacher_room(teacher_room)
        
        lesson = {
            "subject": subject,
            "teacher": teacher,
            "time_start": self.time_slots[pair]["start"],
            "time_end": self.time_slots[pair]["end"],
            "room": room
        }
        
        self.schedule_data["groups"][group]["schedule"][day].append(lesson)