#!/usr/bin/env python3
"""
Системный мониторинг для CrewLife
"""

import psutil
import subprocess
import json
import time
import os
from datetime import datetime

class SystemMonitor:
    def __init__(self):
        self.log_file = "/var/log/crewlife_monitor.log"
        self.alert_thresholds = {
            'cpu_percent': 80,
            'memory_percent': 85,
            'disk_percent': 90,
            'load_average': 2.0
        }
    
    def get_system_stats(self):
        """Получение системной статистики"""
        stats = {
            'timestamp': datetime.now().isoformat(),
            'cpu': {
                'percent': psutil.cpu_percent(interval=1),
                'count': psutil.cpu_count(),
                'load_avg': os.getloadavg() if hasattr(os, 'getloadavg') else [0, 0, 0]
            },
            'memory': {
                'total': psutil.virtual_memory().total,
                'available': psutil.virtual_memory().available,
                'percent': psutil.virtual_memory().percent,
                'used': psutil.virtual_memory().used
            },
            'disk': {
                'total': psutil.disk_usage('/').total,
                'used': psutil.disk_usage('/').used,
                'free': psutil.disk_usage('/').free,
                'percent': psutil.disk_usage('/').percent
            },
            'network': {
                'bytes_sent': psutil.net_io_counters().bytes_sent,
                'bytes_recv': psutil.net_io_counters().bytes_recv,
                'packets_sent': psutil.net_io_counters().packets_sent,
                'packets_recv': psutil.net_io_counters().packets_recv
            },
            'processes': {
                'total': len(psutil.pids()),
                'crewlife_processes': self.get_crewlife_processes()
            }
        }
        return stats
    
    def get_crewlife_processes(self):
        """Получение процессов CrewLife"""
        crewlife_processes = []
        for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_percent', 'cmdline']):
            try:
                if any('crewlife' in str(cmd).lower() for cmd in proc.info['cmdline']):
                    crewlife_processes.append({
                        'pid': proc.info['pid'],
                        'name': proc.info['name'],
                        'cpu_percent': proc.info['cpu_percent'],
                        'memory_percent': proc.info['memory_percent'],
                        'cmdline': ' '.join(proc.info['cmdline'])
                    })
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        return crewlife_processes
    
    def get_database_stats(self):
        """Получение статистики базы данных"""
        try:
            # Количество подключений
            result = subprocess.run([
                'mysql', '-u', 'crewlife_user', '-pandrei8002012', 'crewlife_prod',
                '-e', "SHOW STATUS LIKE 'Threads_connected'"
            ], capture_output=True, text=True)
            
            connections = 0
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                if len(lines) > 1:
                    connections = int(lines[1].split('\t')[1])
            
            # Размер базы данных
            result = subprocess.run([
                'mysql', '-u', 'crewlife_user', '-pandrei8002012', 'crewlife_prod',
                '-e', "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'DB Size in MB' FROM information_schema.tables WHERE table_schema = 'crewlife_prod'"
            ], capture_output=True, text=True)
            
            db_size = 0
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                if len(lines) > 1:
                    db_size = float(lines[1])
            
            return {
                'connections': connections,
                'size_mb': db_size,
                'status': 'online'
            }
        except Exception as e:
            return {
                'connections': 0,
                'size_mb': 0,
                'status': 'error',
                'error': str(e)
            }
    
    def check_alerts(self, stats):
        """Проверка на превышение пороговых значений"""
        alerts = []
        
        if stats['cpu']['percent'] > self.alert_thresholds['cpu_percent']:
            alerts.append(f"⚠️ Высокая загрузка CPU: {stats['cpu']['percent']:.1f}%")
        
        if stats['memory']['percent'] > self.alert_thresholds['memory_percent']:
            alerts.append(f"⚠️ Высокое использование памяти: {stats['memory']['percent']:.1f}%")
        
        if stats['disk']['percent'] > self.alert_thresholds['disk_percent']:
            alerts.append(f"⚠️ Мало места на диске: {stats['disk']['percent']:.1f}%")
        
        if stats['cpu']['load_avg'][0] > self.alert_thresholds['load_average']:
            alerts.append(f"⚠️ Высокая нагрузка системы: {stats['cpu']['load_avg'][0]:.2f}")
        
        return alerts
    
    def log_stats(self, stats, alerts):
        """Логирование статистики"""
        log_entry = {
            'timestamp': stats['timestamp'],
            'stats': stats,
            'alerts': alerts
        }
        
        try:
            with open(self.log_file, 'a') as f:
                f.write(json.dumps(log_entry) + '\n')
        except Exception as e:
            print(f"Ошибка записи в лог: {e}")
    
    def monitor_loop(self, interval=30):
        """Основной цикл мониторинга"""
        print("🔍 Запуск системного мониторинга CrewLife")
        print("=" * 50)
        print("Нажмите Ctrl+C для остановки")
        print("=" * 50)
        
        try:
            while True:
                # Получаем статистику
                stats = self.get_system_stats()
                db_stats = self.get_database_stats()
                stats['database'] = db_stats
                
                # Проверяем алерты
                alerts = self.check_alerts(stats)
                
                # Логируем
                self.log_stats(stats, alerts)
                
                # Выводим на экран
                self.print_stats(stats, alerts)
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n\n🛑 Мониторинг остановлен")
    
    def print_stats(self, stats, alerts):
        """Вывод статистики на экран"""
        os.system('clear')
        
        print(f"📊 СИСТЕМНЫЙ МОНИТОРИНГ - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # CPU
        print(f"🖥️  CPU: {stats['cpu']['percent']:.1f}% (ядер: {stats['cpu']['count']})")
        print(f"   Нагрузка: {stats['cpu']['load_avg'][0]:.2f} {stats['cpu']['load_avg'][1]:.2f} {stats['cpu']['load_avg'][2]:.2f}")
        
        # Память
        memory_gb = stats['memory']['total'] / (1024**3)
        memory_used_gb = stats['memory']['used'] / (1024**3)
        print(f"💾 Память: {stats['memory']['percent']:.1f}% ({memory_used_gb:.1f}GB / {memory_gb:.1f}GB)")
        
        # Диск
        disk_gb = stats['disk']['total'] / (1024**3)
        disk_used_gb = stats['disk']['used'] / (1024**3)
        print(f"💿 Диск: {stats['disk']['percent']:.1f}% ({disk_used_gb:.1f}GB / {disk_gb:.1f}GB)")
        
        # Сеть
        network_mb_sent = stats['network']['bytes_sent'] / (1024**2)
        network_mb_recv = stats['network']['bytes_recv'] / (1024**2)
        print(f"🌐 Сеть: Отправлено {network_mb_sent:.1f}MB, Получено {network_mb_recv:.1f}MB")
        
        # Процессы
        print(f"⚙️  Процессы: {stats['processes']['total']} (CrewLife: {len(stats['processes']['crewlife_processes'])})")
        
        # База данных
        if stats['database']['status'] == 'online':
            print(f"🗄️  База данных: {stats['database']['connections']} подключений, {stats['database']['size_mb']:.1f}MB")
        else:
            print(f"🗄️  База данных: ❌ Ошибка")
        
        # Алерты
        if alerts:
            print("\n🚨 АЛЕРТЫ:")
            for alert in alerts:
                print(f"   {alert}")
        else:
            print("\n✅ Все системы работают нормально")
        
        print("=" * 60)

def main():
    """Главная функция"""
    monitor = SystemMonitor()
    
    print("🔍 Системный мониторинг CrewLife")
    print("=" * 40)
    print("1. Мониторинг в реальном времени")
    print("2. Показать текущую статистику")
    print("3. Просмотр логов")
    print("=" * 40)
    
    choice = input("Выберите опцию (1-3): ").strip()
    
    if choice == "1":
        interval = input("Интервал обновления в секундах (по умолчанию 30): ").strip()
        try:
            interval = int(interval) if interval else 30
        except ValueError:
            interval = 30
        monitor.monitor_loop(interval)
    
    elif choice == "2":
        stats = monitor.get_system_stats()
        db_stats = monitor.get_database_stats()
        stats['database'] = db_stats
        alerts = monitor.check_alerts(stats)
        monitor.print_stats(stats, alerts)
    
    elif choice == "3":
        if os.path.exists(monitor.log_file):
            print(f"\n📋 Последние записи из {monitor.log_file}:")
            print("=" * 50)
            with open(monitor.log_file, 'r') as f:
                lines = f.readlines()
                for line in lines[-10:]:  # Последние 10 записей
                    try:
                        data = json.loads(line.strip())
                        print(f"{data['timestamp']}: {len(data['alerts'])} алертов")
                    except:
                        print(line.strip())
        else:
            print("❌ Лог файл не найден")
    
    else:
        print("❌ Неверный выбор")

if __name__ == "__main__":
    main()
