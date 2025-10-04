// Оптимизация производительности для CrewLife
class PerformanceOptimizer {
    constructor() {
        this.imageObserver = null;
        this.lazyImages = [];
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.optimizeAnimations();
        this.setupPreloading();
        this.optimizeScrollEvents();
    }

    // Ленивая загрузка изображений
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.classList.remove('lazy');
                            this.imageObserver.unobserve(img);
                        }
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            // Находим все изображения с data-src
            this.lazyImages = document.querySelectorAll('img[data-src]');
            this.lazyImages.forEach(img => {
                img.classList.add('lazy');
                this.imageObserver.observe(img);
            });
        }
    }

    // Оптимизация анимаций
    optimizeAnimations() {
        // Отключаем анимации для пользователей с предпочтением reduced motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--animation-duration', '0.01ms');
            document.documentElement.style.setProperty('--animation-iteration-count', '1');
        }

        // Оптимизируем анимации при низкой частоте кадров
        let lastTime = 0;
        const fps = 60;
        const frameInterval = 1000 / fps;

        const optimizedAnimation = (callback) => {
            return (currentTime) => {
                if (currentTime - lastTime >= frameInterval) {
                    callback(currentTime);
                    lastTime = currentTime;
                }
                requestAnimationFrame(optimizedAnimation(callback));
            };
        };

        // Применяем оптимизацию к существующим анимациям
        window.optimizedAnimation = optimizedAnimation;
    }

    // Предзагрузка критических ресурсов
    setupPreloading() {
        // Предзагружаем шрифты
        const fontPreloads = [
            'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap'
        ];

        fontPreloads.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = font;
            document.head.appendChild(link);
        });

        // Предзагружаем критические страницы
        const criticalPages = ['login.html', 'register.html'];
        criticalPages.forEach(page => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
        });
    }

    // Оптимизация событий прокрутки
    optimizeScrollEvents() {
        let ticking = false;

        const optimizedScrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    // Здесь выполняются все операции, связанные с прокруткой
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', optimizedScrollHandler, { passive: true });
    }

    handleScroll() {
        // Обработка прокрутки с оптимизацией
        const scrollY = window.pageYOffset;
        
        // Обновляем кнопку "Наверх"
        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (scrollToTopBtn) {
            if (scrollY > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        }

        // Параллакс эффект для hero секции
        const heroContent = document.querySelector('.hero-content');
        if (heroContent) {
            const rate = scrollY * -0.5;
            heroContent.style.transform = `translateY(${rate}px)`;
        }
    }

    // Оптимизация изображений
    optimizeImages() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            // Добавляем loading="lazy" для браузеров, которые это поддерживают
            if ('loading' in HTMLImageElement.prototype) {
                img.loading = 'lazy';
            }

            // Оптимизируем размеры изображений
            if (img.naturalWidth && img.naturalHeight) {
                const containerWidth = img.parentElement.offsetWidth;
                if (img.naturalWidth > containerWidth * 2) {
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                }
            }
        });
    }

    // Оптимизация CSS
    optimizeCSS() {
        // Удаляем неиспользуемые CSS правила
        const usedClasses = new Set();
        const allElements = document.querySelectorAll('*');
        
        allElements.forEach(el => {
            el.classList.forEach(cls => usedClasses.add(cls));
        });

        // Можно добавить логику для удаления неиспользуемых стилей
        console.log('Используемые CSS классы:', usedClasses.size);
    }

    // Оптимизация JavaScript
    optimizeJavaScript() {
        // Дебаунс для поиска
        const searchInputs = document.querySelectorAll('input[type="search"]');
        searchInputs.forEach(input => {
            let timeout;
            input.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    // Логика поиска
                }, 300);
            });
        });

        // Мемоизация для тяжелых вычислений
        const memoize = (fn) => {
            const cache = new Map();
            return (...args) => {
                const key = JSON.stringify(args);
                if (cache.has(key)) {
                    return cache.get(key);
                }
                const result = fn(...args);
                cache.set(key, result);
                return result;
            };
        };

        // Применяем мемоизацию к функциям
        window.memoize = memoize;
    }

    // Мониторинг производительности
    setupPerformanceMonitoring() {
        // Измеряем время загрузки страницы
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            console.log(`Время загрузки страницы: ${loadTime.toFixed(2)}ms`);

            // Отправляем метрики (в реальном приложении)
            if (window.CrewLife && window.CrewLife.storage) {
                window.CrewLife.storage.set('pageLoadTime', loadTime);
            }
        });

        // Мониторим Core Web Vitals
        if ('web-vital' in window) {
            // LCP (Largest Contentful Paint)
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
            }).observe({ entryTypes: ['largest-contentful-paint'] });

            // FID (First Input Delay)
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            }).observe({ entryTypes: ['first-input'] });

            // CLS (Cumulative Layout Shift)
            let clsValue = 0;
            new PerformanceObserver((entryList) => {
                const entries = entryList.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                console.log('CLS:', clsValue);
            }).observe({ entryTypes: ['layout-shift'] });
        }
    }

    // Оптимизация для мобильных устройств
    optimizeForMobile() {
        // Отключаем hover эффекты на сенсорных устройствах
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }

        // Оптимизируем для медленных соединений
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                document.body.classList.add('slow-connection');
                // Отключаем анимации для медленных соединений
                document.documentElement.style.setProperty('--animation-duration', '0.01ms');
            }
        }
    }

    // Очистка ресурсов
    cleanup() {
        if (this.imageObserver) {
            this.imageObserver.disconnect();
        }
        
        // Очищаем таймеры
        const timers = window.performanceTimers || [];
        timers.forEach(timer => clearTimeout(timer));
    }
}

// Инициализация оптимизатора производительности
document.addEventListener('DOMContentLoaded', () => {
    window.performanceOptimizer = new PerformanceOptimizer();
});

// Очистка при выгрузке страницы
window.addEventListener('beforeunload', () => {
    if (window.performanceOptimizer) {
        window.performanceOptimizer.cleanup();
    }
});

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceOptimizer;
}

