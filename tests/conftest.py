"""
Конфигурация тестов
"""
import pytest
import os
import tempfile
from unittest.mock import Mock, patch
import sys

# Добавляем путь к модулям
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'crewlife-website', 'backend'))


@pytest.fixture(scope="session")
def test_database_config():
    """Конфигурация тестовой базы данных"""
    return {
        'host': 'localhost',
        'user': 'test_user',
        'password': 'test_password',
        'database': 'crewlife_test',
        'charset': 'utf8mb4',
        'autocommit': True
    }


@pytest.fixture(scope="session")
def test_environment():
    """Тестовая среда"""
    return {
        'FLASK_ENV': 'testing',
        'DB_TYPE': 'mysql',
        'DB_HOST': 'localhost',
        'DB_USER': 'test_user',
        'DB_PASSWORD': 'test_password',
        'DB_NAME': 'crewlife_test'
    }


@pytest.fixture
def mock_database():
    """Мок базы данных для тестов"""
    mock_db = Mock()
    
    # Настройка методов
    mock_db.authenticate_user.return_value = True
    mock_db.create_user.return_value = True
    mock_db.get_user_by_employee_id.return_value = {
        'employee_id': 'TEST001',
        'full_name': 'Test User',
        'position': 'Test Position',
        'is_active': True
    }
    mock_db.get_all_users.return_value = []
    mock_db.get_all_requests.return_value = []
    mock_db.create_request.return_value = True
    mock_db.get_dashboard_stats.return_value = {
        'total_users': 0,
        'active_users': 0,
        'total_requests': 0,
        'pending_requests': 0,
        'db_size_mb': 0.0
    }
    
    return mock_db


@pytest.fixture
def sample_user_data():
    """Тестовые данные пользователя"""
    return {
        'employee_id': 'TEST001',
        'full_name': 'Test User',
        'position': 'Test Position',
        'password': 'test_password'
    }


@pytest.fixture
def sample_request_data():
    """Тестовые данные заявки"""
    return {
        'employee_id': 'TEST001',
        'request_type': 'test_type',
        'description': 'Test description',
        'priority': 'medium'
    }


@pytest.fixture
def sample_users_list():
    """Список тестовых пользователей"""
    return [
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


@pytest.fixture
def sample_requests_list():
    """Список тестовых заявок"""
    return [
        {
            'id': 1,
            'employee_id': 'TEST001',
            'request_type': 'test_type',
            'description': 'Test description 1',
            'status': 'pending',
            'priority': 'medium',
            'created_at': '2023-01-01 12:00:00'
        },
        {
            'id': 2,
            'employee_id': 'TEST002',
            'request_type': 'test_type',
            'description': 'Test description 2',
            'status': 'completed',
            'priority': 'high',
            'created_at': '2023-01-02 12:00:00'
        }
    ]


@pytest.fixture
def temp_directory():
    """Временная директория для тестов"""
    with tempfile.TemporaryDirectory() as temp_dir:
        yield temp_dir


@pytest.fixture(autouse=True)
def setup_test_environment():
    """Настройка тестовой среды"""
    # Устанавливаем переменные окружения для тестов
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['DB_TYPE'] = 'mysql'
    os.environ['DB_HOST'] = 'localhost'
    os.environ['DB_USER'] = 'test_user'
    os.environ['DB_PASSWORD'] = 'test_password'
    os.environ['DB_NAME'] = 'crewlife_test'
    
    yield
    
    # Очистка после тестов
    test_env_vars = ['FLASK_ENV', 'DB_TYPE', 'DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME']
    for var in test_env_vars:
        if var in os.environ:
            del os.environ[var]


@pytest.fixture
def mock_file_system():
    """Мок файловой системы"""
    with patch('os.path.exists') as mock_exists, \
         patch('os.makedirs') as mock_makedirs, \
         patch('builtins.open', mock_open()) as mock_file:
        mock_exists.return_value = True
        yield mock_exists, mock_makedirs, mock_file


def mock_open(*args, **kwargs):
    """Мок функции open"""
    from unittest.mock import mock_open as _mock_open
    return _mock_open(*args, **kwargs)


@pytest.fixture
def mock_requests():
    """Мок для requests"""
    with patch('requests.get') as mock_get, \
         patch('requests.post') as mock_post:
        yield mock_get, mock_post


@pytest.fixture
def mock_subprocess():
    """Мок для subprocess"""
    with patch('subprocess.run') as mock_run, \
         patch('subprocess.Popen') as mock_popen:
        yield mock_run, mock_popen


# Маркеры для тестов
def pytest_configure(config):
    """Конфигурация pytest"""
    config.addinivalue_line(
        "markers", "slow: marks tests as slow (deselect with '-m \"not slow\"')"
    )
    config.addinivalue_line(
        "markers", "integration: marks tests as integration tests"
    )
    config.addinivalue_line(
        "markers", "unit: marks tests as unit tests"
    )
