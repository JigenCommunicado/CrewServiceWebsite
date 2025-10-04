#!/usr/bin/env python3
"""
Автоматическое масштабирование CrewLife
"""

import time
import json
import logging
import requests
import subprocess
import psutil
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import os
import sys

# Настройка логирования
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('/var/log/crewlife-autoscaler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)


class AutoScaler:
    """Класс для автоматического масштабирования"""
    
    def __init__(self, config: Dict):
        self.config = config
        self.is_running = False
        self.scale_thread = None
        self.current_instances = 3  # Начальное количество экземпляров
        self.min_instances = config.get('min_instances', 2)
        self.max_instances = config.get('max_instances', 10)
        self.scale_up_threshold = config.get('scale_up_threshold', 70.0)  # CPU %
        self.scale_down_threshold = config.get('scale_down_threshold', 30.0)  # CPU %
        self.cooldown_period = config.get('cooldown_period', 300)  # 5 минут
        self.last_scale_time = 0
        
        # Метрики для принятия решений
        self.metrics_history = []
        self.metrics_window = 5  # Количество метрик для анализа
        
    def start_scaling(self):
        """Запуск автоматического масштабирования"""
        if self.is_running:
            logger.warning("Автоматическое масштабирование уже запущено")
            return
        
        self.is_running = True
        self.scale_thread = threading.Thread(target=self._scaling_loop, daemon=True)
        self.scale_thread.start()
        logger.info("🚀 Автоматическое масштабирование запущено")
    
    def stop_scaling(self):
        """Остановка автоматического масштабирования"""
        self.is_running = False
        if self.scale_thread:
            self.scale_thread.join(timeout=5)
        logger.info("🛑 Автоматическое масштабирование остановлено")
    
    def _scaling_loop(self):
        """Основной цикл масштабирования"""
        while self.is_running:
            try:
                # Сбор метрик
                metrics = self._collect_metrics()
                self._process_metrics(metrics)
                
                # Анализ и принятие решений
                decision = self._analyze_scaling_decision()
                
                if decision['action'] != 'none':
                    self._execute_scaling_decision(decision)
                
                # Ждем следующую итерацию
                time.sleep(self.config.get('check_interval', 60))
                
            except Exception as e:
                logger.error(f"Ошибка в цикле масштабирования: {e}")
                time.sleep(30)
    
    def _collect_metrics(self) -> Dict:
        """Сбор метрик для принятия решений о масштабировании"""
        timestamp = datetime.now()
        
        # Системные метрики
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        
        # Метрики приложений
        app_metrics = self._get_app_metrics()
        
        # Метрики базы данных
        db_metrics = self._get_db_metrics()
        
        # Метрики сети
        network_metrics = self._get_network_metrics()
        
        return {
            'timestamp': timestamp.isoformat(),
            'system': {
                'cpu_percent': cpu_percent,
                'memory_percent': memory.percent,
                'load_average': os.getloadavg()[0] if hasattr(os, 'getloadavg') else 0
            },
            'applications': app_metrics,
            'database': db_metrics,
            'network': network_metrics
        }
    
    def _get_app_metrics(self) -> Dict:
        """Получение метрик приложений"""
        app_metrics = {
            'total_requests': 0,
            'active_connections': 0,
            'response_time_avg': 0,
            'error_rate': 0,
            'instances': []
        }
        
        # Проверяем каждый экземпляр приложения
        for i in range(1, self.current_instances + 1):
            try:
                port = 5000 + i
                response = requests.get(f'http://localhost:{port}/api/stats', timeout=5)
                if response.status_code == 200:
                    stats = response.json()
                    app_metrics['total_requests'] += stats.get('total_requests', 0)
                    app_metrics['active_connections'] += stats.get('active_connections', 0)
                    app_metrics['response_time_avg'] += stats.get('response_time_avg', 0)
                    app_metrics['error_rate'] += stats.get('error_rate', 0)
                    
                    app_metrics['instances'].append({
                        'instance_id': i,
                        'port': port,
                        'status': 'healthy',
                        'stats': stats
                    })
                else:
                    app_metrics['instances'].append({
                        'instance_id': i,
                        'port': port,
                        'status': 'unhealthy',
                        'stats': {}
                    })
            except Exception as e:
                logger.warning(f"Не удалось получить метрики для экземпляра {i}: {e}")
                app_metrics['instances'].append({
                    'instance_id': i,
                    'port': port,
                    'status': 'error',
                    'error': str(e)
                })
        
        # Вычисляем средние значения
        healthy_instances = [inst for inst in app_metrics['instances'] if inst['status'] == 'healthy']
        if healthy_instances:
            app_metrics['response_time_avg'] /= len(healthy_instances)
            app_metrics['error_rate'] /= len(healthy_instances)
        
        return app_metrics
    
    def _get_db_metrics(self) -> Dict:
        """Получение метрик базы данных"""
        try:
            # Проверяем подключения к БД
            response = requests.get('http://localhost:5004/api/stats', timeout=5)
            if response.status_code == 200:
                return response.json()
            else:
                return {'error': 'Database metrics unavailable'}
        except Exception as e:
            logger.warning(f"Не удалось получить метрики БД: {e}")
            return {'error': str(e)}
    
    def _get_network_metrics(self) -> Dict:
        """Получение сетевых метрик"""
        try:
            net_io = psutil.net_io_counters()
            return {
                'bytes_sent': net_io.bytes_sent,
                'bytes_recv': net_io.bytes_recv,
                'packets_sent': net_io.packets_sent,
                'packets_recv': net_io.packets_recv
            }
        except Exception as e:
            logger.warning(f"Не удалось получить сетевые метрики: {e}")
            return {'error': str(e)}
    
    def _process_metrics(self, metrics: Dict):
        """Обработка собранных метрик"""
        self.metrics_history.append(metrics)
        
        # Ограничиваем историю
        if len(self.metrics_history) > self.metrics_window:
            self.metrics_history = self.metrics_history[-self.metrics_window:]
    
    def _analyze_scaling_decision(self) -> Dict:
        """Анализ метрик и принятие решения о масштабировании"""
        if len(self.metrics_history) < 3:
            return {'action': 'none', 'reason': 'Insufficient metrics history'}
        
        # Проверяем cooldown период
        current_time = time.time()
        if current_time - self.last_scale_time < self.cooldown_period:
            return {'action': 'none', 'reason': 'Cooldown period active'}
        
        # Анализируем последние метрики
        recent_metrics = self.metrics_history[-3:]
        
        # Вычисляем средние значения
        avg_cpu = sum(m['system']['cpu_percent'] for m in recent_metrics) / len(recent_metrics)
        avg_memory = sum(m['system']['memory_percent'] for m in recent_metrics) / len(recent_metrics)
        avg_response_time = sum(m['applications']['response_time_avg'] for m in recent_metrics) / len(recent_metrics)
        avg_error_rate = sum(m['applications']['error_rate'] for m in recent_metrics) / len(recent_metrics)
        
        # Проверяем количество здоровых экземпляров
        healthy_instances = sum(
            len([inst for inst in m['applications']['instances'] if inst['status'] == 'healthy'])
            for m in recent_metrics
        ) / len(recent_metrics)
        
        # Принятие решения о масштабировании
        decision = {'action': 'none', 'reason': 'No scaling needed'}
        
        # Условия для масштабирования вверх
        if (avg_cpu > self.scale_up_threshold or 
            avg_memory > 80 or 
            avg_response_time > 2000 or 
            avg_error_rate > 5 or
            healthy_instances < self.current_instances * 0.8):
            
            if self.current_instances < self.max_instances:
                decision = {
                    'action': 'scale_up',
                    'reason': f'High load: CPU={avg_cpu:.1f}%, Memory={avg_memory:.1f}%, Response={avg_response_time:.1f}ms',
                    'target_instances': min(self.current_instances + 1, self.max_instances)
                }
            else:
                decision = {
                    'action': 'none',
                    'reason': f'High load but already at max instances ({self.max_instances})'
                }
        
        # Условия для масштабирования вниз
        elif (avg_cpu < self.scale_down_threshold and 
              avg_memory < 50 and 
              avg_response_time < 500 and 
              avg_error_rate < 1 and
              healthy_instances >= self.current_instances):
            
            if self.current_instances > self.min_instances:
                decision = {
                    'action': 'scale_down',
                    'reason': f'Low load: CPU={avg_cpu:.1f}%, Memory={avg_memory:.1f}%, Response={avg_response_time:.1f}ms',
                    'target_instances': max(self.current_instances - 1, self.min_instances)
                }
        
        return decision
    
    def _execute_scaling_decision(self, decision: Dict):
        """Выполнение решения о масштабировании"""
        action = decision['action']
        reason = decision['reason']
        
        logger.info(f"🔄 Выполнение решения о масштабировании: {action} - {reason}")
        
        if action == 'scale_up':
            self._scale_up(decision['target_instances'])
        elif action == 'scale_down':
            self._scale_down(decision['target_instances'])
        
        self.last_scale_time = time.time()
    
    def _scale_up(self, target_instances: int):
        """Масштабирование вверх"""
        if target_instances <= self.current_instances:
            return
        
        logger.info(f"📈 Масштабирование вверх: {self.current_instances} -> {target_instances}")
        
        # Запускаем новые экземпляры через Docker Compose
        for i in range(self.current_instances + 1, target_instances + 1):
            try:
                # Создаем новый сервис в docker-compose
                self._add_docker_service(i)
                
                # Запускаем новый контейнер
                subprocess.run([
                    'docker-compose', 'up', '-d', f'crewlife-app-{i}'
                ], check=True, capture_output=True)
                
                logger.info(f"✅ Экземпляр {i} запущен")
                
                # Ждем, пока экземпляр станет здоровым
                self._wait_for_healthy_instance(i)
                
            except Exception as e:
                logger.error(f"❌ Ошибка запуска экземпляра {i}: {e}")
        
        self.current_instances = target_instances
        logger.info(f"🎉 Масштабирование вверх завершено: {target_instances} экземпляров")
    
    def _scale_down(self, target_instances: int):
        """Масштабирование вниз"""
        if target_instances >= self.current_instances:
            return
        
        logger.info(f"📉 Масштабирование вниз: {self.current_instances} -> {target_instances}")
        
        # Останавливаем экземпляры с наибольшими номерами
        for i in range(self.current_instances, target_instances, -1):
            try:
                # Останавливаем контейнер
                subprocess.run([
                    'docker-compose', 'stop', f'crewlife-app-{i}'
                ], check=True, capture_output=True)
                
                # Удаляем контейнер
                subprocess.run([
                    'docker-compose', 'rm', '-f', f'crewlife-app-{i}'
                ], check=True, capture_output=True)
                
                logger.info(f"✅ Экземпляр {i} остановлен")
                
            except Exception as e:
                logger.error(f"❌ Ошибка остановки экземпляра {i}: {e}")
        
        self.current_instances = target_instances
        logger.info(f"🎉 Масштабирование вниз завершено: {target_instances} экземпляров")
    
    def _add_docker_service(self, instance_id: int):
        """Добавление нового сервиса в docker-compose"""
        # Здесь можно добавить логику для динамического обновления docker-compose.yml
        # Пока что используем предопределенные сервисы
        pass
    
    def _wait_for_healthy_instance(self, instance_id: int, timeout: int = 60):
        """Ожидание, пока экземпляр станет здоровым"""
        port = 5000 + instance_id
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get(f'http://localhost:{port}/api/health', timeout=5)
                if response.status_code == 200:
                    logger.info(f"✅ Экземпляр {instance_id} стал здоровым")
                    return True
            except Exception:
                pass
            
            time.sleep(5)
        
        logger.warning(f"⚠️ Экземпляр {instance_id} не стал здоровым в течение {timeout} секунд")
        return False
    
    def get_scaling_status(self) -> Dict:
        """Получение статуса масштабирования"""
        return {
            'is_running': self.is_running,
            'current_instances': self.current_instances,
            'min_instances': self.min_instances,
            'max_instances': self.max_instances,
            'last_scale_time': self.last_scale_time,
            'cooldown_remaining': max(0, self.cooldown_period - (time.time() - self.last_scale_time)),
            'metrics_history_count': len(self.metrics_history)
        }


def main():
    """Основная функция"""
    # Конфигурация
    config = {
        'min_instances': 2,
        'max_instances': 10,
        'scale_up_threshold': 70.0,
        'scale_down_threshold': 30.0,
        'cooldown_period': 300,  # 5 минут
        'check_interval': 60  # 1 минута
    }
    
    # Создание и запуск автоскалера
    scaler = AutoScaler(config)
    
    try:
        scaler.start_scaling()
        
        # Основной цикл
        while True:
            time.sleep(60)
            
            # Выводим статус каждую минуту
            status = scaler.get_scaling_status()
            logger.info(f"📊 Статус масштабирования: {status['current_instances']} экземпляров, "
                       f"Cooldown: {status['cooldown_remaining']:.0f}s")
            
    except KeyboardInterrupt:
        logger.info("Получен сигнал остановки")
    finally:
        scaler.stop_scaling()


if __name__ == '__main__':
    import threading
    main()
