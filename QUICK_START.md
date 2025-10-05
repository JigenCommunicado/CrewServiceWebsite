# ⚡ Краткое руководство по запуску

Быстрая справка по основным командам и действиям для работы с CrewServiceWebsite.

## 🚀 Первый запуск

### Полная установка (рекомендуется)

```bash
# 1. Клонирование
git clone https://github.com/JigenCommunicado/CrewServiceWebsite.git
cd CrewServiceWebsite

# 2. Автоматическая установка
./scripts/install.sh

# 3. Запуск
./scripts/start.sh
```

### Быстрый запуск через Docker

```bash
# Запуск всех сервисов
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

## 🔧 Основные команды

### Запуск приложения

```bash
# Режим разработки
./scripts/start.sh

# Production режим
./scripts/start_production.sh

# Кластер (несколько инстансов)
./scripts/start_cluster.sh
```

### Управление через PM2

```bash
# Запуск
pm2 start ecosystem.config.js

# Статус
pm2 status

# Логи
pm2 logs

# Перезапуск
pm2 restart all

# Остановка
pm2 stop all

# Удаление из списка
pm2 delete all
```

### Управление через Docker

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Перезапуск
docker-compose restart

# Пересборка образов
docker-compose build

# Масштабирование
docker-compose up -d --scale backend=3
```

## 🗄️ База данных

### SQLite

```bash
# Открыть БД
sqlite3 crewlife-website/backend/crewlife.db

# Просмотр таблиц
.tables

# Выполнить запрос
SELECT * FROM users LIMIT 5;

# Выход
.exit
```

### Миграция на MariaDB

```bash
# Миграция данных
python3 scripts/migrate_to_mariadb.py

# Финализация
python3 scripts/finalize_mariadb.py
```

### Резервное копирование

```bash
# Создать бэкап
python3 scripts/backup_manager.py --create

# Список бэкапов
python3 scripts/backup_manager.py --list

# Восстановить
python3 scripts/backup_manager.py --restore backups/имя_файла.db
```

## 📊 Мониторинг

### Настройка мониторинга

```bash
# Автоматическая установка
./scripts/setup_monitoring.sh
```

### Доступ к дашбордам

- **Grafana**: http://localhost:3005 (admin/admin)
- **Prometheus**: http://localhost:9090

### Ручной мониторинг

```bash
# Системные ресурсы
python3 scripts/system_monitor.py

# База данных
python3 scripts/db_monitor.py

# Веб-интерфейс мониторинга БД
python3 scripts/web_db_monitor.py
# Откройте http://localhost:8080
```

## 🔐 SSL/HTTPS

```bash
# Автоматическая настройка SSL
./scripts/setup_ssl.sh

# Ручная настройка с certbot
sudo certbot --nginx -d your-domain.com
```

## 🧪 Тестирование

```bash
# Все тесты
cd tests && pytest

# С покрытием кода
pytest --cov=. --cov-report=html

# Конкретный файл
pytest test_api.py

# Node.js тесты
cd crewlife-backend && npm test
```

## 📝 Разработка

### Node.js Backend

```bash
cd crewlife-backend

# Установка зависимостей
npm install

# Запуск в dev режиме
npm run dev

# Линтер
npm run lint
npm run lint:fix

# Тесты
npm test
```

### Python Backend

```bash
cd crewlife-website/backend

# Установка зависимостей
pip install -r requirements.txt

# Запуск в dev режиме
FLASK_ENV=development python3 api.py

# Линтер
flake8

# Форматирование
black .

# Проверка типов
mypy .
```

### Frontend

```bash
cd crewlife-website

# Простой HTTP сервер
python3 -m http.server 3001

# Или с Node.js
npx http-server -p 3001
```

## 🐛 Отладка

### Проверка портов

```bash
# Узнать, что использует порт
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5000

# Или
netstat -tulpn | grep :3000
```

### Остановка процессов

```bash
# Найти процесс
ps aux | grep node
ps aux | grep python

# Остановить процесс
kill -9 <PID>

# Остановить все Node.js процессы (осторожно!)
pkill -9 node
```

### Просмотр логов

```bash
# PM2 логи
pm2 logs
pm2 logs backend
pm2 logs --lines 100

# Docker логи
docker-compose logs
docker-compose logs backend
docker-compose logs -f --tail=100

# Системные логи приложения
tail -f logs/app.log
tail -f logs/backend-error.log
```

### Очистка

```bash
# Очистка кеша npm
npm cache clean --force

# Очистка Python кеша
find . -type d -name __pycache__ -exec rm -r {} +
find . -type f -name "*.pyc" -delete

# Очистка логов
rm -rf logs/*

# Очистка Docker
docker system prune -a
```

## 📦 Развертывание

### Обновление production

```bash
# Подтянуть изменения
git pull origin main

# Запустить скрипт развертывания
./scripts/deploy.sh

# Или вручную
cd crewlife-backend
npm install
pm2 restart backend

cd ../crewlife-website/backend
pip install -r requirements.txt
pm2 restart python-api
```

### Первое развертывание

```bash
# 1. Установка
./scripts/install.sh

# 2. Настройка окружения
cp config/env.example .env
nano .env

# 3. Настройка SSL
./scripts/setup_ssl.sh

# 4. Настройка мониторинга
./scripts/setup_monitoring.sh

# 5. Запуск
./scripts/start_production.sh
```

## 🔄 Git команды

```bash
# Клонирование
git clone https://github.com/JigenCommunicado/CrewServiceWebsite.git

# Создание ветки
git checkout -b feature/my-feature

# Коммит
git add .
git commit -m "feat: добавлена новая функция"

# Push
git push origin feature/my-feature

# Обновление
git pull origin main

# Слияние
git checkout main
git merge feature/my-feature
```

## 🌐 URL и порты

| Сервис | URL | Порт |
|--------|-----|------|
| Frontend | http://localhost:3001 | 3001 |
| Node.js API | http://localhost:3000 | 3000 |
| Python API | http://localhost:5000 | 5000 |
| Grafana | http://localhost:3005 | 3005 |
| Prometheus | http://localhost:9090 | 9090 |
| DB Monitor | http://localhost:8080 | 8080 |

## 📱 Полезные ссылки

- [Полная документация](docs/INDEX.md)
- [Руководство по скриптам](scripts/README.md)
- [Руководство для контрибьюторов](CONTRIBUTING.md)
- [Изменения в проекте](CHANGELOG.md)
- [Вопросы и ответы](docs/FAQ.md)

## 🆘 Быстрая помощь

### Приложение не запускается

1. Проверьте, не заняты ли порты
2. Убедитесь, что зависимости установлены
3. Проверьте файл `.env`
4. Посмотрите логи ошибок

### База данных недоступна

1. Проверьте путь к файлу БД
2. Проверьте права доступа
3. Попробуйте восстановить из бэкапа

### Ошибки аутентификации

1. Проверьте JWT_SECRET в `.env`
2. Очистите localStorage в браузере
3. Перезапустите backend сервис

### Проблемы с производительностью

1. Запустите мониторинг: `python3 scripts/system_monitor.py`
2. Проверьте логи на ошибки
3. Рассмотрите масштабирование: `./scripts/start_cluster.sh`

## 📞 Получение помощи

- **Issues**: https://github.com/JigenCommunicado/CrewServiceWebsite/issues
- **Discussions**: https://github.com/JigenCommunicado/CrewServiceWebsite/discussions
- **Email**: support@crewlife.example

---

**💡 Совет**: Добавьте этот файл в закладки для быстрого доступа к командам!
