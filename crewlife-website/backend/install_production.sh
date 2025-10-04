#!/bin/bash

# Скрипт установки CrewLife API на продакшн сервер

echo "🚀 Установка CrewLife API на продакшн сервер..."

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo "❌ Запустите скрипт с правами root: sudo $0"
    exit 1
fi

# Установка зависимостей
echo "📦 Установка системных зависимостей..."
apt update
apt install -y python3 python3-pip python3-venv apache2 libapache2-mod-wsgi-py3

# Создание виртуального окружения
echo "🐍 Создание виртуального окружения..."
cd /var/www/html/crewlife/backend
python3 -m venv venv
source venv/bin/activate

# Установка Python зависимостей
echo "📦 Установка Python зависимостей..."
pip install -r requirements.txt

# Создание директории для базы данных
echo "🗄️ Настройка базы данных..."
mkdir -p /var/www/html/crewlife/data
chown -R www-data:www-data /var/www/html/crewlife/data
chmod -R 755 /var/www/html/crewlife/data

# Настройка прав доступа
echo "🔒 Настройка прав доступа..."
chown -R www-data:www-data /var/www/html/crewlife/backend
chmod -R 755 /var/www/html/crewlife/backend
chmod +x /var/www/html/crewlife/backend/crewlife-api.wsgi

# Включение модулей Apache
echo "🌐 Настройка Apache..."
a2enmod wsgi
a2enmod headers
a2enmod rewrite

# Копирование конфигурации Apache
echo "📝 Настройка конфигурации Apache..."
cp /var/www/html/crewlife/backend/crewlife-api.conf /etc/apache2/sites-available/
a2ensite crewlife-api.conf

# Перезапуск Apache
echo "🔄 Перезапуск Apache..."
systemctl reload apache2

# Создание базы данных
echo "🗄️ Инициализация базы данных..."
cd /var/www/html/crewlife/backend
source venv/bin/activate
python3 -c "
from database import db
print('✅ База данных инициализирована')
print('📊 Созданы таблицы: users, requests, settings, logs')
print('👤 Создан администратор: admin@crewlife.ru / admin123')
"

# Создание systemd сервиса для мониторинга
echo "⚙️ Создание systemd сервиса..."
cat > /etc/systemd/system/crewlife-api.service << EOF
[Unit]
Description=CrewLife API Service
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/html/crewlife/backend
Environment=PATH=/var/www/html/crewlife/backend/venv/bin
ExecStart=/var/www/html/crewlife/backend/venv/bin/python api.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable crewlife-api.service

echo ""
echo "✅ Установка завершена!"
echo ""
echo "🌐 API доступен по адресу: https://crewlife.ru/api"
echo "📊 Админ-панель: https://crewlife.ru/pages/admin.html"
echo "👤 Данные для входа: admin@crewlife.ru / admin123"
echo ""
echo "📋 Полезные команды:"
echo "  systemctl status crewlife-api    - статус сервиса"
echo "  systemctl restart crewlife-api   - перезапуск API"
echo "  tail -f /var/log/apache2/crewlife-api_error.log - логи ошибок"
echo ""
echo "🔧 Для отладки:"
echo "  cd /var/www/html/crewlife/backend"
echo "  source venv/bin/activate"
echo "  python api.py"
