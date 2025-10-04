#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeDatabase() {
  console.log('🚀 Инициализация базы данных MariaDB...');
  
  // Конфигурация подключения
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
    // Подключение к MariaDB
    console.log('📡 Подключение к MariaDB...');
    connection = await mysql.createConnection(config);
    console.log('✅ Подключение установлено');

    // Чтение SQL файла
    const sqlPath = path.join(__dirname, '..', 'database', 'init.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Разделение SQL на отдельные запросы
    const queries = sqlContent
      .split(';')
      .map(query => query.trim())
      .filter(query => query.length > 0 && !query.startsWith('--') && !query.startsWith('/*'));

    console.log(`📝 Выполнение ${queries.length} SQL запросов...`);
    
    // Выполнение каждого запроса
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query.trim()) {
        try {
          await connection.execute(query);
          console.log(`✅ Запрос ${i + 1}/${queries.length} выполнен`);
        } catch (error) {
          if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DB_CREATE_EXISTS') {
            console.log(`⚠️  Запрос ${i + 1}/${queries.length} - таблица/база уже существует`);
          } else {
            console.error(`❌ Ошибка в запросе ${i + 1}/${queries.length}:`, error.message);
            throw error;
          }
        }
      }
    }

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
