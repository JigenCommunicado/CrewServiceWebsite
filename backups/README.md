# 💾 Резервные копии и отчеты

Эта директория содержит резервные копии баз данных и сгенерированные отчеты.

## 📂 Содержимое

### Резервные копии базы данных

Файлы резервных копий имеют следующий формат имени:
```
crewlife_sqlite_backup_YYYYMMDD_HHMMSS.db
```

Где:
- `YYYYMMDD` - дата создания
- `HHMMSS` - время создания

### Отчеты

Отчеты экспортируются в форматах:
- `.xlsx` - Excel файлы
- `.csv` - CSV файлы
- `.pdf` - PDF отчеты

## 🔄 Автоматическое резервное копирование

### Создание резервной копии

```bash
# Создать резервную копию вручную
python3 scripts/backup_manager.py --create

# Резервная копия с описанием
python3 scripts/backup_manager.py --create --description "Before migration"
```

### Восстановление из копии

```bash
# Просмотр доступных копий
python3 scripts/backup_manager.py --list

# Восстановление из конкретной копии
python3 scripts/backup_manager.py --restore backups/crewlife_sqlite_backup_20251005_120000.db
```

### Автоматическое резервное копирование

Настройка через cron для ежедневного бэкапа в 2:00 ночи:

```bash
# Откройте crontab
crontab -e

# Добавьте строку:
0 2 * * * /usr/bin/python3 /root/CrewServiceWebsite/CrewServiceWebsite-1/scripts/backup_manager.py --create
```

## 📊 Ротация резервных копий

Скрипт `backup_manager.py` автоматически управляет ротацией:

- **Ежедневные**: Хранятся 7 дней
- **Еженедельные**: Хранятся 4 недели
- **Ежемесячные**: Хранятся 12 месяцев

Старые копии автоматически удаляются для экономии места.

## 🔒 Безопасность

### Рекомендации

1. **Храните копии в безопасном месте**
   ```bash
   # Копирование на удаленный сервер
   rsync -avz backups/ user@remote-server:/path/to/backups/
   ```

2. **Шифруйте важные данные**
   ```bash
   # Создание зашифрованной копии
   tar czf - backups/*.db | gpg -c > backup_encrypted.tar.gz.gpg
   ```

3. **Проверяйте целостность копий**
   ```bash
   # Проверка резервной копии
   python3 scripts/backup_manager.py --verify backups/crewlife_sqlite_backup_20251005_120000.db
   ```

## 📁 Структура хранения

Рекомендуемая структура для больших проектов:

```
backups/
├── daily/          # Ежедневные копии (7 дней)
├── weekly/         # Еженедельные копии (4 недели)
├── monthly/        # Ежемесячные копии (12 месяцев)
└── reports/        # Отчеты
    ├── 2025/
    │   ├── 01/
    │   ├── 02/
    │   └── ...
```

## 🛠️ Обслуживание

### Проверка размера директории

```bash
du -sh backups/
```

### Очистка старых копий

```bash
# Удалить копии старше 30 дней
find backups/ -name "*.db" -mtime +30 -delete

# Удалить отчеты старше 90 дней
find backups/ -name "*.xlsx" -mtime +90 -delete
```

### Сжатие копий

```bash
# Сжать старые копии для экономии места
gzip backups/*.db

# Массовое сжатие копий старше 7 дней
find backups/ -name "*.db" -mtime +7 -exec gzip {} \;
```

## 📝 Логирование

Все операции резервного копирования логируются в:
```
logs/backup.log
```

Формат лога:
```
[2025-10-05 12:00:00] INFO: Backup created: crewlife_sqlite_backup_20251005_120000.db
[2025-10-05 12:00:05] INFO: Backup size: 15.3 MB
[2025-10-05 12:00:05] INFO: Old backups removed: 2 files
```

## 🆘 Восстановление в случае сбоя

### Полное восстановление

1. **Остановите сервисы**
   ```bash
   pm2 stop all
   ```

2. **Восстановите базу данных**
   ```bash
   python3 scripts/backup_manager.py --restore backups/latest_backup.db
   ```

3. **Проверьте целостность**
   ```bash
   python3 scripts/backup_manager.py --verify crewlife-website/backend/crewlife.db
   ```

4. **Запустите сервисы**
   ```bash
   pm2 start all
   ```

### Частичное восстановление

Если нужно восстановить только определенные таблицы:

```bash
# Экспортировать конкретную таблицу из бэкапа
sqlite3 backups/crewlife_sqlite_backup_20251005_120000.db ".dump users" > users_backup.sql

# Импортировать в текущую БД
sqlite3 crewlife-website/backend/crewlife.db < users_backup.sql
```

## 📞 Поддержка

При проблемах с резервными копиями:
1. Проверьте логи: `logs/backup.log`
2. Убедитесь в наличии свободного места: `df -h`
3. Проверьте права доступа: `ls -la backups/`

---

**⚠️ ВАЖНО**: Регулярно проверяйте работоспособность резервных копий, проводя тестовое восстановление!
