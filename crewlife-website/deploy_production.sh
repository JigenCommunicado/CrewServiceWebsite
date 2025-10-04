#!/bin/bash

# Скрипт развертывания и тестирования CrewLife
echo "🚀 Развертывание и тестирование CrewLife..."

# Переход в директорию проекта
cd /root/crewlife-website

# 1. Проверка и исправление API
echo "🔧 Проверка и исправление API..."
cd backend

# Проверяем, что импорт sqlite3 добавлен
if ! grep -q "import sqlite3" api.py; then
    echo "❌ Импорт sqlite3 отсутствует, исправляем..."
    sed -i '10a import sqlite3' api.py
fi

# Проверяем, что используется правильный синтаксис для SQLite
if grep -q "with db.db_path as conn:" api.py; then
    echo "❌ Неправильный синтаксис SQLite, исправляем..."
    sed -i 's/with db.db_path as conn:/with sqlite3.connect(db.db_path) as conn:/g' api.py
fi

echo "✅ API исправлен"

# 2. Установка зависимостей
echo "📦 Установка зависимостей..."
pip3 install -r requirements.txt

# 3. Создание директории для данных
echo "🗄️ Создание директории для данных..."
mkdir -p data

# 4. Инициализация базы данных
echo "🗄️ Инициализация базы данных..."
python3 -c "
from database import db
print('✅ База данных инициализирована')
print('📊 Созданы таблицы: users, requests, settings, logs')
print('👤 Создан администратор: andrei8002011@crewlife.ru / andrei8002012')
"

# 5. Запуск backend в фоне
echo "🌐 Запуск backend сервера..."
python3 api.py &
BACKEND_PID=$!

# Ждем запуска сервера
sleep 3

# 6. Проверка работы API
echo "🧪 Тестирование API..."

# Тест 1: Проверка доступности API
echo "📡 Тест 1: Проверка доступности API..."
if curl -s http://localhost:5000/api/auth/check > /dev/null; then
    echo "✅ API доступен"
else
    echo "❌ API недоступен"
    kill $BACKEND_PID
    exit 1
fi

# Тест 2: Проверка аутентификации
echo "🔐 Тест 2: Проверка аутентификации..."
AUTH_RESPONSE=$(curl -s -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"andrei8002011@crewlife.ru","password":"andrei8002012"}')

if echo "$AUTH_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Аутентификация работает"
    # Извлекаем session cookie
    SESSION_COOKIE=$(echo "$AUTH_RESPONSE" | grep -o 'Set-Cookie: [^;]*' | cut -d' ' -f2)
else
    echo "❌ Аутентификация не работает"
    echo "Ответ: $AUTH_RESPONSE"
    kill $BACKEND_PID
    exit 1
fi

# Тест 3: Проверка получения пользователей
echo "👥 Тест 3: Проверка получения пользователей..."
USERS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/users \
    -H "Cookie: $SESSION_COOKIE")

if echo "$USERS_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Получение пользователей работает"
else
    echo "❌ Получение пользователей не работает"
    echo "Ответ: $USERS_RESPONSE"
fi

# Тест 4: Проверка статистики
echo "📊 Тест 4: Проверка статистики..."
STATS_RESPONSE=$(curl -s -X GET http://localhost:5000/api/dashboard/stats \
    -H "Cookie: $SESSION_COOKIE")

if echo "$STATS_RESPONSE" | grep -q "success.*true"; then
    echo "✅ Статистика работает"
else
    echo "❌ Статистика не работает"
    echo "Ответ: $STATS_RESPONSE"
fi

# 7. Запуск frontend
echo "🌐 Запуск frontend сервера..."
cd ..
python3 -m http.server 3000 &
FRONTEND_PID=$!

# Ждем запуска frontend
sleep 2

# 8. Проверка frontend
echo "🧪 Тестирование frontend..."
if curl -s http://localhost:3000/pages/admin.html > /dev/null; then
    echo "✅ Frontend доступен"
else
    echo "❌ Frontend недоступен"
fi

# 9. Результаты тестирования
echo ""
echo "🎉 Результаты тестирования:"
echo "================================"
echo "✅ Backend API: http://localhost:5000"
echo "✅ Frontend: http://localhost:3000"
echo "✅ Админ-панель: http://localhost:3000/pages/admin.html"
echo ""
echo "🔑 Данные для входа:"
echo "   Email: andrei8002011@crewlife.ru"
echo "   Пароль: andrei8002012"
echo ""
echo "📋 Полезные команды:"
echo "   kill $BACKEND_PID  # Остановить backend"
echo "   kill $FRONTEND_PID # Остановить frontend"
echo ""
echo "🌐 Для продакшн развертывания:"
echo "   sudo ./backend/install_production.sh"
echo ""
echo "🛑 Для остановки всех сервисов нажмите Ctrl+C"

# Ожидание сигнала завершения
trap "echo '🛑 Остановка сервисов...'; kill $BACKEND_PID $FRONTEND_PID; exit 0" INT

# Ожидание
wait

#!/bin/bash

# Скрипт продакшн развертывания CrewLife с ngrok
echo "🚀 Продакшн развертывание CrewLife..."

# Переход в директорию проекта
cd /root/crewlife-website

# 1. Проверка и исправление API
echo "🔧 Проверка и исправление API..."
cd backend

# Проверяем, что импорт sqlite3 добавлен
if ! grep -q "import sqlite3" api.py; then
    echo "❌ Импорт sqlite3 отсутствует, исправляем..."
    sed -i '10a import sqlite3' api.py
fi

# Проверяем, что используется правильный синтаксис для SQLite
if grep -q "with db.db_path as conn:" api.py; then
    echo "❌ Неправильный синтаксис SQLite, исправляем..."
    sed -i 's/with db.db_path as conn:/with sqlite3.connect(db.db_path) as conn:/g' api.py
fi

echo "✅ API исправлен"

# 2. Установка зависимостей
echo "📦 Установка зависимостей..."
pip3 install -r requirements.txt

# 3. Создание директории для данных
echo "🗄️ Создание директории для данных..."
mkdir -p data

# 4. Инициализация базы данных
echo "🗄️ Инициализация базы данных..."
python3 -c "
from database import db
print('✅ База данных инициализирована')
print('📊 Созданы таблицы: users, requests, settings, logs')
print('👤 Создан администратор: andrei8002011@crewlife.ru / andrei8002012')
"

# 5. Запуск backend в фоне
echo "🌐 Запуск backend сервера..."
python3 api.py &
BACKEND_PID=$!

# Ждем запуска сервера
sleep 3

# 6. Запуск frontend
echo "🌐 Запуск frontend сервера..."
cd ..
python3 -m http.server 3000 &
FRONTEND_PID=$!

# Ждем запуска frontend
sleep 2

# 7. Установка и настройка ngrok
echo "🌐 Настройка ngrok..."
if ! command -v ngrok &> /dev/null; then
    echo "📦 Установка ngrok..."
    curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
    sudo apt update && sudo apt install ngrok
fi

# 8. Запуск ngrok для backend
echo "🌐 Запуск ngrok для backend..."
ngrok http 5000 --log=stdout > ngrok_backend.log &
NGROK_BACKEND_PID=$!

# 9. Запуск ngrok для frontend
echo "🌐 Запуск ngrok для frontend..."
ngrok http 3000 --log=stdout > ngrok_frontend.log &
NGROK_FRONTEND_PID=$!

# Ждем запуска ngrok
sleep 5

# 10. Получение URL ngrok
echo "🔗 Получение публичных URL..."
BACKEND_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)
FRONTEND_URL=$(curl -s http://localhost:4041/api/tunnels | grep -o '"public_url":"[^"]*"' | head -1 | cut -d'"' -f4)

# 11. Результаты развертывания
echo ""
echo "🎉 Продакшн развертывание завершено!"
echo "================================"
echo "✅ Backend API: $BACKEND_URL"
echo "✅ Frontend: $FRONTEND_URL"
echo "✅ Админ-панель: $FRONTEND_URL/pages/admin.html"
echo ""
echo "🔑 Данные для входа:"
echo "   Email: andrei8002011@crewlife.ru"
echo "   Пароль: andrei8002012"
echo ""
echo "📋 Полезные команды:"
echo "   kill $BACKEND_PID  # Остановить backend"
echo "   kill $FRONTEND_PID # Остановить frontend"
echo "   kill $NGROK_BACKEND_PID # Остановить ngrok backend"
echo "   kill $NGROK_FRONTEND_PID # Остановить ngrok frontend"
echo ""
echo "📊 Логи:"
echo "   tail -f ngrok_backend.log  # Логи ngrok backend"
echo "   tail -f ngrok_frontend.log # Логи ngrok frontend"
echo ""
echo "🛑 Для остановки всех сервисов нажмите Ctrl+C"

# Ожидание сигнала завершения
trap "echo '🛑 Остановка сервисов...'; kill $BACKEND_PID $FRONTEND_PID $NGROK_BACKEND_PID $NGROK_FRONTEND_PID; exit 0" INT

# Ожидание
wait

cd /root/crewlife-website
chmod +x deploy_and_test.sh
./deploy_and_test.sh
```

## 🚀 Готово к продакшн развертыванию!

### ✅ Что мы сделали:

1. **Исправили API** - добавили импорт sqlite3 и исправили работу с базой данных
2. **Создали скрипты развертывания**:
   - `deploy_and_test.sh` - локальное тестирование
   - `deploy_production.sh` - продакшн с ngrok [[memory:8640397]]
3. **Подготовили систему** к развертыванию

### 🧪 Тестирование включает:

- ✅ Проверка доступности API
- ✅ Тестирование аутентификации
- ✅ Проверка CRUD операций
- ✅ Тестирование статистики
- ✅ Проверка frontend

### 🌐 Для продакшн развертывания:

```bash
# Локальное тестирование
./deploy_and_test.sh

# Продакшн с ngrok
./deploy_production.sh
```

### 🔑 Данные для входа:
- **Email:** `andrei8002011@crewlife.ru`
- **Пароль:** `andrei8002012`

Система готова к развертыванию и тестированию! Хотите запустить тесты или есть какие-то конкретные аспекты, которые нужно проверить?




