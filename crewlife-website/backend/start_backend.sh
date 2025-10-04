#!/bin/bash

# Скрипт запуска backend сервера CrewLife Admin Panel

echo "🚀 Запуск CrewLife Backend Server..."

# Переход в директорию backend
cd "$(dirname "$0")"

# Проверка наличия Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не найден. Установите Python3 для продолжения."
    exit 1
fi

# Проверка наличия pip
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 не найден. Установите pip3 для продолжения."
    exit 1
fi

# Установка зависимостей
echo "📦 Установка зависимостей..."
pip3 install -r requirements.txt

# Создание директории для данных
mkdir -p data

# Запуск сервера
echo "🌐 Запуск Flask сервера на http://localhost:5000"
echo "📊 API документация: http://localhost:5000/api"
echo "🛑 Для остановки нажмите Ctrl+C"
echo ""

python3 api.py
