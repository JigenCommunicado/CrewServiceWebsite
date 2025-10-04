#!/usr/bin/env python3
"""
Менеджер резервного копирования для CrewLife
"""

import subprocess
import os
import shutil
import gzip
import json
from datetime import datetime, timedelta
import schedule
import time

class BackupManager:
    def __init__(self):
        self.backup_dir = "/root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/backups"
        self.retention_days = 30
        self.db_config = {
            'user': 'crewlife_user',
            'password': 'andrei8002012',
            'database': 'crewlife_prod'
        }
        
        # Создаем директорию для бэкапов
        os.makedirs(self.backup_dir, exist_ok=True)
    
    def create_database_backup(self):
        """Создание резервной копии базы данных"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(self.backup_dir, f"crewlife_db_{timestamp}.sql")
        
        try:
            # Создаем дамп базы данных
            cmd = [
                'mysqldump',
                '-u', self.db_config['user'],
                f'-p{self.db_config["password"]}',
                '--single-transaction',
                '--routines',
                '--triggers',
                self.db_config['database']
            ]
            
            with open(backup_file, 'w') as f:
                result = subprocess.run(cmd, stdout=f, stderr=subprocess.PIPE, text=True)
            
            if result.returncode == 0:
                # Сжимаем файл
                compressed_file = f"{backup_file}.gz"
                with open(backup_file, 'rb') as f_in:
                    with gzip.open(compressed_file, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
                
                # Удаляем несжатый файл
                os.remove(backup_file)
                
                print(f"✅ Резервная копия БД создана: {compressed_file}")
                return compressed_file
            else:
                print(f"❌ Ошибка создания резервной копии БД: {result.stderr}")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка создания резервной копии БД: {e}")
            return None
    
    def create_files_backup(self):
        """Создание резервной копии файлов приложения"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = os.path.join(self.backup_dir, f"crewlife_files_{timestamp}.tar.gz")
        
        try:
            # Создаем архив файлов приложения
            app_dir = "/root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite"
            cmd = [
                'tar',
                '-czf',
                backup_file,
                '-C',
                os.path.dirname(app_dir),
                '--exclude=backups',
                '--exclude=.git',
                '--exclude=__pycache__',
                '--exclude=*.pyc',
                os.path.basename(app_dir)
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"✅ Резервная копия файлов создана: {backup_file}")
                return backup_file
            else:
                print(f"❌ Ошибка создания резервной копии файлов: {result.stderr}")
                return None
                
        except Exception as e:
            print(f"❌ Ошибка создания резервной копии файлов: {e}")
            return None
    
    def create_full_backup(self):
        """Создание полной резервной копии"""
        print(f"🔄 Создание полной резервной копии - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Создаем резервные копии
        db_backup = self.create_database_backup()
        files_backup = self.create_files_backup()
        
        # Создаем метаданные резервной копии
        metadata = {
            'timestamp': datetime.now().isoformat(),
            'database_backup': db_backup,
            'files_backup': files_backup,
            'size': {
                'database': os.path.getsize(db_backup) if db_backup and os.path.exists(db_backup) else 0,
                'files': os.path.getsize(files_backup) if files_backup and os.path.exists(files_backup) else 0
            }
        }
        
        metadata_file = os.path.join(self.backup_dir, f"backup_metadata_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json")
        with open(metadata_file, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        total_size = metadata['size']['database'] + metadata['size']['files']
        print(f"🎉 Полная резервная копия создана (размер: {total_size / (1024*1024):.1f} MB)")
        
        return metadata
    
    def cleanup_old_backups(self):
        """Очистка старых резервных копий"""
        print("🧹 Очистка старых резервных копий...")
        
        cutoff_date = datetime.now() - timedelta(days=self.retention_days)
        deleted_count = 0
        
        try:
            for filename in os.listdir(self.backup_dir):
                file_path = os.path.join(self.backup_dir, filename)
                
                if os.path.isfile(file_path):
                    file_time = datetime.fromtimestamp(os.path.getmtime(file_path))
                    
                    if file_time < cutoff_date:
                        os.remove(file_path)
                        deleted_count += 1
                        print(f"🗑️  Удален старый файл: {filename}")
            
            print(f"✅ Удалено {deleted_count} старых файлов")
            
        except Exception as e:
            print(f"❌ Ошибка очистки: {e}")
    
    def list_backups(self):
        """Список резервных копий"""
        print("📋 Список резервных копий:")
        print("=" * 60)
        
        backups = []
        for filename in os.listdir(self.backup_dir):
            if filename.endswith('.json'):
                file_path = os.path.join(self.backup_dir, filename)
                try:
                    with open(file_path, 'r') as f:
                        metadata = json.load(f)
                    backups.append(metadata)
                except:
                    continue
        
        # Сортируем по времени создания
        backups.sort(key=lambda x: x['timestamp'], reverse=True)
        
        for i, backup in enumerate(backups[:10]):  # Показываем последние 10
            timestamp = datetime.fromisoformat(backup['timestamp'])
            total_size = backup['size']['database'] + backup['size']['files']
            
            print(f"{i+1:2d}. {timestamp.strftime('%Y-%m-%d %H:%M:%S')}")
            print(f"    Размер: {total_size / (1024*1024):.1f} MB")
            print(f"    БД: {os.path.basename(backup['database_backup'])}")
            print(f"    Файлы: {os.path.basename(backup['files_backup'])}")
            print()
    
    def restore_database(self, backup_file):
        """Восстановление базы данных из резервной копии"""
        if not os.path.exists(backup_file):
            print(f"❌ Файл резервной копии не найден: {backup_file}")
            return False
        
        try:
            print(f"🔄 Восстановление базы данных из {backup_file}...")
            
            # Распаковываем если нужно
            if backup_file.endswith('.gz'):
                temp_file = backup_file.replace('.gz', '_temp.sql')
                with gzip.open(backup_file, 'rb') as f_in:
                    with open(temp_file, 'wb') as f_out:
                        shutil.copyfileobj(f_in, f_out)
                restore_file = temp_file
            else:
                restore_file = backup_file
            
            # Восстанавливаем базу данных
            cmd = [
                'mysql',
                '-u', self.db_config['user'],
                f'-p{self.db_config["password"]}',
                self.db_config['database']
            ]
            
            with open(restore_file, 'r') as f:
                result = subprocess.run(cmd, stdin=f, capture_output=True, text=True)
            
            # Удаляем временный файл
            if backup_file.endswith('.gz'):
                os.remove(restore_file)
            
            if result.returncode == 0:
                print("✅ База данных успешно восстановлена")
                return True
            else:
                print(f"❌ Ошибка восстановления: {result.stderr}")
                return False
                
        except Exception as e:
            print(f"❌ Ошибка восстановления: {e}")
            return False
    
    def setup_automatic_backups(self):
        """Настройка автоматических резервных копий"""
        print("⚙️  Настройка автоматических резервных копий...")
        
        # Планируем резервные копии
        schedule.every().day.at("02:00").do(self.create_full_backup)
        schedule.every().day.at("14:00").do(self.cleanup_old_backups)
        
        # Создаем cron задачу
        cron_script = f"""#!/bin/bash
# Автоматические резервные копии CrewLife
cd /root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite
python3 backup_manager.py --auto-backup
"""
        
        cron_file = "/etc/cron.d/crewlife-backup"
        with open(cron_file, 'w') as f:
            f.write("0 2 * * * root /root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/backup_manager.py --auto-backup\n")
            f.write("0 14 * * * root /root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/backup_manager.py --cleanup\n")
        
        print("✅ Автоматические резервные копии настроены")
        print("   - Ежедневно в 02:00 - создание резервной копии")
        print("   - Ежедневно в 14:00 - очистка старых копий")
    
    def run_automatic_backup(self):
        """Запуск автоматической резервной копии"""
        self.create_full_backup()
        self.cleanup_old_backups()

def main():
    """Главная функция"""
    import sys
    
    backup_manager = BackupManager()
    
    if len(sys.argv) > 1:
        if sys.argv[1] == '--auto-backup':
            backup_manager.run_automatic_backup()
            return
        elif sys.argv[1] == '--cleanup':
            backup_manager.cleanup_old_backups()
            return
    
    print("💾 Менеджер резервного копирования CrewLife")
    print("=" * 50)
    print("1. Создать полную резервную копию")
    print("2. Создать резервную копию БД")
    print("3. Создать резервную копию файлов")
    print("4. Список резервных копий")
    print("5. Восстановить базу данных")
    print("6. Очистить старые копии")
    print("7. Настроить автоматические копии")
    print("=" * 50)
    
    choice = input("Выберите опцию (1-7): ").strip()
    
    if choice == "1":
        backup_manager.create_full_backup()
    elif choice == "2":
        backup_manager.create_database_backup()
    elif choice == "3":
        backup_manager.create_files_backup()
    elif choice == "4":
        backup_manager.list_backups()
    elif choice == "5":
        backup_file = input("Путь к файлу резервной копии: ").strip()
        backup_manager.restore_database(backup_file)
    elif choice == "6":
        backup_manager.cleanup_old_backups()
    elif choice == "7":
        backup_manager.setup_automatic_backups()
    else:
        print("❌ Неверный выбор")

if __name__ == "__main__":
    main()
