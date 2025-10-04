# 🚀 Быстрые команды для CrewLife

## 📋 Статус системы

```bash
# Проверить все сервисы
systemctl status crewlife-backend nginx mysql

# Проверить порты
netstat -tlnp | grep -E ":(80|443|5000|3306)"

# Проверить диск
df -h

# Проверить память
free -h
```

## 🔧 Управление сервисами

```bash
# Перезапуск бэкенда
systemctl restart crewlife-backend

# Перезагрузка Nginx
systemctl reload nginx

# Перезапуск MySQL
systemctl restart mysql

# Включить автозапуск
systemctl enable crewlife-backend nginx mysql
```

## 📊 Логи

```bash
# Логи бэкенда (live)
journalctl -u crewlife-backend -f

# Логи Nginx
tail -f /var/log/nginx/crewlife.ru.error.log
tail -f /var/log/nginx/crewlife.ru.access.log

# Логи MySQL
tail -f /var/log/mysql/error.log
```

## 🌐 Тестирование

```bash
# Проверить API
curl -s https://crewlife.ru/api/auth/check

# Проверить сайт
curl -s https://crewlife.ru/ | grep -o "<title>.*</title>"

# Проверить SSL
curl -s -I https://crewlife.ru/ | head -3
```

## 🗄️ База данных

```bash
# Подключиться к БД
mysql -u crewlife -pcrewlife123

# Проверить пользователей
mysql -u crewlife -pcrewlife123 -e "SELECT COUNT(*) FROM users;"

# Бэкап БД
mysqldump -u crewlife -pcrewlife123 crewlife > backup.sql
```

## 🔄 Развертывание

```bash
# Полное развертывание
cd /root/crewlife-website/
sudo ./deploy_to_production.sh

# Быстрое обновление
systemctl stop crewlife-backend
cp -r /root/crewlife-website/* /var/www/crewlife.ru/
chown -R www-data:www-data /var/www/crewlife.ru
systemctl start crewlife-backend
```

## 🚨 Экстренное восстановление

```bash
# Если всё сломалось
systemctl stop crewlife-backend nginx
systemctl start mysql
systemctl start nginx
systemctl start crewlife-backend

# Проверить что работает
systemctl status crewlife-backend nginx mysql
curl -s https://crewlife.ru/api/auth/check
```

## 🔍 Диагностика проблем

```bash
# Nginx не запускается
nginx -t
systemctl status nginx
netstat -tlnp | grep :80

# Бэкенд не отвечает
systemctl status crewlife-backend
journalctl -u crewlife-backend -n 20
netstat -tlnp | grep :5000

# База данных недоступна
systemctl status mysql
mysql -u crewlife -pcrewlife123 -e "SELECT 1;"
```

## 📁 Важные файлы

```bash
# Конфигурация Nginx
/etc/nginx/sites-available/crewlife.ru

# Сервис бэкенда
/etc/systemd/system/crewlife-backend.service

# Файлы сайта
/var/www/crewlife.ru/

# Логи
/var/log/nginx/crewlife.ru.*.log
journalctl -u crewlife-backend
```

## 🔑 Доступы

```
Сайт: https://crewlife.ru
API: https://crewlife.ru/api/
Админ: https://crewlife.ru/admin

Email: admin@crewlife.ru
Пароль: admin123

БД пользователь: crewlife
БД пароль: crewlife123
БД название: crewlife
```
