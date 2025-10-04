"""
Тесты для API модуля
"""
import pytest
import json
from unittest.mock import Mock, patch
import sys
import os

# Добавляем путь к модулям
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'crewlife-website', 'backend'))

from api_mysql import app


class TestCrewLifeAPI:
    """Тесты для CrewLife API"""
    
    @pytest.fixture
    def client(self):
        """Фикстура для тестового клиента Flask"""
        app.config['TESTING'] = True
        with app.test_client() as client:
            yield client
    
    @pytest.fixture
    def mock_db(self):
        """Мок базы данных"""
        mock_db = Mock()
        return mock_db
    
    def test_health_check(self, client):
        """Тест проверки здоровья API"""
        response = client.get('/api/health')
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['status'] == 'healthy'
    
    @patch('api_mysql.db')
    def test_login_success(self, mock_db, client):
        """Тест успешного входа"""
        # Мок аутентификации
        mock_db.authenticate_user.return_value = True
        mock_db.get_user_by_employee_id.return_value = {
            'employee_id': 'TEST001',
            'full_name': 'Test User',
            'position': 'Test Position',
            'is_active': True
        }
        
        login_data = {
            'employee_id': 'TEST001',
            'password': 'test_password'
        }
        
        response = client.post('/api/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert data['success'] is True
        assert 'user' in data
    
    @patch('api_mysql.db')
    def test_login_failure(self, mock_db, client):
        """Тест неудачного входа"""
        # Мок неудачной аутентификации
        mock_db.authenticate_user.return_value = False
        
        login_data = {
            'employee_id': 'TEST001',
            'password': 'wrong_password'
        }
        
        response = client.post('/api/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 401
        data = json.loads(response.data)
        assert data['success'] is False
        assert 'error' in data
    
    @patch('api_mysql.db')
    def test_get_users(self, mock_db, client):
        """Тест получения списка пользователей"""
        # Мок данных пользователей
        mock_db.get_all_users.return_value = [
            {
                'employee_id': 'TEST001',
                'full_name': 'Test User 1',
                'position': 'Position 1',
                'is_active': True
            },
            {
                'employee_id': 'TEST002',
                'full_name': 'Test User 2',
                'position': 'Position 2',
                'is_active': False
            }
        ]
        
        response = client.get('/api/users')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'users' in data
        assert len(data['users']) == 2
    
    @patch('api_mysql.db')
    def test_create_user(self, mock_db, client):
        """Тест создания пользователя"""
        # Мок создания пользователя
        mock_db.create_user.return_value = True
        
        user_data = {
            'employee_id': 'TEST003',
            'full_name': 'New Test User',
            'position': 'New Position',
            'password': 'new_password'
        }
        
        response = client.post('/api/users', 
                             data=json.dumps(user_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
    
    @patch('api_mysql.db')
    def test_get_requests(self, mock_db, client):
        """Тест получения списка заявок"""
        # Мок данных заявок
        mock_db.get_all_requests.return_value = [
            {
                'id': 1,
                'employee_id': 'TEST001',
                'request_type': 'test_type',
                'description': 'Test description',
                'status': 'pending',
                'priority': 'medium',
                'created_at': '2023-01-01 12:00:00'
            }
        ]
        
        response = client.get('/api/requests')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'requests' in data
        assert len(data['requests']) == 1
    
    @patch('api_mysql.db')
    def test_create_request(self, mock_db, client):
        """Тест создания заявки"""
        # Мок создания заявки
        mock_db.create_request.return_value = True
        
        request_data = {
            'employee_id': 'TEST001',
            'request_type': 'test_type',
            'description': 'Test description',
            'priority': 'high'
        }
        
        response = client.post('/api/requests', 
                             data=json.dumps(request_data),
                             content_type='application/json')
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert data['success'] is True
    
    @patch('api_mysql.db')
    def test_get_dashboard_stats(self, mock_db, client):
        """Тест получения статистики дашборда"""
        # Мок статистики
        mock_db.get_dashboard_stats.return_value = {
            'total_users': 10,
            'active_users': 8,
            'total_requests': 25,
            'pending_requests': 5,
            'db_size_mb': 2.5
        }
        
        response = client.get('/api/dashboard/stats')
        
        assert response.status_code == 200
        data = json.loads(response.data)
        assert 'stats' in data
        assert data['stats']['total_users'] == 10
        assert data['stats']['active_users'] == 8
    
    def test_invalid_json(self, client):
        """Тест обработки невалидного JSON"""
        response = client.post('/api/login', 
                             data='invalid json',
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    def test_missing_required_fields(self, client):
        """Тест обработки отсутствующих обязательных полей"""
        login_data = {
            'employee_id': 'TEST001'
            # Отсутствует password
        }
        
        response = client.post('/api/login', 
                             data=json.dumps(login_data),
                             content_type='application/json')
        
        assert response.status_code == 400
        data = json.loads(response.data)
        assert 'error' in data
    
    @patch('api_mysql.db')
    def test_database_error_handling(self, mock_db, client):
        """Тест обработки ошибок базы данных"""
        # Мок ошибки базы данных
        mock_db.get_all_users.side_effect = Exception("Database error")
        
        response = client.get('/api/users')
        
        assert response.status_code == 500
        data = json.loads(response.data)
        assert 'error' in data


if __name__ == '__main__':
    pytest.main([__file__])
