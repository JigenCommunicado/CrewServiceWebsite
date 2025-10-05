#!/usr/bin/env python3
"""
Система мониторинга производительности CrewLife
"""

import time
import psutil
import json
import logging
import threading
from datetime import datetime, timedelta
from collections import deque
import pymysql
import requests
from typing import Dict, List, Optional
import os
import sys

# Добавляем путь к модулям
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'crewlife-website', 'backend'))

from database_mysql import CrewLifeDatabase

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/crewlife-performance.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class PerformanceMonitor:
    """Класс для мониторинга производительности системы"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.metrics_history = deque(maxlen=1000)  # Храним последние 1000 метрик
        self.alerts = []
        self.is_running = False
        self.monitor_thread = None
        
        # Пороги для алертов
        self.thresholds = {
            'cpu_percent': 80.0,
            'memory_percent': 85.0,
            'disk_percent': 90.0,
            'response_time_ms': 5000.0,
            'db_connection_time_ms': 1000.0,
            'error_rate_percent': 5.0
        }
        
        # Инициализация базы данных
        try:
            self.db = CrewLifeDatabase(
                host=config.get('db_host', 'localhost'),
                user=config.get('db_user', 'crewlife_user'),
                password=config.get('db_password', 'andrei8002012'),
                database=config.get('db_name', 'crewlife_prod')
            )
        except Exception as e:
            logger.error(f"Ошибка инициализации базы данных: {e}")
            self.db = None
    
    def start_monitoring(self):
        """Запуск мониторинга"""
        if self.is_running:
            logger.warning("Мониторинг уже запущен")
            return
        
        self.is_running = True
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()
        logger.info("🚀 Мониторинг производительности запущен")
    
    def stop_monitoring(self):
        """Остановка мониторинга"""
        self.is_running = False
        if self.monitor_thread:
            self.monitor_thread.join(timeout=5)
        logger.info("🛑 Мониторинг производительности остановлен")
    
    def _monitor_loop(self):
        """Основной цикл мониторинга"""
        while self.is_running:
            try:
                metrics = self._collect_metrics()
                self._process_metrics(metrics)
                self._check_alerts(metrics)
                
                # Сохраняем метрики
                self.metrics_history.append(metrics)
                
                # Ждем следующую итерацию
                time.sleep(self.config.get('monitor_interval', 30))
                
            except Exception as e:
                logger.error(f"Ошибка в цикле мониторинга: {e}")
                time.sleep(10)
    
    def _collect_metrics(self) -> Dict:
        """Сбор метрик системы"""
        timestamp = datetime.now()
        
        # Системные метрики
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        network = psutil.net_io_counters()
        
        # Метрики базы данных
        db_metrics = self._get_database_metrics()
        
        # Метрики API
        api_metrics = self._get_api_metrics()
        
        # Метрики процессов
        process_metrics = self._get_process_metrics()
        
        return {
            'timestamp': timestamp.isoformat(),
            'system': {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'memory_used_mb': memory.used / 1024 / 1024,
                'memory_available_mb': memory.available / 1024 / 1024,
                'disk_percent': disk.percent,
                'disk_used_gb': disk.used / 1024 / 1024 / 1024,
                'disk_free_gb': disk.free / 1024 / 1024 / 1024,
                'network_bytes_sent': network.bytes_sent,
                'network_bytes_recv': network.bytes_recv
            },
            'database': db_metrics,
            'api': api_metrics,
            'processes': process_metrics
        }
    
    def _get_database_metrics(self) -> Dict:
        """Получение метрик базы данных"""
        if not self.db:
            return {'error': 'Database not available'}
        
        try:
            start_time = time.time()
            
            # Тест подключения
            connection_time = self._test_db_connection()
            
            # Получение статистики
            stats = self.db.get_dashboard_stats()
            
            # Получение информации о подключениях
            connection_info = self._get_db_connection_info()
            
            return {
                'connection_time_ms': connection_time,
                'stats': stats,
                'connections': connection_info,
                'status': 'healthy'
            }
            
        except Exception as e:
            logger.error(f"Ошибка получения метрик БД: {e}")
            return {
                'error': str(e),
                'status': 'error'
            }
    
    def _test_db_connection(self) -> float:
        """Тест времени подключения к базе данных"""
        try:
            start_time = time.time()
            # Простой запрос для тестирования
            self.db.connection.cursor().execute("SELECT 1")
            end_time = time.time()
            return (end_time - start_time) * 1000  # В миллисекундах
        except Exception as e:
            logger.error(f"Ошибка тестирования подключения к БД: {e}")
            return -1
    
    def _get_db_connection_info(self) -> Dict:
        """Получение информации о подключениях к БД"""
        try:
            cursor = self.db.connection.cursor()
            cursor.execute("SHOW STATUS LIKE 'Threads_connected'")
            result = cursor.fetchone()
            return {
                'threads_connected': result[1] if result else 0
            }
        except Exception as e:
            logger.error(f"Ошибка получения информации о подключениях: {e}")
            return {'error': str(e)}
    
    def _get_api_metrics(self) -> Dict:
        """Получение метрик API"""
        try:
            # Тест времени ответа API
            start_time = time.time()
            response = requests.get('http://localhost:5001/api/stats', timeout=10)
            end_time = time.time()
            
            response_time = (end_time - start_time) * 1000  # В миллисекундах
            
            return {
                'response_time_ms': response_time,
                'status_code': response.status_code,
                'status': 'healthy' if response.status_code == 200 else 'error'
            }
            
        except Exception as e:
            logger.error(f"Ошибка получения метрик API: {e}")
            return {
                'error': str(e),
                'status': 'error'
            }
    
    def _get_process_metrics(self) -> Dict:
        """Получение метрик процессов"""
        try:
            # Поиск процессов CrewLife
            crewlife_processes = []
            for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent']):
                try:
                    if 'python' in proc.info['name'].lower() and 'crewlife' in ' '.join(proc.cmdline()).lower():
                        crewlife_processes.append({
                            'pid': proc.info['pid'],
                            'name': proc.info['name'],
                            'cpu_percent': proc.info['cpu_percent'],
                            'memory_percent': proc.info['memory_percent']
                        })
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    continue
            
            return {
                'crewlife_processes': crewlife_processes,
                'total_processes': len(psutil.pids())
            }
            
        except Exception as e:
            logger.error(f"Ошибка получения метрик процессов: {e}")
            return {'error': str(e)}
    
    def _process_metrics(self, metrics: Dict):
        """Обработка собранных метрик"""
        # Здесь можно добавить дополнительную обработку метрик
        # Например, вычисление трендов, агрегация данных и т.д.
        pass
    
    def _check_alerts(self, metrics: Dict):
        """Проверка порогов и создание алертов"""
        alerts = []
        
        # Проверка CPU
        if metrics['system']['cpu_percent'] > self.thresholds['cpu_percent']:
            alerts.append({
                'type': 'cpu_high',
                'message': f"Высокая загрузка CPU: {metrics['system']['cpu_percent']:.1f}%",
                'value': metrics['system']['cpu_percent'],
                'threshold': self.thresholds['cpu_percent'],
                'timestamp': metrics['timestamp']
            })
        
        # Проверка памяти
        if metrics['system']['memory_percent'] > self.thresholds['memory_percent']:
            alerts.append({
                'type': 'memory_high',
                'message': f"Высокое использование памяти: {metrics['system']['memory_percent']:.1f}%",
                'value': metrics['system']['memory_percent'],
                'threshold': self.thresholds['memory_percent'],
                'timestamp': metrics['timestamp']
            })
        
        # Проверка диска
        if metrics['system']['disk_percent'] > self.thresholds['disk_percent']:
            alerts.append({
                'type': 'disk_high',
                'message': f"Мало места на диске: {metrics['system']['disk_percent']:.1f}%",
                'value': metrics['system']['disk_percent'],
                'threshold': self.thresholds['disk_percent'],
                'timestamp': metrics['timestamp']
            })
        
        # Проверка времени ответа API
        if 'api' in metrics and 'response_time_ms' in metrics['api']:
            if metrics['api']['response_time_ms'] > self.thresholds['response_time_ms']:
                alerts.append({
                    'type': 'api_slow',
                    'message': f"Медленный ответ API: {metrics['api']['response_time_ms']:.1f}ms",
                    'value': metrics['api']['response_time_ms'],
                    'threshold': self.thresholds['response_time_ms'],
                    'timestamp': metrics['timestamp']
                })
        
        # Проверка времени подключения к БД
        if 'database' in metrics and 'connection_time_ms' in metrics['database']:
            if metrics['database']['connection_time_ms'] > self.thresholds['db_connection_time_ms']:
                alerts.append({
                    'type': 'db_slow',
                    'message': f"Медленное подключение к БД: {metrics['database']['connection_time_ms']:.1f}ms",
                    'value': metrics['database']['connection_time_ms'],
                    'threshold': self.thresholds['db_connection_time_ms'],
                    'timestamp': metrics['timestamp']
                })
        
        # Добавляем новые алерты
        for alert in alerts:
            self.alerts.append(alert)
            logger.warning(f"🚨 АЛЕРТ: {alert['message']}")
        
        # Ограничиваем количество алертов
        if len(self.alerts) > 100:
            self.alerts = self.alerts[-100:]
    
    def get_current_metrics(self) -> Dict:
        """Получение текущих метрик"""
        if not self.metrics_history:
            return {}
        return self.metrics_history[-1]
    
    def get_metrics_history(self, hours: int = 24) -> List[Dict]:
        """Получение истории метрик за указанное количество часов"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        return [
            metric for metric in self.metrics_history
            if datetime.fromisoformat(metric['timestamp']) > cutoff_time
        ]
    
    def get_alerts(self, hours: int = 24) -> List[Dict]:
        """Получение алертов за указанное количество часов"""
        cutoff_time = datetime.now() - timedelta(hours=hours)
        return [
            alert for alert in self.alerts
            if datetime.fromisoformat(alert['timestamp']) > cutoff_time
        ]
    
    def get_performance_summary(self) -> Dict:
        """Получение сводки по производительности"""
        if not self.metrics_history:
            return {'error': 'No metrics available'}
        
        recent_metrics = list(self.metrics_history)[-10:]  # Последние 10 метрик
        
        # Вычисляем средние значения
        avg_cpu = sum(m['system']['cpu_percent'] for m in recent_metrics) / len(recent_metrics)
        avg_memory = sum(m['system']['memory_percent'] for m in recent_metrics) / len(recent_metrics)
        avg_disk = sum(m['system']['disk_percent'] for m in recent_metrics) / len(recent_metrics)
        
        # Статус системы
        status = 'healthy'
        if avg_cpu > 70 or avg_memory > 80 or avg_disk > 85:
            status = 'warning'
        if avg_cpu > 90 or avg_memory > 95 or avg_disk > 95:
            status = 'critical'
        
        return {
            'status': status,
            'average_metrics': {
                'cpu_percent': round(avg_cpu, 2),
                'memory_percent': round(avg_memory, 2),
                'disk_percent': round(avg_disk, 2)
            },
            'total_alerts': len(self.alerts),
            'recent_alerts': len(self.get_alerts(hours=1)),
            'monitoring_duration_hours': len(self.metrics_history) * (self.config.get('monitor_interval', 30) / 3600)
        }


def main():
    """Основная функция"""
    # Конфигурация
    config = {
        'monitor_interval': 30,  # Интервал мониторинга в секундах
        'db_host': 'localhost',
        'db_user': 'crewlife_user',
        'db_password': 'andrei8002012',
        'db_name': 'crewlife_prod'
    }
    
    # Создание и запуск мониторинга
    monitor = PerformanceMonitor(config)
    
    try:
        monitor.start_monitoring()
        
        # Основной цикл
        while True:
            time.sleep(60)
            
            # Выводим сводку каждую минуту
            summary = monitor.get_performance_summary()
            if 'error' not in summary:
                logger.info(f"📊 Статус: {summary['status']}, "
                          f"CPU: {summary['average_metrics']['cpu_percent']}%, "
                          f"RAM: {summary['average_metrics']['memory_percent']}%, "
                          f"Диск: {summary['average_metrics']['disk_percent']}%")
            
    except KeyboardInterrupt:
        logger.info("Получен сигнал остановки")
    finally:
        monitor.stop_monitoring()


if __name__ == '__main__':
    main()
