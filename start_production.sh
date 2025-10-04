#!/bin/bash
# CrewLife Production Startup Script

echo "🚀 Запуск CrewLife в режиме продакшена..."

# Проверяем MariaDB
if ! systemctl is-active --quiet mariadb; then
    echo "❌ MariaDB не запущен. Запускаем..."
    systemctl start mariadb
fi

# Проверяем подключение к базе данных
if ! mysql -u crewlife_user -pandrei8002012 crewlife_prod -e "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Не удается подключиться к базе данных"
    exit 1
fi

echo "✅ База данных готова"

# Запускаем API сервер
cd /root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/crewlife-website/backend
echo "🌐 Запускаем API сервер на порту 5000..."
python3 api.py

echo "🎉 CrewLife запущен в режиме продакшена!"
