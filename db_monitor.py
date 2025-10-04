#!/usr/bin/env python3
"""
Мониторинг базы данных MariaDB в реальном времени
"""

import subprocess
import time
import json
import os
from datetime import datetime

class DatabaseMonitor:
    def __init__(self):
        self.db_config = {
            'user': 'crewlife_user',
            'password': 'andrei8002012',
            'database': 'crewlife_prod'
        }
    
    def run_mysql_query(self, query):
        """Выполнение SQL запроса"""
        try:
            cmd = f"mysql -u {self.db_config['user']} -p{self.db_config['password']} {self.db_config['database']} -e \"{query}\""
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
            if result.returncode == 0:
                return result.stdout.strip()
            else:
                return f"Ошибка: {result.stderr}"
        except Exception as e:
            return f"Ошибка выполнения: {e}"
    
    def get_database_stats(self):
        """Получение статистики базы данных"""
        stats = {}
        
        # Количество пользователей
        users_result = self.run_mysql_query("SELECT COUNT(*) FROM users WHERE is_active = 1")
        stats['active_users'] = users_result.split('\n')[-1] if users_result else "0"
        
        # Количество заявок
        requests_result = self.run_mysql_query("SELECT COUNT(*) FROM requests")
        stats['total_requests'] = requests_result.split('\n')[-1] if requests_result else "0"
        
        # Заявки по статусам
        pending_result = self.run_mysql_query("SELECT COUNT(*) FROM requests WHERE status = 'pending'")
        stats['pending_requests'] = pending_result.split('\n')[-1] if pending_result else "0"
        
        # Размер базы данных
        size_result = self.run_mysql_query("SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'DB Size in MB' FROM information_schema.tables WHERE table_schema = 'crewlife_prod'")
        stats['db_size_mb'] = size_result.split('\n')[-1] if size_result else "0"
        
        # Последние логи
        logs_result = self.run_mysql_query("SELECT action, details, created_at FROM logs ORDER BY created_at DESC LIMIT 5")
        stats['recent_logs'] = logs_result if logs_result else "Нет логов"
        
        return stats
    
    def get_connection_info(self):
        """Информация о подключениях"""
        connections_result = self.run_mysql_query("SHOW PROCESSLIST")
        return connections_result if connections_result else "Нет активных подключений"
    
    def get_table_info(self):
        """Информация о таблицах"""
        tables_result = self.run_mysql_query("SHOW TABLE STATUS")
        return tables_result if tables_result else "Ошибка получения информации о таблицах"
    
    def monitor_loop(self, interval=5):
        """Основной цикл мониторинга"""
        print("🔍 Запуск мониторинга базы данных в реальном времени")
        print("=" * 60)
        print("Нажмите Ctrl+C для остановки")
        print("=" * 60)
        
        try:
            while True:
                # Очищаем экран
                os.system('clear')
                
                print(f"📊 МОНИТОРИНГ БАЗЫ ДАННЫХ - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                print("=" * 60)
                
                # Получаем статистику
                stats = self.get_database_stats()
                
                print("📈 СТАТИСТИКА:")
                print(f"   👥 Активных пользователей: {stats['active_users']}")
                print(f"   📝 Всего заявок: {stats['total_requests']}")
                print(f"   ⏳ Заявок в обработке: {stats['pending_requests']}")
                print(f"   💾 Размер БД: {stats['db_size_mb']} MB")
                
                print("\n📋 ПОСЛЕДНИЕ ДЕЙСТВИЯ:")
                if stats['recent_logs'] != "Нет логов":
                    logs_lines = stats['recent_logs'].split('\n')[1:6]  # Пропускаем заголовок
                    for log in logs_lines:
                        if log.strip():
                            print(f"   {log}")
                else:
                    print("   Нет недавних логов")
                
                print("\n🔗 АКТИВНЫЕ ПОДКЛЮЧЕНИЯ:")
                connections = self.get_connection_info()
                if connections != "Нет активных подключений":
                    conn_lines = connections.split('\n')[1:4]  # Показываем первые 3
                    for conn in conn_lines:
                        if conn.strip():
                            print(f"   {conn}")
                else:
                    print("   Нет активных подключений")
                
                print(f"\n⏱️  Обновление каждые {interval} секунд...")
                print("=" * 60)
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            print("\n\n🛑 Мониторинг остановлен")
    
    def export_stats(self, filename=None):
        """Экспорт статистики в JSON"""
        if not filename:
            filename = f"db_stats_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        stats = self.get_database_stats()
        stats['timestamp'] = datetime.now().isoformat()
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(stats, f, ensure_ascii=False, indent=2)
            print(f"✅ Статистика экспортирована в {filename}")
            return filename
        except Exception as e:
            print(f"❌ Ошибка экспорта: {e}")
            return None

def main():
    """Главная функция"""
    monitor = DatabaseMonitor()
    
    print("🔍 Мониторинг базы данных CrewLife")
    print("=" * 40)
    print("1. Мониторинг в реальном времени")
    print("2. Показать текущую статистику")
    print("3. Экспортировать статистику")
    print("4. Информация о таблицах")
    print("5. Активные подключения")
    print("=" * 40)
    
    choice = input("Выберите опцию (1-5): ").strip()
    
    if choice == "1":
        interval = input("Интервал обновления в секундах (по умолчанию 5): ").strip()
        try:
            interval = int(interval) if interval else 5
        except ValueError:
            interval = 5
        monitor.monitor_loop(interval)
    
    elif choice == "2":
        stats = monitor.get_database_stats()
        print("\n📊 ТЕКУЩАЯ СТАТИСТИКА:")
        print("=" * 30)
        for key, value in stats.items():
            if key != 'recent_logs':
                print(f"{key}: {value}")
    
    elif choice == "3":
        filename = monitor.export_stats()
        if filename:
            print(f"📁 Файл сохранен: {filename}")
    
    elif choice == "4":
        print("\n📋 ИНФОРМАЦИЯ О ТАБЛИЦАХ:")
        print("=" * 40)
        table_info = monitor.get_table_info()
        print(table_info)
    
    elif choice == "5":
        print("\n🔗 АКТИВНЫЕ ПОДКЛЮЧЕНИЯ:")
        print("=" * 40)
        connections = monitor.get_connection_info()
        print(connections)
    
    else:
        print("❌ Неверный выбор")

if __name__ == "__main__":
    main()
