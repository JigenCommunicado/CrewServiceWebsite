/**
 * Мобильные улучшения UX для CrewLife
 * Включает: жесты навигации, выдвижное меню, вибрацию, pull-to-refresh, toast уведомления
 */

class MobileUXManager {
    constructor() {
        this.isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.swipeThreshold = 50;
        this.pullThreshold = 80;
        this.isPulling = false;
        this.pullDistance = 0;
        
        if (this.isMobile) {
            this.init();
        }
    }

    init() {
        console.log('🚀 Инициализация мобильных улучшений UX');
        this.setupSwipeNavigation();
        this.setupMobileDrawer();
        this.setupHapticFeedback();
        this.setupPullToRefresh();
        this.setupToastNotifications();
        this.setupMobileModals();
        this.setupPageTransitions();
    }

    // 1. Жесты навигации
    setupSwipeNavigation() {
        if (!this.isMobile) return;

        const navigationMap = {
            '/': { left: '/pages/help.html', right: '/pages/dashboard.html' },
            '/pages/dashboard.html': { left: '/', right: '/pages/profile.html' },
            '/pages/profile.html': { left: '/pages/dashboard.html', right: '/pages/help.html' },
            '/pages/help.html': { left: '/pages/profile.html', right: '/' }
        };

        const currentPath = window.location.pathname;
        const navigation = navigationMap[currentPath];

        if (!navigation) return;

        // Создаем индикаторы навигации
        this.createSwipeIndicators(navigation);

        // Обработчики жестов
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            this.touchEndX = e.changedTouches[0].clientX;
            this.touchEndY = e.changedTouches[0].clientY;
            this.handleSwipe(navigation);
        });
    }

    createSwipeIndicators(navigation) {
        const container = document.createElement('div');
        container.className = 'swipe-navigation';
        
        if (navigation.left) {
            const leftIndicator = document.createElement('div');
            leftIndicator.className = 'swipe-indicator left';
            leftIndicator.innerHTML = '←';
            leftIndicator.title = 'Свайп влево для навигации';
            container.appendChild(leftIndicator);
        }

        if (navigation.right) {
            const rightIndicator = document.createElement('div');
            rightIndicator.className = 'swipe-indicator right';
            rightIndicator.innerHTML = '→';
            rightIndicator.title = 'Свайп вправо для навигации';
            container.appendChild(rightIndicator);
        }

        document.body.appendChild(container);
    }

    handleSwipe(navigation) {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;

        // Проверяем, что это горизонтальный свайп
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > this.swipeThreshold) {
            if (deltaX > 0 && navigation.left) {
                // Свайп вправо - переход влево
                this.showSwipeIndicator('left');
                setTimeout(() => {
                    window.location.href = navigation.left;
                }, 300);
            } else if (deltaX < 0 && navigation.right) {
                // Свайп влево - переход вправо
                this.showSwipeIndicator('right');
                setTimeout(() => {
                    window.location.href = navigation.right;
                }, 300);
            }
        }
    }

    showSwipeIndicator(direction) {
        const indicator = document.querySelector(`.swipe-indicator.${direction}`);
        if (indicator) {
            indicator.classList.add('show');
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 1000);
        }
    }

    // 2. Выдвижное мобильное меню
    setupMobileDrawer() {
        if (!this.isMobile) return;

        // Создаем кнопку меню
        const menuButton = document.createElement('button');
        menuButton.className = 'mobile-menu-btn haptic-feedback';
        menuButton.innerHTML = '☰';
        menuButton.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            z-index: 1001;
            background: rgba(255, 77, 77, 0.9);
            color: white;
            border: none;
            width: 48px;
            height: 48px;
            border-radius: 50%;
            font-size: 1.2rem;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(255, 77, 77, 0.3);
            backdrop-filter: blur(10px);
        `;

        // Создаем выдвижное меню
        const drawer = document.createElement('div');
        drawer.className = 'mobile-drawer';
        drawer.innerHTML = `
            <div class="mobile-drawer-header">
                <div class="mobile-drawer-title">CrewLife</div>
                <div class="mobile-drawer-subtitle">Мобильное меню</div>
            </div>
            <div class="mobile-drawer-menu">
                <a href="/" class="mobile-drawer-item">
                    <div class="mobile-drawer-icon">🏠</div>
                    Главная
                </a>
                <a href="/pages/dashboard.html" class="mobile-drawer-item">
                    <div class="mobile-drawer-icon">📊</div>
                    Дашборд
                </a>
                <a href="/pages/profile.html" class="mobile-drawer-item">
                    <div class="mobile-drawer-icon">👤</div>
                    Профиль
                </a>
                <a href="/pages/help.html" class="mobile-drawer-item">
                    <div class="mobile-drawer-icon">❓</div>
                    Помощь
                </a>
                <a href="/pages/flight-booking.html" class="mobile-drawer-item">
                    <div class="mobile-drawer-icon">✈️</div>
                    Заказ рейса
                </a>
                <a href="/pages/weekend.html" class="mobile-drawer-item">
                    <div class="mobile-drawer-icon">📅</div>
                    Выходные
                </a>
                <a href="/pages/aeroexpress.html" class="mobile-drawer-item">
                    <div class="mobile-drawer-icon">🚄</div>
                    Аэроэкспресс
                </a>
            </div>
        `;

        // Создаем оверлей
        const overlay = document.createElement('div');
        overlay.className = 'mobile-drawer-overlay';

        document.body.appendChild(menuButton);
        document.body.appendChild(overlay);
        document.body.appendChild(drawer);

        // Обработчики событий
        menuButton.addEventListener('click', () => {
            this.toggleDrawer();
            this.vibrate();
        });

        overlay.addEventListener('click', () => {
            this.closeDrawer();
        });

        // Отмечаем активную страницу
        const currentPath = window.location.pathname;
        const activeItem = drawer.querySelector(`a[href="${currentPath}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    toggleDrawer() {
        const drawer = document.querySelector('.mobile-drawer');
        const overlay = document.querySelector('.mobile-drawer-overlay');
        
        if (drawer.classList.contains('show')) {
            this.closeDrawer();
        } else {
            this.openDrawer();
        }
    }

    openDrawer() {
        const drawer = document.querySelector('.mobile-drawer');
        const overlay = document.querySelector('.mobile-drawer-overlay');
        
        overlay.classList.add('show');
        drawer.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeDrawer() {
        const drawer = document.querySelector('.mobile-drawer');
        const overlay = document.querySelector('.mobile-drawer-overlay');
        
        drawer.classList.remove('show');
        overlay.classList.remove('show');
        document.body.style.overflow = '';
    }

    // 3. Вибрация и тактильная обратная связь
    setupHapticFeedback() {
        if (!this.isMobile) return;

        // Добавляем класс haptic-feedback к интерактивным элементам
        const interactiveElements = document.querySelectorAll('button, .btn, .request-btn, .header-btn, a[href]');
        interactiveElements.forEach(element => {
            element.classList.add('haptic-feedback');
            
            element.addEventListener('touchstart', () => {
                this.vibrate();
            });
        });
    }

    vibrate(pattern = [50]) {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    }

    // 4. Pull-to-refresh
    setupPullToRefresh() {
        if (!this.isMobile) return;

        const pullToRefresh = document.createElement('div');
        pullToRefresh.className = 'pull-to-refresh';
        pullToRefresh.innerHTML = '🔄 Обновление...';
        document.body.appendChild(pullToRefresh);

        let startY = 0;
        let currentY = 0;
        let isPulling = false;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;

            currentY = e.touches[0].clientY;
            const pullDistance = currentY - startY;

            if (pullDistance > 0) {
                e.preventDefault();
                this.pullDistance = Math.min(pullDistance, 120);
                
                if (this.pullDistance > this.pullThreshold) {
                    pullToRefresh.classList.add('show');
                }
            }
        });

        document.addEventListener('touchend', () => {
            if (isPulling && this.pullDistance > this.pullThreshold) {
                this.refreshPage();
            }
            
            isPulling = false;
            this.pullDistance = 0;
            pullToRefresh.classList.remove('show');
        });
    }

    refreshPage() {
        this.vibrate([100, 50, 100]);
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

    // 5. Toast уведомления
    setupToastNotifications() {
        // Создаем контейнер для toast
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            z-index: 4000;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }

    showToast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `mobile-toast ${type}`;
        
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <div class="mobile-toast-icon">${icons[type] || icons.info}</div>
            <div class="mobile-toast-message">${message}</div>
        `;

        container.appendChild(toast);

        // Анимация появления
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Автоматическое скрытие
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // 6. Мобильные модальные окна
    setupMobileModals() {
        // Конвертируем обычные модальные окна в мобильные
        const modals = document.querySelectorAll('.modal, .success-modal, .error-modal');
        modals.forEach(modal => {
            modal.classList.add('mobile-modal');
            
            const content = modal.querySelector('.modal-content, .success-content, .error-content');
            if (content) {
                content.classList.add('mobile-modal-content');
            }
        });
    }

    // 7. Переходы между страницами
    setupPageTransitions() {
        if (!this.isMobile) return;

        // Добавляем класс перехода к основному контенту
        const mainContent = document.querySelector('main, .container, .page-content');
        if (mainContent) {
            mainContent.classList.add('page-transition', 'entered');
        }

        // Обработка перехода при загрузке страницы
        window.addEventListener('beforeunload', () => {
            if (mainContent) {
                mainContent.classList.add('exiting');
            }
        });
    }

    // Публичные методы для использования в других скриптах
    static showToast(message, type = 'info', duration = 3000) {
        if (window.mobileUX) {
            window.mobileUX.showToast(message, type, duration);
        }
    }

    static vibrate(pattern = [50]) {
        if (window.mobileUX) {
            window.mobileUX.vibrate(pattern);
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    window.mobileUX = new MobileUXManager();
});

// Экспорт для использования в других модулях
window.MobileUXManager = MobileUXManager;






