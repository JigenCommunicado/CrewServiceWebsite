// Улучшения доступности для CrewLife

class AccessibilityManager {
    constructor() {
        this.isKeyboardNavigation = false;
        this.focusableElements = [];
        this.currentFocusIndex = 0;
        this.skipLinks = [];
        this.announcements = [];
        
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupSkipLinks();
        this.setupFocusManagement();
        this.setupAriaLabels();
        this.setupLiveRegions();
        this.setupFormValidation();
        this.setupModalAccessibility();
        this.setupTableAccessibility();
        this.setupColorContrast();
        this.setupScreenReaderSupport();
    }

    // Настройка навигации с клавиатуры
    setupKeyboardNavigation() {
        // Отслеживаем использование клавиатуры
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.isKeyboardNavigation = true;
                document.body.classList.add('keyboard-navigation');
            }
        });

        // Отслеживаем использование мыши
        document.addEventListener('mousedown', () => {
            this.isKeyboardNavigation = false;
            document.body.classList.remove('keyboard-navigation');
        });

        // Обработка Escape для закрытия модальных окон
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
        });

        // Обработка Enter и Space для кнопок
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                const target = e.target;
                if (target.tagName === 'BUTTON' || target.classList.contains('btn')) {
                    e.preventDefault();
                    target.click();
                }
            }
        });
    }

    // Обработка клавиши Escape
    handleEscapeKey() {
        // Закрываем модальные окна
        const modals = document.querySelectorAll('.modal:not([style*="display: none"])');
        modals.forEach(modal => {
            const closeBtn = modal.querySelector('.modal-close, [data-dismiss="modal"]');
            if (closeBtn) {
                closeBtn.click();
            }
        });

        // Закрываем выпадающие меню
        const dropdowns = document.querySelectorAll('.dropdown.open, .menu.open');
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('open');
        });

        // Закрываем мобильное меню
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu && !mobileMenu.style.display.includes('none')) {
            const closeBtn = document.getElementById('mobileMenuClose');
            if (closeBtn) {
                closeBtn.click();
            }
        }
    }

    // Настройка skip links
    setupSkipLinks() {
        // Создаем skip links если их нет
        this.createSkipLinks();
        
        // Обработка skip links
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('skip-link')) {
                e.preventDefault();
                const targetId = e.target.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // Создание skip links
    createSkipLinks() {
        const skipLinksContainer = document.createElement('div');
        skipLinksContainer.className = 'skip-links';
        skipLinksContainer.innerHTML = `
            <a href="#main-content" class="skip-link">Перейти к основному содержимому</a>
            <a href="#navigation" class="skip-link">Перейти к навигации</a>
            <a href="#footer" class="skip-link">Перейти к подвалу</a>
        `;
        
        document.body.insertBefore(skipLinksContainer, document.body.firstChild);
    }

    // Настройка управления фокусом
    setupFocusManagement() {
        // Ловушка фокуса для модальных окон
        this.setupFocusTrap();
        
        // Возврат фокуса при закрытии модальных окон
        this.setupFocusReturn();
        
        // Визуальные индикаторы фокуса
        this.setupFocusIndicators();
    }

    // Настройка ловушки фокуса
    setupFocusTrap() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const modal = document.querySelector('.modal:not([style*="display: none"])');
                if (modal) {
                    this.trapFocus(modal, e);
                }
            }
        });
    }

    // Ловушка фокуса в элементе
    trapFocus(element, event) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (event.shiftKey) {
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    }

    // Возврат фокуса при закрытии модальных окон
    setupFocusReturn() {
        let lastFocusedElement = null;
        
        // Сохраняем последний сфокусированный элемент
        document.addEventListener('focusin', (e) => {
            if (!e.target.closest('.modal')) {
                lastFocusedElement = e.target;
            }
        });
        
        // Возвращаем фокус при закрытии модального окна
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.classList.contains('modal') && e.target === e.currentTarget) {
                if (lastFocusedElement) {
                    setTimeout(() => {
                        lastFocusedElement.focus();
                    }, 100);
                }
            }
        });
    }

    // Настройка визуальных индикаторов фокуса
    setupFocusIndicators() {
        const style = document.createElement('style');
        style.textContent = `
            .keyboard-navigation *:focus {
                outline: 2px solid var(--accent-color, #FF4D4D) !important;
                outline-offset: 2px !important;
            }
            
            .keyboard-navigation button:focus,
            .keyboard-navigation .btn:focus {
                box-shadow: 0 0 0 3px rgba(255, 77, 77, 0.2) !important;
            }
        `;
        document.head.appendChild(style);
    }

    // Настройка ARIA меток
    setupAriaLabels() {
        // Добавляем ARIA метки к кнопкам без текста
        const iconButtons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        iconButtons.forEach(button => {
            const icon = button.querySelector('svg, .icon');
            if (icon && !button.textContent.trim()) {
                const label = this.generateAriaLabel(button);
                button.setAttribute('aria-label', label);
            }
        });

        // Добавляем ARIA метки к формам
        const forms = document.querySelectorAll('form:not([aria-label]):not([aria-labelledby])');
        forms.forEach(form => {
            const legend = form.querySelector('legend');
            if (legend) {
                form.setAttribute('aria-labelledby', legend.id || this.generateId(legend));
            }
        });

        // Добавляем ARIA метки к навигации
        const navs = document.querySelectorAll('nav:not([aria-label])');
        navs.forEach((nav, index) => {
            nav.setAttribute('aria-label', `Навигация ${index + 1}`);
        });
    }

    // Генерация ARIA метки
    generateAriaLabel(element) {
        const context = this.getElementContext(element);
        const action = this.getElementAction(element);
        return `${action} ${context}`.trim();
    }

    // Получение контекста элемента
    getElementContext(element) {
        const parent = element.closest('[role], section, article, header, footer, main, nav');
        if (parent) {
            const label = parent.getAttribute('aria-label') || 
                         parent.querySelector('h1, h2, h3, h4, h5, h6')?.textContent ||
                         parent.className;
            return label;
        }
        return 'элемент';
    }

    // Получение действия элемента
    getElementAction(element) {
        if (element.classList.contains('close') || element.textContent.includes('×')) {
            return 'Закрыть';
        }
        if (element.classList.contains('menu') || element.classList.contains('hamburger')) {
            return 'Открыть меню';
        }
        if (element.type === 'submit') {
            return 'Отправить';
        }
        if (element.type === 'button') {
            return 'Нажать';
        }
        return 'Активировать';
    }

    // Генерация ID
    generateId(element) {
        const text = element.textContent.trim().toLowerCase().replace(/\s+/g, '-');
        const id = `id-${text}-${Date.now()}`;
        element.id = id;
        return id;
    }

    // Настройка live regions
    setupLiveRegions() {
        // Создаем live region для объявлений
        const liveRegion = document.createElement('div');
        liveRegion.id = 'live-region';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        document.body.appendChild(liveRegion);
    }

    // Объявление для screen readers
    announce(message, priority = 'polite') {
        const liveRegion = document.getElementById('live-region');
        if (liveRegion) {
            liveRegion.setAttribute('aria-live', priority);
            liveRegion.textContent = message;
            
            // Очищаем через 3 секунды
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 3000);
        }
    }

    // Настройка валидации форм
    setupFormValidation() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                if (!this.validateForm(form)) {
                    e.preventDefault();
                }
            });

            // Валидация в реальном времени
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateField(input);
                });
            });
        });
    }

    // Валидация формы
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    // Валидация поля
    validateField(field) {
        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');
        const type = field.type;
        
        let isValid = true;
        let message = '';
        
        if (isRequired && !value) {
            isValid = false;
            message = 'Это поле обязательно для заполнения';
        } else if (value) {
            switch (type) {
                case 'email':
                    if (!this.isValidEmail(value)) {
                        isValid = false;
                        message = 'Введите корректный email адрес';
                    }
                    break;
                case 'tel':
                    if (!this.isValidPhone(value)) {
                        isValid = false;
                        message = 'Введите корректный номер телефона';
                    }
                    break;
                case 'password':
                    if (value.length < 6) {
                        isValid = false;
                        message = 'Пароль должен содержать минимум 6 символов';
                    }
                    break;
            }
        }
        
        this.showFieldValidation(field, isValid, message);
        return isValid;
    }

    // Проверка email
    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    // Проверка телефона
    isValidPhone(phone) {
        const regex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return regex.test(phone);
    }

    // Показ валидации поля
    showFieldValidation(field, isValid, message) {
        // Удаляем предыдущие сообщения
        const existingMessage = field.parentNode.querySelector('.field-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Обновляем ARIA атрибуты
        field.setAttribute('aria-invalid', !isValid);
        field.setAttribute('aria-describedby', isValid ? '' : `error-${field.id || field.name}`);
        
        if (!isValid) {
            // Добавляем класс ошибки
            field.classList.add('error');
            
            // Создаем сообщение об ошибке
            const errorMessage = document.createElement('div');
            errorMessage.className = 'field-message error-message';
            errorMessage.id = `error-${field.id || field.name}`;
            errorMessage.textContent = message;
            field.parentNode.appendChild(errorMessage);
            
            // Объявляем ошибку
            this.announce(`Ошибка: ${message}`);
        } else {
            // Убираем класс ошибки
            field.classList.remove('error');
        }
    }

    // Настройка доступности модальных окон
    setupModalAccessibility() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-trigger')) {
                const modalId = e.target.getAttribute('data-modal');
                const modal = document.getElementById(modalId);
                if (modal) {
                    this.openModal(modal);
                }
            }
        });
    }

    // Открытие модального окна
    openModal(modal) {
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        
        // Фокус на первый фокусируемый элемент
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Блокируем прокрутку фона
        document.body.style.overflow = 'hidden';
    }

    // Закрытие модального окна
    closeModal(modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        
        // Разблокируем прокрутку фона
        document.body.style.overflow = '';
    }

    // Настройка доступности таблиц
    setupTableAccessibility() {
        const tables = document.querySelectorAll('table');
        tables.forEach(table => {
            // Добавляем caption если его нет
            if (!table.querySelector('caption')) {
                const caption = document.createElement('caption');
                caption.textContent = 'Таблица данных';
                table.insertBefore(caption, table.firstChild);
            }
            
            // Добавляем scope к заголовкам
            const headers = table.querySelectorAll('th');
            headers.forEach(header => {
                if (!header.getAttribute('scope')) {
                    header.setAttribute('scope', 'col');
                }
            });
        });
    }

    // Настройка контрастности цветов
    setupColorContrast() {
        // Проверяем контрастность при загрузке
        this.checkColorContrast();
        
        // Проверяем при изменении темы
        document.addEventListener('themechange', () => {
            setTimeout(() => this.checkColorContrast(), 100);
        });
    }

    // Проверка контрастности
    checkColorContrast() {
        const elements = document.querySelectorAll('button, .btn, .request-btn, .header-btn');
        elements.forEach(element => {
            const contrast = this.getContrastRatio(element);
            if (contrast < 4.5) {
                console.warn('Низкий контраст:', element, contrast);
            }
        });
    }

    // Получение коэффициента контрастности
    getContrastRatio(element) {
        const styles = window.getComputedStyle(element);
        const bgColor = this.parseColor(styles.backgroundColor);
        const textColor = this.parseColor(styles.color);
        
        const bgLuminance = this.getLuminance(bgColor);
        const textLuminance = this.getLuminance(textColor);
        
        const lighter = Math.max(bgLuminance, textLuminance);
        const darker = Math.min(bgLuminance, textLuminance);
        
        return (lighter + 0.05) / (darker + 0.05);
    }

    // Парсинг цвета
    parseColor(color) {
        const rgb = color.match(/\d+/g);
        return rgb ? {
            r: parseInt(rgb[0]),
            g: parseInt(rgb[1]),
            b: parseInt(rgb[2])
        } : { r: 0, g: 0, b: 0 };
    }

    // Получение яркости цвета
    getLuminance(color) {
        const { r, g, b } = color;
        const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    }

    // Настройка поддержки screen readers
    setupScreenReaderSupport() {
        // Добавляем ARIA landmarks
        this.addAriaLandmarks();
        
        // Настраиваем заголовки
        this.setupHeadings();
        
        // Настраиваем списки
        this.setupLists();
    }

    // Добавление ARIA landmarks
    addAriaLandmarks() {
        const main = document.querySelector('main');
        if (main && !main.getAttribute('role')) {
            main.setAttribute('role', 'main');
        }
        
        const nav = document.querySelector('nav');
        if (nav && !nav.getAttribute('role')) {
            nav.setAttribute('role', 'navigation');
        }
        
        const header = document.querySelector('header');
        if (header && !header.getAttribute('role')) {
            header.setAttribute('role', 'banner');
        }
        
        const footer = document.querySelector('footer');
        if (footer && !footer.getAttribute('role')) {
            footer.setAttribute('role', 'contentinfo');
        }
    }

    // Настройка заголовков
    setupHeadings() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            if (!heading.id) {
                heading.id = this.generateId(heading);
            }
        });
    }

    // Настройка списков
    setupLists() {
        const lists = document.querySelectorAll('ul, ol');
        lists.forEach(list => {
            if (!list.getAttribute('role')) {
                list.setAttribute('role', list.tagName === 'UL' ? 'list' : 'list');
            }
        });
    }

    // Получение информации о доступности
    getAccessibilityInfo() {
        return {
            isKeyboardNavigation: this.isKeyboardNavigation,
            focusableElements: document.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])').length,
            skipLinks: document.querySelectorAll('.skip-link').length,
            ariaLabels: document.querySelectorAll('[aria-label]').length,
            liveRegions: document.querySelectorAll('[aria-live]').length
        };
    }
}

// Инициализация менеджера доступности
document.addEventListener('DOMContentLoaded', () => {
    window.accessibilityManager = new AccessibilityManager();
    
    // Добавляем информацию о доступности в консоль для отладки
    console.log('Accessibility Manager инициализирован');
    console.log('Информация о доступности:', window.accessibilityManager.getAccessibilityInfo());
});

// Экспорт для использования в модулях
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AccessibilityManager;
}
