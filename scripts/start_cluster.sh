#!/bin/bash
# Скрипт запуска кластера CrewLife

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция логирования
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Проверка зависимостей
check_dependencies() {
    log "🔍 Проверка зависимостей..."
    
    # Проверка Docker
    if ! command -v docker &> /dev/null; then
        error "Docker не установлен"
    fi
    
    # Проверка Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose не установлен"
    fi
    
    # Проверка Python
    if ! command -v python3 &> /dev/null; then
        error "Python3 не установлен"
    fi
    
    success "Все зависимости установлены"
}

# Создание необходимых директорий
create_directories() {
    log "📁 Создание директорий..."
    
    directories=(
        "logs"
        "backups"
        "reports"
        "data"
        "docker/ssl"
        "docker/prometheus"
        "docker/grafana/provisioning"
    )
    
    for dir in "${directories[@]}"; do
        mkdir -p "$dir"
        success "Директория создана: $dir"
    done
}

# Создание .env файла
create_env_file() {
    log "⚙️ Создание .env файла..."
    
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# CrewLife Production Environment

# Database Configuration
DB_TYPE=mysql
DB_HOST=mariadb
DB_PORT=3306
DB_NAME=crewlife_prod
DB_USER=crewlife_user
DB_PASSWORD=andrei8002012
DB_ROOT_PASSWORD=root_password

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=redis_password

# Application Configuration
FLASK_ENV=production
SECRET_KEY=$(openssl rand -hex 32)

# Monitoring Configuration
GRAFANA_PASSWORD=admin123

# SSL Configuration
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
EOF
        success ".env файл создан"
    else
        warning ".env файл уже существует"
    fi
}

# Создание SSL сертификатов (самоподписанные для тестирования)
create_ssl_certificates() {
    log "🔐 Создание SSL сертификатов..."
    
    if [ ! -f "docker/ssl/cert.pem" ] || [ ! -f "docker/ssl/key.pem" ]; then
        openssl req -x509 -newkey rsa:4096 -keyout docker/ssl/key.pem -out docker/ssl/cert.pem -days 365 -nodes -subj "/C=RU/ST=Moscow/L=Moscow/O=CrewLife/CN=localhost"
        success "SSL сертификаты созданы"
    else
        warning "SSL сертификаты уже существуют"
    fi
}

# Создание конфигурации Prometheus
create_prometheus_config() {
    log "📊 Создание конфигурации Prometheus..."
    
    cat > docker/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  # - "first_rules.yml"
  # - "second_rules.yml"

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'crewlife-apps'
    static_configs:
      - targets: ['crewlife-app-1:5000', 'crewlife-app-2:5000', 'crewlife-app-3:5000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'crewlife-monitor'
    static_configs:
      - targets: ['crewlife-web-monitor:5001']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'nginx'
    static_configs:
      - targets: ['nginx:9113']
    scrape_interval: 30s
EOF
    success "Конфигурация Prometheus создана"
}

# Создание конфигурации Grafana
create_grafana_config() {
    log "📈 Создание конфигурации Grafana..."
    
    # Создание datasource
    mkdir -p docker/grafana/provisioning/datasources
    cat > docker/grafana/provisioning/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

    # Создание dashboard
    mkdir -p docker/grafana/provisioning/dashboards
    cat > docker/grafana/provisioning/dashboards/dashboard.yml << EOF
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
EOF
    success "Конфигурация Grafana создана"
}

# Создание пароля для мониторинга
create_monitoring_password() {
    log "🔑 Создание пароля для мониторинга..."
    
    if [ ! -f "docker/nginx/.htpasswd" ]; then
        echo "admin:\$(openssl passwd -apr1 admin123)" > docker/nginx/.htpasswd
        success "Пароль для мониторинга создан (admin/admin123)"
    else
        warning "Пароль для мониторинга уже существует"
    fi
}

# Запуск кластера
start_cluster() {
    log "🚀 Запуск кластера CrewLife..."
    
    # Остановка существующих контейнеров
    docker-compose down 2>/dev/null || true
    
    # Сборка образов
    log "🏗️ Сборка Docker образов..."
    docker-compose build --no-cache
    
    # Запуск сервисов
    log "🔄 Запуск сервисов..."
    docker-compose up -d
    
    # Ожидание запуска сервисов
    log "⏳ Ожидание запуска сервисов..."
    sleep 30
    
    # Проверка статуса сервисов
    check_services_health
}

# Проверка здоровья сервисов
check_services_health() {
    log "🏥 Проверка здоровья сервисов..."
    
    services=(
        "mariadb:3306"
        "redis:6379"
        "crewlife-app-1:5001"
        "crewlife-app-2:5002"
        "crewlife-app-3:5003"
        "nginx:80"
        "crewlife-web-monitor:5004"
        "prometheus:9090"
        "grafana:3000"
    )
    
    for service in "${services[@]}"; do
        name=$(echo $service | cut -d: -f1)
        port=$(echo $service | cut -d: -f2)
        
        if docker-compose ps | grep -q "$name.*Up"; then
            success "✅ $name запущен"
        else
            error "❌ $name не запущен"
        fi
    done
}

# Показать информацию о доступе
show_access_info() {
    log "🌐 Информация о доступе:"
    echo ""
    echo "📱 Основное приложение:"
    echo "   HTTP:  http://localhost"
    echo "   HTTPS: https://localhost"
    echo ""
    echo "📊 Мониторинг:"
    echo "   Веб-мониторинг БД: http://localhost:5004"
    echo "   Prometheus:        http://localhost:9090"
    echo "   Grafana:           http://localhost:3000 (admin/admin123)"
    echo ""
    echo "🔧 API Endpoints:"
    echo "   Health Check:      http://localhost/health"
    echo "   API Stats:         http://localhost/api/stats"
    echo "   Monitor API:       http://localhost:5004/api/stats"
    echo ""
    echo "📋 Полезные команды:"
    echo "   Статус сервисов:   docker-compose ps"
    echo "   Логи:              docker-compose logs -f"
    echo "   Остановка:         docker-compose down"
    echo "   Перезапуск:        docker-compose restart"
    echo ""
}

# Основная функция
main() {
    log "🚀 Запуск кластера CrewLife"
    
    check_dependencies
    create_directories
    create_env_file
    create_ssl_certificates
    create_prometheus_config
    create_grafana_config
    create_monitoring_password
    start_cluster
    show_access_info
    
    success "🎉 Кластер CrewLife успешно запущен!"
    log "Система готова к работе"
}

# Обработка аргументов командной строки
case "${1:-start}" in
    start)
        main
        ;;
    stop)
        log "🛑 Остановка кластера..."
        docker-compose down
        success "Кластер остановлен"
        ;;
    restart)
        log "🔄 Перезапуск кластера..."
        docker-compose restart
        success "Кластер перезапущен"
        ;;
    status)
        log "📊 Статус сервисов:"
        docker-compose ps
        ;;
    logs)
        docker-compose logs -f
        ;;
    scale)
        instances=${2:-3}
        log "📈 Масштабирование до $instances экземпляров..."
        docker-compose up -d --scale crewlife-app=$instances
        success "Масштабирование завершено"
        ;;
    *)
        echo "Использование: $0 {start|stop|restart|status|logs|scale [instances]}"
        exit 1
        ;;
esac
