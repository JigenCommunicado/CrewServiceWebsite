const mysql = require('mysql2/promise');
require('dotenv').config();

// Конфигурация подключения к MariaDB
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'crewlife_prod',
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Создание пула соединений
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Функция для тестирования подключения
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Подключение к MariaDB успешно установлено');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Ошибка подключения к MariaDB:', error.message);
    return false;
  }
}

// Функция для выполнения запросов
async function query(sql, params = []) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Ошибка выполнения запроса:', error);
    throw error;
  }
}

// Функция для выполнения транзакций
async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection
};
