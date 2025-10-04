// API функции для работы с базой данных CrewLife
class CrewLifeAPI {
    constructor() {
        this.baseURL = '/api'; // Базовый URL для API
        this.cache = new Map(); // Кэш для хранения данных
        this.cacheTimeout = 5 * 60 * 1000; // 5 минут
    }

    // Получение статистики пользователей
    async getUsersCount() {
        try {
            // Проверяем кэш
            const cached = this.getCachedData('usersCount');
            if (cached) {
                return cached;
            }

            // В реальном приложении здесь будет запрос к API
            const response = await this.simulateAPIRequest('/stats/users');
            this.setCachedData('usersCount', response);
            return response;
        } catch (error) {
            console.error('Ошибка получения количества пользователей:', error);
            throw error;
        }
    }

    // Получение количества поданных заявок
    async getRequestsCount() {
        try {
            // Проверяем кэш
            const cached = this.getCachedData('requestsCount');
            if (cached) {
                return cached;
            }

            // В реальном приложении здесь будет запрос к API
            const response = await this.simulateAPIRequest('/stats/requests');
            this.setCachedData('requestsCount', response);
            return response;
        } catch (error) {
            console.error('Ошибка получения количества заявок:', error);
            throw error;
        }
    }

    // Получение полной статистики
    async getStats() {
        try {
            const [users, requests] = await Promise.all([
                this.getUsersCount(),
                this.getRequestsCount()
            ]);

            return {
                users: users.count,
                requests: requests.count,
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('Ошибка получения статистики:', error);
            throw error;
        }
    }

    // Симуляция API запроса (заменить на реальный API)
    async simulateAPIRequest(endpoint) {
        // Имитируем задержку сети
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

        // Симулируем разные ответы в зависимости от endpoint
        switch (endpoint) {
            case '/stats/users':
                return {
                    count: Math.floor(Math.random() * 5000) + 1000,
                    status: 'success',
                    timestamp: Date.now()
                };
            case '/stats/requests':
                return {
                    count: Math.floor(Math.random() * 10000) + 5000,
                    status: 'success',
                    timestamp: Date.now()
                };
            default:
                throw new Error('Неизвестный endpoint');
        }
    }

    // Реальный API запрос (для будущего использования)
    async realAPIRequest(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.getAuthToken()}`
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API запрос failed:', error);
            throw error;
        }
    }

    // Получение токена авторизации
    getAuthToken() {
        return localStorage.getItem('authToken') || null;
    }

    // Установка токена авторизации
    setAuthToken(token) {
        localStorage.setItem('authToken', token);
    }

    // Удаление токена авторизации
    removeAuthToken() {
        localStorage.removeItem('authToken');
    }

    // Кэширование данных
    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    // Получение данных из кэша
    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    // Очистка кэша
    clearCache() {
        this.cache.clear();
    }

    // Очистка устаревших данных из кэша
    cleanExpiredCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.cache.delete(key);
            }
        }
    }

    // Получение настроек API
    getAPISettings() {
        return {
            baseURL: this.baseURL,
            cacheTimeout: this.cacheTimeout,
            cacheSize: this.cache.size
        };
    }

    // Обновление настроек API
    updateAPISettings(settings) {
        if (settings.baseURL) {
            this.baseURL = settings.baseURL;
        }
        if (settings.cacheTimeout) {
            this.cacheTimeout = settings.cacheTimeout;
        }
    }

    // Мониторинг состояния API
    getAPIHealth() {
        return {
            status: 'healthy',
            cacheSize: this.cache.size,
            lastCleanup: Date.now(),
            uptime: performance.now()
        };
    }
}

// Создаем глобальный экземпляр API
window.CrewLifeAPI = new CrewLifeAPI();

// Очистка кэша каждые 10 минут
setInterval(() => {
    if (window.CrewLifeAPI) {
        window.CrewLifeAPI.cleanExpiredCache();
    }
}, 10 * 60 * 1000);

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrewLifeAPI;
}

