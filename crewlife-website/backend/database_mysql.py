#!/usr/bin/env python3
"""
MariaDB база данных для CrewLife Admin Panel
Управление пользователями, заявками, настройками и логами
"""

import pymysql
import json
import hashlib
import datetime
from typing import List, Dict, Optional, Any
import os

class CrewLifeDatabase:
    def __init__(self, host='localhost', user='crewlife_user', password='andrei8002012', database='crewlife_prod'):
        self.connection_config = {
            'host': host,
            'user': user,
            'password': password,
            'database': database,
            'charset': 'utf8mb4',
            'autocommit': True
        }
        self.init_database()
    
    def get_connection(self):
        """Получение соединения с базой данных"""
        return pymysql.connect(**self.connection_config)
    
    def init_database(self):
        """Инициализация базы данных и создание таблиц"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Таблица пользователей (используем существующую структуру)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                    employee_id VARCHAR(50) UNIQUE NOT NULL,
                    full_name VARCHAR(255) NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    position VARCHAR(100) NOT NULL,
                    location VARCHAR(100) NOT NULL,
                    is_active TINYINT(1) DEFAULT 1,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ''')
            
            # Таблица заявок
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS requests (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(36) NOT NULL,
                    request_type VARCHAR(100) NOT NULL,
                    title VARCHAR(255) NOT NULL,
                    description TEXT,
                    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
                    status ENUM('pending', 'in_progress', 'resolved', 'closed') DEFAULT 'pending',
                    assigned_to VARCHAR(36) NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    resolved_at TIMESTAMP NULL,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
                    FOREIGN KEY (assigned_to) REFERENCES users (id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ''')
            
            # Таблица настроек системы
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS settings (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    setting_key VARCHAR(100) UNIQUE NOT NULL,
                    setting_value TEXT NOT NULL,
                    description TEXT,
                    category VARCHAR(50) DEFAULT 'general',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ''')
            
            # Таблица логов
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS logs (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    user_id VARCHAR(36) NULL,
                    action VARCHAR(100) NOT NULL,
                    details TEXT,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ''')
            
            # Создание индексов для оптимизации
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_employee_id ON users(employee_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at)')
            
            # Вставка начальных настроек
            self._insert_default_settings(cursor)
            
            # Создание администратора по умолчанию
            self._create_default_admin(cursor)
            
            conn.commit()
    
    def _insert_default_settings(self, cursor):
        """Вставка настроек по умолчанию"""
        default_settings = [
            ('site_name', 'CrewLife', 'Название сайта', 'general'),
            ('site_description', 'Система управления заявками экипажа', 'Описание сайта', 'general'),
            ('max_file_size', '10485760', 'Максимальный размер файла (байты)', 'uploads'),
            ('allowed_file_types', 'jpg,jpeg,png,pdf,doc,docx', 'Разрешенные типы файлов', 'uploads'),
            ('email_notifications', 'true', 'Email уведомления', 'notifications'),
            ('auto_assign_requests', 'false', 'Автоматическое назначение заявок', 'requests'),
            ('request_timeout_days', '7', 'Таймаут заявки (дни)', 'requests'),
            ('backup_enabled', 'true', 'Автоматическое резервное копирование', 'backup'),
            ('backup_interval_hours', '24', 'Интервал резервного копирования (часы)', 'backup'),
        ]
        
        for key, value, description, category in default_settings:
            cursor.execute('''
                INSERT IGNORE INTO settings (setting_key, setting_value, description, category)
                VALUES (%s, %s, %s, %s)
            ''', (key, value, description, category))
    
    def _create_default_admin(self, cursor):
        """Создание администратора по умолчанию"""
        import bcrypt
        admin_password = bcrypt.hashpw('andrei8002012'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        cursor.execute('''
            INSERT IGNORE INTO users 
            (employee_id, full_name, position, location, password, is_active)
            VALUES (%s, %s, %s, %s, %s, %s)
        ''', ('andrei8002011', 'Администратор Системы', 'Системный администратор', 'Москва', 
              admin_password, 1))
    
    def _hash_password(self, password: str) -> str:
        """Хеширование пароля с использованием bcrypt"""
        import bcrypt
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    # === УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ===
    
    def create_user(self, user_data: Dict[str, Any]) -> int:
        """Создание нового пользователя"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            password_hash = self._hash_password(user_data['password'])
            
            cursor.execute('''
                INSERT INTO users 
                (employee_id, full_name, position, location, password, is_active)
                VALUES (%s, %s, %s, %s, %s, %s)
            ''', (
                user_data['employee_id'],
                user_data['full_name'],
                user_data['position'],
                user_data['location'],
                password_hash,
                user_data.get('is_active', 1)
            ))
            
            user_id = cursor.lastrowid
            self._log_action(cursor, user_id, 'user_created', f"Создан пользователь {user_data['full_name']}")
            
            return user_id
    
    def get_users(self, limit: int = 100, offset: int = 0, search: str = None) -> List[Dict]:
        """Получение списка пользователей"""
        with self.get_connection() as conn:
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            query = '''
                SELECT id, employee_id, full_name, position, location, 
                       is_active, created_at, last_login
                FROM users
            '''
            params = []
            
            if search:
                query += '''
                    WHERE full_name LIKE %s OR 
                          employee_id LIKE %s OR position LIKE %s
                '''
                search_term = f"%{search}%"
                params = [search_term] * 3
            
            query += ' ORDER BY created_at DESC LIMIT %s OFFSET %s'
            params.extend([limit, offset])
            
            cursor.execute(query, params)
            return cursor.fetchall()
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Получение пользователя по ID"""
        with self.get_connection() as conn:
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            cursor.execute('''
                SELECT id, employee_id, full_name, position, location, 
                       is_active, created_at, last_login
                FROM users WHERE id = %s
            ''', (user_id,))
            
            return cursor.fetchone()
    
    def update_user(self, user_id: int, user_data: Dict[str, Any]) -> bool:
        """Обновление пользователя"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Подготовка данных для обновления
            update_fields = []
            params = []
            
            for field in ['full_name', 'position', 'location', 'is_active']:
                if field in user_data:
                    update_fields.append(f"{field} = %s")
                    params.append(user_data[field])
            
            if 'password' in user_data:
                update_fields.append("password = %s")
                params.append(self._hash_password(user_data['password']))
            
            if not update_fields:
                return False
            
            params.append(user_id)
            
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = %s"
            cursor.execute(query, params)
            
            self._log_action(cursor, user_id, 'user_updated', f"Обновлен пользователь ID {user_id}")
            
            return cursor.rowcount > 0
    
    def delete_user(self, user_id: int) -> bool:
        """Удаление пользователя"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Получаем информацию о пользователе перед удалением
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            cursor.execute('DELETE FROM users WHERE id = %s', (user_id,))
            
            self._log_action(cursor, user_id, 'user_deleted', 
                           f"Удален пользователь {user['full_name']}")
            
            return cursor.rowcount > 0
    
    # === УПРАВЛЕНИЕ ЗАЯВКАМИ ===
    
    def create_request(self, request_data: Dict[str, Any]) -> int:
        """Создание новой заявки"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO requests 
                (user_id, request_type, title, description, priority, status, assigned_to)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            ''', (
                request_data['user_id'],
                request_data['request_type'],
                request_data['title'],
                request_data.get('description', ''),
                request_data.get('priority', 'medium'),
                request_data.get('status', 'pending'),
                request_data.get('assigned_to')
            ))
            
            request_id = cursor.lastrowid
            self._log_action(cursor, request_data['user_id'], 'request_created', 
                           f"Создана заявка: {request_data['title']}")
            
            return request_id
    
    def get_requests(self, limit: int = 100, offset: int = 0, status: str = None, 
                    user_id: int = None) -> List[Dict]:
        """Получение списка заявок"""
        with self.get_connection() as conn:
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            query = '''
                SELECT r.id, r.user_id, r.request_type, r.title, r.description, 
                       r.priority, r.status, r.assigned_to, r.created_at, r.updated_at, r.resolved_at,
                       u.full_name, u.employee_id,
                       a.full_name as assigned_full_name
                FROM requests r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN users a ON r.assigned_to = a.id
            '''
            params = []
            conditions = []
            
            if status:
                conditions.append("r.status = %s")
                params.append(status)
            
            if user_id:
                conditions.append("r.user_id = %s")
                params.append(user_id)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY r.created_at DESC LIMIT %s OFFSET %s"
            params.extend([limit, offset])
            
            cursor.execute(query, params)
            return cursor.fetchall()
    
    def update_request_status(self, request_id: int, status: str, assigned_to: int = None) -> bool:
        """Обновление статуса заявки"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            update_fields = ["status = %s"]
            params = [status]
            
            if assigned_to:
                update_fields.append("assigned_to = %s")
                params.append(assigned_to)
            
            if status in ['resolved', 'closed']:
                update_fields.append("resolved_at = CURRENT_TIMESTAMP")
            
            params.append(request_id)
            
            query = f"UPDATE requests SET {', '.join(update_fields)} WHERE id = %s"
            cursor.execute(query, params)
            
            self._log_action(cursor, None, 'request_updated', 
                           f"Обновлен статус заявки ID {request_id} на {status}")
            
            return cursor.rowcount > 0
    
    # === УПРАВЛЕНИЕ НАСТРОЙКАМИ ===
    
    def get_setting(self, key: str) -> Optional[str]:
        """Получение настройки по ключу"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT setting_value FROM settings WHERE setting_key = %s', (key,))
            result = cursor.fetchone()
            return result[0] if result else None
    
    def set_setting(self, key: str, value: str, description: str = None, category: str = 'general') -> bool:
        """Установка настройки"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO settings (setting_key, setting_value, description, category)
                VALUES (%s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE 
                setting_value = VALUES(setting_value),
                description = VALUES(description),
                category = VALUES(category),
                updated_at = CURRENT_TIMESTAMP
            ''', (key, value, description, category))
            
            self._log_action(cursor, None, 'setting_updated', f"Обновлена настройка: {key}")
            
            return True
    
    def get_all_settings(self) -> List[Dict]:
        """Получение всех настроек"""
        with self.get_connection() as conn:
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            cursor.execute('''
                SELECT setting_key as key, setting_value as value, description, category, updated_at
                FROM settings ORDER BY category, setting_key
            '''
            )
            
            return cursor.fetchall()
    
    # === УПРАВЛЕНИЕ ЛОГАМИ ===
    
    def _log_action(self, cursor, user_id: Optional[int], action: str, details: str = None):
        """Запись действия в лог"""
        cursor.execute('''
            INSERT INTO logs (user_id, action, details, created_at)
            VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
        ''', (user_id, action, details))
    
    def get_logs(self, limit: int = 100, offset: int = 0, user_id: int = None, 
                action: str = None) -> List[Dict]:
        """Получение логов"""
        with self.get_connection() as conn:
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            query = '''
                SELECT l.id, l.user_id, l.action, l.details, l.ip_address, l.user_agent, l.created_at,
                       u.full_name, u.employee_id
                FROM logs l
                LEFT JOIN users u ON l.user_id = u.id
            '''
            params = []
            conditions = []
            
            if user_id:
                conditions.append("l.user_id = %s")
                params.append(user_id)
            
            if action:
                conditions.append("l.action = %s")
                params.append(action)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY l.created_at DESC LIMIT %s OFFSET %s"
            params.extend([limit, offset])
            
            cursor.execute(query, params)
            return cursor.fetchall()
    
    # === СТАТИСТИКА ===
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Получение статистики для дашборда"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            
            # Общее количество пользователей
            cursor.execute('SELECT COUNT(*) FROM users WHERE is_active = 1')
            total_users = cursor.fetchone()[0]
            
            # Общее количество заявок
            cursor.execute('SELECT COUNT(*) FROM requests')
            total_requests = cursor.fetchone()[0]
            
            # Заявки в обработке
            cursor.execute('SELECT COUNT(*) FROM requests WHERE status = "pending"')
            pending_requests = cursor.fetchone()[0]
            
            # Новые заявки за последние 24 часа
            cursor.execute('''
                SELECT COUNT(*) FROM requests 
                WHERE created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)
            ''')
            new_requests = cursor.fetchone()[0]
            
            return {
                'total_users': total_users,
                'total_requests': total_requests,
                'pending_requests': pending_requests,
                'new_requests': new_requests
            }

# Создание экземпляра базы данных
db = CrewLifeDatabase()



