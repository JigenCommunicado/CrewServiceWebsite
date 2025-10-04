/**
 * Менеджер базы данных пользователей
 * Управляет хранением и получением данных пользователей
 */

class UserDatabase {
    constructor() {
        this.dbPath = '../config/users.json';
        this.users = [];
        this.metadata = {
            version: "1.0.0",
            created: new Date().toISOString().split('T')[0],
            lastUpdated: new Date().toISOString().split('T')[0],
            totalUsers: 0
        };
        this.loadDatabase();
    }

    /**
     * Загружает базу данных из JSON файла
     */
    loadDatabase() {
        try {
            // В браузере используем localStorage
            const stored = localStorage.getItem('crewlife_users_db');
            if (stored) {
                const data = JSON.parse(stored);
                this.users = data.users || [];
                this.metadata = data.metadata || this.metadata;
            }
        } catch (error) {
            console.error('Ошибка загрузки базы данных:', error);
            this.users = [];
        }
    }

    /**
     * Сохраняет базу данных в JSON файл
     */
    saveDatabase() {
        try {
            const data = {
                users: this.users,
                metadata: {
                    ...this.metadata,
                    lastUpdated: new Date().toISOString().split('T')[0],
                    totalUsers: this.users.length
                }
            };
            
            // В браузере используем localStorage
            localStorage.setItem('crewlife_users_db', JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения базы данных:', error);
            return false;
        }
    }

    /**
     * Добавляет нового пользователя
     */
    async addUser(userData) {
        try {
            // Проверяем, существует ли пользователь с таким табельным номером
            const existingUser = this.users.find(user => user.employeeId === userData.employeeId);
            if (existingUser) {
                return { success: false, error: 'Пользователь с таким табельным номером уже существует' };
            }

            // Хешируем пароль
            const hashedPassword = await this.hashPassword(userData.password);
            
            // Создаем нового пользователя
            const newUser = {
                id: this.generateId(),
                employeeId: userData.employeeId,
                fullName: userData.fullName,
                password: hashedPassword,
                position: userData.position,
                location: userData.location,
                isActive: true,
                createdAt: new Date().toISOString(),
                lastLogin: null
            };

            this.users.push(newUser);
            this.saveDatabase();

            // Возвращаем пользователя без пароля
            const { password, ...userWithoutPassword } = newUser;
            return { success: true, user: userWithoutPassword };
        } catch (error) {
            console.error('Ошибка добавления пользователя:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Аутентификация пользователя
     */
    async authenticateUser(employeeId, password) {
        try {
            const user = this.users.find(user => user.employeeId === employeeId && user.isActive);
            if (!user) {
                return { success: false, error: 'Пользователь не найден' };
            }

            const isValidPassword = await this.verifyPassword(password, user.password);
            if (!isValidPassword) {
                return { success: false, error: 'Неверный пароль' };
            }

            // Обновляем время последнего входа
            user.lastLogin = new Date().toISOString();
            this.saveDatabase();

            // Возвращаем пользователя без пароля
            const { password: _, ...userWithoutPassword } = user;
            return { success: true, user: userWithoutPassword };
        } catch (error) {
            console.error('Ошибка аутентификации:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Получает пользователя по табельному номеру
     */
    getUserByEmployeeId(employeeId) {
        const user = this.users.find(user => user.employeeId === employeeId && user.isActive);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    /**
     * Получает пользователя по ID
     */
    getUserById(id) {
        const user = this.users.find(user => user.id === id && user.isActive);
        if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        return null;
    }

    /**
     * Обновляет данные пользователя
     */
    async updateUser(id, updateData) {
        try {
            const userIndex = this.users.findIndex(user => user.id === id);
            if (userIndex === -1) {
                return { success: false, error: 'Пользователь не найден' };
            }

            // Если обновляется пароль, хешируем его
            if (updateData.password) {
                updateData.password = await this.hashPassword(updateData.password);
            }

            this.users[userIndex] = { ...this.users[userIndex], ...updateData };
            this.saveDatabase();

            const { password, ...userWithoutPassword } = this.users[userIndex];
            return { success: true, user: userWithoutPassword };
        } catch (error) {
            console.error('Ошибка обновления пользователя:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Получает всех пользователей
     */
    getAllUsers() {
        return this.users.map(user => {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        });
    }

    /**
     * Экспортирует базу данных
     */
    exportDatabase() {
        try {
            const data = {
                users: this.users,
                metadata: this.metadata
            };
            return { success: true, data: data };
        } catch (error) {
            console.error('Ошибка экспорта базы данных:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Импортирует базу данных
     */
    importDatabase(data) {
        try {
            if (!data.users || !Array.isArray(data.users)) {
                throw new Error('Неверный формат данных');
            }

            this.users = data.users;
            this.metadata = data.metadata || this.metadata;
            this.saveDatabase();

            return { success: true };
        } catch (error) {
            console.error('Ошибка импорта базы данных:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Загружает данные из localStorage
     */
    loadFromLocalStorage() {
        this.loadDatabase();
    }

    /**
     * Генерирует уникальный ID
     */
    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Хеширует пароль
     */
    async hashPassword(password) {
        // Простое хеширование для демонстрации
        // В реальном приложении используйте bcrypt или аналогичную библиотеку
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'crewlife_salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Проверяет пароль
     */
    async verifyPassword(password, hashedPassword) {
        const hashed = await this.hashPassword(password);
        return hashed === hashedPassword;
    }
}

// Создаем глобальный экземпляр базы данных
window.userDB = new UserDatabase();

// Загружаем данные из localStorage при инициализации
document.addEventListener('DOMContentLoaded', () => {
    window.userDB.loadFromLocalStorage();
});

// Экспортируем класс для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserDatabase;
}