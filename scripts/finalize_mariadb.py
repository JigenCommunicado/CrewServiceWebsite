#!/usr/bin/env python3
"""
Финальная настройка системы для продакшена с MariaDB
"""

import subprocess
import os

def run_mysql_command(sql):
    """Выполнение SQL команды в MariaDB"""
    try:
        cmd = f"mysql -u crewlife_user -pandrei8002012 crewlife_prod -e \"{sql}\""
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ Ошибка SQL: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"❌ Ошибка выполнения команды: {e}")
        return False

def create_production_config():
    """Создание конфигурации для продакшена"""
    print("⚙️  Создаем конфигурацию для продакшена...")
    
    config_content = """# CrewLife Production Configuration
# MariaDB Configuration
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crewlife_prod
DB_USER=crewlife_user
DB_PASSWORD=andrei8002012

# Security
JWT_SECRET=crewlife_production_secret_key_2024_change_this
BCRYPT_SALT_ROUNDS=12

# Server Configuration
NODE_ENV=production
DEBUG=false
LOG_LEVEL=info

# API Configuration
API_HOST=0.0.0.0
API_PORT=5000
CORS_ORIGIN=https://crewlife.ru

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_INTERVAL_HOURS=24
BACKUP_RETENTION_DAYS=30
"""
    
    try:
        with open('.env.production', 'w') as f:
            f.write(config_content)
        print("✅ Конфигурация продакшена создана: .env.production")
        return True
    except Exception as e:
        print(f"❌ Ошибка создания конфигурации: {e}")
        return False

def update_api_to_use_mariadb():
    """Обновление API для использования MariaDB"""
    print("🔄 Обновляем API для использования MariaDB...")
    
    try:
        api_path = "/root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/crewlife-website/backend/api.py"
        mariadb_api_path = "/root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/crewlife-website/backend/api_mysql.py"
        
        # Создаем резервную копию оригинального API
        subprocess.run(f"cp {api_path} {api_path}.sqlite_backup", shell=True)
        print("💾 Резервная копия SQLite API создана")
        
        # Копируем MariaDB API как основной
        subprocess.run(f"cp {mariadb_api_path} {api_path}", shell=True)
        print("✅ API обновлен для использования MariaDB")
        return True
    except Exception as e:
        print(f"❌ Ошибка обновления API: {e}")
        return False

def test_mariadb_connection():
    """Тестирование подключения к MariaDB"""
    print("🧪 Тестируем подключение к MariaDB...")
    
    if run_mysql_command("SELECT COUNT(*) as total_users FROM users"):
        print("✅ Подключение к MariaDB работает")
        return True
    else:
        print("❌ Ошибка подключения к MariaDB")
        return False

def create_startup_script():
    """Создание скрипта запуска для продакшена"""
    print("📝 Создаем скрипт запуска для продакшена...")
    
    script_content = """#!/bin/bash
# CrewLife Production Startup Script

echo "🚀 Запуск CrewLife в режиме продакшена..."

# Проверяем MariaDB
if ! systemctl is-active --quiet mariadb; then
    echo "❌ MariaDB не запущен. Запускаем..."
    systemctl start mariadb
fi

# Проверяем подключение к базе данных
if ! mysql -u crewlife_user -pandrei8002012 crewlife_prod -e "SELECT 1" > /dev/null 2>&1; then
    echo "❌ Не удается подключиться к базе данных"
    exit 1
fi

echo "✅ База данных готова"

# Запускаем API сервер
cd /root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/crewlife-website/backend
echo "🌐 Запускаем API сервер на порту 5000..."
python3 api.py

echo "🎉 CrewLife запущен в режиме продакшена!"
"""
    
    try:
        with open('start_production.sh', 'w') as f:
            f.write(script_content)
        
        # Делаем скрипт исполняемым
        subprocess.run('chmod +x start_production.sh', shell=True)
        print("✅ Скрипт запуска создан: start_production.sh")
        return True
    except Exception as e:
        print(f"❌ Ошибка создания скрипта: {e}")
        return False

def main():
    """Основная функция финализации"""
    print("🚀 Финальная настройка системы для продакшена")
    print("=" * 60)
    
    # Тестируем подключение
    if not test_mariadb_connection():
        print("❌ Не удается подключиться к MariaDB")
        return
    
    # Создаем конфигурацию
    if not create_production_config():
        print("❌ Ошибка создания конфигурации")
        return
    
    # Обновляем API
    if not update_api_to_use_mariadb():
        print("❌ Ошибка обновления API")
        return
    
    # Создаем скрипт запуска
    if not create_startup_script():
        print("❌ Ошибка создания скрипта запуска")
        return
    
    print("\n" + "=" * 60)
    print("🎉 СИСТЕМА ГОТОВА К ПРОДАКШЕНУ!")
    print("=" * 60)
    print("📋 Что было сделано:")
    print("   ✅ Данные мигрированы в MariaDB")
    print("   ✅ API обновлен для использования MariaDB")
    print("   ✅ Создана конфигурация продакшена")
    print("   ✅ Создан скрипт запуска")
    print("   💾 Резервные копии созданы")
    
    print("\n🔐 ТЕКУЩИЕ УЧЕТНЫЕ ДАННЫЕ:")
    print("   👤 Пользователь: andrei8002011")
    print("   🔑 Пароль: andrei8002012")
    print("   👤 Пользователь: ADMIN001")
    print("   🔑 Пароль: andrei8002012")
    
    print("\n🚀 ДЛЯ ЗАПУСКА ПРОДАКШЕНА:")
    print("   ./start_production.sh")
    print("\n📊 ДЛЯ ПРОВЕРКИ БАЗЫ ДАННЫХ:")
    print("   mysql -u crewlife_user -pandrei8002012 crewlife_prod")
    
    print("\n⚠️  РЕКОМЕНДАЦИИ:")
    print("   • Измените пароли после первого входа")
    print("   • Настройте SSL сертификаты")
    print("   • Настройте регулярное резервное копирование")
    print("   • Обновите JWT_SECRET в .env.production")

if __name__ == "__main__":
    main()
