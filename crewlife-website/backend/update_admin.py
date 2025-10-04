#!/usr/bin/env python3
"""
Скрипт для обновления данных администратора в базе данных CrewLife
"""

import sqlite3
import hashlib
import os

def hash_password(password: str) -> str:
    """Хеширование пароля"""
    return hashlib.sha256(password.encode()).hexdigest()

def update_admin_credentials():
    """Обновление данных администратора"""
    db_path = "crewlife.db"
    
    if not os.path.exists(db_path):
        print("❌ База данных не найдена. Создайте базу данных сначала.")
        return False
    
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            
            # Проверяем, есть ли старый администратор
            cursor.execute('SELECT id, employee_id, email FROM users WHERE role = "admin"')
            admin_user = cursor.fetchone()
            
            if admin_user:
                admin_id, old_employee_id, old_email = admin_user
                print(f"📋 Найден администратор: ID={admin_id}, Employee ID={old_employee_id}, Email={old_email}")
                
                # Обновляем данные администратора
                new_password_hash = hash_password('andrei8002012')
                cursor.execute('''
                    UPDATE users 
                    SET employee_id = ?, email = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                ''', ('andrei8002011', 'andrei8002011@crewlife.ru', new_password_hash, admin_id))
                
                print("✅ Данные администратора обновлены:")
                print(f"   Новый Employee ID: andrei8002011")
                print(f"   Новый Email: andrei8002011@crewlife.ru")
                print(f"   Новый пароль: andrei8002012")
                
                conn.commit()
                return True
            else:
                print("❌ Администратор не найден в базе данных")
                return False
                
    except Exception as e:
        print(f"❌ Ошибка при обновлении: {e}")
        return False

if __name__ == "__main__":
    print("🔄 Обновление данных администратора CrewLife...")
    success = update_admin_credentials()
    
    if success:
        print("\n🎉 Обновление завершено успешно!")
        print("\n📋 Новые данные для входа в админ-панель:")
        print("   Email: andrei8002011@crewlife.ru")
        print("   Пароль: andrei8002012")
    else:
        print("\n❌ Обновление не удалось")
