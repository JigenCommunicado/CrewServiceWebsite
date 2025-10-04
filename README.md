# CrewServiceWebsite

Система подачи заявок для бортпроводников - полный стек веб-приложения с фронтендом, бэкендом и базой данных.

## 🏗️ Структура проекта

```
CrewServiceWebsite/
├── crewlife-website/          # Фронтенд (HTML, CSS, JS, PWA)
│   ├── backend/               # Python Flask API
│   ├── pages/                 # HTML страницы
│   ├── scripts/               # JavaScript модули
│   ├── styles/                # CSS стили
│   └── assets/                # Иконки и ресурсы
├── crewlife-backend/          # Node.js API сервер
│   ├── src/                   # Исходный код
│   ├── config/                # Конфигурация
│   └── scripts/               # Скрипты развертывания
└── database/                  # База данных
    ├── crewlife-sqlite-dump.sql
    └── crewlife-sqlite-backup.sqlite
```

## 🚀 Быстрый старт

### Предварительные требования
- Node.js 14+ 
- Python 3.6+
- Git

### 1. Клонирование репозитория
```bash
git clone https://github.com/JigenCommunicado/CrewServiceWebsite.git
cd CrewServiceWebsite
```

### 2. Установка зависимостей

#### Node.js бэкенд
```bash
cd crewlife-backend
npm install
```

#### Python бэкенд
```bash
cd crewlife-website/backend
pip install -r requirements.txt
```

### 3. Настройка базы данных

#### Вариант A: Использование SQLite файла
```bash
# Файл уже включен в репозиторий
cp database/crewlife-sqlite-backup.sqlite crewlife-website/backend/crewlife.db
```

#### Вариант B: Восстановление из дампа
```bash
sqlite3 crewlife-website/backend/crewlife.db < database/crewlife-sqlite-dump.sql
```

### 4. Запуск приложения

#### Запуск фронтенда
```bash
cd crewlife-website
python3 -m http.server 3001
# Или используйте скрипт
./start.sh
```

#### Запуск Node.js бэкенда
```bash
cd crewlife-backend
npm start
# Для разработки
npm run dev
```

#### Запуск Python бэкенда
```bash
cd crewlife-website/backend
python3 api.py
```

## 🌐 Доступ к приложению

- **Фронтенд**: http://localhost:3001
- **Node.js API**: http://localhost:3000
- **Python API**: http://localhost:5000

## 📱 Функциональность

- ✅ Регистрация и авторизация пользователей
- ✅ Подача заявок на рейсы
- ✅ Бронирование отелей
- ✅ Календарь смен
- ✅ Админ панель
- ✅ PWA поддержка
- ✅ Мобильная адаптация
- ✅ Темная тема

## 🛠️ Разработка

### Структура API

#### Node.js бэкенд (основной)
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Авторизация
- `GET /api/flight-orders` - Получение заявок на рейсы
- `POST /api/flight-orders` - Создание заявки на рейс
- `GET /api/hotel-orders` - Получение заявок на отели
- `POST /api/hotel-orders` - Создание заявки на отель

#### Python бэкенд (дополнительный)
- `GET /api/status` - Статус сервиса
- `POST /api/data` - Обработка данных

### База данных

Основные таблицы:
- `users` - Пользователи
- `flight_orders` - Заявки на рейсы
- `hotel_orders` - Заявки на отели
- `schedules` - Расписания смен

## 🚀 Развертывание в продакшн

### 1. Подготовка сервера
```bash
# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Установка Python
sudo apt-get install python3 python3-pip

# Установка SQLite
sudo apt-get install sqlite3
```

### 2. Клонирование и настройка
```bash
git clone https://github.com/JigenCommunicado/CrewServiceWebsite.git
cd CrewServiceWebsite
```

### 3. Настройка переменных окружения
```bash
# Создать .env файлы для каждого сервиса
cp crewlife-backend/config/production.env.example crewlife-backend/.env
# Отредактировать .env файлы с вашими настройками
```

### 4. Запуск через PM2 (рекомендуется)
```bash
# Установка PM2
npm install -g pm2

# Запуск Node.js бэкенда
cd crewlife-backend
pm2 start src/server.js --name "crewlife-api"

# Запуск Python бэкенда
cd ../crewlife-website/backend
pm2 start api.py --name "crewlife-python" --interpreter python3

# Запуск фронтенда
cd ../crewlife-website
pm2 start "python3 -m http.server 3001" --name "crewlife-frontend"
```

### 5. Настройка Nginx (опционально)
```bash
# Пример конфигурации Nginx
sudo nano /etc/nginx/sites-available/crewlife
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
    }
}
```

## 🔧 Устранение неполадок

### Проблемы с базой данных
```bash
# Проверка подключения к SQLite
sqlite3 crewlife-website/backend/crewlife.db ".tables"

# Восстановление из бэкапа
cp database/crewlife-sqlite-backup.sqlite crewlife-website/backend/crewlife.db
```

### Проблемы с портами
```bash
# Проверка занятых портов
netstat -tulpn | grep :3000
netstat -tulpn | grep :3001
netstat -tulpn | grep :5000

# Остановка процессов
sudo kill -9 <PID>
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `pm2 logs`
2. Убедитесь, что все зависимости установлены
3. Проверьте права доступа к файлам базы данных
4. Создайте issue в репозитории

## 📄 Лицензия

MIT License - см. файл LICENSE для подробностей.

---

**Разработано командой CrewLife** 🛩️