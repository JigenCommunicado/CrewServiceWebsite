#!/usr/bin/env python3
"""
Flask API для CrewLife Admin Panel с MariaDB
REST API для управления пользователями, заявками, настройками и логами
"""

from flask import Flask, request, jsonify, session
from flask_cors import CORS
from database_mysql import db
import json
import hashlib
import pymysql
from datetime import datetime, timedelta
import os

app = Flask(__name__)
app.secret_key = 'crewlife_admin_secret_key_2024'
CORS(app, supports_credentials=True)

# === АУТЕНТИФИКАЦИЯ ===

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Вход в систему"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'Email и пароль обязательны'}), 400
        
        # Поиск пользователя по employee_id (так как email нет в схеме)
        with db.get_connection() as conn:
            cursor = conn.cursor(pymysql.cursors.DictCursor)
            
            cursor.execute('''
                SELECT id, employee_id, full_name, position, location, 
                       password, is_active
                FROM users WHERE employee_id = %s AND is_active = 1
            ''', (email,))  # Используем email как employee_id для совместимости
            
            user = cursor.fetchone()
            
            if not user:
                return jsonify({'error': 'Пользователь не найден'}), 401
            
            # Проверка пароля с bcrypt
            import bcrypt
            if not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                return jsonify({'error': 'Неверный пароль'}), 401
            
            # Обновление времени последнего входа
            cursor.execute('''
                UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = %s
            ''', (user['id'],))
            
            # Запись в лог
            cursor.execute('''
                INSERT INTO logs (user_id, action, details, created_at)
                VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
            ''', (user['id'], 'login', f"Вход в систему: {user['full_name']}"))
            
            conn.commit()
            
            # Удаление пароля из ответа
            del user['password']
            
            # Сохранение в сессии
            session['user_id'] = user['id']
            session['user_role'] = 'admin' if user['employee_id'] == 'andrei8002011' else 'user'  # Простая логика ролей
            
            return jsonify({
                'success': True,
                'user': user,
                'message': 'Успешный вход в систему'
            })
            
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Выход из системы"""
    try:
        user_id = session.get('user_id')
        if user_id:
            # Запись в лог
            with db.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO logs (user_id, action, details, created_at)
                    VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                ''', (user_id, 'logout', 'Выход из системы'))
                conn.commit()
        
        session.clear()
        return jsonify({'success': True, 'message': 'Успешный выход из системы'})
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    """Проверка аутентификации"""
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'authenticated': False}), 401
    
    try:
        user = db.get_user_by_id(user_id)
        if not user:
            session.clear()
            return jsonify({'authenticated': False}), 401
        
        return jsonify({
            'authenticated': True,
            'user': user
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

# === УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ===

@app.route('/api/users', methods=['GET'])
def get_users():
    """Получение списка пользователей"""
    try:
        # Проверка аутентификации
        if not session.get('user_id'):
            return jsonify({'error': 'Необходима аутентификация'}), 401
        
        # Параметры запроса
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        search = request.args.get('search', '')
        
        users = db.get_users(limit=limit, offset=offset, search=search)
        
        return jsonify({
            'success': True,
            'users': users,
            'total': len(users)
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    """Создание нового пользователя"""
    try:
        # Проверка аутентификации и прав
        if not session.get('user_id') or session.get('user_role') != 'admin':
            return jsonify({'error': 'Недостаточно прав'}), 403
        
        data = request.get_json()
        
        # Валидация данных
        required_fields = ['employee_id', 'full_name', 'position', 'location', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Поле {field} обязательно'}), 400
        
        # Проверка уникальности employee_id
        with db.get_connection() as conn:
            cursor = conn.cursor()
            
            # Проверка employee_id
            cursor.execute('SELECT id FROM users WHERE employee_id = %s', (data['employee_id'],))
            if cursor.fetchone():
                return jsonify({'error': 'Пользователь с таким табельным номером уже существует'}), 400
        
        user_id = db.create_user(data)
        
        return jsonify({
            'success': True,
            'user_id': user_id,
            'message': 'Пользователь успешно создан'
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Получение пользователя по ID"""
    try:
        if not session.get('user_id'):
            return jsonify({'error': 'Необходима аутентификация'}), 401
        
        user = db.get_user_by_id(user_id)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        return jsonify({
            'success': True,
            'user': user
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Обновление пользователя"""
    try:
        if not session.get('user_id') or session.get('user_role') != 'admin':
            return jsonify({'error': 'Недостаточно прав'}), 403
        
        data = request.get_json()
        
        success = db.update_user(user_id, data)
        if not success:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Пользователь успешно обновлен'
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Удаление пользователя"""
    try:
        if not session.get('user_id') or session.get('user_role') != 'admin':
            return jsonify({'error': 'Недостаточно прав'}), 403
        
        success = db.delete_user(user_id)
        if not success:
            return jsonify({'error': 'Пользователь не найден'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Пользователь успешно удален'
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

# === УПРАВЛЕНИЕ ЗАЯВКАМИ ===

@app.route('/api/requests', methods=['GET'])
def get_requests():
    """Получение списка заявок"""
    try:
        if not session.get('user_id'):
            return jsonify({'error': 'Необходима аутентификация'}), 401
        
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        status = request.args.get('status')
        user_id = request.args.get('user_id', type=int)
        
        requests = db.get_requests(limit=limit, offset=offset, status=status, user_id=user_id)
        
        return jsonify({
            'success': True,
            'requests': requests,
            'total': len(requests)
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/requests', methods=['POST'])
def create_request():
    """Создание новой заявки"""
    try:
        if not session.get('user_id'):
            return jsonify({'error': 'Необходима аутентификация'}), 401
        
        data = request.get_json()
        data['user_id'] = session['user_id']  # Автоматически назначаем текущего пользователя
        
        request_id = db.create_request(data)
        
        return jsonify({
            'success': True,
            'request_id': request_id,
            'message': 'Заявка успешно создана'
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/requests/<int:request_id>/status', methods=['PUT'])
def update_request_status(request_id):
    """Обновление статуса заявки"""
    try:
        if not session.get('user_id') or session.get('user_role') != 'admin':
            return jsonify({'error': 'Недостаточно прав'}), 403
        
        data = request.get_json()
        status = data.get('status')
        assigned_to = data.get('assigned_to')
        
        if not status:
            return jsonify({'error': 'Статус обязателен'}), 400
        
        success = db.update_request_status(request_id, status, assigned_to)
        if not success:
            return jsonify({'error': 'Заявка не найдена'}), 404
        
        return jsonify({
            'success': True,
            'message': 'Статус заявки обновлен'
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

# === УПРАВЛЕНИЕ НАСТРОЙКАМИ ===

@app.route('/api/settings', methods=['GET'])
def get_settings():
    """Получение всех настроек"""
    try:
        if not session.get('user_id'):
            return jsonify({'error': 'Необходима аутентификация'}), 401
        
        settings = db.get_all_settings()
        
        return jsonify({
            'success': True,
            'settings': settings
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/settings/<key>', methods=['GET'])
def get_setting(key):
    """Получение настройки по ключу"""
    try:
        if not session.get('user_id'):
            return jsonify({'error': 'Необходима аутентификация'}), 401
        
        value = db.get_setting(key)
        if value is None:
            return jsonify({'error': 'Настройка не найдена'}), 404
        
        return jsonify({
            'success': True,
            'key': key,
            'value': value
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

@app.route('/api/settings/<key>', methods=['PUT'])
def update_setting(key):
    """Обновление настройки"""
    try:
        if not session.get('user_id') or session.get('user_role') != 'admin':
            return jsonify({'error': 'Недостаточно прав'}), 403
        
        data = request.get_json()
        value = data.get('value')
        description = data.get('description')
        category = data.get('category', 'general')
        
        if value is None:
            return jsonify({'error': 'Значение обязательно'}), 400
        
        success = db.set_setting(key, value, description, category)
        
        return jsonify({
            'success': True,
            'message': 'Настройка обновлена'
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

# === УПРАВЛЕНИЕ ЛОГАМИ ===

@app.route('/api/logs', methods=['GET'])
def get_logs():
    """Получение логов"""
    try:
        if not session.get('user_id'):
            return jsonify({'error': 'Необходима аутентификация'}), 401
        
        limit = int(request.args.get('limit', 100))
        offset = int(request.args.get('offset', 0))
        user_id = request.args.get('user_id', type=int)
        action = request.args.get('action')
        
        logs = db.get_logs(limit=limit, offset=offset, user_id=user_id, action=action)
        
        return jsonify({
            'success': True,
            'logs': logs,
            'total': len(logs)
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

# === СТАТИСТИКА ===

@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Получение статистики для дашборда"""
    try:
        if not session.get('user_id'):
            return jsonify({'error': 'Необходима аутентификация'}), 401
        
        stats = db.get_dashboard_stats()
        
        return jsonify({
            'success': True,
            'stats': stats
        })
        
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500

# === ОБРАБОТКА ОШИБОК ===

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Эндпоинт не найден'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Внутренняя ошибка сервера'}), 500

if __name__ == '__main__':
    # Создание директории для данных
    os.makedirs('data', exist_ok=True)
    
    # Запуск сервера
    app.run(host='0.0.0.0', port=5000, debug=True)



