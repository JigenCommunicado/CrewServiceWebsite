# 🚀 Руководство по развертыванию CrewServiceWebsite

Подробное руководство по развертыванию системы подачи заявок для бортпроводников в продакшн среде.

## 📋 Предварительные требования

### Системные требования
- **ОС**: Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- **RAM**: минимум 2GB, рекомендуется 4GB+
- **CPU**: 2 ядра, рекомендуется 4+
- **Диск**: минимум 10GB свободного места
- **Сеть**: статический IP адрес

### Программное обеспечение
- **Node.js**: 14.x или выше
- **Python**: 3.6 или выше
- **SQLite**: 3.x
- **Nginx**: 1.18+ (рекомендуется)
- **PM2**: для управления процессами
- **Git**: для клонирования репозитория

## 🛠️ Установка зависимостей

### 1. Обновление системы
```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Установка Node.js
```bash
# Установка Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка установки
node --version
npm --version
```

### 3. Установка Python
```bash
# Установка Python 3 и pip
sudo apt install python3 python3-pip python3-venv -y

# Проверка установки
python3 --version
pip3 --version
```

### 4. Установка SQLite
```bash
sudo apt install sqlite3 -y
sqlite3 --version
```

### 5. Установка Nginx
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 6. Установка PM2
```bash
sudo npm install -g pm2
pm2 --version
```

## 📦 Развертывание приложения

### 1. Клонирование репозитория
```bash
# Создание пользователя для приложения
sudo useradd -m -s /bin/bash crewlife
sudo usermod -aG sudo crewlife

# Переключение на пользователя
sudo su - crewlife

# Клонирование репозитория
git clone https://github.com/JigenCommunicado/CrewServiceWebsite.git
cd CrewServiceWebsite
```

### 2. Установка зависимостей
```bash
# Автоматическая установка
chmod +x install.sh
./install.sh

# Или ручная установка
npm run install-all
```

### 3. Настройка переменных окружения
```bash
# Копирование примера конфигурации
cp env.example .env

# Редактирование конфигурации
nano .env
```

**Важные настройки для продакшн:**
```bash
NODE_ENV=production
DEBUG=false
JWT_SECRET=your_very_secure_jwt_secret_here
DB_PATH=/home/crewlife/CrewServiceWebsite/crewlife-website/backend/crewlife.db
LOG_LEVEL=warn
```

### 4. Настройка базы данных
```bash
# Восстановление базы данных
npm run setup-db

# Проверка базы данных
sqlite3 crewlife-website/backend/crewlife.db ".tables"
```

### 5. Настройка прав доступа
```bash
# Права на файлы базы данных
chmod 664 crewlife-website/backend/crewlife.db
chown crewlife:crewlife crewlife-website/backend/crewlife.db

# Права на логи
mkdir -p logs
chmod 755 logs
chown crewlife:crewlife logs
```

## 🚀 Запуск сервисов

### 1. Запуск через PM2
```bash
# Создание конфигурации PM2
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'crewlife-api',
      script: './crewlife-backend/src/server.js',
      cwd: '/home/crewlife/CrewServiceWebsite',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_file: './logs/api-combined.log',
      time: true
    },
    {
      name: 'crewlife-python',
      script: './crewlife-website/backend/api.py',
      cwd: '/home/crewlife/CrewServiceWebsite',
      interpreter: 'python3',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PYTHON_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/python-error.log',
      out_file: './logs/python-out.log',
      log_file: './logs/python-combined.log',
      time: true
    },
    {
      name: 'crewlife-frontend',
      script: 'python3',
      args: '-m http.server 3001',
      cwd: '/home/crewlife/CrewServiceWebsite/crewlife-website',
      instances: 1,
      exec_mode: 'fork',
      env: {
        PORT: 3001
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};
EOF

# Запуск всех сервисов
pm2 start ecosystem.config.js

# Сохранение конфигурации PM2
pm2 save

# Настройка автозапуска
pm2 startup
```

### 2. Проверка статуса
```bash
# Статус всех процессов
pm2 status

# Логи
pm2 logs

# Мониторинг
pm2 monit
```

## 🌐 Настройка Nginx

### 1. Создание конфигурации
```bash
sudo nano /etc/nginx/sites-available/crewlife
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Логи
    access_log /var/log/nginx/crewlife.access.log;
    error_log /var/log/nginx/crewlife.error.log;

    # Максимальный размер загружаемых файлов
    client_max_body_size 10M;

    # Фронтенд
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Кэширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Node.js API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS заголовки
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
        
        if ($request_method = 'OPTIONS') {
            add_header Access-Control-Allow-Origin *;
            add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
            add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization";
            add_header Access-Control-Max-Age 1728000;
            add_header Content-Type 'text/plain; charset=utf-8';
            add_header Content-Length 0;
            return 204;
        }
    }

    # Python API
    location /python-api/ {
        proxy_pass http://localhost:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

### 2. Активация конфигурации
```bash
# Создание символической ссылки
sudo ln -s /etc/nginx/sites-available/crewlife /etc/nginx/sites-enabled/

# Удаление дефолтной конфигурации
sudo rm -f /etc/nginx/sites-enabled/default

# Проверка конфигурации
sudo nginx -t

# Перезапуск Nginx
sudo systemctl reload nginx
```

## 🔒 Настройка SSL (Let's Encrypt)

### 1. Установка Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Получение SSL сертификата
```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Автоматическое обновление
```bash
sudo crontab -e
# Добавить строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Мониторинг и логирование

### 1. Настройка логирования
```bash
# Создание директории для логов
mkdir -p /home/crewlife/CrewServiceWebsite/logs

# Настройка ротации логов
sudo nano /etc/logrotate.d/crewlife
```

```bash
/home/crewlife/CrewServiceWebsite/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 crewlife crewlife
    postrotate
        pm2 reloadLogs
    endscript
}
```

### 2. Мониторинг системы
```bash
# Установка htop для мониторинга
sudo apt install htop -y

# Мониторинг PM2
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

## 🔧 Обслуживание

### 1. Обновление приложения
```bash
# Переход в директорию приложения
cd /home/crewlife/CrewServiceWebsite

# Остановка сервисов
pm2 stop all

# Обновление кода
git pull origin main

# Установка новых зависимостей
npm run install-all

# Запуск сервисов
pm2 start all
```

### 2. Резервное копирование
```bash
# Создание скрипта бэкапа
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/crewlife/backups"
DATE=$(date +%Y%m%d_%H%M%S)
APP_DIR="/home/crewlife/CrewServiceWebsite"

mkdir -p $BACKUP_DIR

# Бэкап базы данных
cp $APP_DIR/crewlife-website/backend/crewlife.db $BACKUP_DIR/crewlife_$DATE.db

# Бэкап логов
tar -czf $BACKUP_DIR/logs_$DATE.tar.gz $APP_DIR/logs/

# Очистка старых бэкапов (старше 30 дней)
find $BACKUP_DIR -name "*.db" -mtime +30 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x backup.sh

# Добавление в cron (ежедневно в 2:00)
crontab -e
# Добавить строку:
0 2 * * * /home/crewlife/CrewServiceWebsite/backup.sh
```

## 🚨 Устранение неполадок

### 1. Проверка статуса сервисов
```bash
# Статус PM2
pm2 status

# Логи приложения
pm2 logs

# Статус Nginx
sudo systemctl status nginx

# Проверка портов
netstat -tulpn | grep -E ':(3000|3001|5000|80|443)'
```

### 2. Частые проблемы

**Проблема**: Сервисы не запускаются
```bash
# Проверка логов
pm2 logs --err

# Перезапуск
pm2 restart all
```

**Проблема**: База данных заблокирована
```bash
# Проверка процессов SQLite
lsof crewlife-website/backend/crewlife.db

# Восстановление из бэкапа
cp database/crewlife-sqlite-backup.sqlite crewlife-website/backend/crewlife.db
```

**Проблема**: Nginx не проксирует запросы
```bash
# Проверка конфигурации
sudo nginx -t

# Перезапуск
sudo systemctl reload nginx
```

## 📈 Масштабирование

### 1. Горизонтальное масштабирование
```bash
# Увеличение количества экземпляров API
pm2 scale crewlife-api 3
pm2 scale crewlife-python 2
```

### 2. Настройка балансировщика нагрузки
```nginx
upstream api_backend {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}

location /api/ {
    proxy_pass http://api_backend;
}
```

## ✅ Чек-лист развертывания

- [ ] Установлены все зависимости
- [ ] Клонирован репозиторий
- [ ] Настроены переменные окружения
- [ ] Восстановлена база данных
- [ ] Настроены права доступа
- [ ] Запущены сервисы через PM2
- [ ] Настроен Nginx
- [ ] Получен SSL сертификат
- [ ] Настроено логирование
- [ ] Настроено резервное копирование
- [ ] Проверена работоспособность

---

**🎉 Поздравляем! Ваше приложение развернуто и готово к работе!**

Для получения поддержки создайте issue в репозитории или обратитесь к команде разработки.
