# ⚙️ Конфигурационные файлы

Эта директория содержит примеры конфигурационных файлов и шаблоны для различных окружений.

## 📁 Структура

```
config/
├── env.example              # Пример файла переменных окружения
├── database.config.example  # Пример конфигурации БД
├── nginx.conf.example       # Пример конфигурации Nginx
└── README.md               # Этот файл
```

## 🔐 Переменные окружения

### Создание .env файла

1. **Скопируйте файл-пример**:
   ```bash
   cp config/env.example .env
   ```

2. **Отредактируйте значения**:
   ```bash
   nano .env
   # или
   vim .env
   ```

### Основные переменные

#### Приложение
```env
# Режим работы (development, production, test)
NODE_ENV=production

# Порты
PORT=3000
FRONTEND_PORT=3001
PYTHON_API_PORT=5000

# URL приложения
APP_URL=https://your-domain.com
```

#### База данных
```env
# SQLite (для разработки)
DB_TYPE=sqlite
DB_PATH=./crewlife-website/backend/crewlife.db

# MariaDB/MySQL (для production)
DB_TYPE=mariadb
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crewlife
DB_USER=crewlife_user
DB_PASSWORD=secure_password_here
DB_POOL_MIN=2
DB_POOL_MAX=10
```

#### Безопасность
```env
# JWT секретный ключ (ОБЯЗАТЕЛЬНО ИЗМЕНИТЕ!)
JWT_SECRET=your-super-secret-jwt-key-change-this

# Время жизни токенов
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Соль для bcrypt
BCRYPT_ROUNDS=10

# CORS настройки
CORS_ORIGIN=https://your-domain.com
```

#### Email уведомления
```env
# SMTP настройки
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@crewlife.com
```

#### Redis (опционально)
```env
# Redis для кеширования
REDIS_ENABLED=true
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

#### Мониторинг
```env
# Prometheus
PROMETHEUS_ENABLED=true
PROMETHEUS_PORT=9090

# Grafana
GRAFANA_ENABLED=true
GRAFANA_PORT=3005
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=change_this_password
```

#### Логирование
```env
# Уровень логирования (error, warn, info, debug)
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_SIZE=10m
LOG_MAX_FILES=7
```

#### Автомасштабирование
```env
# Минимальное и максимальное количество инстансов
MIN_INSTANCES=2
MAX_INSTANCES=10

# Пороги CPU для масштабирования (%)
SCALE_UP_THRESHOLD=80
SCALE_DOWN_THRESHOLD=30
```

## 🗄️ Конфигурация базы данных

### SQLite (Разработка)

Для разработки используется SQLite - не требует дополнительной настройки:

```env
DB_TYPE=sqlite
DB_PATH=./crewlife-website/backend/crewlife.db
```

### MariaDB/MySQL (Production)

#### Установка MariaDB

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mariadb-server

# Безопасная настройка
sudo mysql_secure_installation
```

#### Создание базы данных

```sql
-- Войдите в MariaDB
sudo mysql -u root -p

-- Создайте базу данных
CREATE DATABASE crewlife CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Создайте пользователя
CREATE USER 'crewlife_user'@'localhost' IDENTIFIED BY 'secure_password';

-- Дайте права
GRANT ALL PRIVILEGES ON crewlife.* TO 'crewlife_user'@'localhost';
FLUSH PRIVILEGES;

-- Выход
EXIT;
```

#### Миграция данных

```bash
# Миграция с SQLite на MariaDB
python3 scripts/migrate_to_mariadb.py

# Финализация настройки
python3 scripts/finalize_mariadb.py
```

## 🌐 Конфигурация Nginx

### Базовая конфигурация

Создайте файл `/etc/nginx/sites-available/crewlife`:

```nginx
# HTTP -> HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    # SSL сертификаты
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL настройки
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Безопасность
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Node.js API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты для длительных запросов
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Python API
    location /py-api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Статические файлы с кешированием
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf)$ {
        proxy_pass http://localhost:3001;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Service Worker
    location /sw.js {
        proxy_pass http://localhost:3001;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

### Активация конфигурации

```bash
# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/crewlife /etc/nginx/sites-enabled/

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl restart nginx
```

## 🔧 PM2 конфигурация

### Файл ecosystem.config.js

Создайте `ecosystem.config.js` в корне проекта:

```javascript
module.exports = {
  apps: [
    {
      name: 'crewlife-backend',
      script: 'crewlife-backend/src/server.js',
      instances: 2,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'crewlife-python',
      script: 'crewlife-website/backend/api.py',
      interpreter: 'python3',
      env: {
        FLASK_ENV: 'production',
        PORT: 5000
      },
      error_file: './logs/python-error.log',
      out_file: './logs/python-out.log'
    }
  ]
};
```

### Запуск через PM2

```bash
# Запуск всех приложений
pm2 start ecosystem.config.js

# Сохранить конфигурацию
pm2 save

# Автозапуск при старте системы
pm2 startup
```

## 🐳 Docker конфигурация

### docker-compose.yml

Основной файл уже создан в корне проекта. Для переопределения настроек создайте:

```yaml
# docker-compose.override.yml
version: '3.8'

services:
  backend:
    environment:
      - NODE_ENV=development
      - DEBUG=true
    volumes:
      - ./crewlife-backend:/app
```

## 🔍 Проверка конфигурации

### Скрипт проверки

```bash
#!/bin/bash
# config/validate_config.sh

echo "Проверка конфигурации..."

# Проверка .env файла
if [ ! -f ".env" ]; then
    echo "❌ Файл .env не найден!"
    echo "Скопируйте config/env.example в .env"
    exit 1
fi

# Проверка обязательных переменных
required_vars=("JWT_SECRET" "DB_TYPE")
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" .env; then
        echo "❌ Переменная $var не найдена в .env"
        exit 1
    fi
done

echo "✅ Конфигурация корректна!"
```

## 📝 Шаблоны для разных окружений

### Development
```env
NODE_ENV=development
DEBUG=true
LOG_LEVEL=debug
DB_TYPE=sqlite
```

### Staging
```env
NODE_ENV=staging
DEBUG=false
LOG_LEVEL=info
DB_TYPE=mariadb
```

### Production
```env
NODE_ENV=production
DEBUG=false
LOG_LEVEL=warn
DB_TYPE=mariadb
REDIS_ENABLED=true
PROMETHEUS_ENABLED=true
```

## 🔒 Безопасность конфигурации

### ⚠️ ВАЖНО

1. **Никогда не коммитьте .env файлы в Git**
   - `.env` добавлен в `.gitignore`
   - Используйте `env.example` как шаблон

2. **Генерируйте сильные секретные ключи**
   ```bash
   # Генерация JWT секрета
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Ограничьте права доступа**
   ```bash
   chmod 600 .env
   ```

4. **Используйте разные ключи для разных окружений**

5. **Регулярно ротируйте секреты**

---

**Дополнительную информацию см. в [документации](../docs/INDEX.md)**
