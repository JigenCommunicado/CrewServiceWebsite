#!/usr/bin/env node

const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  console.log('🚀 Инициализация базы данных MariaDB...');
  
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crewlife_prod',
    charset: 'utf8mb4'
  };

  let connection;
  
  try {
    console.log('📡 Подключение к MariaDB...');
    connection = await mysql.createConnection(config);
    console.log('✅ Подключение установлено');

    // Создание таблицы пользователей
    console.log('👤 Создание таблицы users...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        employee_id VARCHAR(50) UNIQUE NOT NULL COMMENT 'Табельный номер',
        full_name VARCHAR(255) NOT NULL COMMENT 'ФИО полностью',
        password VARCHAR(255) NOT NULL COMMENT 'Хешированный пароль',
        position VARCHAR(100) NOT NULL COMMENT 'Должность',
        location VARCHAR(100) NOT NULL COMMENT 'Локация',
        is_active BOOLEAN DEFAULT TRUE COMMENT 'Активен ли пользователь',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата создания',
        last_login TIMESTAMP NULL COMMENT 'Последний вход',
        
        INDEX idx_employee_id (employee_id),
        INDEX idx_full_name (full_name),
        INDEX idx_position (position),
        INDEX idx_location (location),
        INDEX idx_is_active (is_active),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Таблица пользователей системы'
    `);
    console.log('✅ Таблица users создана');

    // Создание таблицы заявок на авиабилеты
    console.log('✈️ Создание таблицы flight_orders...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS flight_orders (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        order_number VARCHAR(50) UNIQUE NOT NULL COMMENT 'Номер заявки',
        user_id VARCHAR(36) NOT NULL COMMENT 'ID пользователя',
        employee_id VARCHAR(50) NOT NULL COMMENT 'Табельный номер',
        full_name VARCHAR(255) NOT NULL COMMENT 'ФИО',
        
        departure_city VARCHAR(100) NOT NULL COMMENT 'Город отправления',
        arrival_city VARCHAR(100) NOT NULL COMMENT 'Город прибытия',
        departure_date DATE NOT NULL COMMENT 'Дата отправления',
        departure_time TIME NOT NULL COMMENT 'Время отправления',
        arrival_date DATE NOT NULL COMMENT 'Дата прибытия',
        arrival_time TIME NOT NULL COMMENT 'Время прибытия',
        flight_number VARCHAR(20) NULL COMMENT 'Номер рейса',
        airline VARCHAR(100) NULL COMMENT 'Авиакомпания',
        
        purpose TEXT NULL COMMENT 'Цель поездки',
        priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM' COMMENT 'Приоритет',
        passengers INT DEFAULT 1 COMMENT 'Количество пассажиров',
        luggage_info TEXT NULL COMMENT 'Информация о багаже',
        special_requests TEXT NULL COMMENT 'Особые пожелания',
        
        status ENUM('NEW', 'PROCESSING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED') DEFAULT 'NEW' COMMENT 'Статус заявки',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата создания',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Дата обновления',
        processed_by VARCHAR(36) NULL COMMENT 'ID обработавшего администратора',
        processed_at TIMESTAMP NULL COMMENT 'Дата обработки',
        admin_notes TEXT NULL COMMENT 'Заметки администратора',
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_order_number (order_number),
        INDEX idx_user_id (user_id),
        INDEX idx_employee_id (employee_id),
        INDEX idx_status (status),
        INDEX idx_departure_date (departure_date),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Заявки на авиабилеты'
    `);
    console.log('✅ Таблица flight_orders создана');

    // Создание таблицы заявок на отели
    console.log('🏨 Создание таблицы hotel_orders...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hotel_orders (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        order_number VARCHAR(50) UNIQUE NOT NULL COMMENT 'Номер заявки',
        user_id VARCHAR(36) NOT NULL COMMENT 'ID пользователя',
        employee_id VARCHAR(50) NOT NULL COMMENT 'Табельный номер',
        full_name VARCHAR(255) NOT NULL COMMENT 'ФИО',
        
        city VARCHAR(100) NOT NULL COMMENT 'Город',
        check_in_date DATE NOT NULL COMMENT 'Дата заезда',
        check_in_time TIME NOT NULL COMMENT 'Время заезда',
        check_out_date DATE NOT NULL COMMENT 'Дата выезда',
        check_out_time TIME NOT NULL COMMENT 'Время выезда',
        flight_date DATE NULL COMMENT 'Дата рейса',
        flight_number VARCHAR(20) NULL COMMENT 'Номер рейса',
        
        status ENUM('NEW', 'PROCESSING', 'CONFIRMED', 'REJECTED', 'COMPLETED', 'CANCELLED') DEFAULT 'NEW' COMMENT 'Статус заявки',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Дата создания',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Дата обновления',
        processed_by VARCHAR(36) NULL COMMENT 'ID обработавшего администратора',
        processed_at TIMESTAMP NULL COMMENT 'Дата обработки',
        admin_notes TEXT NULL COMMENT 'Заметки администратора',
        
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL,
        
        INDEX idx_order_number (order_number),
        INDEX idx_user_id (user_id),
        INDEX idx_employee_id (employee_id),
        INDEX idx_status (status),
        INDEX idx_check_in_date (check_in_date),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Заявки на отели'
    `);
    console.log('✅ Таблица hotel_orders создана');

    console.log('🎉 База данных успешно инициализирована!');
    
    // Проверка созданных таблиц
    console.log('🔍 Проверка созданных таблиц...');
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Созданные таблицы:');
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });

  } catch (error) {
    console.error('❌ Ошибка инициализации базы данных:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Соединение закрыто');
    }
  }
}

// Запуск инициализации
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('✨ Инициализация завершена успешно!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Критическая ошибка:', error);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
