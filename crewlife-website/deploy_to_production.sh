#!/bin/bash

# 🚀 Скрипт развертывания CrewLife на продакшн сервер crewlife.ru
echo "🚀 Развертывание CrewLife на продакшн сервер..."

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    log_error "Запустите скрипт с правами root: sudo $0"
    exit 1
fi

# 1. Создание директории для сайта
log_info "Создание директории для сайта..."
mkdir -p /var/www/crewlife.ru
chown -R www-data:www-data /var/www/crewlife.ru
chmod -R 755 /var/www/crewlife.ru

# 2. Копирование файлов фронтенда
log_info "Копирование файлов фронтенда..."
cp -r /root/crewlife-website/* /var/www/crewlife.ru/
chown -R www-data:www-data /var/www/crewlife.ru
chmod -R 755 /var/www/crewlife.ru

# 3. Настройка бэкенда
log_info "Настройка бэкенда..."
cd /var/www/crewlife.ru/backend

# Создание systemd сервиса для бэкенда
cat > /etc/systemd/system/crewlife-backend.service << EOF
[Unit]
Description=CrewLife Backend API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/crewlife.ru/backend
Environment=PATH=/var/www/crewlife.ru/backend/venv/bin
ExecStart=/var/www/crewlife.ru/backend/venv/bin/python api_mysql.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# 4. Установка зависимостей Python
log_info "Установка зависимостей Python..."
if [ ! -d "/var/www/crewlife.ru/backend/venv" ]; then
    python3 -m venv /var/www/crewlife.ru/backend/venv
fi

source /var/www/crewlife.ru/backend/venv/bin/activate
pip install -r /var/www/crewlife.ru/backend/requirements.txt

# 5. Настройка базы данных
log_info "Настройка базы данных..."
# Создание пользователя и базы данных MariaDB
mysql -e "CREATE DATABASE IF NOT EXISTS crewlife CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'crewlife'@'localhost' IDENTIFIED BY 'crewlife123';"
mysql -e "GRANT ALL PRIVILEGES ON crewlife.* TO 'crewlife'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Инициализация базы данных
cd /var/www/crewlife.ru/backend
python3 -c "
from database_mysql import db
print('✅ База данных инициализирована')
"

# 6. Настройка Nginx
log_info "Настройка Nginx..."
# Активация сайта
ln -sf /etc/nginx/sites-available/crewlife.ru /etc/nginx/sites-enabled/
nginx -t
if [ $? -eq 0 ]; then
    systemctl reload nginx
    log_success "Nginx настроен и перезагружен"
else
    log_error "Ошибка в конфигурации Nginx"
    exit 1
fi

# 7. Запуск бэкенда
log_info "Запуск бэкенда..."
systemctl daemon-reload
systemctl enable crewlife-backend
systemctl start crewlife-backend

# Проверка статуса
sleep 3
if systemctl is-active --quiet crewlife-backend; then
    log_success "Бэкенд запущен успешно"
else
    log_error "Ошибка запуска бэкенда"
    systemctl status crewlife-backend
    exit 1
fi

# 8. Настройка SSL (Let's Encrypt)
log_info "Настройка SSL сертификата..."
if command -v certbot &> /dev/null; then
    certbot --nginx -d crewlife.ru -d www.crewlife.ru --non-interactive --agree-tos --email admin@crewlife.ru
    if [ $? -eq 0 ]; then
        log_success "SSL сертификат установлен"
    else
        log_warning "Не удалось установить SSL сертификат. Настройте вручную."
    fi
else
    log_warning "Certbot не установлен. Установите SSL сертификат вручную."
fi

# 9. Настройка файрвола
log_info "Настройка файрвола..."
ufw allow 'Nginx Full'
ufw allow ssh
ufw --force enable

# 10. Создание тестового пользователя
log_info "Создание тестового пользователя..."
mysql -u crewlife -pcrewlife123 -e "USE crewlife; INSERT IGNORE INTO users (employee_id, first_name, last_name, position, location, email, password_hash, role, status) VALUES ('ADMIN001', 'Администратор', 'Системы', 'Администратор', 'Москва', 'admin@crewlife.ru', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'admin', 'active');"

# 11. Финальная проверка
log_info "Финальная проверка..."
sleep 5

# Проверка бэкенда
if curl -s http://localhost:5000/api/auth/check > /dev/null; then
    log_success "Бэкенд API работает"
else
    log_warning "Бэкенд API не отвечает"
fi

# Проверка фронтенда
if curl -s http://localhost/ > /dev/null; then
    log_success "Фронтенд работает"
else
    log_warning "Фронтенд не отвечает"
fi

# Результаты развертывания
echo ""
echo "🎉 Развертывание CrewLife завершено!"
echo "=================================="
echo "🌐 Сайт: https://crewlife.ru"
echo "🔧 Админ-панель: https://crewlife.ru/admin"
echo "📡 API: https://crewlife.ru/api/"
echo ""
echo "🔑 Данные для входа:"
echo "   Email: admin@crewlife.ru"
echo "   Пароль: admin123"
echo ""
echo "📋 Полезные команды:"
echo "   systemctl status crewlife-backend  # Статус бэкенда"
echo "   systemctl restart crewlife-backend # Перезапуск бэкенда"
echo "   nginx -t                          # Проверка Nginx"
echo "   systemctl reload nginx            # Перезагрузка Nginx"
echo "   tail -f /var/log/nginx/crewlife.ru.error.log # Логи ошибок"
echo ""
echo "🔧 Устранение неполадок:"
echo "   Если сайт не работает, проверьте:"
echo "   1. Статус бэкенда: systemctl status crewlife-backend"
echo "   2. Логи Nginx: tail -f /var/log/nginx/crewlife.ru.error.log"
echo "   3. Логи бэкенда: journalctl -u crewlife-backend -f"
echo "   4. SSL сертификат: certbot certificates"
echo ""

log_success "CrewLife успешно развернут на crewlife.ru!"
