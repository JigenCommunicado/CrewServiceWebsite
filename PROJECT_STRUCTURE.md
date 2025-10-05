# 📊 Структура проекта CrewServiceWebsite

Визуальное представление организации файлов и директорий проекта.

## 🌳 Дерево директорий

```
CrewServiceWebsite/
│
├── 📄 README.md                    # Главная документация проекта
├── 📄 QUICK_START.md              # Краткое руководство по запуску
├── 📄 CONTRIBUTING.md             # Руководство для контрибьюторов
├── 📄 CHANGELOG.md                # История изменений
├── 📄 LICENSE                     # MIT лицензия
├── 📄 .gitignore                  # Git игнорируемые файлы
├── 📄 .editorconfig               # Настройки редактора кода
│
├── 📦 package.json                # Node.js зависимости (корневой)
├── 📦 requirements.txt            # Python зависимости (корневой)
├── 📦 requirements.docker.txt     # Python зависимости для Docker
│
├── 🐳 docker-compose.yml          # Docker Compose конфигурация
├── 🐳 docker-compose.simple.yml   # Упрощенная Docker конфигурация
├── 🐳 Dockerfile                  # Docker образ
├── 🐳 Dockerfile.simple           # Упрощенный Docker образ
│
├── 📁 .github/                    # GitHub настройки
│   ├── ISSUE_TEMPLATE/            # Шаблоны Issues
│   │   ├── bug_report.md          # Шаблон для багов
│   │   └── feature_request.md     # Шаблон для новых функций
│   └── PULL_REQUEST_TEMPLATE.md   # Шаблон PR
│
├── 📁 crewlife-backend/           # Node.js API сервер
│   ├── src/                       # Исходный код
│   │   ├── controllers/           # Контроллеры API
│   │   ├── models/                # Модели данных
│   │   ├── routes/                # Маршруты API
│   │   ├── middleware/            # Middleware функции
│   │   ├── utils/                 # Вспомогательные функции
│   │   └── server.js              # Точка входа сервера
│   │
│   ├── config/                    # Конфигурационные файлы
│   │   ├── database.js            # Настройки БД
│   │   └── config.js              # Общие настройки
│   │
│   ├── scripts/                   # Скрипты развертывания
│   ├── package.json               # Зависимости
│   ├── DATABASE_SETUP.md          # Настройка БД
│   └── README.md                  # Документация бэкенда
│
├── 📁 crewlife-website/           # Фронтенд приложение
│   ├── pages/                     # HTML страницы
│   │   ├── flights/               # Страницы рейсов
│   │   ├── hotels/                # Страницы отелей
│   │   ├── schedule/              # Календарь и расписание
│   │   └── admin/                 # Админ панель
│   │
│   ├── scripts/                   # JavaScript модули
│   │   ├── api.js                 # API клиент
│   │   ├── auth.js                # Аутентификация
│   │   ├── utils.js               # Утилиты
│   │   └── components/            # UI компоненты
│   │
│   ├── styles/                    # CSS стили
│   │   ├── main.css               # Основные стили
│   │   ├── components/            # Стили компонентов
│   │   └── themes/                # Темы оформления
│   │
│   ├── assets/                    # Статические ресурсы
│   │   ├── icons/                 # Иконки
│   │   ├── images/                # Изображения
│   │   └── fonts/                 # Шрифты
│   │
│   ├── backend/                   # Python Flask API
│   │   ├── api.py                 # Основной файл API
│   │   ├── api_mysql.py           # API для MySQL
│   │   ├── database.py            # Работа с SQLite
│   │   ├── database_mysql.py      # Работа с MySQL
│   │   └── update_admin.py        # Скрипты администрирования
│   │
│   ├── config/                    # Конфигурация фронтенда
│   ├── docs/                      # Документация фронтенда
│   │
│   ├── index.html                 # Главная страница
│   ├── login.html                 # Страница входа
│   ├── register.html              # Страница регистрации
│   ├── dashboard.html             # Дашборд
│   ├── profile.html               # Профиль пользователя
│   ├── help.html                  # Помощь
│   ├── sw.js                      # Service Worker (PWA)
│   │
│   ├── start.sh                   # Скрипт запуска
│   └── README.md                  # Документация фронтенда
│
├── 📁 scripts/                    # Скрипты управления проектом
│   ├── 🚀 Развертывание
│   │   ├── install.sh             # Установка системы
│   │   ├── deploy.sh              # Развертывание
│   │   ├── start.sh               # Запуск
│   │   ├── start_production.sh    # Запуск в production
│   │   ├── start_cluster.sh       # Запуск кластера
│   │   └── start_simple_cluster.sh # Упрощенный кластер
│   │
│   ├── 🔐 Настройка
│   │   ├── setup_ssl.sh           # Настройка SSL
│   │   └── setup_monitoring.sh    # Настройка мониторинга
│   │
│   ├── 🗄️ База данных
│   │   ├── migrate_to_mariadb.py  # Миграция на MariaDB
│   │   ├── simple_migrate.py      # Простая миграция
│   │   ├── finalize_mariadb.py    # Финализация MariaDB
│   │   └── update_to_bcrypt.py    # Обновление паролей
│   │
│   ├── 📊 Мониторинг
│   │   ├── system_monitor.py      # Мониторинг системы
│   │   ├── performance_monitor.py # Мониторинг производительности
│   │   ├── db_monitor.py          # Мониторинг БД
│   │   └── web_db_monitor.py      # Веб-интерфейс мониторинга
│   │
│   ├── ⚙️ Автоматизация
│   │   ├── auto_scaler.py         # Автомасштабирование
│   │   ├── backup_manager.py      # Управление резервными копиями
│   │   ├── cache_manager.py       # Управление кешем
│   │   └── create_daily_report.sh # Ежедневные отчеты
│   │
│   └── README.md                  # Документация по скриптам
│
├── 📁 docs/                       # Документация проекта
│   ├── INDEX.md                   # Индекс документации
│   ├── DEPLOYMENT.md              # Развертывание
│   ├── MONITORING_SETUP_COMPLETE.md      # Мониторинг
│   ├── CLUSTER_MONITORING_COMPLETE.md    # Кластер
│   ├── AUTOMATION_SCALING_COMPLETE.md    # Автомасштабирование
│   ├── CICD_SCALING_GUIDE.md      # CI/CD
│   ├── EXCEL_EXPORT_GUIDE.md      # Экспорт данных
│   ├── EXCEL_EXPORT_COMPLETE.md   # Завершение экспорта
│   ├── MIGRATION_REPORT.md        # Отчет о миграции
│   └── README.md                  # Описание документации
│
├── 📁 docker/                     # Docker конфигурации
│   ├── nginx/                     # Nginx конфигурация
│   │   ├── nginx.conf             # Основной конфиг
│   │   └── ssl/                   # SSL сертификаты
│   │
│   ├── prometheus/                # Prometheus конфигурация
│   │   ├── prometheus.yml         # Конфиг Prometheus
│   │   └── alerts.yml             # Алерты
│   │
│   └── grafana/                   # Grafana конфигурация
│       ├── dashboards/            # Дашборды
│       └── provisioning/          # Провижининг
│
├── 📁 config/                     # Конфигурационные файлы
│   ├── env.example                # Пример .env файла
│   └── README.md                  # Документация по конфигурации
│
├── 📁 backups/                    # Резервные копии и отчеты
│   ├── *.db                       # Резервные копии БД
│   ├── *.xlsx                     # Excel отчеты
│   └── README.md                  # Документация по бэкапам
│
├── 📁 tests/                      # Тесты
│   ├── conftest.py                # Конфигурация pytest
│   ├── test_api.py                # Тесты API
│   └── test_database.py           # Тесты БД
│
├── 📁 reports/                    # Сгенерированные отчеты
│   ├── daily/                     # Ежедневные отчеты
│   ├── weekly/                    # Еженедельные отчеты
│   └── monthly/                   # Ежемесячные отчеты
│
└── 📁 logs/                       # Логи приложения (создается автоматически)
    ├── app.log                    # Основные логи
    ├── backend-error.log          # Ошибки бэкенда
    ├── backend-out.log            # Вывод бэкенда
    └── backup.log                 # Логи резервного копирования
```

## 📈 Статистика проекта

### Основные компоненты

| Компонент | Технология | Файлы | Строк кода (прим.) |
|-----------|------------|-------|-------------------|
| Frontend | HTML/CSS/JS | ~30 | ~5,000 |
| Backend API | Node.js/Express | ~25 | ~3,000 |
| Python API | Flask | ~10 | ~1,500 |
| Scripts | Bash/Python | ~20 | ~2,000 |
| Docs | Markdown | ~15 | ~5,000 |
| Tests | pytest/Jest | ~5 | ~800 |
| **Всего** | - | **~105** | **~17,300** |

### Размеры директорий (примерно)

```
crewlife-backend/       ~15 MB   (с node_modules ~150 MB)
crewlife-website/       ~10 MB
docs/                   ~1 MB
scripts/                ~500 KB
docker/                 ~200 KB
tests/                  ~100 KB
```

## 🔗 Взаимосвязи компонентов

```
┌─────────────────┐
│   Пользователь   │
└────────┬─────────┘
         │
         ▼
┌─────────────────┐
│   Frontend      │ ◄──── index.html, dashboard.html
│  (HTML/CSS/JS)  │ ◄──── scripts/, styles/
└────────┬─────────┘
         │ HTTP/REST API
         ▼
┌─────────────────┐
│   Nginx         │ ◄──── Reverse Proxy, SSL
│  (Load Balancer)│ ◄──── docker/nginx/
└────────┬─────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────┐
│ Node.js │ │ Python   │
│ Backend │ │ Flask    │
│  :3000  │ │  :5000   │
└────┬────┘ └────┬─────┘
     │           │
     └─────┬─────┘
           ▼
    ┌──────────────┐
    │   Database   │ ◄──── SQLite / MariaDB
    │   (SQLite/   │
    │   MariaDB)   │
    └──────────────┘
           │
           ▼
    ┌──────────────┐
    │   Backups    │ ◄──── backup_manager.py
    └──────────────┘

┌──────────────────────────────────┐
│       Мониторинг                  │
│  ┌──────────┐    ┌──────────┐   │
│  │Prometheus│◄───│ Metrics  │   │
│  │  :9090   │    └──────────┘   │
│  └────┬─────┘                     │
│       │                           │
│       ▼                           │
│  ┌──────────┐                     │
│  │ Grafana  │                     │
│  │  :3005   │                     │
│  └──────────┘                     │
└──────────────────────────────────┘
```

## 📝 Ключевые файлы и их назначение

### Корневой уровень

| Файл | Назначение |
|------|-----------|
| `README.md` | Главная документация, быстрый старт |
| `QUICK_START.md` | Краткая справка по командам |
| `CONTRIBUTING.md` | Правила для контрибьюторов |
| `CHANGELOG.md` | История изменений проекта |
| `LICENSE` | MIT лицензия |
| `.gitignore` | Игнорируемые Git файлы |
| `.editorconfig` | Настройки редактора кода |
| `docker-compose.yml` | Конфигурация Docker |
| `package.json` | Node.js зависимости |
| `requirements.txt` | Python зависимости |

### Конфигурация

| Файл/Директория | Назначение |
|-----------------|-----------|
| `config/env.example` | Шаблон переменных окружения |
| `docker/nginx/` | Конфигурация веб-сервера |
| `docker/prometheus/` | Конфигурация мониторинга |
| `docker/grafana/` | Дашборды визуализации |

### API Endpoints

| Маршрут | Файл | Описание |
|---------|------|----------|
| `/api/auth/*` | `crewlife-backend/src/routes/auth.js` | Аутентификация |
| `/api/flight-orders/*` | `crewlife-backend/src/routes/flights.js` | Рейсы |
| `/api/hotel-orders/*` | `crewlife-backend/src/routes/hotels.js` | Отели |
| `/py-api/*` | `crewlife-website/backend/api.py` | Python API |

## 🎯 Навигация по проекту

### Для начинающих разработчиков

1. Начните с [README.md](README.md)
2. Изучите [QUICK_START.md](QUICK_START.md)
3. Прочитайте [CONTRIBUTING.md](CONTRIBUTING.md)
4. Посмотрите [docs/INDEX.md](docs/INDEX.md)

### Для разработки Frontend

1. `crewlife-website/` - основная директория
2. `crewlife-website/pages/` - HTML страницы
3. `crewlife-website/scripts/` - JavaScript код
4. `crewlife-website/styles/` - CSS стили

### Для разработки Backend

1. `crewlife-backend/src/` - Node.js код
2. `crewlife-website/backend/` - Python код
3. `tests/` - тесты
4. `docs/` - API документация

### Для DevOps

1. `docker/` - Docker конфигурации
2. `scripts/` - скрипты автоматизации
3. `docs/DEPLOYMENT.md` - развертывание
4. `docs/MONITORING_SETUP_COMPLETE.md` - мониторинг

### Для администраторов

1. `backups/` - резервные копии
2. `scripts/backup_manager.py` - управление бэкапами
3. `scripts/system_monitor.py` - мониторинг
4. `config/` - конфигурация

## 🔍 Поиск в проекте

### Найти определенный функционал

```bash
# Поиск функции
grep -r "function_name" crewlife-backend/src/

# Поиск API endpoint
grep -r "/api/endpoint" .

# Поиск в документации
grep -r "keyword" docs/
```

### Найти конфигурацию

```bash
# Переменные окружения
grep -r "ENV_VAR" .

# Порты
grep -r ":3000" .
```

## 📚 Дополнительные ресурсы

- [Архитектура системы](docs/ARCHITECTURE.md) (создать)
- [API Reference](docs/API_REFERENCE.md) (создать)
- [База данных схема](docs/DATABASE_SCHEMA.md) (создать)
- [Security Guide](docs/SECURITY.md) (создать)

---

**Последнее обновление структуры:** 5 октября 2025  
**Версия проекта:** 2.0.0
