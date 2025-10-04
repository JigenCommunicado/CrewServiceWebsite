"""
Тесты для модуля базы данных
"""
import pytest
import tempfile
import os
from unittest.mock import Mock, patch
import sys

# Добавляем путь к модулям
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'crewlife-website', 'backend'))

from database_mysql import CrewLifeDatabase


class TestCrewLifeDatabase:
    """Тесты для класса CrewLifeDatabase"""
    
    @pytest.fixture
    def mock_db_config(self):
        """Мок конфигурации базы данных"""
        return {
            'host': 'localhost',
            'user': 'test_user',
            'password': 'test_password',
            'database': 'test_db',
            'charset': 'utf8mb4',
            'autocommit': True
        }
    
    @pytest.fixture
    def mock_connection(self):
        """Мок подключения к базе данных"""
        mock_conn = Mock()
        mock_cursor = Mock()
        mock_conn.cursor.return_value = mock_cursor
        mock_cursor.fetchall.return_value = []
        mock_cursor.fetchone.return_value = None
        mock_cursor.rowcount = 0
        return mock_conn, mock_cursor
    
    @patch('database_mysql.pymysql.connect')
    def test_database_initialization(self, mock_connect, mock_db_config, mock_connection):
        """Тест инициализации базы данных"""
        mock_conn, mock_cursor = mock_connection
        mock_connect.return_value = mock_conn
        
        db = CrewLifeDatabase(**mock_db_config)
        
        # Проверяем, что подключение было создано
        mock_connect.assert_called_once()
        assert db.connection_config == mock_db_config
    
    @patch('database_mysql.pymysql.connect')
    def test_user_creation(self, mock_connect, mock_db_config, mock_connection):
        """Тест создания пользователя"""
        mock_conn, mock_cursor = mock_connection
        mock_connect.return_value = mock_conn
        
        db = CrewLifeDatabase(**mock_db_config)
        
        # Тестовые данные
        user_data = {
            'employee_id': 'TEST001',
            'full_name': 'Test User',
            'position': 'Test Position',
            'password': 'test_password'
        }
        
        result = db.create_user(**user_data)
        
        # Проверяем, что был выполнен SQL запрос
        mock_cursor.execute.assert_called()
        assert result is True
    
    @patch('database_mysql.pymysql.connect')
    def test_user_authentication(self, mock_connect, mock_db_config, mock_connection):
        """Тест аутентификации пользователя"""
        mock_conn, mock_cursor = mock_connection
        mock_connect.return_value = mock_conn
        
        # Мок результата запроса
        mock_cursor.fetchone.return_value = ('TEST001', 'hashed_password')
        
        db = CrewLifeDatabase(**mock_db_config)
        
        result = db.authenticate_user('TEST001', 'test_password')
        
        # Проверяем, что был выполнен SQL запрос
        mock_cursor.execute.assert_called()
        assert result is True
    
    @patch('database_mysql.pymysql.connect')
    def test_password_hashing(self, mock_connect, mock_db_config, mock_connection):
        """Тест хеширования пароля"""
        mock_conn, mock_cursor = mock_connection
        mock_connect.return_value = mock_conn
        
        db = CrewLifeDatabase(**mock_db_config)
        
        password = 'test_password'
        hashed = db._hash_password(password)
        
        # Проверяем, что пароль был захеширован
        assert hashed != password
        assert len(hashed) > 0
    
    @patch('database_mysql.pymysql.connect')
    def test_request_creation(self, mock_connect, mock_db_config, mock_connection):
        """Тест создания заявки"""
        mock_conn, mock_cursor = mock_connection
        mock_connect.return_value = mock_conn
        
        db = CrewLifeDatabase(**mock_db_config)
        
        # Тестовые данные
        request_data = {
            'employee_id': 'TEST001',
            'request_type': 'test_type',
            'description': 'Test description',
            'priority': 'medium'
        }
        
        result = db.create_request(**request_data)
        
        # Проверяем, что был выполнен SQL запрос
        mock_cursor.execute.assert_called()
        assert result is True
    
    @patch('database_mysql.pymysql.connect')
    def test_dashboard_stats(self, mock_connect, mock_db_config, mock_connection):
        """Тест получения статистики дашборда"""
        mock_conn, mock_cursor = mock_connection
        mock_connect.return_value = mock_conn
        
        # Мок результатов запросов
        mock_cursor.fetchone.side_effect = [
            (5,),  # total_users
            (10,), # active_users
            (25,), # total_requests
            (15,), # pending_requests
            (1024,) # db_size_bytes
        ]
        
        db = CrewLifeDatabase(**mock_db_config)
        
        stats = db.get_dashboard_stats()
        
        # Проверяем структуру статистики
        assert 'total_users' in stats
        assert 'active_users' in stats
        assert 'total_requests' in stats
        assert 'pending_requests' in stats
        assert 'db_size_mb' in stats
        
        assert stats['total_users'] == 5
        assert stats['active_users'] == 10
        assert stats['total_requests'] == 25
        assert stats['pending_requests'] == 15
        assert stats['db_size_mb'] == 1.0  # 1024 bytes = 1 MB
    
    @patch('database_mysql.pymysql.connect')
    def test_database_connection_error(self, mock_connect, mock_db_config):
        """Тест обработки ошибки подключения к базе данных"""
        mock_connect.side_effect = Exception("Connection failed")
        
        with pytest.raises(Exception):
            CrewLifeDatabase(**mock_db_config)
    
    @patch('database_mysql.pymysql.connect')
    def test_sql_execution_error(self, mock_connect, mock_db_config, mock_connection):
        """Тест обработки ошибки выполнения SQL"""
        mock_conn, mock_cursor = mock_connection
        mock_connect.return_value = mock_conn
        mock_cursor.execute.side_effect = Exception("SQL execution failed")
        
        db = CrewLifeDatabase(**mock_db_config)
        
        with pytest.raises(Exception):
            db.create_user('TEST001', 'Test User', 'Test Position', 'test_password')


if __name__ == '__main__':
    pytest.main([__file__])
