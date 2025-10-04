// PWA функциональность для CrewLife

class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        
        this.init();
    }

    init() {
        this.setupServiceWorker();
        this.setupInstallPrompt();
        this.setupUpdatePrompt();
        this.setupOfflineDetection();
        this.setupPushNotifications();
        this.setupBackgroundSync();
        this.setupAppShortcuts();
    }

    // Регистрация Service Worker
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });
                
                console.log('Service Worker зарегистрирован:', registration);
                
                // Обработка обновлений
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateNotification();
                        }
                    });
                });
                
            } catch (error) {
                console.error('Ошибка регистрации Service Worker:', error);
            }
        }
    }

    // Обработка установки приложения
    setupInstallPrompt() {
        // Отслеживаем событие beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('Доступна установка PWA');
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        // Отслеживаем установку приложения
        window.addEventListener('appinstalled', () => {
            console.log('PWA установлено');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showNotification('Приложение успешно установлено!', 'success');
        });

        // Проверяем, установлено ли приложение
        this.checkIfInstalled();
    }

    // Показ кнопки установки
    showInstallButton() {
        // Создаем кнопку установки, если её нет
        if (!document.getElementById('installBtn')) {
            const installBtn = document.createElement('button');
            installBtn.id = 'installBtn';
            installBtn.className = 'install-btn';
            installBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor"/>
                </svg>
                Установить приложение
            `;
            
            // Добавляем стили
            installBtn.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #FF4D4D;
                color: white;
                border: none;
                padding: 12px 20px;
                border-radius: 25px;
                font-family: 'Montserrat', sans-serif;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(255, 77, 77, 0.3);
                z-index: 1000;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s ease;
                animation: slideInUp 0.5s ease;
            `;
            
            // Добавляем анимацию
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideInUp {
                    from {
                        transform: translateY(100px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                
                .install-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(255, 77, 77, 0.4);
                }
                
                .install-btn:active {
                    transform: translateY(0);
                }
            `;
            document.head.appendChild(style);
            
            // Обработчик клика
            installBtn.addEventListener('click', () => {
                this.installApp();
            });
            
            document.body.appendChild(installBtn);
        }
    }

    // Скрытие кнопки установки
    hideInstallButton() {
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => {
                installBtn.remove();
            }, 300);
        }
    }

    // Установка приложения
    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log('Результат установки:', outcome);
            
            if (outcome === 'accepted') {
                this.showNotification('Установка началась...', 'info');
            } else {
                this.showNotification('Установка отменена', 'warning');
            }
            
            this.deferredPrompt = null;
        }
    }

    // Проверка установки приложения
    checkIfInstalled() {
        // Проверяем различные признаки установки PWA
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isInApp = window.navigator.standalone === true;
        const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
        
        this.isInstalled = isStandalone || isInApp || isFullscreen;
        
        if (this.isInstalled) {
            console.log('PWA уже установлено');
            this.hideInstallButton();
        }
    }

    // Обработка обновлений
    setupUpdatePrompt() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                window.location.reload();
            });
        }
    }

    // Показ уведомления об обновлении
    showUpdateNotification() {
        const updateNotification = document.createElement('div');
        updateNotification.className = 'update-notification';
        updateNotification.innerHTML = `
            <div class="update-content">
                <div class="update-icon">🔄</div>
                <div class="update-text">
                    <h4>Доступно обновление</h4>
                    <p>Новая версия приложения готова к установке</p>
                </div>
                <button class="update-btn" id="updateBtn">Обновить</button>
                <button class="update-close" id="updateClose">&times;</button>
            </div>
        `;
        
        // Стили
        updateNotification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            border: 2px solid #FF4D4D;
            border-radius: 10px;
            padding: 20px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.15);
            z-index: 1001;
            max-width: 400px;
            width: 90%;
            animation: slideInDown 0.5s ease;
        `;
        
        // Добавляем стили для содержимого
        const style = document.createElement('style');
        style.textContent = `
            .update-content {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .update-icon {
                font-size: 24px;
            }
            
            .update-text h4 {
                margin: 0 0 5px 0;
                color: #333;
                font-size: 16px;
            }
            
            .update-text p {
                margin: 0;
                color: #666;
                font-size: 14px;
            }
            
            .update-btn {
                background: #FF4D4D;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                margin-left: auto;
            }
            
            .update-close {
                background: none;
                border: none;
                font-size: 20px;
                cursor: pointer;
                color: #999;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            @keyframes slideInDown {
                from {
                    transform: translate(-50%, -100%);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, 0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(updateNotification);
        
        // Обработчики
        document.getElementById('updateBtn').addEventListener('click', () => {
            window.location.reload();
        });
        
        document.getElementById('updateClose').addEventListener('click', () => {
            updateNotification.remove();
        });
    }

    // Обработка офлайн режима
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.showNotification('Подключение восстановлено', 'success');
            this.hideOfflineIndicator();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showNotification('Нет подключения к интернету', 'warning');
            this.showOfflineIndicator();
        });

        // Показываем индикатор офлайн режима при загрузке
        if (!this.isOnline) {
            this.showOfflineIndicator();
        }
    }

    // Показ индикатора офлайн режима
    showOfflineIndicator() {
        if (!document.getElementById('offlineIndicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'offlineIndicator';
            indicator.innerHTML = `
                <div class="offline-content">
                    <div class="offline-icon">📡</div>
                    <span>Офлайн режим</span>
                </div>
            `;
            
            indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ffc107;
                color: #333;
                padding: 8px;
                text-align: center;
                font-weight: 600;
                z-index: 1002;
                animation: slideDown 0.3s ease;
            `;
            
            // Стили для содержимого
            const style = document.createElement('style');
            style.textContent = `
                .offline-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                
                .offline-icon {
                    font-size: 16px;
                }
                
                @keyframes slideDown {
                    from {
                        transform: translateY(-100%);
                    }
                    to {
                        transform: translateY(0);
                    }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(indicator);
        }
    }

    // Скрытие индикатора офлайн режима
    hideOfflineIndicator() {
        const indicator = document.getElementById('offlineIndicator');
        if (indicator) {
            indicator.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                indicator.remove();
            }, 300);
        }
    }

    // Настройка push уведомлений
    async setupPushNotifications() {
        if ('Notification' in window && 'serviceWorker' in navigator) {
            // Запрашиваем разрешение на уведомления
            if (Notification.permission === 'default') {
                const permission = await Notification.requestPermission();
                console.log('Разрешение на уведомления:', permission);
            }
        }
    }

    // Настройка фоновой синхронизации
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            navigator.serviceWorker.ready.then((registration) => {
                // Регистрируем фоновую синхронизацию
                registration.sync.register('background-sync');
            });
        }
    }

    // Настройка ярлыков приложения
    setupAppShortcuts() {
        // Добавляем обработчики для ярлыков из манифеста
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', (event) => {
                if (event.data && event.data.type === 'SHORTCUT_ACTION') {
                    this.handleShortcutAction(event.data.action);
                }
            });
        }
    }

    // Обработка действий ярлыков
    handleShortcutAction(action) {
        switch (action) {
            case 'flight-request':
                this.navigateToSection('#flight-request');
                break;
            case 'aeroexpress-request':
                this.navigateToSection('#aeroexpress-request');
                break;
            case 'hotel-request':
                this.navigateToSection('#hotel-request');
                break;
            case 'vacation-request':
                this.navigateToSection('#vacation-request');
                break;
            case 'dashboard':
                window.location.href = '/dashboard.html';
                break;
        }
    }

    // Навигация к секции
    navigateToSection(selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
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
            background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: ${type === 'warning' ? '#333' : 'white'};
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-family: 'Montserrat', sans-serif;
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

    // Получение информации о PWA
    getPWAInfo() {
        return {
            isInstalled: this.isInstalled,
            isOnline: this.isOnline,
            canInstall: !!this.deferredPrompt,
            supportsNotifications: 'Notification' in window,
            supportsServiceWorker: 'serviceWorker' in navigator,
            supportsBackgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
            displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
        };
    }
}

// Инициализация PWA Manager
document.addEventListener('DOMContentLoaded', () => {
    window.pwaManager = new PWAManager();
    
    // Добавляем информацию о PWA в консоль для отладки
    console.log('PWA Manager инициализирован');
    console.log('Информация о PWA:', window.pwaManager.getPWAInfo());
});

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}
