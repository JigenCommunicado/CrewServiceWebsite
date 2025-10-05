#!/bin/bash

# CrewServiceWebsite - Скрипт автоматической установки
# Автор: CrewLife Team

set -e

echo "🚀 Установка CrewServiceWebsite..."
echo "=================================="

# Проверка предварительных требований
echo "📋 Проверка предварительных требований..."

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не найден. Установите Node.js 14+ и повторите попытку."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Требуется Node.js версии 14 или выше. Текущая версия: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) найден"

# Проверка Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не найден. Установите Python 3.6+ и повторите попытку."
    exit 1
fi

PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "✅ Python $PYTHON_VERSION найден"

# Проверка SQLite
if ! command -v sqlite3 &> /dev/null; then
    echo "❌ SQLite3 не найден. Установите SQLite3 и повторите попытку."
    exit 1
fi

echo "✅ SQLite3 $(sqlite3 -version | cut -d' ' -f1) найден"

echo ""
echo "📦 Установка зависимостей..."

# Установка зависимостей Node.js
echo "🔧 Установка зависимостей Node.js бэкенда..."
cd crewlife-backend
if [ ! -f package.json ]; then
    echo "❌ package.json не найден в crewlife-backend/"
    exit 1
fi

npm install
echo "✅ Зависимости Node.js установлены"

# Установка зависимостей Python
echo "🔧 Установка зависимостей Python бэкенда..."
cd ../crewlife-website/backend
if [ ! -f requirements.txt ]; then
    echo "❌ requirements.txt не найден в crewlife-website/backend/"
    exit 1
fi

pip3 install -r requirements.txt
echo "✅ Зависимости Python установлены"

# Настройка базы данных
echo ""
echo "🗄️ Настройка базы данных..."

cd ../../

# Проверка наличия файлов базы данных
if [ -f "database/crewlife-sqlite-backup.sqlite" ]; then
    echo "📋 Восстановление базы данных из бэкапа..."
    cp database/crewlife-sqlite-backup.sqlite crewlife-website/backend/crewlife.db
    echo "✅ База данных восстановлена из бэкапа"
elif [ -f "database/crewlife-sqlite-dump.sql" ]; then
    echo "📋 Восстановление базы данных из дампа..."
    sqlite3 crewlife-website/backend/crewlife.db < database/crewlife-sqlite-dump.sql
    echo "✅ База данных восстановлена из дампа"
else
    echo "⚠️ Файлы базы данных не найдены. Создайте базу данных вручную."
fi

# Проверка прав доступа к файлу базы данных
if [ -f "crewlife-website/backend/crewlife.db" ]; then
    chmod 664 crewlife-website/backend/crewlife.db
    echo "✅ Права доступа к базе данных настроены"
fi

echo ""
echo "🎉 Установка завершена успешно!"
echo "=================================="
echo ""
echo "📋 Следующие шаги:"
echo "1. Запустите фронтенд:     cd crewlife-website && python3 -m http.server 3001"
echo "2. Запустите Node.js API:  cd crewlife-backend && npm start"
echo "3. Запустите Python API:   cd crewlife-website/backend && python3 api.py"
echo ""
echo "🌐 Доступ к приложению:"
echo "- Фронтенд: http://localhost:3001"
echo "- Node.js API: http://localhost:3000"
echo "- Python API: http://localhost:5000"
echo ""
echo "📖 Подробные инструкции см. в README.md"
echo ""
echo "🚀 Для быстрого запуска используйте: npm run start"
