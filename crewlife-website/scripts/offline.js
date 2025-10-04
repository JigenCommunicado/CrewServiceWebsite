// JavaScript для офлайн страницы CrewLife

class OfflineManager {
    constructor() {
        this.retryBtn = document.getElementById('retryBtn');
        this.homeBtn = document.getElementById('homeBtn');
        this.connectionStatus = document.getElementById('connectionStatus');
        this.loadingAnimation = document.getElementById('loadingAnimation');
        this.statusIndicator = document.querySelector('.status-indicator');
        this.statusText = document.querySelector('.status-text');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkConnection();
        this.setupConnectionMonitoring();
        this.setupServiceWorker();
    }

    setupEventListeners() {
        // Кнопка "Попробовать снова"
        this.retryBtn.addEventListener('click', () => {
            this.retryConnection();
        });

        // Кнопка "На главную"
        this.homeBtn.addEventListener('click', () => {
            this.goHome();
        });

        // Обработка клавиатуры
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (document.activeElement === this.retryBtn) {
                    this.retryConnection();
                } else if (document.activeElement === this.homeBtn) {
                    this.goHome();
                }
            }
        });
    }

    // Проверка подключения
    async checkConnection() {
        try {
            // Показываем анимацию загрузки
            this.showLoading(true);
            
            // Пытаемся загрузить небольшой ресурс
            const response = await fetch('/manifest.json', {
                method: 'HEAD',
                cache: 'no-cache',
                timeout: 5000
            });
            
            if (response.ok) {
                this.updateConnectionStatus(true);
                // Если подключение восстановлено, перенаправляем на главную
                setTimeout(() => {
                    this.goHome();
                }, 1000);
            } else {
                this.updateConnectionStatus(false);
            }
        } catch (error) {
            console.log('Нет подключения к интернету:', error);
            this.updateConnectionStatus(false);
        } finally {
            this.showLoading(false);
        }
    }

    // Повторная попытка подключения
    async retryConnection() {
        this.retryBtn.disabled = true;
        this.retryBtn.innerHTML = `
            <div class="spinner" style="width: 16px; height: 16px; border-width: 2px;"></div>
            Проверка...
        `;
        
        await this.checkConnection();
        
        // Восстанавливаем кнопку
        setTimeout(() => {
            this.retryBtn.disabled = false;
            this.retryBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M23 20v-6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Попробовать снова
            `;
        }, 2000);
    }

    // Переход на главную страницу
    goHome() {
        // Пытаемся перейти на главную страницу
        window.location.href = '/crewlife.html';
    }

    // Обновление статуса подключения
    updateConnectionStatus(isOnline) {
        if (isOnline) {
            this.statusIndicator.classList.remove('offline');
            this.statusIndicator.classList.add('online');
            this.statusText.textContent = 'Подключено';
            this.connectionStatus.style.borderColor = '#28a745';
        } else {
            this.statusIndicator.classList.remove('online');
            this.statusIndicator.classList.add('offline');
            this.statusText.textContent = 'Отключено';
            this.connectionStatus.style.borderColor = '#dc3545';
        }
    }

    // Показ/скрытие анимации загрузки
    showLoading(show) {
        if (show) {
            this.loadingAnimation.style.display = 'flex';
        } else {
            this.loadingAnimation.style.display = 'none';
        }
    }

    // Мониторинг подключения
    setupConnectionMonitoring() {
        // Слушаем события подключения/отключения
        window.addEventListener('online', () => {
            console.log('Подключение восстановлено');
            this.updateConnectionStatus(true);
            this.showNotification('Подключение восстановлено!', 'success');
            
            // Автоматически перенаправляем на главную через 2 секунды
            setTimeout(() => {
                this.goHome();
            }, 2000);
        });

        window.addEventListener('offline', () => {
            console.log('Подключение потеряно');
            this.updateConnectionStatus(false);
            this.showNotification('Подключение потеряно', 'warning');
        });

        // Периодическая проверка подключения
        setInterval(() => {
            this.checkConnection();
        }, 30000); // Каждые 30 секунд
    }

    // Настройка Service Worker
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.ready.then((registration) => {
                console.log('Service Worker готов');
                
                // Проверяем обновления
                registration.addEventListener('updatefound', () => {
                    console.log('Найдено обновление Service Worker');
                    this.showNotification('Доступно обновление приложения', 'info');
                });
            });
        }
    }

    // Показ уведомлений
    showNotification(message, type = 'info') {
        // Создаем элемент уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // Добавляем стили
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        // Добавляем в DOM
        document.body.appendChild(notification);

        // Обработка закрытия
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        // Автоматическое закрытие через 5 секунд
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, 5000);
    }

    // Проверка доступности кэшированных страниц
    async checkCachedPages() {
        try {
            const cache = await caches.open('crewlife-static-v2.0.0');
            const requests = [
                '/crewlife.html',
                '/dashboard.html',
                '/login.html',
                '/register.html'
            ];

            const availablePages = [];
            
            for (const request of requests) {
                const response = await cache.match(request);
                if (response) {
                    availablePages.push(request);
                }
            }

            console.log('Доступные кэшированные страницы:', availablePages);
            return availablePages;
        } catch (error) {
            console.log('Ошибка проверки кэша:', error);
            return [];
        }
    }

    // Получение информации о кэше
    async getCacheInfo() {
        try {
            const cacheNames = await caches.keys();
            const cacheInfo = {};

            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                cacheInfo[cacheName] = keys.length;
            }

            console.log('Информация о кэше:', cacheInfo);
            return cacheInfo;
        } catch (error) {
            console.log('Ошибка получения информации о кэше:', error);
            return {};
        }
    }

    // Очистка кэша
    async clearCache() {
        try {
            const cacheNames = await caches.keys();
            
            for (const cacheName of cacheNames) {
                await caches.delete(cacheName);
            }

            console.log('Кэш очищен');
            this.showNotification('Кэш очищен', 'success');
        } catch (error) {
            console.log('Ошибка очистки кэша:', error);
            this.showNotification('Ошибка очистки кэша', 'error');
        }
    }

    // Получение информации о приложении
    getAppInfo() {
        return {
            version: '2.0.0',
            name: 'CrewLife',
            description: 'Система подачи заявок для бортпроводников',
            lastUpdate: new Date().toLocaleString('ru-RU'),
            userAgent: navigator.userAgent,
            language: navigator.language,
            platform: navigator.platform,
            online: navigator.onLine
        };
    }
}

// Добавляем CSS анимации для уведомлений
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification {
        font-family: 'Montserrat', sans-serif;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.offlineManager = new OfflineManager();
    
    // Добавляем информацию о приложении в консоль для отладки
    console.log('CrewLife Offline Manager инициализирован');
    console.log('Информация о приложении:', window.offlineManager.getAppInfo());
});

// Обработка ошибок
window.addEventListener('error', (event) => {
    console.error('Ошибка на офлайн странице:', event.error);
});

// Обработка необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
    console.error('Необработанная ошибка промиса:', event.reason);
});

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OfflineManager;
}
