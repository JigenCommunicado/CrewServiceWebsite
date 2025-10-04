# Настройка базы данных MariaDB для CrewLife

## Обзор

База данных настроена для хранения данных пользователей, идентичных полям регистрации на сайте:

- **ФИО (полностью)**: `full_name`
- **Табельный номер**: `employee_id` 
- **Должность**: `position`
- **Локация**: `location`

## Структура таблиц

### Таблица `users`
```sql
- id (VARCHAR(36)) - Уникальный ID пользователя
- employee_id (VARCHAR(50)) - Табельный номер (уникальный)
- full_name (VARCHAR(255)) - ФИО полностью
- password (VARCHAR(255)) - Хешированный пароль
- position (VARCHAR(100)) - Должность
- location (VARCHAR(100)) - Локация
- is_active (BOOLEAN) - Статус активности
- created_at (TIMESTAMP) - Дата создания
- last_login (TIMESTAMP) - Последний вход
```

### Дополнительные таблицы
- `flight_orders` - Заявки на авиабилеты
- `hotel_orders` - Заявки на отели

## Настройка для продакшена

### 1. Установка MariaDB

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mariadb-server mariadb-client

# CentOS/RHEL
sudo yum install mariadb-server mariadb
```

### 2. Настройка MariaDB

```bash
# Запуск службы
sudo systemctl start mariadb
sudo systemctl enable mariadb

# Безопасная настройка
sudo mysql_secure_installation
```

### 3. Создание пользователя и базы данных

```sql
-- Подключение к MariaDB
sudo mysql -u root -p

-- Создание пользователя для приложения
CREATE USER 'crewlife_user'@'localhost' IDENTIFIED BY 'your_secure_password';
CREATE DATABASE crewlife_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON crewlife_prod.* TO 'crewlife_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Настройка переменных окружения

Скопируйте `config/production.env` в `.env` и настройте:

```bash
cp config/production.env .env
```

Отредактируйте `.env`:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=crewlife_user
DB_PASSWORD=your_secure_password_here
DB_NAME=crewlife_prod
```

### 5. Инициализация базы данных

```bash
# Установка зависимостей
npm install

# Инициализация базы данных
npm run db:init

# Тестирование подключения
npm run db:test
```

## Использование

### Модель User

```javascript
const User = require('./src/models/User');

// Создание пользователя
const userData = {
  employeeId: '12345',
  fullName: 'Иванов Иван Иванович',
  password: 'password123',
  position: 'БП',
  location: 'Москва'
};
const userId = await User.create(userData);

// Поиск пользователя
const user = await User.findByEmployeeId('12345');

// Проверка пароля
const isValid = await user.checkPassword('password123');

// Обновление данных
await user.update({
  full_name: 'Новое ФИО',
  position: 'СБЭ'
});
```

### Прямые SQL запросы

```javascript
const { query } = require('./src/config/database');

// Выполнение запроса
const users = await query('SELECT * FROM users WHERE is_active = ?', [true]);

// Транзакции
const { transaction } = require('./src/config/database');
await transaction(async (connection) => {
  await connection.execute('INSERT INTO users ...');
  await connection.execute('UPDATE users ...');
});
```

## Безопасность

1. **Пароли**: Хешируются с помощью bcrypt (12 раундов)
2. **SQL инъекции**: Защита через параметризованные запросы
3. **Подключения**: Использование пула соединений
4. **Права доступа**: Отдельный пользователь БД с минимальными правами

## Мониторинг

### Проверка статуса

```bash
# Тест подключения
npm run db:test

# Проверка таблиц
mysql -u crewlife_user -p crewlife_prod -e "SHOW TABLES;"

# Статистика пользователей
mysql -u crewlife_user -p crewlife_prod -e "SELECT COUNT(*) as total_users FROM users;"
```

### Логи

Логи подключения и ошибок записываются в консоль приложения.

## Резервное копирование

```bash
# Создание бэкапа
mysqldump -u crewlife_user -p crewlife_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Восстановление
mysql -u crewlife_user -p crewlife_prod < backup_file.sql
```

## Производительность

- Индексы на часто используемые поля
- Пул соединений (максимум 10)
- UTF8MB4 для поддержки эмодзи
- InnoDB движок для транзакций
