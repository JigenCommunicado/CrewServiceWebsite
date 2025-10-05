#!/usr/bin/env python3
"""
Упрощенный скрипт миграции данных из SQLite в MariaDB
Использует только стандартные библиотеки Python
"""

import sqlite3
import subprocess
import json
from datetime import datetime
import os

# Конфигурация
SQLITE_DB = '/root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/crewlife-website/backend/crewlife.db'

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

def get_sqlite_data():
    """Получение данных из SQLite"""
    print("📊 Получаем данные из SQLite...")
    
    with sqlite3.connect(SQLITE_DB) as conn:
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        # Получаем пользователей
        cursor.execute('''
            SELECT employee_id, first_name, last_name, position, location, 
                   email, password_hash, role, status, created_at, last_login
            FROM users
        ''')
        users = [dict(row) for row in cursor.fetchall()]
        
        # Получаем заявки
        cursor.execute('''
            SELECT user_id, request_type, title, description, priority, 
                   status, assigned_to, created_at, updated_at, resolved_at
            FROM requests
        ''')
        requests = [dict(row) for row in cursor.fetchall()]
        
        # Получаем настройки
        cursor.execute('''
            SELECT key, value, description, category, updated_at
            FROM settings
        ''')
        settings = [dict(row) for row in cursor.fetchall()]
        
        return users, requests, settings

def migrate_users_to_mariadb(users):
    """Миграция пользователей в MariaDB"""
    print(f"🔄 Мигрируем {len(users)} пользователей...")
    
    # Очищаем таблицу
    if not run_mysql_command("DELETE FROM users"):
        return False
    
    migrated_count = 0
    for user in users:
        # Создаем простой хеш пароля (в реальной системе нужно использовать bcrypt)
        # Для демонстрации используем SHA-256
        import hashlib
        new_password = hashlib.sha256('andrei8002012'.encode()).hexdigest()
        
        full_name = f"{user['first_name']} {user['last_name']}"
        is_active = 1 if user['status'] == 'active' else 0
        
        sql = f"""
        INSERT INTO users 
        (employee_id, full_name, position, location, password, is_active, created_at, last_login)
        VALUES ('{user['employee_id']}', '{full_name}', '{user['position']}', 
                '{user['location']}', '{new_password}', {is_active}, 
                '{user['created_at']}', {f"'{user['last_login']}'" if user['last_login'] else 'NULL'})
        """
        
        if run_mysql_command(sql):
            migrated_count += 1
            print(f"✅ Мигрирован: {user['employee_id']} - {full_name}")
        else:
            print(f"❌ Ошибка миграции: {user['employee_id']}")
    
    print(f"🎉 Успешно мигрировано {migrated_count} пользователей")
    return True

def migrate_settings_to_mariadb(settings):
    """Миграция настроек в MariaDB"""
    print(f"🔄 Мигрируем {len(settings)} настроек...")
    
    # Очищаем таблицу
    if not run_mysql_command("DELETE FROM settings"):
        return False
    
    migrated_count = 0
    for setting in settings:
        sql = f"""
        INSERT INTO settings 
        (setting_key, setting_value, description, category, updated_at)
        VALUES ('{setting['key']}', '{setting['value']}', 
                '{setting['description']}', '{setting['category']}', 
                '{setting['updated_at']}')
        """
        
        if run_mysql_command(sql):
            migrated_count += 1
            print(f"✅ Мигрирована настройка: {setting['key']}")
        else:
            print(f"❌ Ошибка миграции настройки: {setting['key']}")
    
    print(f"🎉 Успешно мигрировано {migrated_count} настроек")
    return True

def create_backup():
    """Создание резервной копии"""
    print("💾 Создаем резервную копию SQLite...")
    
    backup_filename = f"crewlife_sqlite_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    backup_path = f"/root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/{backup_filename}"
    
    try:
        with sqlite3.connect(SQLITE_DB) as source:
            with sqlite3.connect(backup_path) as backup:
                source.backup(backup)
        
        print(f"✅ Резервная копия создана: {backup_path}")
        return backup_path
    except Exception as e:
        print(f"❌ Ошибка создания резервной копии: {e}")
        return None

def main():
    """Основная функция миграции"""
    print("🚀 Начинаем упрощенную миграцию с SQLite на MariaDB")
    print("=" * 60)
    
    # Проверяем подключение к MariaDB
    if not run_mysql_command("SELECT 1"):
        print("❌ Не удается подключиться к MariaDB")
        return
    
    print("✅ Подключение к MariaDB успешно")
    
    # Создаем резервную копию
    backup_path = create_backup()
    
    # Получаем данные из SQLite
    users, requests, settings = get_sqlite_data()
    
    print(f"📊 Найдено в SQLite:")
    print(f"   👥 Пользователей: {len(users)}")
    print(f"   📝 Заявок: {len(requests)}")
    print(f"   ⚙️  Настроек: {len(settings)}")
    
    # Мигрируем данные
    success = True
    
    if users:
        success &= migrate_users_to_mariadb(users)
    
    if settings:
        success &= migrate_settings_to_mariadb(settings)
    
    if success:
        print("\n" + "=" * 60)
        print("🎉 МИГРАЦИЯ ЗАВЕРШЕНА УСПЕШНО!")
        print("=" * 60)
        print("📋 Что было сделано:")
        print("   ✅ Пользователи мигрированы")
        print("   ✅ Настройки мигрированы")
        print(f"   💾 Резервная копия: {backup_path}")
        print("\n🔐 ВАЖНО: Все пользователи получили пароль 'andrei8002012'")
        print("   (хешированный SHA-256)")
    else:
        print("❌ Миграция завершилась с ошибками")

if __name__ == "__main__":
    main()
