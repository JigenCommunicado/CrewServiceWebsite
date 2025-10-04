#!/bin/bash
# Скрипт настройки SSL, мониторинга и резервного копирования для CrewLife

echo "🚀 Настройка SSL, мониторинга и резервного копирования CrewLife"
echo "=============================================================="

# Установка необходимых пакетов
echo "📦 Устанавливаем необходимые пакеты..."
apt update
apt install -y python3-psutil python3-schedule nginx certbot python3-certbot-nginx

# Настройка SSL
echo "🔒 Настраиваем SSL..."
chmod +x setup_ssl.sh
./setup_ssl.sh

# Создание директорий для мониторинга
echo "📁 Создаем директории для мониторинга..."
mkdir -p /var/log/crewlife
mkdir -p /root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/backups
mkdir -p /root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/monitoring

# Настройка прав доступа
echo "🔐 Настраиваем права доступа..."
chmod +x db_monitor.py
chmod +x web_db_monitor.py
chmod +x system_monitor.py
chmod +x backup_manager.py

# Создание systemd сервисов
echo "⚙️  Создаем systemd сервисы..."

# Сервис веб-мониторинга
cat > /etc/systemd/system/crewlife-web-monitor.service << 'EOF'
[Unit]
Description=CrewLife Web Database Monitor
After=network.target mariadb.service

[Service]
Type=simple
User=root
WorkingDirectory=/root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite
ExecStart=/usr/bin/python3 web_db_monitor.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Сервис системного мониторинга
cat > /etc/systemd/system/crewlife-system-monitor.service << 'EOF'
[Unit]
Description=CrewLife System Monitor
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite
ExecStart=/usr/bin/python3 system_monitor.py --daemon
Restart=always
RestartSec=30

[Install]
WantedBy=multi-user.target
EOF

# Активация сервисов
echo "🔄 Активируем сервисы..."
systemctl daemon-reload
systemctl enable crewlife-web-monitor
systemctl enable crewlife-system-monitor

# Настройка автоматических резервных копий
echo "💾 Настраиваем автоматические резервные копии..."
python3 backup_manager.py --setup-auto

# Создание скрипта запуска всех сервисов
cat > start_monitoring.sh << 'EOF'
#!/bin/bash
# Запуск всех сервисов мониторинга CrewLife

echo "🚀 Запуск сервисов мониторинга CrewLife..."

# Запускаем веб-мониторинг
systemctl start crewlife-web-monitor
echo "✅ Веб-мониторинг запущен (порт 5001)"

# Запускаем системный мониторинг
systemctl start crewlife-system-monitor
echo "✅ Системный мониторинг запущен"

# Проверяем статус
echo ""
echo "📊 Статус сервисов:"
systemctl status crewlife-web-monitor --no-pager -l
systemctl status crewlife-system-monitor --no-pager -l

echo ""
echo "🌐 Доступ к веб-мониторингу:"
echo "   http://localhost:5001"
echo "   http://crewlife.ru:5001 (если настроен DNS)"
echo ""
echo "🔍 Консольный мониторинг БД:"
echo "   python3 db_monitor.py"
echo ""
echo "📊 Системный мониторинг:"
echo "   python3 system_monitor.py"
echo ""
echo "💾 Резервные копии:"
echo "   python3 backup_manager.py"
EOF

chmod +x start_monitoring.sh

# Создание скрипта остановки
cat > stop_monitoring.sh << 'EOF'
#!/bin/bash
# Остановка всех сервисов мониторинга CrewLife

echo "🛑 Остановка сервисов мониторинга CrewLife..."

systemctl stop crewlife-web-monitor
systemctl stop crewlife-system-monitor

echo "✅ Все сервисы мониторинга остановлены"
EOF

chmod +x stop_monitoring.sh

# Создание скрипта проверки статуса
cat > check_monitoring.sh << 'EOF'
#!/bin/bash
# Проверка статуса всех сервисов мониторинга

echo "📊 Статус сервисов мониторинга CrewLife"
echo "======================================"

echo "🌐 Веб-мониторинг БД:"
systemctl is-active crewlife-web-monitor && echo "✅ Активен" || echo "❌ Неактивен"

echo "📊 Системный мониторинг:"
systemctl is-active crewlife-system-monitor && echo "✅ Активен" || echo "❌ Неактивен"

echo "🗄️  База данных MariaDB:"
systemctl is-active mariadb && echo "✅ Активна" || echo "❌ Неактивна"

echo "🌐 Nginx:"
systemctl is-active nginx && echo "✅ Активен" || echo "❌ Неактивен"

echo ""
echo "🔗 Доступные интерфейсы:"
echo "   Веб-мониторинг БД: http://localhost:5001"
echo "   Основной сайт: http://localhost (или https://crewlife.ru)"
echo ""
echo "📋 Полезные команды:"
echo "   ./start_monitoring.sh  - Запуск всех сервисов"
echo "   ./stop_monitoring.sh   - Остановка всех сервисов"
echo "   python3 db_monitor.py  - Консольный мониторинг БД"
echo "   python3 system_monitor.py - Системный мониторинг"
echo "   python3 backup_manager.py - Управление резервными копиями"
EOF

chmod +x check_monitoring.sh

# Создание документации
cat > MONITORING_GUIDE.md << 'EOF'
# 🔍 Руководство по мониторингу CrewLife

## 📊 Доступные инструменты мониторинга

### 1. Веб-мониторинг базы данных
- **URL**: http://localhost:5001
- **Описание**: Веб-интерфейс для просмотра базы данных в реальном времени
- **Функции**:
  - Статистика пользователей и заявок
  - Просмотр таблиц в реальном времени
  - Автообновление данных
  - История действий

### 2. Консольный мониторинг БД
```bash
python3 db_monitor.py
```
- **Функции**:
  - Мониторинг в реальном времени
  - Экспорт статистики
  - Просмотр активных подключений
  - Информация о таблицах

### 3. Системный мониторинг
```bash
python3 system_monitor.py
```
- **Функции**:
  - Мониторинг CPU, памяти, диска
  - Сетевая статистика
  - Процессы CrewLife
  - Алерты при превышении порогов

### 4. Резервное копирование
```bash
python3 backup_manager.py
```
- **Функции**:
  - Автоматические резервные копии
  - Восстановление данных
  - Очистка старых копий
  - Управление расписанием

## 🚀 Управление сервисами

### Запуск всех сервисов
```bash
./start_monitoring.sh
```

### Остановка всех сервисов
```bash
./stop_monitoring.sh
```

### Проверка статуса
```bash
./check_monitoring.sh
```

### Ручное управление сервисами
```bash
# Веб-мониторинг
systemctl start/stop/restart crewlife-web-monitor
systemctl status crewlife-web-monitor

# Системный мониторинг
systemctl start/stop/restart crewlife-system-monitor
systemctl status crewlife-system-monitor
```

## 🔒 SSL настройка

### Получение SSL сертификата
```bash
sudo certbot --nginx -d crewlife.ru -d www.crewlife.ru
```

### Автоматическое обновление
```bash
sudo crontab -e
# Добавить строку:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 📋 Логи и мониторинг

### Логи приложения
- `/var/log/nginx/crewlife_access.log` - Логи доступа
- `/var/log/nginx/crewlife_error.log` - Логи ошибок
- `/var/log/crewlife_monitor.log` - Логи системного мониторинга

### Резервные копии
- Директория: `/root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/backups/`
- Расписание: Ежедневно в 02:00
- Хранение: 30 дней

## ⚠️ Важные порты

- **80/443** - Nginx (основной сайт)
- **5000** - API сервер CrewLife
- **5001** - Веб-мониторинг БД
- **3306** - MariaDB

## 🆘 Устранение неполадок

### Проверка подключения к БД
```bash
mysql -u crewlife_user -pandrei8002012 crewlife_prod -e "SELECT 1"
```

### Проверка логов
```bash
journalctl -u crewlife-web-monitor -f
journalctl -u crewlife-system-monitor -f
```

### Перезапуск всех сервисов
```bash
./stop_monitoring.sh
./start_monitoring.sh
```
EOF

echo ""
echo "🎉 НАСТРОЙКА ЗАВЕРШЕНА!"
echo "======================"
echo ""
echo "📋 Что было настроено:"
echo "   ✅ SSL конфигурация (nginx)"
echo "   ✅ Веб-мониторинг БД (порт 5001)"
echo "   ✅ Системный мониторинг"
echo "   ✅ Автоматические резервные копии"
echo "   ✅ Systemd сервисы"
echo "   ✅ Скрипты управления"
echo ""
echo "🚀 Для запуска мониторинга:"
echo "   ./start_monitoring.sh"
echo ""
echo "📊 Для проверки статуса:"
echo "   ./check_monitoring.sh"
echo ""
echo "📖 Документация:"
echo "   cat MONITORING_GUIDE.md"
echo ""
echo "⚠️  Следующие шаги:"
echo "   1. Настройте DNS для crewlife.ru"
echo "   2. Получите SSL сертификат: sudo certbot --nginx -d crewlife.ru"
echo "   3. Запустите мониторинг: ./start_monitoring.sh"
echo "   4. Проверьте доступ: http://localhost:5001"
