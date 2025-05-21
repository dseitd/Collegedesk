from typing import List, Optional
from datetime import datetime

class NotificationManager:
    def __init__(self, bot):
        self.bot = bot

    async def notify_teacher_about_dispute(self, teacher_id: str, student_name: str, subject: str, description: str):
        """Уведомление преподавателя о новой жалобе"""
        message = (
            f"🔔 Новая жалоба!\n"
            f"От студента: {student_name}\n"
            f"Предмет: {subject}\n"
            f"Описание: {description}"
        )
        await self.bot.send_message(teacher_id, message)

    async def notify_students_about_news(self, student_ids: List[str], title: str, content: str):
        """Массовая рассылка новостей студентам"""
        message = f"📢 Новое объявление!\n\n{title}\n\n{content}"
        for student_id in student_ids:
            try:
                await self.bot.send_message(student_id, message)
            except Exception as e:
                print(f"Ошибка отправки сообщения студенту {student_id}: {e}")

    async def notify_about_schedule_update(self, group_ids: List[str]):
        """Уведомление об обновлении расписания"""
        message = "📅 Расписание было обновлено! Проверьте изменения в веб-приложении."
        for group_id in group_ids:
            try:
                await self.bot.send_message(group_id, message)
            except Exception as e:
                print(f"Ошибка отправки уведомления группе {group_id}: {e}")