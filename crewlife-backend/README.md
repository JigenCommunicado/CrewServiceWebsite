# 🚀 CrewLife Backend API

Backend API для системы управления заявками экипажа авиакомпании.

## 🏗️ Технологии

- **Node.js** + **Express.js** - сервер
- **PostgreSQL** - база данных
- **Prisma** - ORM
- **JWT** - аутентификация
- **bcryptjs** - хеширование паролей

## 📋 Функциональность

### 🔐 Аутентификация
- Регистрация пользователей
- Авторизация с JWT токенами
- Управление профилем

### ✈️ Заказы рейсов
- Создание заказов рейсов
- Просмотр заказов пользователя
- Управление статусами (админ)
- Фильтрация и поиск

### 🏨 Заказы гостиниц
- Создание заказов гостиниц
- Просмотр заказов пользователя
- Управление статусами (админ)

### 👥 Управление пользователями (админ)
- Просмотр всех пользователей
- Создание/редактирование пользователей
- Активация/деактивация аккаунтов
- Статистика пользователей

## 🚀 Установка и запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка базы данных
```bash
# Создайте базу данных PostgreSQL
createdb crewlife_db

# Настройте переменные окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

### 3. Инициализация базы данных
```bash
# Генерация Prisma клиента
npm run db:generate

# Применение миграций
npm run db:push

# Заполнение тестовыми данными
npm run db:seed
```

### 4. Запуск сервера
```bash
# Разработка
npm run dev

# Продакшн
npm start
```

## 📚 API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/register` - Регистрация
- `GET /api/auth/profile` - Получить профиль
- `PUT /api/auth/profile` - Обновить профиль

### Заказы рейсов
- `POST /api/flight-orders` - Создать заказ рейса
- `GET /api/flight-orders/my` - Мои заказы рейсов
- `GET /api/flight-orders/:id` - Получить заказ рейса
- `GET /api/flight-orders/stats` - Статистика заказов

### Заказы гостиниц
- `POST /api/hotel-orders` - Создать заказ гостиницы
- `GET /api/hotel-orders/my` - Мои заказы гостиниц
- `GET /api/hotel-orders/:id` - Получить заказ гостиницы
- `GET /api/hotel-orders/stats` - Статистика заказов

### Пользователи (админ)
- `GET /api/users` - Все пользователи
- `GET /api/users/:id` - Получить пользователя
- `POST /api/users` - Создать пользователя
- `PUT /api/users/:id` - Обновить пользователя
- `DELETE /api/users/:id` - Удалить пользователя
- `PATCH /api/users/:id/toggle-status` - Переключить статус

## 🔧 Скрипты

```bash
npm start          # Запуск сервера
npm run dev        # Запуск в режиме разработки
npm run db:generate # Генерация Prisma клиента
npm run db:push    # Применение изменений схемы
npm run db:migrate # Создание миграции
npm run db:studio  # Открыть Prisma Studio
npm run db:seed    # Заполнить тестовыми данными
```

## 🔐 Тестовые данные

После выполнения `npm run db:seed`:

**Администратор:**
- Employee ID: `ADMIN001`
- Password: `admin123`

**Пользователь:**
- Employee ID: `12345`
- Password: `test123`

## 📊 Структура базы данных

### Users (Пользователи)
- id, employeeId, fullName, password, position, location
- isActive, createdAt, lastLogin

### FlightOrders (Заказы рейсов)
- id, orderNumber, userId, employeeId, fullName
- departureCity, arrivalCity, departureDate, departureTime
- arrivalDate, arrivalTime, flightNumber, airline
- purpose, priority, passengers, luggageInfo, specialRequests
- status, createdAt, updatedAt, processedBy, processedAt, adminNotes

### HotelOrders (Заказы гостиниц)
- id, orderNumber, userId, employeeId, fullName
- city, checkInDate, checkInTime, checkOutDate, checkOutTime
- flightDate, flightNumber
- status, createdAt, updatedAt, processedBy, processedAt, adminNotes

## 🌐 Переменные окружения

```env
DATABASE_URL="postgresql://username:password@localhost:5432/crewlife_db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3001"
```

## 📝 Лицензия

ISC

Backend API для системы управления заявками экипажа авиакомпании.

## 🏗️ Технологии

- **Node.js** + **Express.js** - сервер
- **PostgreSQL** - база данных
- **Prisma** - ORM
- **JWT** - аутентификация
- **bcryptjs** - хеширование паролей

## 📋 Функциональность

### 🔐 Аутентификация
- Регистрация пользователей
- Авторизация с JWT токенами
- Управление профилем

### ✈️ Заказы рейсов
- Создание заказов рейсов
- Просмотр заказов пользователя
- Управление статусами (админ)
- Фильтрация и поиск

### 🏨 Заказы гостиниц
- Создание заказов гостиниц
- Просмотр заказов пользователя
- Управление статусами (админ)

### 👥 Управление пользователями (админ)
- Просмотр всех пользователей
- Создание/редактирование пользователей
- Активация/деактивация аккаунтов
- Статистика пользователей

## 🚀 Установка и запуск

### 1. Установка зависимостей
```bash
npm install
```

### 2. Настройка базы данных
```bash
# Создайте базу данных PostgreSQL
createdb crewlife_db

# Настройте переменные окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками
```

### 3. Инициализация базы данных
```bash
# Генерация Prisma клиента
npm run db:generate

# Применение миграций
npm run db:push

# Заполнение тестовыми данными
npm run db:seed
```

### 4. Запуск сервера
```bash
# Разработка
npm run dev

# Продакшн
npm start
```

## 📚 API Endpoints

### Аутентификация
- `POST /api/auth/login` - Вход в систему
- `POST /api/auth/register` - Регистрация
- `GET /api/auth/profile` - Получить профиль
- `PUT /api/auth/profile` - Обновить профиль

### Заказы рейсов
- `POST /api/flight-orders` - Создать заказ рейса
- `GET /api/flight-orders/my` - Мои заказы рейсов
- `GET /api/flight-orders/:id` - Получить заказ рейса
- `GET /api/flight-orders/stats` - Статистика заказов

### Заказы гостиниц
- `POST /api/hotel-orders` - Создать заказ гостиницы
- `GET /api/hotel-orders/my` - Мои заказы гостиниц
- `GET /api/hotel-orders/:id` - Получить заказ гостиницы
- `GET /api/hotel-orders/stats` - Статистика заказов

### Пользователи (админ)
- `GET /api/users` - Все пользователи
- `GET /api/users/:id` - Получить пользователя
- `POST /api/users` - Создать пользователя
- `PUT /api/users/:id` - Обновить пользователя
- `DELETE /api/users/:id` - Удалить пользователя
- `PATCH /api/users/:id/toggle-status` - Переключить статус

## 🔧 Скрипты

```bash
npm start          # Запуск сервера
npm run dev        # Запуск в режиме разработки
npm run db:generate # Генерация Prisma клиента
npm run db:push    # Применение изменений схемы
npm run db:migrate # Создание миграции
npm run db:studio  # Открыть Prisma Studio
npm run db:seed    # Заполнить тестовыми данными
```

## 🔐 Тестовые данные

После выполнения `npm run db:seed`:

**Администратор:**
- Employee ID: `ADMIN001`
- Password: `admin123`

**Пользователь:**
- Employee ID: `12345`
- Password: `test123`

## 📊 Структура базы данных

### Users (Пользователи)
- id, employeeId, fullName, password, position, location
- isActive, createdAt, lastLogin

### FlightOrders (Заказы рейсов)
- id, orderNumber, userId, employeeId, fullName
- departureCity, arrivalCity, departureDate, departureTime
- arrivalDate, arrivalTime, flightNumber, airline
- purpose, priority, passengers, luggageInfo, specialRequests
- status, createdAt, updatedAt, processedBy, processedAt, adminNotes

### HotelOrders (Заказы гостиниц)
- id, orderNumber, userId, employeeId, fullName
- city, checkInDate, checkInTime, checkOutDate, checkOutTime
- flightDate, flightNumber
- status, createdAt, updatedAt, processedBy, processedAt, adminNotes

## 🌐 Переменные окружения

```env
DATABASE_URL="postgresql://username:password@localhost:5432/crewlife_db"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="development"
CORS_ORIGIN="http://localhost:3001"
```

## 📝 Лицензия

ISC
