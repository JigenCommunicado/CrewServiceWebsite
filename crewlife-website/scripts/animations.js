// Продвинутые анимации для CrewLife

class AnimationManager {
    constructor() {
        this.observers = new Map();
        this.animations = new Map();
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.init();
    }

    init() {
        this.setupScrollAnimations();
        this.setupHoverAnimations();
        this.setupClickAnimations();
        this.setupMagneticEffect();
        this.setupParticleSystem();
        this.setupLoadingAnimations();
        this.setupPageTransitions();
        this.setupGestureSupport();
        this.setupPerformanceOptimizations();
    }

    // 1. Анимации при скролле
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.triggerScrollAnimation(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Наблюдаем за элементами с анимациями
        const animatedElements = document.querySelectorAll('.animate-on-scroll, .fade-in, .slide-in-left, .slide-in-right, .scale-in');
        animatedElements.forEach(el => {
            observer.observe(el);
        });

        this.observers.set('scroll', observer);
    }

    triggerScrollAnimation(element) {
        if (this.isReducedMotion) return;

        const animationType = this.getAnimationType(element);
        element.classList.add('visible', 'animated');
        
        // Добавляем задержку для последовательных анимаций
        const delay = element.dataset.delay || 0;
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) translateX(0) scale(1)';
        }, delay);
    }

    getAnimationType(element) {
        if (element.classList.contains('fade-in')) return 'fade';
        if (element.classList.contains('slide-in-left')) return 'slideLeft';
        if (element.classList.contains('slide-in-right')) return 'slideRight';
        if (element.classList.contains('scale-in')) return 'scale';
        return 'fade';
    }

    // 2. Анимации при наведении (отключены для стабильности)
    setupHoverAnimations() {
        // Отключаем анимации при наведении для предотвращения дергания
        return;
    }

    triggerHoverAnimation(element, type) {
        if (this.isReducedMotion) return;

        if (type === 'enter') {
            element.style.transform = 'translateY(-8px) scale(1.02)';
            element.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        } else {
            element.style.transform = 'translateY(0) scale(1)';
            element.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
        }
    }

    // 3. Анимации при клике
    setupClickAnimations() {
        const clickElements = document.querySelectorAll('.btn, .request-btn, .header-btn');
        
        clickElements.forEach(element => {
            element.addEventListener('click', (e) => {
                this.triggerClickAnimation(element, e);
            });
        });
    }

    triggerClickAnimation(element, event) {
        if (this.isReducedMotion) return;

        // Создаем эффект волны
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);

        // Добавляем CSS для анимации ripple
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 4. Магнитный эффект (отключен для стабильности)
    setupMagneticEffect() {
        // Отключаем магнитный эффект для предотвращения дергания
        return;
    }

    triggerMagneticEffect(element, event) {
        if (this.isReducedMotion) return;

        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left - rect.width / 2;
        const y = event.clientY - rect.top - rect.height / 2;
        
        element.style.setProperty('--mouse-x', `${x * 0.1}px`);
        element.style.setProperty('--mouse-y', `${y * 0.1}px`);
    }

    resetMagneticEffect(element) {
        element.style.setProperty('--mouse-x', '0px');
        element.style.setProperty('--mouse-y', '0px');
    }

    // 5. Система частиц (отключена для стабильности)
    setupParticleSystem() {
        // Отключаем систему частиц для предотвращения дергания
        return;
    }

    createParticles(container) {
        const particleCount = 5;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.animationDelay = `${i * 0.5}s`;
            container.appendChild(particle);
        }
    }

    // 6. Анимации загрузки
    setupLoadingAnimations() {
        const loadingElements = document.querySelectorAll('.loading-spinner, .loading-dots');
        
        loadingElements.forEach(element => {
            this.triggerLoadingAnimation(element);
        });
    }

    triggerLoadingAnimation(element) {
        if (this.isReducedMotion) return;

        element.style.animation = 'spin 1s linear infinite';
    }

    // 7. Переходы между страницами
    setupPageTransitions() {
        const links = document.querySelectorAll('a[href]');
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.href && !link.href.startsWith('mailto:') && !link.href.startsWith('tel:')) {
                    this.triggerPageTransition(e, link);
                }
            });
        });
    }

    triggerPageTransition(event, link) {
        if (this.isReducedMotion) return;

        event.preventDefault();
        
        const body = document.body;
        body.classList.add('page-transition', 'exiting');
        
        setTimeout(() => {
            window.location.href = link.href;
        }, 300);
    }

    // 8. Поддержка жестов
    setupGestureSupport() {
        if (!this.isMobile) return;

        const swipeContainers = document.querySelectorAll('.swipe-container');
        
        swipeContainers.forEach(container => {
            this.setupSwipeGestures(container);
        });

        // this.setupMobilePickers(); // Отключено - используем обычные выпадающие списки
        this.setupPullToRefresh();
    }

    setupSwipeGestures(container) {
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let isDragging = false;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isDragging = true;
            container.classList.add('swiping');
        });

        container.addEventListener('touchmove', (e) => {
            if (!isDragging) return;

            currentX = e.touches[0].clientX;
            const deltaX = currentX - startX;
            const deltaY = Math.abs(e.touches[0].clientY - startY);

            if (deltaY < 50) { // Горизонтальный свайп
                e.preventDefault();
                container.style.transform = `translateX(${deltaX}px)`;
            }
        });

        container.addEventListener('touchend', () => {
            if (!isDragging) return;

            const deltaX = currentX - startX;
            const threshold = 100;

            if (Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    this.triggerSwipeAction(container, 'right');
                } else {
                    this.triggerSwipeAction(container, 'left');
                }
            }

            container.style.transform = '';
            container.classList.remove('swiping');
            isDragging = false;
        });
    }

    triggerSwipeAction(container, direction) {
        const event = new CustomEvent('swipe', {
            detail: { direction }
        });
        container.dispatchEvent(event);
    }

    // Настройка мобильных пикеров для селектов
    setupMobilePickers() {
        // Отключаем мобильные пикеры, оставляем обычные выпадающие списки
        return;
    }

    convertSelectToMobilePicker(select) {
        console.log('Converting select to mobile picker:', select.id);
        
        // Создаем кнопку для открытия пикера
        const pickerButton = document.createElement('button');
        pickerButton.type = 'button';
        pickerButton.className = 'form-input mobile-picker-button';
        pickerButton.style.textAlign = 'left';
        pickerButton.style.cursor = 'pointer';
        pickerButton.style.position = 'relative';
        pickerButton.style.width = '100%';
        pickerButton.style.padding = '12px 16px';
        pickerButton.style.border = '1px solid #ddd';
        pickerButton.style.borderRadius = '8px';
        pickerButton.style.backgroundColor = 'white';
        pickerButton.style.fontSize = '16px';
        
        // Устанавливаем текущее значение
        const updateButtonText = () => {
            const selectedOption = select.options[select.selectedIndex];
            pickerButton.textContent = selectedOption ? selectedOption.textContent : 'Выберите...';
        };
        updateButtonText();
        
        // Создаем мобильный пикер
        const picker = this.createMobilePicker(select, updateButtonText);
        
        // Обработчик клика по кнопке
        pickerButton.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Picker button clicked');
            this.showMobilePicker(picker);
        });
        
        // Заменяем select на кнопку
        select.style.display = 'none';
        select.parentNode.insertBefore(pickerButton, select);
        select.parentNode.insertBefore(picker, select);
        
        console.log('Mobile picker created for:', select.id);
    }

    createMobilePicker(select, updateCallback) {
        const picker = document.createElement('div');
        picker.className = 'mobile-picker';
        picker.innerHTML = `
            <div class="mobile-picker-header">
                <div class="mobile-picker-title">${select.getAttribute('data-title') || 'Выберите опцию'}</div>
                <button type="button" class="mobile-picker-close">&times;</button>
            </div>
            <div class="mobile-picker-wheel">
                <div class="mobile-picker-wheel-indicators"></div>
                <div class="mobile-picker-wheel-container"></div>
            </div>
            <button type="button" class="mobile-picker-confirm">Готово</button>
        `;
        
        const wheelContainer = picker.querySelector('.mobile-picker-wheel-container');
        const closeButton = picker.querySelector('.mobile-picker-close');
        const confirmButton = picker.querySelector('.mobile-picker-confirm');
        
        // Создаем колесо прокрутки
        const wheel = new MobilePickerWheel(select, wheelContainer, updateCallback);
        
        // Обработчики закрытия
        closeButton.addEventListener('click', () => {
            this.hideMobilePicker(picker);
        });
        
        confirmButton.addEventListener('click', () => {
            wheel.confirmSelection();
            this.hideMobilePicker(picker);
        });
        
        return picker;
    }

    showMobilePicker(picker) {
        console.log('Showing mobile picker');
        const overlay = document.createElement('div');
        overlay.className = 'mobile-picker-overlay';
        document.body.appendChild(overlay);
        document.body.appendChild(picker);
        
        // Предотвращаем скролл body
        document.body.style.overflow = 'hidden';
        
        // Анимация появления
        requestAnimationFrame(() => {
            overlay.classList.add('show');
            picker.classList.add('show');
            console.log('Mobile picker shown');
            
            // Анимация появления заголовка
            const title = picker.querySelector('.mobile-picker-title');
            if (title) {
                title.style.opacity = '0';
                title.style.transform = 'translateY(-20px)';
                setTimeout(() => {
                    title.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    title.style.opacity = '1';
                    title.style.transform = 'translateY(0)';
                }, 100);
            }
            
            // Анимация появления кнопки закрытия
            const closeBtn = picker.querySelector('.mobile-picker-close');
            if (closeBtn) {
                closeBtn.style.opacity = '0';
                closeBtn.style.transform = 'scale(0.5) rotate(180deg)';
                setTimeout(() => {
                    closeBtn.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    closeBtn.style.opacity = '1';
                    closeBtn.style.transform = 'scale(1) rotate(0deg)';
                }, 200);
            }
            
            // Анимация появления кнопки подтверждения
            const confirmBtn = picker.querySelector('.mobile-picker-confirm');
            if (confirmBtn) {
                confirmBtn.style.opacity = '0';
                confirmBtn.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    confirmBtn.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                    confirmBtn.style.opacity = '1';
                    confirmBtn.style.transform = 'translateY(0)';
                }, 300);
            }
        });
        
        // Закрытие по клику на оверлей
        overlay.addEventListener('click', () => {
            this.hideMobilePicker(picker);
        });
    }

    hideMobilePicker(picker) {
        const overlay = document.querySelector('.mobile-picker-overlay');
        
        picker.classList.remove('show');
        if (overlay) {
            overlay.classList.remove('show');
        }
        
        // Восстанавливаем скролл body
        document.body.style.overflow = '';
        
        // Удаляем элементы после анимации
        setTimeout(() => {
            if (overlay) {
                overlay.remove();
            }
            picker.remove();
        }, 300);
    }

    setupPullToRefresh() {
        let startY = 0;
        let currentY = 0;
        let isPulling = false;
        const threshold = 100;

        document.addEventListener('touchstart', (e) => {
            if (window.scrollY === 0) {
                startY = e.touches[0].clientY;
                isPulling = true;
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (!isPulling) return;

            currentY = e.touches[0].clientY;
            const deltaY = currentY - startY;

            if (deltaY > 0) {
                e.preventDefault();
                this.updatePullToRefresh(deltaY);
            }
        });

        document.addEventListener('touchend', () => {
            if (!isPulling) return;

            const deltaY = currentY - startY;
            
            if (deltaY > threshold) {
                this.triggerPullToRefresh();
            } else {
                this.resetPullToRefresh();
            }

            isPulling = false;
        });
    }

    updatePullToRefresh(deltaY) {
        const pullElement = document.querySelector('.pull-to-refresh');
        if (pullElement) {
            const progress = Math.min(deltaY / 100, 1);
            pullElement.style.top = `${-60 + (deltaY * 0.6)}px`;
            pullElement.style.opacity = progress;
        }
    }

    triggerPullToRefresh() {
        const pullElement = document.querySelector('.pull-to-refresh');
        if (pullElement) {
            pullElement.classList.add('show');
            // Обновляем страницу
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    resetPullToRefresh() {
        const pullElement = document.querySelector('.pull-to-refresh');
        if (pullElement) {
            pullElement.classList.remove('show');
            pullElement.style.top = '-60px';
            pullElement.style.opacity = '0';
        }
    }

    // 9. Оптимизация производительности
    setupPerformanceOptimizations() {
        // Дебаунсинг для событий скролла
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(() => {
                this.handleScroll();
            }, 16);
        }, { passive: true });

        // Оптимизация для медленных соединений
        if (navigator.connection && navigator.connection.effectiveType) {
            const connectionType = navigator.connection.effectiveType;
            if (connectionType === 'slow-2g' || connectionType === '2g') {
                this.disableAnimations();
            }
        }

        // Отключение анимаций для пользователей с предпочтением reduced motion
        if (this.isReducedMotion) {
            this.disableAnimations();
        }
    }

    handleScroll() {
        // Обработка скролла для анимаций
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const rate = scrolled * -0.5;
            element.style.transform = `translateY(${rate}px)`;
        });
    }

    disableAnimations() {
        document.body.classList.add('reduced-motion');
        
        // Отключаем все анимации
        const style = document.createElement('style');
        style.textContent = `
            *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        `;
        document.head.appendChild(style);
    }

    // 10. Утилиты для анимаций
    animate(element, animation, duration = 1000) {
        if (this.isReducedMotion) return;

        return new Promise((resolve) => {
            element.style.animation = `${animation} ${duration}ms ease`;
            element.addEventListener('animationend', resolve, { once: true });
        });
    }

    fadeIn(element, duration = 600) {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
        });
    }

    fadeOut(element, duration = 600) {
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0';
        
        setTimeout(() => {
            element.style.display = 'none';
        }, duration);
    }

    slideIn(element, direction = 'up', duration = 600) {
        const transforms = {
            up: 'translateY(30px)',
            down: 'translateY(-30px)',
            left: 'translateX(30px)',
            right: 'translateX(-30px)'
        };

        element.style.opacity = '0';
        element.style.transform = transforms[direction];
        element.style.transition = `all ${duration}ms ease`;
        
        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translate(0, 0)';
        });
    }

    // 11. Очистка ресурсов
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        this.animations.clear();
    }
}

// Класс для мобильного пикера с колесом прокрутки
class MobilePickerWheel {
    constructor(select, container, updateCallback) {
        this.select = select;
        this.container = container;
        this.updateCallback = updateCallback;
        this.options = Array.from(select.options).filter(option => option.value);
        this.currentIndex = select.selectedIndex;
        this.isDragging = false;
        this.startY = 0;
        this.currentY = 0;
        this.velocity = 0;
        this.lastY = 0;
        this.lastTime = 0;
        this.animationId = null;
        
        this.init();
    }
    
    init() {
        this.createWheelItems();
        this.setupEventListeners();
        this.updateWheelPosition();
    }
    
    createWheelItems() {
        this.container.innerHTML = '';
        
        this.options.forEach((option, index) => {
            const item = document.createElement('div');
            item.className = 'mobile-picker-wheel-item';
            item.textContent = option.textContent;
            item.dataset.index = index;
            item.dataset.value = option.value;
            
            // Добавляем анимацию появления
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px) scale(0.8)';
            
            this.container.appendChild(item);
            
            // Анимация появления с задержкой
            setTimeout(() => {
                item.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
                item.style.opacity = '1';
                item.style.transform = 'translateY(0) scale(1)';
            }, index * 50);
        });
        
        this.items = this.container.querySelectorAll('.mobile-picker-wheel-item');
    }
    
    setupEventListeners() {
        this.container.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        });
        
        this.container.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        });
        
        this.container.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        });
        
        // Поддержка мыши для тестирования
        this.container.addEventListener('mousedown', (e) => {
            this.handleMouseStart(e);
        });
        
        this.container.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        this.container.addEventListener('mouseup', (e) => {
            this.handleMouseEnd(e);
        });
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        this.isDragging = true;
        this.startY = e.touches[0].clientY;
        this.currentY = this.startY;
        this.velocity = 0;
        this.lastY = this.startY;
        this.lastTime = Date.now();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    handleTouchMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        this.currentY = e.touches[0].clientY;
        const deltaY = this.currentY - this.startY;
        
        // Вычисляем скорость для инерции
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastTime;
        if (timeDiff > 0) {
            this.velocity = (this.currentY - this.lastY) / timeDiff;
        }
        this.lastY = this.currentY;
        this.lastTime = currentTime;
        
        this.updateWheelPosition(deltaY);
    }
    
    handleTouchEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.applyMomentum();
    }
    
    handleMouseStart(e) {
        e.preventDefault();
        this.isDragging = true;
        this.startY = e.clientY;
        this.currentY = this.startY;
        this.velocity = 0;
        this.lastY = this.startY;
        this.lastTime = Date.now();
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        this.currentY = e.clientY;
        const deltaY = this.currentY - this.startY;
        
        // Вычисляем скорость для инерции
        const currentTime = Date.now();
        const timeDiff = currentTime - this.lastTime;
        if (timeDiff > 0) {
            this.velocity = (this.currentY - this.lastY) / timeDiff;
        }
        this.lastY = this.currentY;
        this.lastTime = currentTime;
        
        this.updateWheelPosition(deltaY);
    }
    
    handleMouseEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        this.applyMomentum();
    }
    
    updateWheelPosition(deltaY = 0) {
        const itemHeight = 60; // Высота одного элемента
        const centerOffset = deltaY / itemHeight;
        const newIndex = Math.round(this.currentIndex - centerOffset);
        
        // Ограничиваем индекс
        const clampedIndex = Math.max(0, Math.min(newIndex, this.options.length - 1));
        
        this.items.forEach((item, index) => {
            const offset = index - clampedIndex;
            const distance = Math.abs(offset);
            
            item.classList.remove('selected', 'above', 'below');
            
            if (offset === 0) {
                item.classList.add('selected');
            } else if (offset < 0) {
                item.classList.add('above');
            } else {
                item.classList.add('below');
            }
            
            // Позиционируем элемент
            const translateY = offset * itemHeight;
            item.style.transform = `translateY(${translateY}px)`;
            item.style.opacity = Math.max(0.3, 1 - distance * 0.3);
        });
        
        this.currentIndex = clampedIndex;
    }
    
    applyMomentum() {
        if (Math.abs(this.velocity) > 0.1) {
            const momentum = this.velocity * 200;
            const targetIndex = Math.round(this.currentIndex - momentum / 60);
            const clampedIndex = Math.max(0, Math.min(targetIndex, this.options.length - 1));
            
            this.animateToIndex(clampedIndex);
        } else {
            this.snapToNearest();
        }
    }
    
    animateToIndex(targetIndex) {
        const startIndex = this.currentIndex;
        const startTime = Date.now();
        const duration = 300;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentIndex = startIndex + (targetIndex - startIndex) * easeOut;
            
            this.updateWheelPosition((currentIndex - this.currentIndex) * 60);
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.currentIndex = targetIndex;
                this.snapToNearest();
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    snapToNearest() {
        this.updateWheelPosition();
        this.select.selectedIndex = this.currentIndex;
        this.select.dispatchEvent(new Event('change', { bubbles: true }));
        this.updateCallback();
    }
    
    confirmSelection() {
        this.select.selectedIndex = this.currentIndex;
        this.select.dispatchEvent(new Event('change', { bubbles: true }));
        this.updateCallback();
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    window.animationManager = new AnimationManager();
});

// Экспорт для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationManager;
}
