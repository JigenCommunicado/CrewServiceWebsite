/**
 * API Client для CrewLife Backend
 * Обработка всех HTTP запросов к backend API
 */

class CrewLifeAPI {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('authToken');
    }

    // Установка токена авторизации
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('authToken', token);
        } else {
            localStorage.removeItem('authToken');
        }
    }

    // Получение заголовков для запросов
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    // Базовый метод для HTTP запросов
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // ==================== АУТЕНТИФИКАЦИЯ ====================

    // Вход в систему
    async login(employeeId, password) {
        const data = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ employeeId, password })
        });

        if (data.token) {
            this.setToken(data.token);
        }

        return data;
    }

    // Регистрация
    async register(userData) {
        const data = await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (data.token) {
            this.setToken(data.token);
        }

        return data;
    }

    // Получение профиля
    async getProfile() {
        return await this.request('/auth/profile');
    }

    // Обновление профиля
    async updateProfile(profileData) {
        return await this.request('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Выход из системы
    logout() {
        this.setToken(null);
        localStorage.removeItem('userData');
    }

    // ==================== УТИЛИТЫ ====================

    // Проверка статуса авторизации
    isAuthenticated() {
        return !!this.token;
    }

    // Получение токена
    getToken() {
        return this.token;
    }

    // Проверка соединения с API
    async checkConnection() {
        try {
            // Проверяем API endpoint напрямую
            const response = await fetch(`${this.baseURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    employeeId: 'connection_test',
                    fullName: 'Connection Test',
                    password: 'test123',
                    position: 'БП',
                    location: 'Москва'
                })
            });
            
            // Если получили ответ (даже ошибку), значит API доступен
            return true;
        } catch (error) {
            console.log('API connection check failed:', error);
            return false;
        }
    }

    // Обработка ошибок API
    handleError(error) {
        console.error('API Error:', error);
        
        if (error.message.includes('401') || error.message.includes('403')) {
            // Неавторизован - перенаправляем на страницу входа
            this.logout();
            window.location.href = 'login.html';
            return;
        }

        // Показываем уведомление об ошибке
        alert(`Ошибка: ${error.message}`);
    }
}

// Создаем глобальный экземпляр API клиента
window.crewLifeAPI = new CrewLifeAPI();

// Экспортируем для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrewLifeAPI;
}