/**
 * Интеграция формы заказа рейса с API
 */

class FlightBookingAPI {
    constructor() {
        this.api = window.crewLifeAPI;
    }

    // Проверка доступности API
    async checkAPIAvailability() {
        return await this.api.checkConnection();
    }

    // Создание заказа рейса
    async createFlightOrder(formData) {
        try {
            // Проверяем доступность API
            const isAPIAvailable = await this.checkAPIAvailability();
            
            if (isAPIAvailable) {
                // Используем API
                const orderData = this.formatOrderData(formData);
                const result = await this.api.createFlightOrder(orderData);
                
                console.log('Заказ рейса создан через API:', result);
                return {
                    success: true,
                    order: result.order,
                    message: 'Заказ рейса успешно создан!'
                };
            } else {
                // Fallback на локальное сохранение
                console.log('API недоступен, сохраняем локально');
                return await this.saveOrderLocally(formData);
            }
        } catch (error) {
            console.error('Ошибка создания заказа рейса:', error);
            return {
                success: false,
                error: error.message || 'Ошибка при создании заказа рейса'
            };
        }
    }

    // Форматирование данных заказа для API
    formatOrderData(formData) {
        return {
            departureCity: formData.departureCity,
            arrivalCity: formData.arrivalCity,
            departureDate: formData.departureDate,
            departureTime: formData.departureTime,
            arrivalDate: formData.arrivalDate,
            arrivalTime: formData.arrivalTime,
            flightNumber: formData.flightNumber || null,
            airline: formData.airline || null,
            purpose: formData.purpose || null,
            priority: formData.priority || 'MEDIUM',
            passengers: parseInt(formData.passengers) || 1,
            luggageInfo: formData.luggageInfo || null,
            specialRequests: formData.specialRequests || null
        };
    }

    // Локальное сохранение заказа (fallback)
    async saveOrderLocally(formData) {
        try {
            // Получаем данные пользователя
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            
            // Создаем заказ
            const order = {
                id: 'flight_' + Date.now(),
                orderNumber: 'FL-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4),
                userId: userData.id || 'local_user',
                employeeId: userData.employeeId || 'unknown',
                fullName: userData.fullName || 'Пользователь',
                ...this.formatOrderData(formData),
                status: 'NEW',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Сохраняем в localStorage
            const existingOrders = JSON.parse(localStorage.getItem('flightOrders') || '[]');
            existingOrders.push(order);
            localStorage.setItem('flightOrders', JSON.stringify(existingOrders));

            console.log('Заказ рейса сохранен локально:', order);
            return {
                success: true,
                order: order,
                message: 'Заказ рейса сохранен локально (API недоступен)'
            };
        } catch (error) {
            console.error('Ошибка локального сохранения:', error);
            return {
                success: false,
                error: 'Ошибка при сохранении заказа рейса'
            };
        }
    }

    // Получение заказов рейсов пользователя
    async getUserFlightOrders(params = {}) {
        try {
            const isAPIAvailable = await this.checkAPIAvailability();
            
            if (isAPIAvailable) {
                // Используем API
                const result = await this.api.getMyFlightOrders(params);
                return {
                    success: true,
                    orders: result.orders,
                    pagination: result.pagination
                };
            } else {
                // Fallback на локальные данные
                const orders = JSON.parse(localStorage.getItem('flightOrders') || '[]');
                return {
                    success: true,
                    orders: orders,
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: orders.length,
                        pages: 1
                    }
                };
            }
        } catch (error) {
            console.error('Ошибка получения заказов рейсов:', error);
            return {
                success: false,
                error: error.message || 'Ошибка при получении заказов рейсов'
            };
        }
    }

    // Получение статистики заказов рейсов
    async getFlightOrderStats() {
        try {
            const isAPIAvailable = await this.checkAPIAvailability();
            
            if (isAPIAvailable) {
                // Используем API
                const result = await this.api.getFlightOrderStats();
                return {
                    success: true,
                    stats: result
                };
            } else {
                // Fallback на локальные данные
                const orders = JSON.parse(localStorage.getItem('flightOrders') || '[]');
                const stats = this.calculateLocalStats(orders);
                return {
                    success: true,
                    stats: stats
                };
            }
        } catch (error) {
            console.error('Ошибка получения статистики:', error);
            return {
                success: false,
                error: error.message || 'Ошибка при получении статистики'
            };
        }
    }

    // Расчет локальной статистики
    calculateLocalStats(orders) {
        const statusStats = {};
        orders.forEach(order => {
            statusStats[order.status] = (statusStats[order.status] || 0) + 1;
        });

        return {
            statusStats: Object.entries(statusStats).map(([status, count]) => ({
                status,
                _count: { status: count }
            })),
            totalOrders: orders.length,
            recentOrders: orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return orderDate >= weekAgo;
            }).length
        };
    }

    // Валидация формы заказа рейса
    validateForm(formData) {
        const errors = [];

        if (!formData.departureCity) {
            errors.push('Город отправления обязателен');
        }

        if (!formData.arrivalCity) {
            errors.push('Город прибытия обязателен');
        }

        if (!formData.departureDate) {
            errors.push('Дата отправления обязательна');
        }

        if (!formData.departureTime) {
            errors.push('Время отправления обязательно');
        }

        if (!formData.arrivalDate) {
            errors.push('Дата прибытия обязательна');
        }

        if (!formData.arrivalTime) {
            errors.push('Время прибытия обязательно');
        }

        // Проверка дат
        if (formData.departureDate && formData.arrivalDate) {
            const departureDate = new Date(formData.departureDate);
            const arrivalDate = new Date(formData.arrivalDate);
            
            if (arrivalDate <= departureDate) {
                errors.push('Дата прибытия должна быть позже даты отправления');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Создаем глобальный экземпляр
window.flightBookingAPI = new FlightBookingAPI();
 * Интеграция формы заказа рейса с API
 */

class FlightBookingAPI {
    constructor() {
        this.api = window.crewLifeAPI;
    }

    // Проверка доступности API
    async checkAPIAvailability() {
        return await this.api.checkConnection();
    }

    // Создание заказа рейса
    async createFlightOrder(formData) {
        try {
            // Проверяем доступность API
            const isAPIAvailable = await this.checkAPIAvailability();
            
            if (isAPIAvailable) {
                // Используем API
                const orderData = this.formatOrderData(formData);
                const result = await this.api.createFlightOrder(orderData);
                
                console.log('Заказ рейса создан через API:', result);
                return {
                    success: true,
                    order: result.order,
                    message: 'Заказ рейса успешно создан!'
                };
            } else {
                // Fallback на локальное сохранение
                console.log('API недоступен, сохраняем локально');
                return await this.saveOrderLocally(formData);
            }
        } catch (error) {
            console.error('Ошибка создания заказа рейса:', error);
            return {
                success: false,
                error: error.message || 'Ошибка при создании заказа рейса'
            };
        }
    }

    // Форматирование данных заказа для API
    formatOrderData(formData) {
        return {
            departureCity: formData.departureCity,
            arrivalCity: formData.arrivalCity,
            departureDate: formData.departureDate,
            departureTime: formData.departureTime,
            arrivalDate: formData.arrivalDate,
            arrivalTime: formData.arrivalTime,
            flightNumber: formData.flightNumber || null,
            airline: formData.airline || null,
            purpose: formData.purpose || null,
            priority: formData.priority || 'MEDIUM',
            passengers: parseInt(formData.passengers) || 1,
            luggageInfo: formData.luggageInfo || null,
            specialRequests: formData.specialRequests || null
        };
    }

    // Локальное сохранение заказа (fallback)
    async saveOrderLocally(formData) {
        try {
            // Получаем данные пользователя
            const userData = JSON.parse(localStorage.getItem('userData') || '{}');
            
            // Создаем заказ
            const order = {
                id: 'flight_' + Date.now(),
                orderNumber: 'FL-' + new Date().getFullYear() + '-' + String(Date.now()).slice(-4),
                userId: userData.id || 'local_user',
                employeeId: userData.employeeId || 'unknown',
                fullName: userData.fullName || 'Пользователь',
                ...this.formatOrderData(formData),
                status: 'NEW',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Сохраняем в localStorage
            const existingOrders = JSON.parse(localStorage.getItem('flightOrders') || '[]');
            existingOrders.push(order);
            localStorage.setItem('flightOrders', JSON.stringify(existingOrders));

            console.log('Заказ рейса сохранен локально:', order);
            return {
                success: true,
                order: order,
                message: 'Заказ рейса сохранен локально (API недоступен)'
            };
        } catch (error) {
            console.error('Ошибка локального сохранения:', error);
            return {
                success: false,
                error: 'Ошибка при сохранении заказа рейса'
            };
        }
    }

    // Получение заказов рейсов пользователя
    async getUserFlightOrders(params = {}) {
        try {
            const isAPIAvailable = await this.checkAPIAvailability();
            
            if (isAPIAvailable) {
                // Используем API
                const result = await this.api.getMyFlightOrders(params);
                return {
                    success: true,
                    orders: result.orders,
                    pagination: result.pagination
                };
            } else {
                // Fallback на локальные данные
                const orders = JSON.parse(localStorage.getItem('flightOrders') || '[]');
                return {
                    success: true,
                    orders: orders,
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: orders.length,
                        pages: 1
                    }
                };
            }
        } catch (error) {
            console.error('Ошибка получения заказов рейсов:', error);
            return {
                success: false,
                error: error.message || 'Ошибка при получении заказов рейсов'
            };
        }
    }

    // Получение статистики заказов рейсов
    async getFlightOrderStats() {
        try {
            const isAPIAvailable = await this.checkAPIAvailability();
            
            if (isAPIAvailable) {
                // Используем API
                const result = await this.api.getFlightOrderStats();
                return {
                    success: true,
                    stats: result
                };
            } else {
                // Fallback на локальные данные
                const orders = JSON.parse(localStorage.getItem('flightOrders') || '[]');
                const stats = this.calculateLocalStats(orders);
                return {
                    success: true,
                    stats: stats
                };
            }
        } catch (error) {
            console.error('Ошибка получения статистики:', error);
            return {
                success: false,
                error: error.message || 'Ошибка при получении статистики'
            };
        }
    }

    // Расчет локальной статистики
    calculateLocalStats(orders) {
        const statusStats = {};
        orders.forEach(order => {
            statusStats[order.status] = (statusStats[order.status] || 0) + 1;
        });

        return {
            statusStats: Object.entries(statusStats).map(([status, count]) => ({
                status,
                _count: { status: count }
            })),
            totalOrders: orders.length,
            recentOrders: orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return orderDate >= weekAgo;
            }).length
        };
    }

    // Валидация формы заказа рейса
    validateForm(formData) {
        const errors = [];

        if (!formData.departureCity) {
            errors.push('Город отправления обязателен');
        }

        if (!formData.arrivalCity) {
            errors.push('Город прибытия обязателен');
        }

        if (!formData.departureDate) {
            errors.push('Дата отправления обязательна');
        }

        if (!formData.departureTime) {
            errors.push('Время отправления обязательно');
        }

        if (!formData.arrivalDate) {
            errors.push('Дата прибытия обязательна');
        }

        if (!formData.arrivalTime) {
            errors.push('Время прибытия обязательно');
        }

        // Проверка дат
        if (formData.departureDate && formData.arrivalDate) {
            const departureDate = new Date(formData.departureDate);
            const arrivalDate = new Date(formData.arrivalDate);
            
            if (arrivalDate <= departureDate) {
                errors.push('Дата прибытия должна быть позже даты отправления');
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// Создаем глобальный экземпляр
window.flightBookingAPI = new FlightBookingAPI();
