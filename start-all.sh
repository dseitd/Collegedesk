#!/bin/bash

echo "Запуск всех интерфейсов..."

# Запуск бэкенда
echo "Запуск бэкенда на порту 8000..."
cd backend && python3 -m app.main &
BACKEND_PID=$!

# Запуск бота
echo "Запуск бота..."
cd ../bot && python3 main.py &
BOT_PID=$!

# Запуск студенческого интерфейса
echo "Запуск студенческого интерфейса на порту 3001..."
cd ../interfaces/student && npm start &
STUDENT_PID=$!

# Запуск интерфейса преподавателя
echo "Запуск интерфейса преподавателя на порту 3002..."
cd ../teacher && npm start &
TEACHER_PID=$!

# Запуск интерфейса администратора
echo "Запуск интерфейса администратора на порту 3003..."
cd ../admin && npm start &
ADMIN_PID=$!

echo "Все сервисы запущены!"
echo "Студенческий интерфейс: http://localhost:3001"
echo "Интерфейс преподавателя: http://localhost:3002"
echo "Интерфейс администратора: http://localhost:3003"
echo "API бэкенда: http://localhost:8000"

# Ожидание завершения
wait $BACKEND_PID $BOT_PID $STUDENT_PID $TEACHER_PID $ADMIN_PID