#!/bin/bash

# CrewServiceWebsite - Скрипт запуска всех сервисов
# Автор: CrewLife Team

set -e

echo "🚀 Запуск CrewServiceWebsite..."
echo "==============================="

# Функция для очистки при завершении
cleanup() {
    echo ""
    echo "🛑 Остановка сервисов..."
    jobs -p | xargs -r kill
    echo "✅ Все сервисы остановлены"
    exit 0
}

# Установка обработчика сигналов
trap cleanup SIGINT SIGTERM

# Проверка, что установка выполнена
if [ ! -d "crewlife-backend/node_modules" ]; then
    echo "❌ Зависимости не установлены. Запустите ./install.sh сначала."
    exit 1
fi

if [ ! -f "crewlife-website/backend/crewlife.db" ]; then
    echo "❌ База данных не настроена. Запустите ./install.sh сначала."
    exit 1
fi

echo "📋 Запуск сервисов..."

# Запуск Node.js бэкенда
echo "🔧 Запуск Node.js API (порт 3000)..."
cd crewlife-backend
npm start &
BACKEND_PID=$!
cd ..

# Небольшая задержка для запуска бэкенда
sleep 2

# Запуск Python бэкенда
echo "🐍 Запуск Python API (порт 5000)..."
cd crewlife-website/backend
python3 api.py &
PYTHON_PID=$!
cd ../..

# Небольшая задержка для запуска Python API
sleep 2

# Запуск фронтенда
echo "🌐 Запуск фронтенда (порт 3001)..."
cd crewlife-website
python3 -m http.server 3001 &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Все сервисы запущены!"
echo "==============================="
echo ""
echo "🌐 Доступ к приложению:"
echo "- Фронтенд:     http://localhost:3001"
echo "- Node.js API:  http://localhost:3000"
echo "- Python API:   http://localhost:5000"
echo ""
echo "📱 Основные страницы:"
echo "- Главная:      http://localhost:3001/index.html"
echo "- Вход:         http://localhost:3001/login.html"
echo "- Дашборд:      http://localhost:3001/dashboard.html"
echo "- Админ:        http://localhost:3001/pages/admin.html"
echo ""
echo "🛑 Для остановки нажмите Ctrl+C"
echo ""

# Ожидание завершения
wait
