#!/bin/bash

# Скрипт для запуска сайта CrewLife
echo "🚀 Запуск сайта CrewLife..."
echo "📁 Папка проекта: $(pwd)"
echo "🌐 Открытие сайта в браузере..."

# Запуск сервера в фоновом режиме
python3 -m http.server 3001 &
SERVER_PID=$!

# Ожидание запуска сервера
sleep 2

# Открытие сайта в браузере
if command -v xdg-open > /dev/null; then
    xdg-open http://localhost:3001/crewlife.html
elif command -v open > /dev/null; then
    open http://localhost:3001/crewlife.html
else
    echo "❌ Не удалось открыть браузер автоматически"
    echo "🌐 Откройте вручную: http://localhost:3001/crewlife.html"
fi

echo "✅ Сайт запущен на http://localhost:3001/crewlife.html"
echo "🛑 Для остановки нажмите Ctrl+C"

# Ожидание завершения
wait $SERVER_PID





