// JavaScript для страницы бронирования гостиницы
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const form = document.getElementById('hotelForm');
    const profileBtn = document.getElementById('profileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const checkInDate = document.getElementById('checkInDate');
    const checkOutDate = document.getElementById('checkOutDate');
    const flightDate = document.getElementById('flightDate');
    const fullName = document.getElementById('fullName');
    const employeeId = document.getElementById('employeeId');
    
    // Календарь
    let currentCalendar = null;
    let selectedDate = null;
    let currentDate = new Date();

    // Инициализация
    init();

    function init() {
        // Настраиваем обработчики событий
        setupEventListeners();
        
        // Загружаем данные пользователя (если есть)
        loadUserData();
        
        // Устанавливаем минимальную дату (завтра)
        setMinDate();
        
        // Инициализируем календарь
        initCalendar();
    }

    // Проверка авторизации
    function checkAuth() {
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (!authToken || !userData) {
            return false;
        }
        
        try {
            const user = JSON.parse(userData);
            return user && user.id;
        } catch (error) {
            console.error('Ошибка парсинга данных пользователя:', error);
            return false;
        }
    }


    // Загрузка данных пользователя
    function loadUserData() {
        try {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                fullName.value = user.fullName || '';
                employeeId.value = user.employeeId || user.id || '';
            }
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
        }
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Обработчики для формы
        
        // Форма
        form.addEventListener('submit', handleFormSubmit);
        
        // Валидация дат
        checkInDate.addEventListener('change', validateDates);
        checkOutDate.addEventListener('change', validateDates);
        
        // Валидация полей
        setupFieldValidation();
    }

    // Установка минимальной даты
    function setMinDate() {
        // Для текстовых полей минимальная дата не устанавливается через атрибут min
        // Валидация будет происходить в функции validateField
    }

    // Валидация дат
    function validateDates() {
        const checkIn = parseDate(checkInDate.value);
        const checkOut = parseDate(checkOutDate.value);
        
        if (checkIn && checkOut) {
            if (checkOut <= checkIn) {
                showFieldError(checkOutDate, 'Дата выезда должна быть позже даты заезда');
                return false;
            }
        }
        
        clearFieldError({ target: checkOutDate });
        return true;
    }

    // Настройка валидации полей
    function setupFieldValidation() {
        const requiredFields = form.querySelectorAll('[required]');
        
        requiredFields.forEach(field => {
            field.addEventListener('blur', validateField);
            field.addEventListener('input', clearFieldError);
        });
    }

    // Валидация поля
    function validateField(event) {
        const field = event.target;
        const value = field.value.trim();
        
        if (field.hasAttribute('required') && !value) {
            showFieldError(field, 'Это поле обязательно для заполнения');
            return false;
        }
        
        // Специальная валидация для дат
        if (field.classList.contains('date-input') && value) {
            const date = parseDate(value);
            if (!date) {
                showFieldError(field, 'Введите дату в формате ДД.ММ.ГГГГ');
                return false;
            }
            
            // Проверяем, что дата не в прошлом (для даты заезда)
            if (field.id === 'checkInDate') {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                if (date < today) {
                    showFieldError(field, 'Дата заезда не может быть в прошлом');
                    return false;
                }
            }
        }
        
        // Специальная валидация для email
        if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                showFieldError(field, 'Введите корректный email адрес');
                return false;
            }
        }
        
        // Специальная валидация для телефона
        if (field.type === 'tel' && value) {
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(value)) {
                showFieldError(field, 'Введите корректный номер телефона');
                return false;
            }
        }
        
        clearFieldError(event);
        return true;
    }

    // Показать ошибку поля
    function showFieldError(field, message) {
        clearFieldError({ target: field });
        
        field.classList.add('error');
        field.style.borderColor = '#FF4D4D';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#FF4D4D';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
    }

    // Очистить ошибку поля
    function clearFieldError(event) {
        const field = event.target;
        field.classList.remove('error');
        field.style.borderColor = '';
        
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }


    // Обработка отправки формы
    function handleFormSubmit(event) {
        event.preventDefault();
        
        // Валидация формы
        if (!validateForm()) {
            return;
        }
        
        // Показываем индикатор загрузки
        showLoading();
        
        // Собираем данные формы
        const formData = collectFormData();
        
        // Симулируем отправку заявки
        setTimeout(() => {
            hideLoading();
            showSuccessMessage();
            form.reset();
        }, 2000);
    }

    // Валидация формы
    function validateForm() {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!validateField({ target: field })) {
                isValid = false;
            }
        });
        
        // Дополнительная валидация дат
        if (!validateDates()) {
            isValid = false;
        }
        
        return isValid;
    }

    // Сбор данных формы
    function collectFormData() {
        const formData = new FormData(form);
        const data = {};
        
        // Обычные поля
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    // Показать сообщение об успехе
    function showSuccessMessage() {
        alert('Заявка на бронирование гостиницы успешно отправлена!');
        
        // Перенаправляем на дашборд через 2 секунды
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }

    // Показать индикатор загрузки
    function showLoading() {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="animate-spin">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"/>
            </svg>
            Отправка...
        `;
    }

    // Скрыть индикатор загрузки
    function hideLoading() {
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 19L5 12L12 5M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Отправить заявку
        `;
    }

    // Показать уведомление
    function showNotification(message, type = 'info') {
        alert(message);
    }

    // Выход из системы
    function logout() {
        if (confirm('Вы уверены, что хотите выйти из системы?')) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.href = '../index.html';
        }
    }

    // Инициализация календаря
    function initCalendar() {
        // Обработчики для кнопок календаря
        document.getElementById('checkInDateBtn').addEventListener('click', function() {
            showCalendar('checkInDate');
        });
        
        document.getElementById('checkOutDateBtn').addEventListener('click', function() {
            showCalendar('checkOutDate');
        });
        
        document.getElementById('flightDateBtn').addEventListener('click', function() {
            showCalendar('flightDate');
        });
    }

    // Показать календарь
    function showCalendar(targetInputId) {
        // Закрываем предыдущий календарь
        hideCalendar();
        
        currentCalendar = targetInputId;
        const targetInput = document.getElementById(targetInputId);
        
        // Создаем календарь
        const calendar = createCalendar();
        targetInput.parentNode.appendChild(calendar);
        
        // Показываем календарь
        calendar.style.display = 'block';
        
        // Обработчик клика вне календаря
        setTimeout(() => {
            document.addEventListener('click', handleOutsideClick);
        }, 100);
    }

    // Создать календарь
    function createCalendar() {
        const calendar = document.createElement('div');
        calendar.className = 'custom-calendar';
        calendar.id = 'customCalendar';
        
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        
        const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
        
        calendar.innerHTML = `
            <div class="calendar-header">
                <button type="button" class="calendar-nav-btn" id="prevMonth">‹</button>
                <div class="calendar-title">${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}</div>
                <button type="button" class="calendar-nav-btn" id="nextMonth">›</button>
            </div>
            <div class="calendar-grid">
                ${dayNames.map(day => `<div class="calendar-day-header">${day}</div>`).join('')}
                ${generateCalendarDays()}
            </div>
            <div class="calendar-footer">
                <button type="button" class="calendar-action-btn" id="clearDate">Очистить</button>
                <button type="button" class="calendar-action-btn" id="todayDate">Сегодня</button>
            </div>
        `;
        
        // Обработчики навигации
        calendar.querySelector('#prevMonth').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar(calendar);
        });
        
        calendar.querySelector('#nextMonth').addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar(calendar);
        });
        
        // Обработчики кнопок
        calendar.querySelector('#clearDate').addEventListener('click', () => {
            clearSelectedDate();
        });
        
        calendar.querySelector('#todayDate').addEventListener('click', () => {
            selectToday();
        });
        
        // Добавляем обработчики для дней календаря сразу при создании
        addDayClickHandlers(calendar);
        
        return calendar;
    }

    // Генерация дней календаря
    function generateCalendarDays() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));
        
        const days = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const isCurrentMonth = date.getMonth() === month;
            const isPast = date < today;
            const isSelected = selectedDate && date.getTime() === selectedDate.getTime();
            const isToday = date.getTime() === today.getTime();
            
            let classes = 'calendar-day';
            if (!isCurrentMonth) classes += ' other-month';
            if (isPast) classes += ' disabled';
            if (isSelected) classes += ' selected';
            if (isToday) classes += ' today';
            
            days.push(`<button type="button" class="${classes}" data-date="${date.toISOString().split('T')[0]}">${date.getDate()}</button>`);
        }
        
        return days.join('');
    }

    // Отрисовка календаря
    function renderCalendar(calendar) {
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        
        calendar.querySelector('.calendar-title').textContent = 
            `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
        
        const grid = calendar.querySelector('.calendar-grid');
        const dayHeaders = grid.querySelectorAll('.calendar-day-header');
        const dayButtons = grid.querySelectorAll('.calendar-day');
        
        dayButtons.forEach(btn => btn.remove());
        
        const newDays = generateCalendarDays();
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newDays;
        
        while (tempDiv.firstChild) {
            grid.appendChild(tempDiv.firstChild);
        }
        
        // Добавляем обработчики клика
        addDayClickHandlers(calendar);
    }

    // Добавление обработчиков клика для дней календаря
    function addDayClickHandlers(calendar) {
        const grid = calendar.querySelector('.calendar-grid');
        grid.querySelectorAll('.calendar-day').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!this.classList.contains('disabled')) {
                    selectDate(new Date(this.dataset.date));
                }
            });
        });
    }

    // Выбор даты
    function selectDate(date) {
        selectedDate = date;
        const targetInput = document.getElementById(currentCalendar);
        targetInput.value = formatDate(date);
        hideCalendar();
    }

    // Очистить выбранную дату
    function clearSelectedDate() {
        selectedDate = null;
        const targetInput = document.getElementById(currentCalendar);
        targetInput.value = '';
        hideCalendar();
    }

    // Выбрать сегодня
    function selectToday() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        selectDate(today);
    }

    // Форматирование даты для input[type="date"]
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Парсинг даты из формата DD.MM.YYYY
    function parseDate(dateString) {
        if (!dateString) return null;
        
        const parts = dateString.split('.');
        if (parts.length !== 3) return null;
        
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // месяцы в JS начинаются с 0
        const year = parseInt(parts[2], 10);
        
        if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
        
        const date = new Date(year, month, day);
        
        // Проверяем, что дата валидна
        if (date.getDate() !== day || date.getMonth() !== month || date.getFullYear() !== year) {
            return null;
        }
        
        return date;
    }

    // Скрыть календарь
    function hideCalendar() {
        const calendar = document.getElementById('customCalendar');
        if (calendar) {
            calendar.remove();
        }
        document.removeEventListener('click', handleOutsideClick);
    }

    // Обработчик клика вне календаря
    function handleOutsideClick(event) {
        const calendar = document.getElementById('customCalendar');
        if (calendar && !calendar.contains(event.target) && !event.target.closest('.date-picker-btn')) {
            hideCalendar();
        }
    }

    // Форматирование даты
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${day}.${month}.${year}`;
    }
});

// CSS для анимации загрузки
const style = document.createElement('style');
style.textContent = `
    .animate-spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .field-error {
        color: #FF4D4D;
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }
    
    .form-input.error,
    .form-select.error,
    .form-textarea.error {
        border-color: #FF4D4D;
    }
`;
document.head.appendChild(style);
