#!/bin/bash
# Скрипт автоматического развертывания CrewLife

set -e  # Остановка при ошибке

# Конфигурация
ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}
BACKUP_DIR="/backups"
LOG_FILE="/var/log/crewlife-deploy.log"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция логирования
log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Проверка прав доступа
check_permissions() {
    log "🔐 Проверка прав доступа..."
    if [[ $EUID -ne 0 ]]; then
        error "Этот скрипт должен запускаться с правами root"
    fi
    success "Права доступа проверены"
}

# Создание резервной копии
create_backup() {
    log "💾 Создание резервной копии..."
    
    BACKUP_NAME="crewlife_backup_$(date +%Y%m%d_%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    mkdir -p "$BACKUP_PATH"
    
    # Резервная копия базы данных
    if systemctl is-active --quiet mariadb; then
        mysqldump -u crewlife_user -pandrei8002012 crewlife_prod > "$BACKUP_PATH/database.sql"
        success "Резервная копия БД создана"
    else
        warning "MariaDB не активна, пропускаем резервную копию БД"
    fi
    
    # Резервная копия файлов
    if [ -d "/app" ]; then
        cp -r /app "$BACKUP_PATH/app_backup"
        success "Резервная копия файлов создана"
    fi
    
    # Резервная копия конфигурации
    if [ -f "/etc/nginx/sites-available/crewlife" ]; then
        cp /etc/nginx/sites-available/crewlife "$BACKUP_PATH/nginx.conf"
        success "Резервная копия конфигурации создана"
    fi
    
    success "Резервная копия создана: $BACKUP_PATH"
}

# Остановка сервисов
stop_services() {
    log "🛑 Остановка сервисов..."
    
    services=("crewlife-web-monitor" "crewlife-system-monitor" "nginx" "mariadb")
    
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service"; then
            log "Остановка $service..."
            systemctl stop "$service"
            success "$service остановлен"
        else
            log "$service уже остановлен"
        fi
    done
}

# Обновление кода
update_code() {
    log "📥 Обновление кода..."
    
    if [ -d "/app/.git" ]; then
        cd /app
        git fetch origin
        git reset --hard "origin/$ENVIRONMENT"
        success "Код обновлен из ветки $ENVIRONMENT"
    else
        warning "Git репозиторий не найден, пропускаем обновление кода"
    fi
}

# Установка зависимостей
install_dependencies() {
    log "📦 Установка зависимостей..."
    
    cd /app
    
    # Python зависимости
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        success "Python зависимости установлены"
    fi
    
    # Системные зависимости
    apt-get update
    apt-get install -y python3-psutil python3-schedule nginx
    success "Системные зависимости установлены"
}

# Настройка конфигурации
setup_configuration() {
    log "⚙️ Настройка конфигурации..."
    
    # Создание .env файла
    if [ ! -f "/app/.env" ]; then
        cp /app/.env.production /app/.env
        success "Конфигурация .env создана"
    fi
    
    # Настройка nginx
    if [ -f "/app/nginx.conf" ]; then
        cp /app/nginx.conf /etc/nginx/sites-available/crewlife
        ln -sf /etc/nginx/sites-available/crewlife /etc/nginx/sites-enabled/
        rm -f /etc/nginx/sites-enabled/default
        success "Конфигурация nginx обновлена"
    fi
    
    # Настройка systemd сервисов
    if [ -d "/app/docker/services" ]; then
        cp /app/docker/services/* /etc/systemd/system/
        systemctl daemon-reload
        success "Systemd сервисы обновлены"
    fi
}

# Инициализация базы данных
init_database() {
    log "🗄️ Инициализация базы данных..."
    
    # Проверка подключения к БД
    if ! mysql -u crewlife_user -pandrei8002012 crewlife_prod -e "SELECT 1" > /dev/null 2>&1; then
        error "Не удается подключиться к базе данных"
    fi
    
    # Запуск миграций (если есть)
    if [ -f "/app/migrate_to_mariadb.py" ]; then
        python3 /app/migrate_to_mariadb.py
        success "Миграции выполнены"
    fi
    
    success "База данных инициализирована"
}

# Запуск сервисов
start_services() {
    log "🚀 Запуск сервисов..."
    
    # Запуск MariaDB
    systemctl start mariadb
    systemctl enable mariadb
    success "MariaDB запущен"
    
    # Запуск nginx
    systemctl start nginx
    systemctl enable nginx
    success "Nginx запущен"
    
    # Запуск мониторинга
    systemctl start crewlife-web-monitor
    systemctl start crewlife-system-monitor
    systemctl enable crewlife-web-monitor
    systemctl enable crewlife-system-monitor
    success "Сервисы мониторинга запущены"
}

# Проверка развертывания
verify_deployment() {
    log "✅ Проверка развертывания..."
    
    # Проверка API
    sleep 10  # Ждем запуска сервисов
    
    if curl -f http://localhost:5001/api/stats > /dev/null 2>&1; then
        success "API мониторинга работает"
    else
        error "API мониторинга не отвечает"
    fi
    
    # Проверка nginx
    if curl -f http://localhost/ > /dev/null 2>&1; then
        success "Nginx работает"
    else
        warning "Nginx не отвечает"
    fi
    
    # Проверка базы данных
    if mysql -u crewlife_user -pandrei8002012 crewlife_prod -e "SELECT 1" > /dev/null 2>&1; then
        success "База данных доступна"
    else
        error "База данных недоступна"
    fi
}

# Очистка старых резервных копий
cleanup_backups() {
    log "🧹 Очистка старых резервных копий..."
    
    # Удаляем резервные копии старше 30 дней
    find "$BACKUP_DIR" -type d -name "crewlife_backup_*" -mtime +30 -exec rm -rf {} \;
    success "Старые резервные копии удалены"
}

# Отправка уведомлений
send_notifications() {
    log "🔔 Отправка уведомлений..."
    
    # Здесь можно добавить отправку уведомлений в Slack, Telegram и т.д.
    echo "Развертывание CrewLife в $ENVIRONMENT завершено успешно" | tee -a "$LOG_FILE"
    success "Уведомления отправлены"
}

# Основная функция
main() {
    log "🚀 Начало развертывания CrewLife в $ENVIRONMENT"
    log "Версия: $VERSION"
    
    check_permissions
    create_backup
    stop_services
    update_code
    install_dependencies
    setup_configuration
    init_database
    start_services
    verify_deployment
    cleanup_backups
    send_notifications
    
    success "🎉 Развертывание завершено успешно!"
    log "Время развертывания: $(date)"
}

# Обработка ошибок
trap 'error "Развертывание прервано с ошибкой"' ERR

# Запуск
main "$@"
