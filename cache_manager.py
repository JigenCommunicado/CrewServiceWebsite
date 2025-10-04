#!/usr/bin/env python3
"""
Система кэширования CrewLife с Redis
"""

import redis
import json
import pickle
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Any, Optional, Dict, List
import os
import sys

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CacheManager:
    """Менеджер кэширования с Redis"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.redis_client = None
        self.is_connected = False
        
        # Настройки кэширования
        self.default_ttl = config.get('default_ttl', 3600)  # 1 час
        self.key_prefix = config.get('key_prefix', 'crewlife:')
        
        # Подключение к Redis
        self._connect_redis()
    
    def _connect_redis(self):
        """Подключение к Redis"""
        try:
            self.redis_client = redis.Redis(
                host=self.config.get('redis_host', 'localhost'),
                port=self.config.get('redis_port', 6379),
                password=self.config.get('redis_password', None),
                db=self.config.get('redis_db', 0),
                decode_responses=False,  # Для совместимости с pickle
                socket_connect_timeout=5,
                socket_timeout=5,
                retry_on_timeout=True
            )
            
            # Тест подключения
            self.redis_client.ping()
            self.is_connected = True
            logger.info("✅ Подключение к Redis установлено")
            
        except Exception as e:
            logger.error(f"❌ Ошибка подключения к Redis: {e}")
            self.is_connected = False
            self.redis_client = None
    
    def _generate_key(self, key: str, namespace: str = 'default') -> str:
        """Генерация ключа кэша"""
        return f"{self.key_prefix}{namespace}:{key}"
    
    def _serialize_data(self, data: Any) -> bytes:
        """Сериализация данных для хранения"""
        try:
            # Пытаемся использовать JSON для простых типов
            if isinstance(data, (dict, list, str, int, float, bool, type(None))):
                return json.dumps(data, ensure_ascii=False).encode('utf-8')
            else:
                # Используем pickle для сложных объектов
                return pickle.dumps(data)
        except Exception as e:
            logger.error(f"Ошибка сериализации данных: {e}")
            return pickle.dumps(data)
    
    def _deserialize_data(self, data: bytes) -> Any:
        """Десериализация данных из кэша"""
        try:
            # Пытаемся десериализовать как JSON
            try:
                return json.loads(data.decode('utf-8'))
            except (json.JSONDecodeError, UnicodeDecodeError):
                # Если не получилось, используем pickle
                return pickle.loads(data)
        except Exception as e:
            logger.error(f"Ошибка десериализации данных: {e}")
            return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None, namespace: str = 'default') -> bool:
        """Установка значения в кэш"""
        if not self.is_connected:
            logger.warning("Redis не подключен, кэширование отключено")
            return False
        
        try:
            cache_key = self._generate_key(key, namespace)
            serialized_value = self._serialize_data(value)
            ttl = ttl or self.default_ttl
            
            result = self.redis_client.setex(cache_key, ttl, serialized_value)
            
            if result:
                logger.debug(f"Кэш установлен: {cache_key} (TTL: {ttl}s)")
            else:
                logger.warning(f"Не удалось установить кэш: {cache_key}")
            
            return result
            
        except Exception as e:
            logger.error(f"Ошибка установки кэша {key}: {e}")
            return False
    
    def get(self, key: str, namespace: str = 'default') -> Optional[Any]:
        """Получение значения из кэша"""
        if not self.is_connected:
            return None
        
        try:
            cache_key = self._generate_key(key, namespace)
            data = self.redis_client.get(cache_key)
            
            if data is None:
                logger.debug(f"Кэш не найден: {cache_key}")
                return None
            
            value = self._deserialize_data(data)
            logger.debug(f"Кэш получен: {cache_key}")
            return value
            
        except Exception as e:
            logger.error(f"Ошибка получения кэша {key}: {e}")
            return None
    
    def delete(self, key: str, namespace: str = 'default') -> bool:
        """Удаление значения из кэша"""
        if not self.is_connected:
            return False
        
        try:
            cache_key = self._generate_key(key, namespace)
            result = self.redis_client.delete(cache_key)
            
            if result:
                logger.debug(f"Кэш удален: {cache_key}")
            else:
                logger.debug(f"Кэш не найден для удаления: {cache_key}")
            
            return bool(result)
            
        except Exception as e:
            logger.error(f"Ошибка удаления кэша {key}: {e}")
            return False
    
    def exists(self, key: str, namespace: str = 'default') -> bool:
        """Проверка существования ключа в кэше"""
        if not self.is_connected:
            return False
        
        try:
            cache_key = self._generate_key(key, namespace)
            return bool(self.redis_client.exists(cache_key))
        except Exception as e:
            logger.error(f"Ошибка проверки существования кэша {key}: {e}")
            return False
    
    def ttl(self, key: str, namespace: str = 'default') -> int:
        """Получение TTL ключа"""
        if not self.is_connected:
            return -1
        
        try:
            cache_key = self._generate_key(key, namespace)
            return self.redis_client.ttl(cache_key)
        except Exception as e:
            logger.error(f"Ошибка получения TTL кэша {key}: {e}")
            return -1
    
    def clear_namespace(self, namespace: str = 'default') -> int:
        """Очистка всех ключей в namespace"""
        if not self.is_connected:
            return 0
        
        try:
            pattern = f"{self.key_prefix}{namespace}:*"
            keys = self.redis_client.keys(pattern)
            
            if keys:
                deleted = self.redis_client.delete(*keys)
                logger.info(f"Удалено {deleted} ключей из namespace '{namespace}'")
                return deleted
            else:
                logger.info(f"Ключи в namespace '{namespace}' не найдены")
                return 0
                
        except Exception as e:
            logger.error(f"Ошибка очистки namespace '{namespace}': {e}")
            return 0
    
    def get_stats(self) -> Dict:
        """Получение статистики кэша"""
        if not self.is_connected:
            return {'error': 'Redis not connected'}
        
        try:
            info = self.redis_client.info()
            
            # Подсчет ключей по namespace
            namespaces = {}
            for key in self.redis_client.keys(f"{self.key_prefix}*"):
                key_str = key.decode('utf-8') if isinstance(key, bytes) else key
                namespace = key_str.split(':')[1] if ':' in key_str else 'default'
                namespaces[namespace] = namespaces.get(namespace, 0) + 1
            
            return {
                'connected': True,
                'memory_used': info.get('used_memory_human', 'N/A'),
                'total_keys': info.get('db0', {}).get('keys', 0),
                'namespaces': namespaces,
                'uptime_seconds': info.get('uptime_in_seconds', 0),
                'connected_clients': info.get('connected_clients', 0)
            }
            
        except Exception as e:
            logger.error(f"Ошибка получения статистики: {e}")
            return {'error': str(e)}
    
    def cache_function(self, ttl: Optional[int] = None, namespace: str = 'functions'):
        """Декоратор для кэширования результатов функций"""
        def decorator(func):
            def wrapper(*args, **kwargs):
                # Генерируем ключ кэша на основе функции и аргументов
                cache_key = self._generate_function_key(func, args, kwargs)
                
                # Пытаемся получить из кэша
                cached_result = self.get(cache_key, namespace)
                if cached_result is not None:
                    logger.debug(f"Результат функции {func.__name__} получен из кэша")
                    return cached_result
                
                # Выполняем функцию
                result = func(*args, **kwargs)
                
                # Сохраняем в кэш
                self.set(cache_key, result, ttl, namespace)
                logger.debug(f"Результат функции {func.__name__} сохранен в кэш")
                
                return result
            
            return wrapper
        return decorator
    
    def _generate_function_key(self, func, args, kwargs) -> str:
        """Генерация ключа кэша для функции"""
        # Создаем хеш из имени функции и аргументов
        key_data = f"{func.__name__}:{str(args)}:{str(sorted(kwargs.items()))}"
        return hashlib.md5(key_data.encode()).hexdigest()
    
    def invalidate_pattern(self, pattern: str, namespace: str = 'default') -> int:
        """Инвалидация ключей по паттерну"""
        if not self.is_connected:
            return 0
        
        try:
            search_pattern = f"{self.key_prefix}{namespace}:{pattern}"
            keys = self.redis_client.keys(search_pattern)
            
            if keys:
                deleted = self.redis_client.delete(*keys)
                logger.info(f"Удалено {deleted} ключей по паттерну '{pattern}'")
                return deleted
            else:
                logger.info(f"Ключи по паттерну '{pattern}' не найдены")
                return 0
                
        except Exception as e:
            logger.error(f"Ошибка инвалидации по паттерну '{pattern}': {e}")
            return 0


class CrewLifeCache:
    """Специализированный кэш для CrewLife"""
    
    def __init__(self, cache_manager: CacheManager):
        self.cache = cache_manager
        
        # Настройки TTL для разных типов данных
        self.ttl_settings = {
            'user_data': 1800,      # 30 минут
            'dashboard_stats': 300,  # 5 минут
            'requests_list': 600,    # 10 минут
            'logs': 1800,           # 30 минут
            'settings': 3600,       # 1 час
            'api_responses': 300,   # 5 минут
            'database_queries': 600 # 10 минут
        }
    
    def cache_user_data(self, user_id: str, user_data: Dict) -> bool:
        """Кэширование данных пользователя"""
        return self.cache.set(f"user:{user_id}", user_data, 
                            self.ttl_settings['user_data'], 'users')
    
    def get_user_data(self, user_id: str) -> Optional[Dict]:
        """Получение данных пользователя из кэша"""
        return self.cache.get(f"user:{user_id}", 'users')
    
    def cache_dashboard_stats(self, stats: Dict) -> bool:
        """Кэширование статистики дашборда"""
        return self.cache.set("dashboard_stats", stats, 
                            self.ttl_settings['dashboard_stats'], 'stats')
    
    def get_dashboard_stats(self) -> Optional[Dict]:
        """Получение статистики дашборда из кэша"""
        return self.cache.get("dashboard_stats", 'stats')
    
    def cache_requests_list(self, requests: List[Dict]) -> bool:
        """Кэширование списка заявок"""
        return self.cache.set("requests_list", requests, 
                            self.ttl_settings['requests_list'], 'requests')
    
    def get_requests_list(self) -> Optional[List[Dict]]:
        """Получение списка заявок из кэша"""
        return self.cache.get("requests_list", 'requests')
    
    def cache_api_response(self, endpoint: str, params: Dict, response: Any) -> bool:
        """Кэширование ответа API"""
        # Создаем ключ на основе endpoint и параметров
        key = f"api:{endpoint}:{hashlib.md5(str(params).encode()).hexdigest()}"
        return self.cache.set(key, response, 
                            self.ttl_settings['api_responses'], 'api')
    
    def get_api_response(self, endpoint: str, params: Dict) -> Optional[Any]:
        """Получение ответа API из кэша"""
        key = f"api:{endpoint}:{hashlib.md5(str(params).encode()).hexdigest()}"
        return self.cache.get(key, 'api')
    
    def invalidate_user_cache(self, user_id: str = None) -> int:
        """Инвалидация кэша пользователей"""
        if user_id:
            return 1 if self.cache.delete(f"user:{user_id}", 'users') else 0
        else:
            return self.cache.clear_namespace('users')
    
    def invalidate_stats_cache(self) -> int:
        """Инвалидация кэша статистики"""
        return self.cache.clear_namespace('stats')
    
    def invalidate_requests_cache(self) -> int:
        """Инвалидация кэша заявок"""
        return self.cache.clear_namespace('requests')
    
    def get_cache_stats(self) -> Dict:
        """Получение статистики кэша"""
        return self.cache.get_stats()


def main():
    """Основная функция для тестирования"""
    # Конфигурация
    config = {
        'redis_host': 'localhost',
        'redis_port': 6379,
        'redis_password': None,
        'redis_db': 0,
        'default_ttl': 3600,
        'key_prefix': 'crewlife:'
    }
    
    # Создание менеджера кэша
    cache_manager = CacheManager(config)
    crewlife_cache = CrewLifeCache(cache_manager)
    
    # Тестирование
    print("🧪 Тестирование системы кэширования...")
    
    # Тест базовых операций
    test_data = {'test': 'data', 'number': 42}
    cache_manager.set('test_key', test_data, 60)
    retrieved_data = cache_manager.get('test_key')
    print(f"✅ Базовые операции: {retrieved_data == test_data}")
    
    # Тест специализированного кэша
    user_data = {'id': 'TEST001', 'name': 'Test User'}
    crewlife_cache.cache_user_data('TEST001', user_data)
    retrieved_user = crewlife_cache.get_user_data('TEST001')
    print(f"✅ Кэш пользователей: {retrieved_user == user_data}")
    
    # Статистика
    stats = crewlife_cache.get_cache_stats()
    print(f"📊 Статистика кэша: {stats}")


if __name__ == '__main__':
    main()
