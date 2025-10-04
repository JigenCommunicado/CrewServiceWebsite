#!/usr/bin/env python3
"""
SQLite база данных для CrewLife Admin Panel
Управление пользователями, заявками, настройками и логами
"""

import sqlite3
import json
import hashlib
import datetime
from typing import List, Dict, Optional, Any
import os

class CrewLifeDatabase:
    def __init__(self, db_path: str = "crewlife.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Инициализация базы данных и создание таблиц"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Таблица пользователей
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    employee_id TEXT UNIQUE NOT NULL,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    position TEXT NOT NULL,
                    location TEXT NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'user',
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Таблица заявок
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    request_type TEXT NOT NULL,
                    title TEXT NOT NULL,
                    description TEXT,
                    priority TEXT DEFAULT 'medium',
                    status TEXT DEFAULT 'pending',
                    assigned_to INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    resolved_at TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    FOREIGN KEY (assigned_to) REFERENCES users (id)
                )
            ''')
            
            # Таблица настроек системы
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    key TEXT UNIQUE NOT NULL,
                    value TEXT NOT NULL,
                    description TEXT,
                    category TEXT DEFAULT 'general',
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Таблица логов
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    action TEXT NOT NULL,
                    details TEXT,
                    ip_address TEXT,
                    user_agent TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Создание индексов для оптимизации
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
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
                INSERT OR IGNORE INTO settings (key, value, description, category)
                VALUES (?, ?, ?, ?)
            ''', (key, value, description, category))
    
    def _create_default_admin(self, cursor):
        """Создание администратора по умолчанию"""
        admin_password = self._hash_password('andrei8002012')
        cursor.execute('''
            INSERT OR IGNORE INTO users 
            (employee_id, first_name, last_name, position, location, email, password_hash, role, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', ('andrei8002011', 'Администратор', 'Системы', 'Системный администратор', 'Москва', 
              'andrei8002011@crewlife.ru', admin_password, 'admin', 'active'))
    
    def _hash_password(self, password: str) -> str:
        """Хеширование пароля"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    # === УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ===
    
    def create_user(self, user_data: Dict[str, Any]) -> int:
        """Создание нового пользователя"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            password_hash = self._hash_password(user_data['password'])
            
            cursor.execute('''
                INSERT INTO users 
                (employee_id, first_name, last_name, position, location, email, password_hash, role, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                user_data['employee_id'],
                user_data['first_name'],
                user_data['last_name'],
                user_data['position'],
                user_data['location'],
                user_data['email'],
                password_hash,
                user_data.get('role', 'user'),
                user_data.get('status', 'active')
            ))
            
            user_id = cursor.lastrowid
            self._log_action(cursor, user_id, 'user_created', f"Создан пользователь {user_data['first_name']} {user_data['last_name']}")
            
            conn.commit()
            return user_id
    
    def get_users(self, limit: int = 100, offset: int = 0, search: str = None) -> List[Dict]:
        """Получение списка пользователей"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = '''
                SELECT id, employee_id, first_name, last_name, position, location, 
                       email, role, status, created_at, last_login, updated_at
                FROM users
            '''
            params = []
            
            if search:
                query += '''
                    WHERE first_name LIKE ? OR last_name LIKE ? OR 
                          employee_id LIKE ? OR email LIKE ? OR position LIKE ?
                '''
                search_term = f"%{search}%"
                params = [search_term] * 5
            
            query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
            params.extend([limit, offset])
            
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        """Получение пользователя по ID"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, employee_id, first_name, last_name, position, location, 
                       email, role, status, created_at, last_login, updated_at
                FROM users WHERE id = ?
            ''', (user_id,))
            
            row = cursor.fetchone()
            return dict(row) if row else None
    
    def update_user(self, user_id: int, user_data: Dict[str, Any]) -> bool:
        """Обновление пользователя"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Подготовка данных для обновления
            update_fields = []
            params = []
            
            for field in ['first_name', 'last_name', 'position', 'location', 'email', 'role', 'status']:
                if field in user_data:
                    update_fields.append(f"{field} = ?")
                    params.append(user_data[field])
            
            if 'password' in user_data:
                update_fields.append("password_hash = ?")
                params.append(self._hash_password(user_data['password']))
            
            if not update_fields:
                return False
            
            update_fields.append("updated_at = CURRENT_TIMESTAMP")
            params.append(user_id)
            
            query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, params)
            
            self._log_action(cursor, user_id, 'user_updated', f"Обновлен пользователь ID {user_id}")
            
            conn.commit()
            return cursor.rowcount > 0
    
    def delete_user(self, user_id: int) -> bool:
        """Удаление пользователя"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Получаем информацию о пользователе перед удалением
            user = self.get_user_by_id(user_id)
            if not user:
                return False
            
            cursor.execute('DELETE FROM users WHERE id = ?', (user_id,))
            
            self._log_action(cursor, user_id, 'user_deleted', 
                           f"Удален пользователь {user['first_name']} {user['last_name']}")
            
            conn.commit()
            return cursor.rowcount > 0
    
    # === УПРАВЛЕНИЕ ЗАЯВКАМИ ===
    
    def create_request(self, request_data: Dict[str, Any]) -> int:
        """Создание новой заявки"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO requests 
                (user_id, request_type, title, description, priority, status, assigned_to)
                VALUES (?, ?, ?, ?, ?, ?, ?)
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
            
            conn.commit()
            return request_id
    
    def get_requests(self, limit: int = 100, offset: int = 0, status: str = None, 
                    user_id: int = None) -> List[Dict]:
        """Получение списка заявок"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = '''
                SELECT r.id, r.user_id, r.request_type, r.title, r.description, 
                       r.priority, r.status, r.assigned_to, r.created_at, r.updated_at, r.resolved_at,
                       u.first_name, u.last_name, u.employee_id,
                       a.first_name as assigned_first_name, a.last_name as assigned_last_name
                FROM requests r
                LEFT JOIN users u ON r.user_id = u.id
                LEFT JOIN users a ON r.assigned_to = a.id
            '''
            params = []
            conditions = []
            
            if status:
                conditions.append("r.status = ?")
                params.append(status)
            
            if user_id:
                conditions.append("r.user_id = ?")
                params.append(user_id)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
    
    def update_request_status(self, request_id: int, status: str, assigned_to: int = None) -> bool:
        """Обновление статуса заявки"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            update_fields = ["status = ?", "updated_at = CURRENT_TIMESTAMP"]
            params = [status]
            
            if assigned_to:
                update_fields.append("assigned_to = ?")
                params.append(assigned_to)
            
            if status in ['resolved', 'closed']:
                update_fields.append("resolved_at = CURRENT_TIMESTAMP")
            
            params.append(request_id)
            
            query = f"UPDATE requests SET {', '.join(update_fields)} WHERE id = ?"
            cursor.execute(query, params)
            
            self._log_action(cursor, None, 'request_updated', 
                           f"Обновлен статус заявки ID {request_id} на {status}")
            
            conn.commit()
            return cursor.rowcount > 0
    
    # === УПРАВЛЕНИЕ НАСТРОЙКАМИ ===
    
    def get_setting(self, key: str) -> Optional[str]:
        """Получение настройки по ключу"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT value FROM settings WHERE key = ?', (key,))
            result = cursor.fetchone()
            return result[0] if result else None
    
    def set_setting(self, key: str, value: str, description: str = None, category: str = 'general') -> bool:
        """Установка настройки"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO settings (key, value, description, category, updated_at)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
            ''', (key, value, description, category))
            
            self._log_action(cursor, None, 'setting_updated', f"Обновлена настройка: {key}")
            
            conn.commit()
            return True
    
    def get_all_settings(self) -> List[Dict]:
        """Получение всех настроек"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT key, value, description, category, updated_at
                FROM settings ORDER BY category, key
            ''')
            
            return [dict(row) for row in cursor.fetchall()]
    
    # === УПРАВЛЕНИЕ ЛОГАМИ ===
    
    def _log_action(self, cursor, user_id: Optional[int], action: str, details: str = None):
        """Запись действия в лог"""
        cursor.execute('''
            INSERT INTO logs (user_id, action, details, created_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        ''', (user_id, action, details))
    
    def get_logs(self, limit: int = 100, offset: int = 0, user_id: int = None, 
                action: str = None) -> List[Dict]:
        """Получение логов"""
        with sqlite3.connect(self.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = '''
                SELECT l.id, l.user_id, l.action, l.details, l.ip_address, l.user_agent, l.created_at,
                       u.first_name, u.last_name, u.employee_id
                FROM logs l
                LEFT JOIN users u ON l.user_id = u.id
            '''
            params = []
            conditions = []
            
            if user_id:
                conditions.append("l.user_id = ?")
                params.append(user_id)
            
            if action:
                conditions.append("l.action = ?")
                params.append(action)
            
            if conditions:
                query += " WHERE " + " AND ".join(conditions)
            
            query += " ORDER BY l.created_at DESC LIMIT ? OFFSET ?"
            params.extend([limit, offset])
            
            cursor.execute(query, params)
            return [dict(row) for row in cursor.fetchall()]
    
    # === СТАТИСТИКА ===
    
    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Получение статистики для дашборда"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Общее количество пользователей
            cursor.execute('SELECT COUNT(*) FROM users WHERE status = "active"')
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
                WHERE created_at >= datetime('now', '-1 day')
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
