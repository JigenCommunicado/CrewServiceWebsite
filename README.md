# 🛩️ CrewServiceWebsite

<div align="center">

**Система управления заявками для бортпроводников**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

*Полнофункциональное веб-приложение для управления рейсами, бронирования отелей и планирования смен бортпроводников*

[🚀 Быстрый старт](#-быстрый-старт) •
[📚 Документация](#-документация) •
[✨ Функциональность](#-функциональность) •
[🛠️ Разработка](#️-разработка) •
[🤝 Вклад в проект](#-вклад-в-проект)

</div>

---

## 📋 Содержание

- [О проекте](#-о-проекте)
- [Структура проекта](#️-структура-проекта)
- [Быстрый старт](#-быстрый-старт)
- [Функциональность](#-функциональность)
- [Технологии](#-технологии)
- [Документация](#-документация)
- [Разработка](#️-разработка)
- [Развертывание](#-развертывание)
- [Мониторинг](#-мониторинг)
- [Вклад в проект](#-вклад-в-проект)
- [Лицензия](#-лицензия)

---

## 🎯 О проекте

CrewServiceWebsite — это современное веб-приложение, разработанное специально для бортпроводников. Система предоставляет удобный интерфейс для управления заявками на рейсы, бронирования отелей и планирования рабочих смен.

### Ключевые особенности:

- 🌐 **PWA** - Работает как нативное приложение
- 📱 **Адаптивный дизайн** - Оптимизировано для мобильных устройств
- 🔐 **Безопасность** - JWT аутентификация, bcrypt хеширование
- ⚡ **Производительность** - Кеширование, оптимизация запросов
- 📊 **Мониторинг** - Prometheus + Grafana
- 🐳 **Docker** - Простое развертывание
- 🔄 **Автомасштабирование** - Адаптация под нагрузку

---

## 🏗️ Структура проекта

```
CrewServiceWebsite/
│
├── 📁 crewlife-backend/       # Node.js API сервер
│   ├── src/                   # Исходный код
│   ├── config/                # Конфигурационные файлы
│   └── scripts/               # Скрипты развертывания
│
├── 📁 crewlife-website/       # Фронтенд приложение
│   ├── pages/                 # HTML страницы
│   ├── scripts/               # JavaScript модули
│   ├── styles/                # CSS стили
│   ├── assets/                # Ресурсы (иконки, изображения)
│   └── backend/               # Python Flask API
│
├── 📁 scripts/                # Скрипты управления
│   ├── deploy.sh              # Развертывание
│   ├── start.sh               # Запуск приложения
│   ├── backup_manager.py      # Резервное копирование
│   └── auto_scaler.py         # Автомасштабирование
│
├── 📁 docs/                   # Документация
│   ├── INDEX.md               # Индекс документации
│   ├── DEPLOYMENT.md          # Руководство по развертыванию
│   └── ...                    # Другие руководства
│
├── 📁 docker/                 # Docker конфигурации
│   ├── nginx/                 # Nginx конфигурация
│   ├── prometheus/            # Prometheus конфигурация
│   └── grafana/               # Grafana дашборды
│
├── 📁 tests/                  # Тесты
│   ├── test_api.py            # API тесты
│   └── test_database.py       # Тесты БД
│
├── 📁 config/                 # Конфигурации
│   └── env.example            # Пример переменных окружения
│
├── 📁 backups/                # Резервные копии
│
├── 📄 README.md               # Этот файл
├── 📄 CONTRIBUTING.md         # Руководство для контрибьюторов
├── 📄 docker-compose.yml      # Docker Compose конфигурация
├── 📄 .gitignore              # Git игнорируемые файлы
├── 📄 package.json            # Node.js зависимости
└── 📄 requirements.txt        # Python зависимости
```

---

## 🚀 Быстрый старт

### Предварительные требования

Убедитесь, что установлены:

- **Node.js** 18+ и npm
- **Python** 3.8+
- **SQLite** 3+ или **MariaDB** 10+
- **Git**

### Установка за 3 шага

#### 1️⃣ Клонирование репозитория

```bash
git clone https://github.com/JigenCommunicado/CrewServiceWebsite.git
cd CrewServiceWebsite
```

#### 2️⃣ Автоматическая установка

```bash
./scripts/install.sh
```

Этот скрипт:
- Установит все зависимости (Node.js и Python)
- Настроит базу данных
- Создаст необходимые конфигурационные файлы

#### 3️⃣ Запуск приложения

```bash
./scripts/start.sh
```

### Доступ к приложению

После запуска откройте в браузере:

- 🌐 **Фронтенд**: http://localhost:3001
- 🔌 **Node.js API**: http://localhost:3000
- 🐍 **Python API**: http://localhost:5000

### Альтернатива: Docker

```bash
# Быстрый запуск с Docker
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f
```

---

## ✨ Функциональность

### Для пользователей (бортпроводников)

- ✅ **Регистрация и авторизация**
  - Безопасная регистрация с подтверждением email
  - JWT токены для сессий
  - Двухфакторная аутентификация (опционально)

- ✅ **Управление рейсами**
  - Подача заявок на рейсы
  - Просмотр расписания
  - История полетов
  - Уведомления об изменениях

- ✅ **Бронирование отелей**
  - Поиск доступных отелей
  - Создание заявок на бронирование
  - Отмена и изменение бронирований

- ✅ **Календарь смен**
  - Интерактивный календарь
  - Планирование рабочих дней
  - Синхронизация с календарями (Google, iCal)

- ✅ **Личный кабинет**
  - Редактирование профиля
  - Статистика рейсов
  - Настройки уведомлений

### Для администраторов

- 🔐 **Панель администрирования**
  - Управление пользователями
  - Модерация заявок
  - Статистика и аналитика
  - Экспорт данных в Excel

- 📊 **Мониторинг системы**
  - Метрики производительности
  - Логи приложения
  - Состояние серверов

- 🛠️ **Управление системой**
  - Настройка параметров
  - Резервное копирование
  - Обновления системы

### PWA функции

- 📲 **Установка на устройство** - Работает как нативное приложение
- 🔔 **Push-уведомления** - Важные обновления в реальном времени
- 💾 **Офлайн режим** - Базовая функциональность без интернета
- 🌙 **Темная тема** - Удобство для глаз

---

## 🔧 Технологии

### Frontend

- **HTML5** - Семантическая разметка
- **CSS3** - Современные стили, flexbox, grid
- **JavaScript (ES6+)** - Модульная архитектура
- **Service Worker** - PWA функциональность
- **Responsive Design** - Адаптивная верстка

### Backend

#### Node.js сервер
- **Node.js** 18+ - Runtime
- **Express.js** - Web framework
- **JWT** - Аутентификация
- **bcrypt** - Хеширование паролей
- **Sequelize** - ORM для баз данных

#### Python сервер
- **Python** 3.8+
- **Flask** - Микрофреймворк
- **SQLAlchemy** - ORM
- **Pandas** - Обработка данных

### Базы данных

- **SQLite** - Разработка и тестирование
- **MariaDB** - Production окружение
- **Redis** - Кеширование (опционально)

### DevOps

- **Docker** - Контейнеризация
- **Docker Compose** - Оркестрация контейнеров
- **Nginx** - Reverse proxy, балансировка
- **Prometheus** - Сбор метрик
- **Grafana** - Визуализация метрик
- **PM2** - Process manager для Node.js

---

## 📚 Документация

Полная документация доступна в директории [`docs/`](docs/):

### Основные руководства

| Документ | Описание |
|----------|----------|
| [📖 INDEX.md](docs/INDEX.md) | Индекс всей документации |
| [🚀 DEPLOYMENT.md](docs/DEPLOYMENT.md) | Развертывание в production |
| [📊 MONITORING_SETUP_COMPLETE.md](docs/MONITORING_SETUP_COMPLETE.md) | Настройка мониторинга |
| [⚙️ AUTOMATION_SCALING_COMPLETE.md](docs/AUTOMATION_SCALING_COMPLETE.md) | Автомасштабирование |
| [🔄 CICD_SCALING_GUIDE.md](docs/CICD_SCALING_GUIDE.md) | CI/CD пайплайны |
| [📤 EXCEL_EXPORT_GUIDE.md](docs/EXCEL_EXPORT_GUIDE.md) | Экспорт данных |

### Дополнительные ресурсы

- [📜 Скрипты](scripts/README.md) - Документация по всем скриптам
- [🔌 API Documentation](docs/API.md) - Описание API endpoints
- [🐛 Troubleshooting](docs/TROUBLESHOOTING.md) - Решение проблем
- [❓ FAQ](docs/FAQ.md) - Часто задаваемые вопросы

---

## 🛠️ Разработка

### Настройка среды разработки

1. **Установите зависимости**:

```bash
# Node.js backend
cd crewlife-backend
npm install

# Python backend
cd crewlife-website/backend
pip install -r requirements.txt
```

2. **Настройте переменные окружения**:

```bash
cp config/env.example .env
# Отредактируйте .env файл
```

3. **Запустите в режиме разработки**:

```bash
# Node.js с hot reload
cd crewlife-backend
npm run dev

# Python с auto-reload
cd crewlife-website/backend
FLASK_ENV=development python3 api.py

# Frontend
cd crewlife-website
python3 -m http.server 3001
```

### Структура API

#### Node.js Backend (порт 3000)

**Аутентификация:**
```
POST   /api/auth/register       # Регистрация
POST   /api/auth/login          # Вход
POST   /api/auth/logout         # Выход
POST   /api/auth/refresh        # Обновление токена
```

**Рейсы:**
```
GET    /api/flight-orders       # Список заявок
POST   /api/flight-orders       # Создать заявку
GET    /api/flight-orders/:id   # Получить заявку
PUT    /api/flight-orders/:id   # Обновить заявку
DELETE /api/flight-orders/:id   # Удалить заявку
```

**Отели:**
```
GET    /api/hotel-orders        # Список бронирований
POST   /api/hotel-orders        # Создать бронирование
GET    /api/hotel-orders/:id    # Получить бронирование
PUT    /api/hotel-orders/:id    # Обновить бронирование
DELETE /api/hotel-orders/:id    # Удалить бронирование
```

#### Python Backend (порт 5000)

```
GET    /api/status              # Статус сервиса
POST   /api/data/process        # Обработка данных
GET    /api/reports/export      # Экспорт отчетов
```

### Тестирование

```bash
# Запуск всех тестов
cd tests
pytest

# С покрытием кода
pytest --cov=. --cov-report=html

# Только API тесты
pytest test_api.py

# Только тесты БД
pytest test_database.py
```

### Линтинг и форматирование

```bash
# JavaScript/Node.js
npm run lint
npm run lint:fix

# Python
flake8
black .
mypy .
```

---

## 📦 Развертывание

### Production с PM2

```bash
# Установка PM2
npm install -g pm2

# Запуск всех сервисов
./scripts/start_production.sh

# Управление процессами
pm2 list                    # Список процессов
pm2 logs                    # Просмотр логов
pm2 restart all             # Перезапуск всех
pm2 stop all                # Остановка всех
```

### Docker Production

```bash
# Сборка образов
docker-compose build

# Запуск в production
docker-compose -f docker-compose.yml up -d

# Масштабирование
docker-compose up -d --scale backend=3
```

### Nginx конфигурация

Пример конфигурации Nginx для production:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL сертификат

```bash
# Let's Encrypt с certbot
./scripts/setup_ssl.sh

# Или вручную
sudo certbot --nginx -d your-domain.com
```

---

## 📊 Мониторинг

### Настройка системы мониторинга

```bash
# Автоматическая настройка
./scripts/setup_monitoring.sh
```

### Доступ к дашбордам

- **Prometheus**: http://your-domain.com:9090
- **Grafana**: http://your-domain.com:3005
  - Логин по умолчанию: `admin`
  - Пароль: `admin` (измените при первом входе)

### Основные метрики

- **Системные**: CPU, RAM, диск, сеть
- **Приложение**: Время ответа, количество запросов, ошибки
- **База данных**: Количество подключений, размер, медленные запросы
- **Пользователи**: Активные сессии, новые регистрации

### Алерты

Настройка уведомлений в `docker/prometheus/alerts.yml`:

```yaml
groups:
  - name: application
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status="500"}[5m]) > 0.05
        annotations:
          summary: "Высокий уровень ошибок"
```

---

## 🔧 Скрипты

### Основные скрипты управления

| Скрипт | Назначение |
|--------|------------|
| `install.sh` | Установка системы |
| `start.sh` | Запуск приложения |
| `start_production.sh` | Запуск в production |
| `deploy.sh` | Развертывание обновлений |
| `backup_manager.py` | Управление резервными копиями |
| `auto_scaler.py` | Автомасштабирование |
| `system_monitor.py` | Мониторинг системы |
| `db_monitor.py` | Мониторинг БД |

Подробная документация: [scripts/README.md](scripts/README.md)

---

## 🤝 Вклад в проект

Мы приветствуем вклад в развитие проекта! 

### Как внести вклад

1. 🍴 **Fork** репозитория
2. 🌿 **Создайте ветку** для вашей функции (`git checkout -b feature/AmazingFeature`)
3. 💻 **Внесите изменения** и добавьте тесты
4. ✅ **Проверьте код** (`npm run lint`, `pytest`)
5. 📝 **Закоммитьте изменения** (`git commit -m 'feat: Add amazing feature'`)
6. 🚀 **Запушьте ветку** (`git push origin feature/AmazingFeature`)
7. 🎉 **Откройте Pull Request**

### Правила разработки

Пожалуйста, ознакомьтесь с [CONTRIBUTING.md](CONTRIBUTING.md) перед началом работы.

### Кодекс поведения

Мы придерживаемся дружелюбной и инклюзивной атмосферы. Будьте уважительны к другим участникам проекта.

---

## 🐛 Сообщить об ошибке

Нашли баг? Создайте [Issue](https://github.com/JigenCommunicado/CrewServiceWebsite/issues/new) с описанием:

- Описание проблемы
- Шаги для воспроизведения
- Ожидаемое и фактическое поведение
- Скриншоты (если применимо)
- Окружение (ОС, браузер, версии)

---

## 📈 Roadmap

### В разработке

- [ ] Интеграция с внешними системами бронирования
- [ ] Мобильное приложение (React Native)
- [ ] Чат для общения экипажа
- [ ] AI-рекомендации по оптимизации маршрутов

### Планируется

- [ ] Поддержка нескольких языков (i18n)
- [ ] Интеграция с корпоративными системами HR
- [ ] Расширенная аналитика и отчеты
- [ ] GraphQL API

---

## 📄 Лицензия

Этот проект лицензирован под [MIT License](LICENSE).

```
MIT License

Copyright (c) 2025 CrewLife Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👥 Команда

**CrewLife Development Team**

- 👨‍💻 Backend: Node.js & Python
- 🎨 Frontend: HTML, CSS, JavaScript
- 🗄️ Database: SQLite, MariaDB
- 🐳 DevOps: Docker, CI/CD

---

## 📞 Контакты и поддержка

- 📧 **Email**: support@crewlife.example
- 🐛 **Issues**: [GitHub Issues](https://github.com/JigenCommunicado/CrewServiceWebsite/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/JigenCommunicado/CrewServiceWebsite/discussions)
- 📖 **Документация**: [docs/INDEX.md](docs/INDEX.md)

---

## 🌟 Благодарности

Спасибо всем контрибьюторам, которые помогают развивать этот проект!

---

<div align="center">

**Сделано с ❤️ командой CrewLife**

[⬆ Вернуться к началу](#️-crewservicewebsite)

</div>
