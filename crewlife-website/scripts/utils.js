// Утилиты для проекта CrewLife
class CrewLifeUtils {
    constructor() {
        this.notifications = [];
        this.init();
    }

    init() {
        this.createNotificationContainer();
        this.setupKeyboardShortcuts();
    }

    // Создание контейнера для уведомлений
    createNotificationContainer() {
        if (!document.getElementById('notification-container')) {
            const container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
                pointer-events: none;
            `;
            if (document.body) {
                document.body.appendChild(container);
            } else {
                document.addEventListener('DOMContentLoaded', () => {
                    document.body.appendChild(container);
                });
            }
        }
    }

    // Показ уведомления
    showNotification(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        const id = Date.now() + Math.random();
        
        notification.id = `notification-${id}`;
        notification.className = `notification notification-${type}`;
        
        const icon = this.getNotificationIcon(type);
        const color = this.getNotificationColor(type);
        
        notification.innerHTML = `
            <div class="notification-content" style="
                background: white;
                border-left: 4px solid ${color};
                border-radius: 8px;
                padding: 16px 20px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                max-width: 400px;
                pointer-events: auto;
                animation: slideInRight 0.3s ease;
            ">
                <div class="notification-icon" style="
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: ${color};
                ">
                    ${icon}
                </div>
                <div class="notification-message" style="
                    flex: 1;
                    color: #333;
                    font-size: 14px;
                    line-height: 1.4;
                ">${message}</div>
                <button class="notification-close" style="
                    background: none;
                    border: none;
                    color: #999;
                    cursor: pointer;
                    padding: 4px;
                    border-radius: 4px;
                    transition: color 0.2s ease;
                " onclick="this.parentElement.parentElement.remove()">
                    ✕
                </button>
            </div>
        `;

        // Добавляем стили для анимации
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
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
                .notification-close:hover {
                    color: #FF4D4D !important;
                }
            `;
            document.head.appendChild(style);
        }

        const container = document.getElementById('notification-container');
        container.appendChild(notification);

        // Автоматическое удаление
        if (duration > 0) {
            setTimeout(() => {
                this.removeNotification(notification);
            }, duration);
        }

        this.notifications.push(notification);
        return notification;
    }

    // Удаление уведомления
    removeNotification(notification) {
        if (notification && notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }

    // Получение иконки для типа уведомления
    getNotificationIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    // Получение цвета для типа уведомления
    getNotificationColor(type) {
        const colors = {
            success: '#28a745',
            error: '#FF4D4D',
            warning: '#ffc107',
            info: '#17a2b8'
        };
        return colors[type] || colors.info;
    }

    // Функция удалена
    showModal(title, message, type = 'info') {
        // Функция удалена - используйте showNotification вместо модальных окон
        console.log('showModal вызвана, но функция удалена. Используйте showNotification.');
        return null;
    }

    // Валидация email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Валидация телефона
    validatePhone(phone) {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    // Валидация пароля
    validatePassword(password) {
        const minLength = 6;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

        return {
            isValid: password.length >= minLength,
            minLength: password.length >= minLength,
            hasUpperCase,
            hasLowerCase,
            hasNumbers,
            hasSpecialChar,
            strength: this.calculatePasswordStrength(password)
        };
    }

    // Расчет силы пароля
    calculatePasswordStrength(password) {
        let score = 0;
        if (password.length >= 6) score += 1;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

        if (score <= 2) return 'weak';
        if (score <= 4) return 'medium';
        return 'strong';
    }

    // Форматирование даты
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Intl.DateTimeFormat('ru-RU', { ...defaultOptions, ...options }).format(date);
    }

    // Дебаунс функция
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Троттлинг функция
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Настройка горячих клавиш
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + Enter для отправки форм
            if (e.ctrlKey && e.key === 'Enter') {
                const form = document.querySelector('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }

            // Escape для закрытия модальных окон
            if (e.key === 'Escape') {
                const modal = document.querySelector('.modal');
                if (modal) {
                    modal.remove();
                    document.body.style.overflow = 'auto';
                }
            }
        });
    }

    // Анимация печатания
    typeWriter(element, text, speed = 100, callback) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else if (callback) {
                callback();
            }
        }
        
        type();
    }

    // Плавная прокрутка к элементу
    scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }

    // Проверка видимости элемента
    isElementInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // Локальное хранилище с поддержкой JSON
    storage = {
        set(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (e) {
                console.error('Ошибка сохранения в localStorage:', e);
                return false;
            }
        },
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                console.error('Ошибка чтения из localStorage:', e);
                return defaultValue;
            }
        },
        remove(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (e) {
                console.error('Ошибка удаления из localStorage:', e);
                return false;
            }
        }
    };
}

// Создаем глобальный экземпляр утилит
window.CrewLife = new CrewLifeUtils();

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrewLifeUtils;
}


// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CrewLifeUtils;
}

