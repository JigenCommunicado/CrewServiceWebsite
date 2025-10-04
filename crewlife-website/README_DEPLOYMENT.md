# 🚀 Руководство по развертыванию CrewLife на продакшн сервер

## 📋 Обзор

CrewLife - это веб-приложение для управления персоналом, состоящее из:
- **Фронтенд**: HTML/CSS/JavaScript (статичные файлы)
- **Бэкенд**: Python Flask API (порт 5000)
- **База данных**: MariaDB/MySQL
- **Веб-сервер**: Nginx (прокси + статика)
- **SSL**: Let's Encrypt сертификаты

## 🏗️ Архитектура развертывания

```
Интернет → Nginx (80/443) → Flask API (5000)
                ↓
            Статические файлы (/var/www/crewlife.ru/)
                ↓
            MariaDB (3306)
```

## 📁 Структура файлов

```
/root/crewlife-website/
├── deploy_to_production.sh    # Основной скрипт развертывания
├── backend/
│   ├── api_mysql.py          # Flask API сервер
│   ├── database_mysql.py     # Модели базы данных
│   ├── requirements.txt      # Python зависимости
│   └── venv/                 # Виртуальное окружение
├── index.html                # Главная страница
├── pages/                    # HTML страницы
├── styles/                   # CSS файлы
├── scripts/                  # JavaScript файлы
└── assets/                   # Изображения и ресурсы
```

## 🔧 Системные требования

### Установленные компоненты:
- **Nginx** - веб-сервер и обратный прокси
- **MariaDB/MySQL** - база данных
- **Python 3** - для бэкенда
- **Certbot** - для SSL сертификатов
- **UFW** - файрвол

### Порты:
- **80** - HTTP (Nginx)
- **443** - HTTPS (Nginx)
- **5000** - Flask API (внутренний)
- **3306** - MariaDB (внутренний)

## 🚀 Быстрое развертывание

### 1. Подготовка системы

```bash
# Проверить права root
sudo su

# Остановить Apache2 (если запущен)
systemctl stop apache2
systemctl disable apache2

# Установить недостающие пакеты
apt update
apt install -y certbot python3-certbot-nginx ufw
```

### 2. Запуск развертывания

```bash
# Перейти в директорию проекта
cd /root/crewlife-website/

# Запустить скрипт развертывания
sudo ./deploy_to_production.sh
```

### 3. Проверка развертывания

```bash
# Проверить статус сервисов
systemctl status crewlife-backend nginx mysql

# Проверить API
curl -s https://crewlife.ru/api/auth/check

# Проверить сайт
curl -s https://crewlife.ru/ | grep -o "<title>.*</title>"
```

## 📝 Подробные шаги развертывания

### Шаг 1: Создание директорий и копирование файлов

```bash
# Создать директорию для сайта
mkdir -p /var/www/crewlife.ru
chown -R www-data:www-data /var/www/crewlife.ru
chmod -R 755 /var/www/crewlife.ru

# Скопировать файлы
cp -r /root/crewlife-website/* /var/www/crewlife.ru/
chown -R www-data:www-data /var/www/crewlife.ru
```

### Шаг 2: Настройка Python окружения

```bash
cd /var/www/crewlife.ru/backend

# Создать виртуальное окружение
python3 -m venv venv

# Активировать и установить зависимости
source venv/bin/activate
pip install -r requirements.txt
```

### Шаг 3: Настройка базы данных

```bash
# Создать пользователя и базу данных
mysql -e "CREATE DATABASE IF NOT EXISTS crewlife CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS 'crewlife'@'localhost' IDENTIFIED BY 'crewlife123';"
mysql -e "GRANT ALL PRIVILEGES ON crewlife.* TO 'crewlife'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

# Инициализировать базу данных
python3 -c "from database_mysql import db; print('База данных инициализирована')"
```

### Шаг 4: Настройка systemd сервиса

Создать файл `/etc/systemd/system/crewlife-backend.service`:

```ini
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
```

### Шаг 5: Настройка Nginx

Конфигурация `/etc/nginx/sites-available/crewlife.ru`:

```nginx
server {
    listen 80;
    server_name crewlife.ru www.crewlife.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crewlife.ru www.crewlife.ru;
    
    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/crewlife.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crewlife.ru/privkey.pem;
    
    # Корневая директория
    root /var/www/crewlife.ru;
    index index.html;
    
    # API проксирование
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Статические файлы
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # HTML файлы
    location / {
        try_files $uri $uri.html $uri/ =404;
    }
}
```

### Шаг 6: Запуск сервисов

```bash
# Активировать сайт в Nginx
ln -sf /etc/nginx/sites-available/crewlife.ru /etc/nginx/sites-enabled/

# Проверить конфигурацию
nginx -t

# Перезагрузить Nginx
systemctl reload nginx

# Запустить бэкенд
systemctl daemon-reload
systemctl enable crewlife-backend
systemctl start crewlife-backend
```

### Шаг 7: Настройка SSL

```bash
# Установить SSL сертификат
certbot --nginx -d crewlife.ru -d www.crewlife.ru --non-interactive --agree-tos --email admin@crewlife.ru
```

### Шаг 8: Настройка файрвола

```bash
# Разрешить HTTP/HTTPS и SSH
ufw allow 'Nginx Full'
ufw allow ssh
ufw --force enable
```

## 🔑 Доступы и учетные данные

### Данные для входа в систему:
- **Email**: admin@crewlife.ru
- **Пароль**: admin123

### База данных:
- **Пользователь**: crewlife
- **Пароль**: crewlife123
- **База данных**: crewlife

### Файловые права:
- **Владелец**: www-data:www-data
- **Права**: 755 (директории), 644 (файлы)

## 🛠️ Управление сервисами

### Основные команды:

```bash
# Статус всех сервисов
systemctl status crewlife-backend nginx mysql

# Перезапуск бэкенда
systemctl restart crewlife-backend

# Перезагрузка Nginx
systemctl reload nginx

# Перезапуск MySQL
systemctl restart mysql

# Включить автозапуск
systemctl enable crewlife-backend nginx mysql
```

### Логи и мониторинг:

```bash
# Логи бэкенда (в реальном времени)
journalctl -u crewlife-backend -f

# Логи Nginx
tail -f /var/log/nginx/crewlife.ru.error.log
tail -f /var/log/nginx/crewlife.ru.access.log

# Логи MySQL
tail -f /var/log/mysql/error.log

# Использование ресурсов
htop
df -h
free -h
```

## 🔧 Устранение неполадок

### Проблема: Nginx не запускается

```bash
# Проверить, что занимает порт 80
netstat -tlnp | grep :80

# Остановить Apache2 (если запущен)
systemctl stop apache2
systemctl disable apache2

# Проверить конфигурацию Nginx
nginx -t

# Перезапустить Nginx
systemctl restart nginx
```

### Проблема: Бэкенд не отвечает

```bash
# Проверить статус сервиса
systemctl status crewlife-backend

# Проверить логи
journalctl -u crewlife-backend -n 50

# Проверить порт 5000
netstat -tlnp | grep :5000

# Перезапустить сервис
systemctl restart crewlife-backend
```

### Проблема: База данных недоступна

```bash
# Проверить статус MySQL
systemctl status mysql

# Проверить подключение
mysql -u crewlife -pcrewlife123 -e "SELECT 1;"

# Проверить права пользователя
mysql -e "SHOW GRANTS FOR 'crewlife'@'localhost';"
```

### Проблема: SSL сертификат

```bash
# Проверить сертификаты
certbot certificates

# Обновить сертификат
certbot renew --dry-run

# Проверить конфигурацию Nginx
nginx -t
```

## 🔄 Обновление приложения

### 1. Остановить сервисы

```bash
systemctl stop crewlife-backend
```

### 2. Обновить код

```bash
cd /root/crewlife-website/
git pull origin main  # если используете git

# Или скопировать новые файлы
cp -r /root/crewlife-website/* /var/www/crewlife.ru/
chown -R www-data:www-data /var/www/crewlife.ru
```

### 3. Обновить зависимости (если нужно)

```bash
cd /var/www/crewlife.ru/backend
source venv/bin/activate
pip install -r requirements.txt --upgrade
```

### 4. Перезапустить сервисы

```bash
systemctl start crewlife-backend
systemctl reload nginx
```

## 📊 Мониторинг производительности

### Проверка ресурсов:

```bash
# CPU и память
htop

# Дисковое пространство
df -h

# Использование портов
netstat -tlnp

# Активные соединения
ss -tuln
```

### Проверка производительности API:

```bash
# Тест API
curl -w "@curl-format.txt" -s -o /dev/null https://crewlife.ru/api/auth/check

# Создать файл curl-format.txt:
echo "time_namelookup:  %{time_namelookup}\n
time_connect:     %{time_connect}\n
time_appconnect:  %{time_appconnect}\n
time_pretransfer: %{time_pretransfer}\n
time_redirect:    %{time_redirect}\n
time_starttransfer: %{time_starttransfer}\n
time_total:       %{time_total}\n" > curl-format.txt
```

## 🔒 Безопасность

### Рекомендации:

1. **Регулярно обновлять систему**:
   ```bash
   apt update && apt upgrade -y
   ```

2. **Мониторить логи**:
   ```bash
   # Настроить ротацию логов
   logrotate -d /etc/logrotate.d/nginx
   ```

3. **Резервное копирование**:
   ```bash
   # Бэкап базы данных
   mysqldump -u crewlife -pcrewlife123 crewlife > backup_$(date +%Y%m%d).sql
   
   # Бэкап файлов
   tar -czf website_backup_$(date +%Y%m%d).tar.gz /var/www/crewlife.ru/
   ```

4. **Мониторинг файрвола**:
   ```bash
   ufw status verbose
   ```

## 📞 Контакты и поддержка

При возникновении проблем:

1. Проверьте логи сервисов
2. Убедитесь, что все сервисы запущены
3. Проверьте конфигурационные файлы
4. Используйте команды диагностики из этого README

---

**Последнее обновление**: 4 октября 2025 г.
**Версия**: 1.0
**Автор**: AI Assistant

---

> 💡 **Совет**: Сохраните этот README и регулярно обновляйте его при внесении изменений в инфраструктуру.
