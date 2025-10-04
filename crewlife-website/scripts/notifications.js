// Система уведомлений CrewLife
class NotificationSystem {
    constructor() {
        this.permission = 'default';
        this.notifications = [];
        this.maxNotifications = 5;
        this.autoHideDelay = 5000;
        this.init();
    }

    async init() {
        // Проверяем поддержку уведомлений
        if (!('Notification' in window)) {
            console.warn('Браузер не поддерживает уведомления');
            return;
        }

        // Запрашиваем разрешение
        await this.requestPermission();
        
        // Инициализируем контейнер уведомлений
        this.createNotificationContainer();
        
        // Загружаем сохраненные уведомления
        this.loadStoredNotifications();
        
        // Настраиваем периодические проверки
        this.startPeriodicChecks();
    }

    // Запрос разрешения на уведомления
    async requestPermission() {
        if (Notification.permission === 'granted') {
            this.permission = 'granted';
            return true;
        }

        if (Notification.permission === 'denied') {
            this.permission = 'denied';
            return false;
        }

        try {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        } catch (error) {
            console.error('Ошибка запроса разрешения на уведомления:', error);
            return false;
        }
    }

    // Создание контейнера для уведомлений
    createNotificationContainer() {
        if (document.getElementById('notification-container')) return;
        
        // Ждем загрузки DOM
        if (!document.body) {
            setTimeout(() => this.createNotificationContainer(), 100);
            return;
        }

        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'notification-container';
        document.body.appendChild(container);

        // Добавляем стили
        const style = document.createElement('style');
        style.textContent = `
            .notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                max-width: 400px;
                pointer-events: none;
            }

            .notification {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                padding: 16px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                transform: translateX(100%);
                opacity: 0;
                transition: all 0.3s ease;
                pointer-events: auto;
                border-left: 4px solid #FF4D4D;
                max-width: 100%;
                word-wrap: break-word;
            }

            .notification.show {
                transform: translateX(0);
                opacity: 1;
            }

            .notification.success {
                border-left-color: #4CAF50;
            }

            .notification.warning {
                border-left-color: #FF9800;
            }

            .notification.error {
                border-left-color: #F44336;
            }

            .notification.info {
                border-left-color: #2196F3;
            }

            .notification-icon {
                flex-shrink: 0;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 14px;
                font-weight: bold;
            }

            .notification.success .notification-icon {
                background: #4CAF50;
            }

            .notification.warning .notification-icon {
                background: #FF9800;
            }

            .notification.error .notification-icon {
                background: #F44336;
            }

            .notification.info .notification-icon {
                background: #2196F3;
            }

            .notification-content {
                flex: 1;
                min-width: 0;
            }

            .notification-title {
                font-weight: 600;
                color: #333;
                margin: 0 0 4px 0;
                font-size: 14px;
            }

            .notification-message {
                color: #666;
                margin: 0;
                font-size: 13px;
                line-height: 1.4;
            }

            .notification-close {
                flex-shrink: 0;
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: all 0.2s ease;
                font-size: 16px;
                line-height: 1;
            }

            .notification-close:hover {
                background: #f0f0f0;
                color: #666;
            }

            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: #FF4D4D;
                border-radius: 0 0 12px 12px;
                transition: width linear;
            }

            .notification.success .notification-progress {
                background: #4CAF50;
            }

            .notification.warning .notification-progress {
                background: #FF9800;
            }

            .notification.error .notification-progress {
                background: #F44336;
            }

            .notification.info .notification-progress {
                background: #2196F3;
            }

            @media (max-width: 480px) {
                .notification-container {
                    top: 10px;
                    right: 10px;
                    left: 10px;
                    max-width: none;
                }

                .notification {
                    padding: 12px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Показ уведомления
    showNotification(message, type = 'info', options = {}) {
        const notification = {
            id: Date.now() + Math.random(),
            message,
            type,
            title: options.title || this.getDefaultTitle(type),
            duration: options.duration || this.autoHideDelay,
            persistent: options.persistent || false,
            actions: options.actions || [],
            timestamp: new Date()
        };

        // Добавляем в массив
        this.notifications.push(notification);

        // Ограничиваем количество
        if (this.notifications.length > this.maxNotifications) {
            this.notifications.shift();
        }

        // Сохраняем
        this.saveNotifications();

        // Показываем в UI
        this.displayNotification(notification);

        // Показываем браузерное уведомление
        if (this.permission === 'granted' && !document.hasFocus()) {
            this.showBrowserNotification(notification);
        }

        return notification.id;
    }

    // Отображение уведомления в UI
    displayNotification(notification) {
        const container = document.getElementById('notification-container');
        if (!container) return;

        const element = document.createElement('div');
        element.className = `notification ${notification.type}`;
        element.dataset.id = notification.id;

        element.innerHTML = `
            <div class="notification-icon">${this.getIcon(notification.type)}</div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                ${notification.actions.length > 0 ? this.renderActions(notification.actions) : ''}
            </div>
            <button class="notification-close" onclick="window.notificationSystem.hideNotification(${notification.id})">&times;</button>
            ${!notification.persistent ? '<div class="notification-progress"></div>' : ''}
        `;

        container.appendChild(element);

        // Анимация появления
        setTimeout(() => {
            element.classList.add('show');
        }, 10);

        // Автоматическое скрытие
        if (!notification.persistent) {
            this.autoHideNotification(notification.id, notification.duration);
        }

        // Звуковое уведомление
        this.playNotificationSound(notification.type);
    }

    // Скрытие уведомления
    hideNotification(id) {
        const element = document.querySelector(`[data-id="${id}"]`);
        if (!element) return;

        element.classList.remove('show');
        
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);

        // Удаляем из массива
        this.notifications = this.notifications.filter(n => n.id !== id);
        this.saveNotifications();
    }

    // Автоматическое скрытие
    autoHideNotification(id, duration) {
        const element = document.querySelector(`[data-id="${id}"]`);
        if (!element) return;

        const progressBar = element.querySelector('.notification-progress');
        if (progressBar) {
            progressBar.style.width = '100%';
            progressBar.style.transition = `width ${duration}ms linear`;
        }

        setTimeout(() => {
            this.hideNotification(id);
        }, duration);
    }

    // Показ браузерного уведомления
    showBrowserNotification(notification) {
        if (this.permission !== 'granted') return;

        const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: notification.id,
            requireInteraction: notification.persistent,
            actions: notification.actions.map(action => ({
                action: action.id,
                title: action.title
            }))
        });

        browserNotification.onclick = () => {
            window.focus();
            browserNotification.close();
        };

        // Автоматическое закрытие
        if (!notification.persistent) {
            setTimeout(() => {
                browserNotification.close();
            }, notification.duration);
        }
    }

    // Получение иконки по типу
    getIcon(type) {
        const icons = {
            success: '✓',
            warning: '⚠',
            error: '✕',
            info: 'i'
        };
        return icons[type] || 'i';
    }

    // Получение заголовка по умолчанию
    getDefaultTitle(type) {
        const titles = {
            success: 'Успешно',
            warning: 'Внимание',
            error: 'Ошибка',
            info: 'Уведомление'
        };
        return titles[type] || 'Уведомление';
    }

    // Рендер действий
    renderActions(actions) {
        return `
            <div class="notification-actions" style="margin-top: 8px; display: flex; gap: 8px;">
                ${actions.map(action => `
                    <button onclick="window.notificationSystem.handleAction('${action.id}')" 
                            style="padding: 4px 8px; font-size: 12px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">
                        ${action.title}
                    </button>
                `).join('')}
            </div>
        `;
    }

    // Обработка действий
    handleAction(actionId) {
        console.log('Действие выполнено:', actionId);
        // Здесь можно добавить логику обработки действий
    }

    // Звуковое уведомление
    playNotificationSound(type) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Разные частоты для разных типов
            const frequencies = {
                success: 800,
                warning: 600,
                error: 400,
                info: 700
            };

            oscillator.frequency.setValueAtTime(frequencies[type] || 700, audioContext.currentTime);
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (error) {
            console.warn('Не удалось воспроизвести звук:', error);
        }
    }

    // Загрузка сохраненных уведомлений
    loadStoredNotifications() {
        try {
            const stored = localStorage.getItem('crewlife_notifications');
            if (stored) {
                this.notifications = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        }
    }

    // Сохранение уведомлений
    saveNotifications() {
        try {
            localStorage.setItem('crewlife_notifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Ошибка сохранения уведомлений:', error);
        }
    }

    // Периодические проверки
    startPeriodicChecks() {
        // Проверяем новые уведомления каждые 30 секунд
        setInterval(() => {
            this.checkForNewNotifications();
        }, 30000);

        // Проверяем статус заявок каждые 5 минут
        setInterval(() => {
            this.checkRequestStatus();
        }, 300000);
    }

    // Проверка новых уведомлений
    async checkForNewNotifications() {
        try {
            // Здесь можно добавить API вызов для получения новых уведомлений
            // const newNotifications = await fetch('/api/notifications').then(r => r.json());
            
            // Симуляция новых уведомлений
            if (Math.random() < 0.1) { // 10% вероятность
                this.showNotification(
                    'У вас есть новые уведомления',
                    'info',
                    { title: 'Новые уведомления' }
                );
            }
        } catch (error) {
            console.error('Ошибка проверки уведомлений:', error);
        }
    }

    // Проверка статуса заявок
    async checkRequestStatus() {
        try {
            // Здесь можно добавить API вызов для проверки статуса заявок
            // const statusUpdates = await fetch('/api/requests/status').then(r => r.json());
            
            // Симуляция обновлений статуса
            if (Math.random() < 0.05) { // 5% вероятность
                this.showNotification(
                    'Статус одной из ваших заявок изменился',
                    'info',
                    { title: 'Обновление заявки' }
                );
            }
        } catch (error) {
            console.error('Ошибка проверки статуса заявок:', error);
        }
    }

    // Очистка всех уведомлений
    clearAllNotifications() {
        this.notifications = [];
        this.saveNotifications();
        
        const container = document.getElementById('notification-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    // Получение истории уведомлений
    getNotificationHistory() {
        return [...this.notifications].reverse();
    }

    // Настройка уведомлений
    updateSettings(settings) {
        this.autoHideDelay = settings.autoHideDelay || this.autoHideDelay;
        this.maxNotifications = settings.maxNotifications || this.maxNotifications;
    }
}

// Инициализация системы уведомлений
window.notificationSystem = new NotificationSystem();

// Интеграция с существующей системой
if (window.CrewLife) {
    // Переопределяем существующую функцию showNotification
    const originalShowNotification = window.CrewLife.showNotification;
    
    window.CrewLife.showNotification = function(message, type = 'info', options = {}) {
        // Вызываем оригинальную функцию для совместимости
        if (originalShowNotification) {
            originalShowNotification(message, type);
        }
        
        // Используем новую систему уведомлений
        return window.notificationSystem.showNotification(message, type, options);
    };
} else {
    // Создаем объект CrewLife если его нет
    window.CrewLife = {
        showNotification: function(message, type = 'info', options = {}) {
            return window.notificationSystem.showNotification(message, type, options);
        }
    };
}

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}
