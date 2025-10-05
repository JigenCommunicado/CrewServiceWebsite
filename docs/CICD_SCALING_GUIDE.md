# 🚀 Руководство по CI/CD и масштабированию CrewLife

## 📋 Содержание

1. [CI/CD Pipeline](#cicd-pipeline)
2. [Автоматическое развертывание](#автоматическое-развертывание)
3. [Система тестирования](#система-тестирования)
4. [Мониторинг производительности](#мониторинг-производительности)
5. [Масштабирование](#масштабирование)
6. [Кэширование](#кэширование)
7. [Кластерная архитектура](#кластерная-архитектура)

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Система использует GitHub Actions для автоматизации CI/CD процессов:

```yaml
# .github/workflows/deploy.yml
name: 🚀 CrewLife CI/CD Pipeline

on:
  push:
    branches: [ main, production ]
  pull_request:
    branches: [ main ]
```

### Этапы Pipeline

1. **🧪 Тестирование**
   - Unit тесты
   - Integration тесты
   - Security сканирование
   - Code coverage

2. **🏗️ Сборка**
   - Docker образы
   - Артефакты
   - Версионирование

3. **🚀 Развертывание**
   - Staging environment
   - Production environment
   - Health checks

### Запуск Pipeline

```bash
# Запуск тестов
pytest tests/ -v --cov=crewlife

# Security сканирование
bandit -r . -f json
safety check --json

# Сборка Docker образа
docker build -t crewlife:latest .
```

## 🚀 Автоматическое развертывание

### Скрипт развертывания

```bash
# Развертывание в staging
./deploy.sh staging

# Развертывание в production
./deploy.sh production
```

### Этапы развертывания

1. **🔐 Проверка прав доступа**
2. **💾 Создание резервной копии**
3. **🛑 Остановка сервисов**
4. **📥 Обновление кода**
5. **📦 Установка зависимостей**
6. **⚙️ Настройка конфигурации**
7. **🗄️ Инициализация базы данных**
8. **🚀 Запуск сервисов**
9. **✅ Проверка развертывания**

### Конфигурация развертывания

```bash
# Переменные окружения
ENVIRONMENT=production
VERSION=latest
BACKUP_DIR=/backups
LOG_FILE=/var/log/crewlife-deploy.log
```

## 🧪 Система тестирования

### Структура тестов

```
tests/
├── conftest.py          # Конфигурация тестов
├── test_database.py     # Тесты базы данных
├── test_api.py          # Тесты API
└── test_integration.py  # Интеграционные тесты
```

### Запуск тестов

```bash
# Все тесты
pytest tests/ -v

# С покрытием кода
pytest tests/ -v --cov=crewlife --cov-report=html

# Конкретный тест
pytest tests/test_database.py::TestCrewLifeDatabase::test_user_creation -v

# Параллельное выполнение
pytest tests/ -n auto
```

### Типы тестов

1. **Unit тесты** - тестирование отдельных компонентов
2. **Integration тесты** - тестирование взаимодействия компонентов
3. **API тесты** - тестирование REST API
4. **Database тесты** - тестирование работы с БД
5. **Performance тесты** - тестирование производительности

## 📊 Мониторинг производительности

### Система мониторинга

```python
# performance_monitor.py
class PerformanceMonitor:
    def __init__(self, config):
        self.metrics_history = deque(maxlen=1000)
        self.alerts = []
        self.thresholds = {
            'cpu_percent': 80.0,
            'memory_percent': 85.0,
            'response_time_ms': 5000.0
        }
```

### Метрики

1. **Системные метрики**
   - CPU использование
   - Память
   - Диск
   - Сеть

2. **Метрики приложения**
   - Время ответа API
   - Количество запросов
   - Ошибки
   - Активные соединения

3. **Метрики базы данных**
   - Время подключения
   - Количество соединений
   - Размер БД
   - Производительность запросов

### Алерты

```python
# Пороги для алертов
thresholds = {
    'cpu_percent': 80.0,
    'memory_percent': 85.0,
    'disk_percent': 90.0,
    'response_time_ms': 5000.0,
    'db_connection_time_ms': 1000.0,
    'error_rate_percent': 5.0
}
```

## 📈 Масштабирование

### Автоматическое масштабирование

```python
# auto_scaler.py
class AutoScaler:
    def __init__(self, config):
        self.min_instances = 2
        self.max_instances = 10
        self.scale_up_threshold = 70.0
        self.scale_down_threshold = 30.0
```

### Условия масштабирования

**Масштабирование вверх:**
- CPU > 70%
- Память > 80%
- Время ответа > 2000ms
- Ошибки > 5%

**Масштабирование вниз:**
- CPU < 30%
- Память < 50%
- Время ответа < 500ms
- Ошибки < 1%

### Горизонтальное масштабирование

```yaml
# docker-compose.yml
services:
  crewlife-app-1:
    build: .
    ports:
      - "5001:5000"
  
  crewlife-app-2:
    build: .
    ports:
      - "5002:5000"
  
  crewlife-app-3:
    build: .
    ports:
      - "5003:5000"
```

### Балансировка нагрузки

```nginx
# nginx.conf
upstream crewlife_backend {
    least_conn;
    server crewlife-app-1:5000 max_fails=3 fail_timeout=30s;
    server crewlife-app-2:5000 max_fails=3 fail_timeout=30s;
    server crewlife-app-3:5000 max_fails=3 fail_timeout=30s;
}
```

## 💾 Кэширование

### Redis кэширование

```python
# cache_manager.py
class CacheManager:
    def __init__(self, config):
        self.redis_client = redis.Redis(
            host=config['redis_host'],
            port=config['redis_port'],
            password=config['redis_password']
        )
```

### Типы кэширования

1. **Кэш пользователей** - TTL: 30 минут
2. **Кэш статистики** - TTL: 5 минут
3. **Кэш заявок** - TTL: 10 минут
4. **Кэш API ответов** - TTL: 5 минут
5. **Кэш запросов БД** - TTL: 10 минут

### Декоратор кэширования

```python
@cache_manager.cache_function(ttl=300, namespace='api')
def get_dashboard_stats():
    return db.get_dashboard_stats()
```

## 🏗️ Кластерная архитектура

### Компоненты кластера

1. **База данных** - MariaDB
2. **Кэш** - Redis
3. **Приложения** - 3+ экземпляра
4. **Балансировщик** - Nginx
5. **Мониторинг** - Prometheus + Grafana
6. **Резервные копии** - Автоматические

### Запуск кластера

```bash
# Запуск всего кластера
./start_cluster.sh

# Проверка статуса
./start_cluster.sh status

# Масштабирование
./start_cluster.sh scale 5

# Остановка
./start_cluster.sh stop
```

### Мониторинг кластера

```bash
# Статус сервисов
docker-compose ps

# Логи
docker-compose logs -f

# Метрики
curl http://localhost:9090/metrics
```

## 🔧 Конфигурация

### Переменные окружения

```bash
# .env
DB_TYPE=mysql
DB_HOST=mariadb
DB_USER=crewlife_user
DB_PASSWORD=andrei8002012
REDIS_HOST=redis
REDIS_PASSWORD=redis_password
```

### Docker Compose

```yaml
version: '3.8'
services:
  mariadb:
    image: mariadb:10.11
    environment:
      MYSQL_DATABASE: crewlife_prod
      MYSQL_USER: crewlife_user
      MYSQL_PASSWORD: andrei8002012
```

## 📊 Мониторинг и алерты

### Prometheus метрики

- `crewlife_requests_total` - общее количество запросов
- `crewlife_response_time_seconds` - время ответа
- `crewlife_active_users` - активные пользователи
- `crewlife_database_connections` - соединения с БД

### Grafana дашборды

1. **System Overview** - общий обзор системы
2. **Application Metrics** - метрики приложения
3. **Database Performance** - производительность БД
4. **Error Tracking** - отслеживание ошибок

### Алерты

- Высокая загрузка CPU
- Недостаток памяти
- Медленные ответы API
- Ошибки базы данных
- Недоступность сервисов

## 🚀 Развертывание в продакшене

### Подготовка

1. Настройка сервера
2. Установка Docker
3. Настройка SSL сертификатов
4. Конфигурация мониторинга

### Развертывание

```bash
# Клонирование репозитория
git clone https://github.com/your-repo/crewlife.git
cd crewlife

# Настройка окружения
cp .env.example .env
# Редактирование .env

# Запуск кластера
./start_cluster.sh

# Проверка развертывания
./start_cluster.sh status
```

### Обслуживание

```bash
# Обновление
git pull origin main
./deploy.sh production

# Резервные копии
./backup_manager.py

# Мониторинг
./performance_monitor.py
```

## 📚 Полезные команды

### Docker

```bash
# Статус контейнеров
docker-compose ps

# Логи
docker-compose logs -f [service]

# Перезапуск сервиса
docker-compose restart [service]

# Масштабирование
docker-compose up -d --scale crewlife-app=5
```

### Мониторинг

```bash
# Статистика системы
curl http://localhost:5001/api/stats

# Метрики Prometheus
curl http://localhost:9090/metrics

# Статус кэша
curl http://localhost:5004/api/cache/stats
```

### Тестирование

```bash
# Запуск тестов
pytest tests/ -v

# Тестирование API
curl -X POST http://localhost/api/login \
  -H "Content-Type: application/json" \
  -d '{"employee_id":"TEST001","password":"test"}'

# Нагрузочное тестирование
ab -n 1000 -c 10 http://localhost/api/stats
```

## 🎯 Заключение

Система CrewLife теперь включает:

✅ **CI/CD Pipeline** с автоматическим тестированием и развертыванием
✅ **Автоматическое масштабирование** на основе метрик
✅ **Мониторинг производительности** в реальном времени
✅ **Кэширование** для повышения производительности
✅ **Кластерная архитектура** с балансировкой нагрузки
✅ **Система алертов** для критических событий
✅ **Автоматические резервные копии**
✅ **SSL/TLS** для безопасности

Система готова к продакшену и может автоматически масштабироваться в зависимости от нагрузки!
