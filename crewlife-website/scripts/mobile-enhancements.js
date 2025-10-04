// Улучшения мобильного опыта для CrewLife

class MobileEnhancements {
    constructor() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.isScrolling = false;
        this.pullToRefreshThreshold = 60;
        this.swipeThreshold = 50;
        
        this.init();
    }

    init() {
        this.setupTouchEvents();
        this.setupSwipeGestures();
        this.setupPullToRefresh();
        this.setupHapticFeedback();
        this.setupViewportOptimization();
        this.setupMobileMenu();
        this.setupKeyboardHandling();
        this.setupOrientationHandling();
        this.optimizeForSlowConnection();
    }

    // Настройка сенсорных событий
    setupTouchEvents() {
        // Предотвращаем зум при двойном тапе
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = new Date().getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Улучшенная обработка касаний
        document.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });
    }

    // Обработка начала касания
    handleTouchStart(e) {
        const touch = e.touches[0];
        this.touchStartX = touch.clientX;
        this.touchStartY = touch.clientY;
        this.isScrolling = false;
    }

    // Обработка движения касания
    handleTouchMove(e) {
        if (!this.touchStartX || !this.touchStartY) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - this.touchStartX;
        const deltaY = touch.clientY - this.touchStartY;

        // Определяем, это прокрутка или жест
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
            this.isScrolling = true;
        }

        // Обработка pull-to-refresh
        if (window.scrollY === 0 && deltaY > 0) {
            this.handlePullToRefresh(deltaY);
        }
    }

    // Обработка окончания касания
    handleTouchEnd(e) {
        if (!this.touchStartX || !this.touchStartY) return;

        const touch = e.changedTouches[0];
        this.touchEndX = touch.clientX;
        this.touchEndY = touch.clientY;

        if (!this.isScrolling) {
            this.handleSwipe();
        }

        this.resetTouchData();
    }

    // Сброс данных касания
    resetTouchData() {
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.isScrolling = false;
    }

    // Настройка жестов свайпа
    setupSwipeGestures() {
        // Свайп влево/вправо для навигации
        document.addEventListener('swipeleft', () => {
            this.handleSwipeLeft();
        });

        document.addEventListener('swiperight', () => {
            this.handleSwipeRight();
        });
    }

    // Обработка свайпа
    handleSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;

        if (Math.abs(deltaX) > this.swipeThreshold) {
            if (deltaX > 0) {
                this.handleSwipeRight();
            } else {
                this.handleSwipeLeft();
            }
        }

        if (Math.abs(deltaY) > this.swipeThreshold) {
            if (deltaY > 0) {
                this.handleSwipeDown();
            } else {
                this.handleSwipeUp();
            }
        }
    }

    // Свайп влево
    handleSwipeLeft() {
        // Закрываем мобильное меню
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && mobileMenu.classList.contains('open')) {
            this.closeMobileMenu();
        }
    }

    // Свайп вправо
    handleSwipeRight() {
        // Открываем мобильное меню
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && !mobileMenu.classList.contains('open')) {
            this.openMobileMenu();
        }
    }

    // Свайп вверх
    handleSwipeUp() {
        // Прокрутка вверх
        window.scrollBy(0, -100);
    }

    // Свайп вниз
    handleSwipeDown() {
        // Прокрутка вниз
        window.scrollBy(0, 100);
    }

    // Настройка pull-to-refresh
    setupPullToRefresh() {
        // Создаем индикатор pull-to-refresh
        this.createPullToRefreshIndicator();
    }

    // Создание индикатора pull-to-refresh
    createPullToRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'pullToRefresh';
        indicator.className = 'pull-to-refresh';
        indicator.innerHTML = `
            <div class="refresh-content">
                <div class="refresh-icon">🔄</div>
                <span>Потяните для обновления</span>
            </div>
        `;
        document.body.appendChild(indicator);
    }

    // Обработка pull-to-refresh
    handlePullToRefresh(deltaY) {
        const indicator = document.getElementById('pullToRefresh');
        if (!indicator) return;

        if (deltaY > this.pullToRefreshThreshold) {
            indicator.classList.add('show');
            indicator.querySelector('.refresh-icon').style.transform = 'rotate(180deg)';
        } else {
            indicator.classList.remove('show');
            indicator.querySelector('.refresh-icon').style.transform = 'rotate(0deg)';
        }

        // Обновление при отпускании
        if (deltaY > this.pullToRefreshThreshold * 1.5) {
            this.refreshPage();
        }
    }

    // Обновление страницы
    refreshPage() {
        const indicator = document.getElementById('pullToRefresh');
        if (indicator) {
            indicator.querySelector('span').textContent = 'Обновление...';
            indicator.querySelector('.refresh-icon').style.animation = 'spin 1s linear infinite';
        }

        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }

    // Настройка тактильной обратной связи
    setupHapticFeedback() {
        // Проверяем поддержку вибрации
        if ('vibrate' in navigator) {
            this.setupVibrationFeedback();
        }
    }

    // Настройка вибрации
    setupVibrationFeedback() {
        // Вибрация при нажатии кнопок
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn, .request-btn, .header-btn')) {
                this.vibrate(50);
            }
        });

        // Вибрация при ошибках
        document.addEventListener('error', () => {
            this.vibrate([100, 50, 100]);
        });

        // Вибрация при успехе
        document.addEventListener('success', () => {
            this.vibrate([50, 50, 50]);
        });
    }

    // Вибрация
    vibrate(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }

    // Настройка оптимизации viewport
    setupViewportOptimization() {
        // Предотвращаем зум при фокусе на input
        const inputs = document.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                this.preventZoomOnFocus(input);
            });
        });

        // Оптимизация для разных ориентаций
        this.handleOrientationChange();
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
    }

    // Предотвращение зума при фокусе
    preventZoomOnFocus(input) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            
            input.addEventListener('blur', () => {
                viewport.content = 'width=device-width, initial-scale=1.0';
            }, { once: true });
        }
    }

    // Обработка изменения ориентации
    handleOrientationChange() {
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isPortrait) {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        } else {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        }
    }

    // Настройка мобильного меню
    setupMobileMenu() {
        const menuBtn = document.getElementById('mobileMenuBtn');
        const menu = document.getElementById('mobileMenu');
        const closeBtn = document.getElementById('mobileMenuClose');

        if (menuBtn && menu) {
            menuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        if (closeBtn && menu) {
            closeBtn.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Закрытие при клике вне меню
        if (menu) {
            menu.addEventListener('click', (e) => {
                if (e.target === menu) {
                    this.closeMobileMenu();
                }
            });
        }
    }

    // Переключение мобильного меню
    toggleMobileMenu() {
        const menu = document.getElementById('mobileMenu');
        if (menu) {
            if (menu.classList.contains('open')) {
                this.closeMobileMenu();
            } else {
                this.openMobileMenu();
            }
        }
    }

    // Открытие мобильного меню
    openMobileMenu() {
        const menu = document.getElementById('mobileMenu');
        const menuBtn = document.getElementById('mobileMenuBtn');
        
        if (menu && menuBtn) {
            menu.classList.add('open');
            menuBtn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            this.vibrate(50);
        }
    }

    // Закрытие мобильного меню
    closeMobileMenu() {
        const menu = document.getElementById('mobileMenu');
        const menuBtn = document.getElementById('mobileMenuBtn');
        
        if (menu && menuBtn) {
            menu.classList.remove('open');
            menuBtn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
            this.vibrate(50);
        }
    }

    // Настройка обработки клавиатуры
    setupKeyboardHandling() {
        // Обработка виртуальной клавиатуры
        this.handleVirtualKeyboard();
        
        // Обработка клавиш на мобильных устройствах
        document.addEventListener('keydown', (e) => {
            this.handleMobileKeyboard(e);
        });
    }

    // Обработка виртуальной клавиатуры
    handleVirtualKeyboard() {
        let initialViewportHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            const currentHeight = window.innerHeight;
            const heightDifference = initialViewportHeight - currentHeight;
            
            if (heightDifference > 150) {
                // Клавиатура открыта
                document.body.classList.add('keyboard-open');
            } else {
                // Клавиатура закрыта
                document.body.classList.remove('keyboard-open');
            }
        });
    }

    // Обработка клавиатуры на мобильных
    handleMobileKeyboard(e) {
        // Обработка специальных клавиш
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            const form = e.target.closest('form');
            if (form) {
                const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
                const currentIndex = inputs.indexOf(e.target);
                const nextInput = inputs[currentIndex + 1];
                
                if (nextInput) {
                    e.preventDefault();
                    nextInput.focus();
                } else {
                    // Последнее поле - отправляем форму
                    form.submit();
                }
            }
        }
    }

    // Получение информации о мобильных возможностях
    getMobileInfo() {
        return {
            isTouchDevice: 'ontouchstart' in window,
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
            hasVibration: 'vibrate' in navigator,
            hasOrientation: 'orientation' in window,
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1
        };
    }
    
    // Оптимизация для медленных соединений
    optimizeForSlowConnection() {
        if (navigator.connection) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                // Отключаем анимации для медленных соединений
                document.body.classList.add('slow-connection');
                
                // Предзагружаем только критически важные ресурсы
                this.preloadCriticalResources();
            }
        }
    }
    
    // Предзагрузка критически важных ресурсов
    preloadCriticalResources() {
        const criticalResources = [
            'styles/crewlife.css',
            'scripts/crewlife.js'
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource;
            link.as = resource.endsWith('.css') ? 'style' : 'script';
            document.head.appendChild(link);
        });
    }
    
    // Улучшенная обработка ориентации экрана
    setupOrientationHandling() {
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });
        
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }
    
    // Обработка изменения ориентации
    handleOrientationChange() {
        const info = this.getMobileInfo();
        console.log('Ориентация изменилась:', info);
        
        // Обновляем высоту viewport для мобильных браузеров
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    // Обработка изменения размера окна
    handleResize() {
        const info = this.getMobileInfo();
        
        // Обновляем CSS переменные для viewport
        const vh = window.innerHeight * 0.01;
        const vw = window.innerWidth * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        document.documentElement.style.setProperty('--vw', `${vw}px`);
        
        // Адаптируем интерфейс под новый размер
        this.adaptInterfaceToScreenSize(info);
    }
    
    // Адаптация интерфейса под размер экрана
    adaptInterfaceToScreenSize(info) {
        if (info.screenWidth < 480) {
            document.body.classList.add('very-small-screen');
        } else {
            document.body.classList.remove('very-small-screen');
        }
        
        if (info.screenWidth >= 768) {
            document.body.classList.add('tablet-or-larger');
        } else {
            document.body.classList.remove('tablet-or-larger');
        }
    }
}

// Инициализация мобильных улучшений
document.addEventListener('DOMContentLoaded', () => {
    window.mobileEnhancements = new MobileEnhancements();
    
    // Добавляем информацию о мобильных возможностях в консоль для отладки
    console.log('Mobile Enhancements инициализированы');
    console.log('Информация о мобильных возможностях:', window.mobileEnhancements.getMobileInfo());
});

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MobileEnhancements;
}
