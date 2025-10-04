#!/usr/bin/env node

const { testConnection } = require('../src/config/database');
const User = require('../src/models/User');

async function testDatabaseConnection() {
  console.log('🧪 Тестирование подключения к базе данных...');
  
  try {
    // Тест подключения
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Не удалось подключиться к базе данных');
      process.exit(1);
    }
    
    console.log('✅ Подключение к базе данных работает');
    
    // Тест модели User
    console.log('👤 Тестирование модели User...');
    
    // Проверка существования таблицы users
    const { query } = require('../src/config/database');
    const [tables] = await query('SHOW TABLES LIKE "users"');
    
    if (tables.length === 0) {
      console.error('❌ Таблица users не найдена. Запустите: npm run db:init');
      process.exit(1);
    }
    
    console.log('✅ Таблица users найдена');
    
    // Тест создания пользователя (тестового)
    console.log('🔧 Тестирование создания пользователя...');
    
    const testUserData = {
      employeeId: 'TEST001',
      fullName: 'Тестовый Пользователь',
      password: 'testpassword123',
      position: 'БП',
      location: 'Москва'
    };
    
    // Проверяем, существует ли уже тестовый пользователь
    const existingUser = await User.findByEmployeeId('TEST001');
    
    if (existingUser) {
      console.log('⚠️  Тестовый пользователь уже существует, пропускаем создание');
    } else {
      const userId = await User.create(testUserData);
      console.log(`✅ Тестовый пользователь создан с ID: ${userId}`);
    }
    
    // Тест поиска пользователя
    const foundUser = await User.findByEmployeeId('TEST001');
    if (foundUser) {
      console.log('✅ Поиск пользователя работает');
      console.log(`   Найден: ${foundUser.fullName} (${foundUser.employeeId})`);
    } else {
      console.error('❌ Поиск пользователя не работает');
    }
    
    // Тест статистики
    const stats = await User.getStats();
    console.log('📊 Статистика пользователей:');
    console.log(`   Всего пользователей: ${stats.total_users}`);
    console.log(`   Активных: ${stats.active_users}`);
    console.log(`   Неактивных: ${stats.inactive_users}`);
    console.log(`   Зарегистрированных сегодня: ${stats.today_registrations}`);
    
    console.log('🎉 Все тесты пройдены успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
    process.exit(1);
  }
}

// Запуск тестов
if (require.main === module) {
  testDatabaseConnection()
    .then(() => {
      console.log('✨ Тестирование завершено успешно!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Критическая ошибка:', error);
      process.exit(1);
    });
}

module.exports = { testDatabaseConnection };
