/**
 * Скрипт для инициализации тестовых данных
 * Добавляет тестового пользователя в базу данных
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Ждем загрузки базы данных
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Проверяем, есть ли уже тестовый пользователь
    const existingUser = window.userDB.getUserByEmployeeId('12345');
    
    if (!existingUser) {
        // Создаем тестового пользователя
        const testUser = {
            fullName: 'Иван Петров',
            employeeId: '12345',
            password: 'test123',
            position: 'БП',
            location: 'Москва'
        };
        
        try {
            const result = await window.userDB.addUser(testUser);
            if (result.success) {
                console.log('✅ Тестовый пользователь создан:', testUser.fullName);
                console.log('📋 Данные для входа:');
                console.log('   Табельный номер: 12345');
                console.log('   Пароль: test123');
            } else {
                console.error('❌ Ошибка создания тестового пользователя:', result.error);
            }
        } catch (error) {
            console.error('❌ Ошибка при создании тестового пользователя:', error);
        }
    } else {
        console.log('ℹ️ Тестовый пользователь уже существует');
    }
});
 * Скрипт для инициализации тестовых данных
 * Добавляет тестового пользователя в базу данных
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Ждем загрузки базы данных
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Проверяем, есть ли уже тестовый пользователь
    const existingUser = window.userDB.getUserByEmployeeId('12345');
    
    if (!existingUser) {
        // Создаем тестового пользователя
        const testUser = {
            fullName: 'Иван Петров',
            employeeId: '12345',
            password: 'test123',
            position: 'БП',
            location: 'Москва'
        };
        
        try {
            const result = await window.userDB.addUser(testUser);
            if (result.success) {
                console.log('✅ Тестовый пользователь создан:', testUser.fullName);
                console.log('📋 Данные для входа:');
                console.log('   Табельный номер: 12345');
                console.log('   Пароль: test123');
            } else {
                console.error('❌ Ошибка создания тестового пользователя:', result.error);
            }
        } catch (error) {
            console.error('❌ Ошибка при создании тестового пользователя:', error);
        }
    } else {
        console.log('ℹ️ Тестовый пользователь уже существует');
    }
});
