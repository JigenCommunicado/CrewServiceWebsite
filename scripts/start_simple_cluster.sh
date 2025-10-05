#!/bin/bash
# Скрипт быстрого запуска кластера CrewLife

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
    
    if ! command -v docker &> /dev/null; then
        error "Docker не установлен"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose не установлен"
    fi
    
    success "Все зависимости установлены"
}

# Остановка существующих контейнеров
stop_existing() {
    log "🛑 Остановка существующих контейнеров..."
    docker-compose -f docker-compose.simple.yml down 2>/dev/null || true
    success "Существующие контейнеры остановлены"
}

# Сборка образов
build_images() {
    log "🏗️ Сборка Docker образов..."
    
    # Копируем простой Dockerfile
    cp Dockerfile.simple Dockerfile
    
    docker-compose -f docker-compose.simple.yml build --no-cache
    success "Образы собраны"
}

# Запуск кластера
start_cluster() {
    log "🚀 Запуск кластера CrewLife..."
    
    docker-compose -f docker-compose.simple.yml up -d
    
    # Ожидание запуска сервисов
    log "⏳ Ожидание запуска сервисов..."
    sleep 30
    
    success "Кластер запущен"
}

# Проверка здоровья сервисов
check_services_health() {
    log "🏥 Проверка здоровья сервисов..."
    
    services=(
        "mariadb:3306"
        "redis:6379"
        "crewlife-app:5000"
        "nginx:80"
        "crewlife-web-monitor:5001"
        "prometheus:9090"
        "grafana:3000"
    )
    
    for service in "${services[@]}"; do
        name=$(echo $service | cut -d: -f1)
        port=$(echo $service | cut -d: -f2)
        
        if docker-compose -f docker-compose.simple.yml ps | grep -q "$name.*Up"; then
            success "✅ $name запущен"
        else
            warning "⚠️ $name не запущен"
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
    echo "   Веб-мониторинг БД: http://localhost:5001"
    echo "   Prometheus:        http://localhost:9090"
    echo "   Grafana:           http://localhost:3000 (admin/admin123)"
    echo ""
    echo "🔧 API Endpoints:"
    echo "   Health Check:      http://localhost/health"
    echo "   API Stats:         http://localhost/api/stats"
    echo "   Monitor API:       http://localhost:5001/api/stats"
    echo "   Excel Export:      http://localhost:5001/api/export/excel"
    echo ""
    echo "📋 Полезные команды:"
    echo "   Статус сервисов:   docker-compose -f docker-compose.simple.yml ps"
    echo "   Логи:              docker-compose -f docker-compose.simple.yml logs -f"
    echo "   Остановка:         docker-compose -f docker-compose.simple.yml down"
    echo "   Перезапуск:        docker-compose -f docker-compose.simple.yml restart"
    echo ""
}

# Основная функция
main() {
    log "🚀 Запуск простого кластера CrewLife"
    
    check_dependencies
    stop_existing
    build_images
    start_cluster
    check_services_health
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
        docker-compose -f docker-compose.simple.yml down
        success "Кластер остановлен"
        ;;
    restart)
        log "🔄 Перезапуск кластера..."
        docker-compose -f docker-compose.simple.yml restart
        success "Кластер перезапущен"
        ;;
    status)
        log "📊 Статус сервисов:"
        docker-compose -f docker-compose.simple.yml ps
        ;;
    logs)
        docker-compose -f docker-compose.simple.yml logs -f
        ;;
    *)
        echo "Использование: $0 {start|stop|restart|status|logs}"
        exit 1
        ;;
esac
