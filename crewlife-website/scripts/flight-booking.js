// JavaScript для страницы заказа рейса

// Переменные
let currentStep = 1;
const totalSteps = 3;
let currentDate = new Date();
let selectedDate = null;
let calendarVisible = false;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    checkAuthStatus();
    
    // Инициализируем календарь
    initCalendar();
    
    // Загружаем данные пользователя
    loadUserData();
    
    // Настраиваем обработчики событий
    setupEventListeners();
    
    // Инициализируем обработку формы
    handleFlightOrderSubmit();
    
    // Инициализируем кнопку "Наверх"
    initScrollToTop();
});

// Проверка статуса авторизации
function checkAuthStatus() {
    const userData = localStorage.getItem('userData');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const mobileDashboardLink = document.getElementById('mobileDashboardLink');
    const mobileProfileLink = document.getElementById('mobileProfileLink');
    const mobileLoginLink = document.getElementById('mobileLoginLink');
    const mobileRegisterLink = document.getElementById('mobileRegisterLink');
    
    if (userData) {
        // Пользователь авторизован
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
        if (dashboardBtn) dashboardBtn.style.display = 'inline-block';
        if (mobileDashboardLink) mobileDashboardLink.style.display = 'block';
        if (mobileProfileLink) mobileProfileLink.style.display = 'block';
        if (mobileLoginLink) mobileLoginLink.style.display = 'none';
        if (mobileRegisterLink) mobileRegisterLink.style.display = 'none';
    } else {
        // Пользователь не авторизован
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (registerBtn) registerBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (dashboardBtn) dashboardBtn.style.display = 'none';
        if (mobileDashboardLink) mobileDashboardLink.style.display = 'none';
        if (mobileProfileLink) mobileProfileLink.style.display = 'none';
        if (mobileLoginLink) mobileLoginLink.style.display = 'block';
        if (mobileRegisterLink) mobileRegisterLink.style.display = 'block';
    }
}

// Загрузка данных пользователя
function loadUserData() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            const fullNameInput = document.getElementById('fullName');
            const employeeIdInput = document.getElementById('employeeId');
            
            if (fullNameInput) fullNameInput.value = user.fullName || '';
            if (employeeIdInput) employeeIdInput.value = user.employeeId || '';
        } catch (e) {
            console.log('Ошибка загрузки данных пользователя:', e);
        }
    }
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Кнопки навигации
    const nextStepBtn = document.getElementById('nextStep');
    const prevStepBtn = document.getElementById('prevStep');
    const submitFlightBtn = document.getElementById('submitFlight');
    const editFlightBtn = document.getElementById('editFlight');
    
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', nextStep);
    }
    
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', prevStep);
    }
    
    if (submitFlightBtn) {
        submitFlightBtn.addEventListener('click', submitFlightBooking);
    }
    
    if (editFlightBtn) {
        editFlightBtn.addEventListener('click', editFlightData);
    }
    
    // Кнопки авторизации
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
    
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            window.location.href = 'register.html';
        });
    }
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', () => {
            window.location.href = 'dashboard.html';
        });
    }
    
    // Мобильное меню
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.style.display = 'block';
            setTimeout(() => {
                mobileMenu.classList.add('show');
            }, 10);
        });
    }
    
    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('show');
            setTimeout(() => {
                mobileMenu.style.display = 'none';
            }, 300);
        });
    }
}

// Навигация по шагам
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            // Скрываем текущий шаг
            document.querySelector('.form-step.active').classList.remove('active');
            
            // Показываем следующий шаг
            currentStep++;
            document.getElementById(`step${currentStep}`).classList.add('active');
            
            // Если это шаг подтверждения, заполняем данные
            if (currentStep === 3) {
                fillConfirmationData();
            }
            
            updateStepButtons();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        // Скрываем текущий шаг
        document.querySelector('.form-step.active').classList.remove('active');
        
        // Показываем предыдущий шаг
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
        
        updateStepButtons();
    }
}

function updateStepButtons() {
    const prevBtn = document.getElementById('prevStep');
    const nextBtn = document.getElementById('nextStep');
    const submitBtn = document.getElementById('submitFlight');
    const editBtn = document.getElementById('editFlight');
    
    // Скрываем все кнопки
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = 'none';
    if (editBtn) editBtn.style.display = 'none';
    
    if (currentStep === 1) {
        if (nextBtn) nextBtn.style.display = 'flex';
    } else if (currentStep === 2) {
        if (prevBtn) prevBtn.style.display = 'flex';
        if (nextBtn) nextBtn.style.display = 'flex';
    } else if (currentStep === 3) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'flex';
        if (editBtn) editBtn.style.display = 'flex';
    }
}

// Валидация текущего шага
function validateCurrentStep() {
    const currentStepElement = document.querySelector('.form-step.active');
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    
    for (let field of requiredFields) {
        if (!field.value.trim()) {
            field.style.borderColor = '#FF4D4D';
            field.focus();
            
            // Показываем уведомление
            if (window.CrewLife && window.CrewLife.showNotification) {
                window.CrewLife.showNotification('Пожалуйста, заполните все обязательные поля', 'error');
            } else {
                alert('Пожалуйста, заполните все обязательные поля');
            }
            
            return false;
        } else {
            field.style.borderColor = '#E0E0E0';
        }
    }
    
    return true;
}

// Заполнение данных подтверждения
function fillConfirmationData() {
    const formData = new FormData(document.getElementById('flightBookingForm'));
    
    const summaryElements = {
        'summaryLocation': formData.get('location') || '',
        'summaryDivision': formData.get('division') || '',
        'summaryPosition': formData.get('position') || '',
        'summaryFullName': formData.get('fullName') || '',
        'summaryEmployeeId': formData.get('employeeId') || '',
        'summaryDirection': formData.get('direction') || '',
        'summaryWishes': formData.get('wishes') || 'отсутствуют'
    };
    
    // Обновляем элементы
    for (const [id, value] of Object.entries(summaryElements)) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    // Форматируем дату
    const departureDate = formData.get('departureDate');
    const summaryDepartureDate = document.getElementById('summaryDepartureDate');
    if (departureDate && summaryDepartureDate) {
        const date = new Date(departureDate.split('.').reverse().join('-'));
        summaryDepartureDate.textContent = date.toLocaleDateString('ru-RU');
    }
}

// Отправка заявки
function submitFlightBooking() {
    const formData = new FormData(document.getElementById('flightBookingForm'));
    
    // Собираем данные заявки
    const flightData = {
        location: formData.get('location'),
        division: formData.get('division'),
        position: formData.get('position'),
        fullName: formData.get('fullName'),
        employeeId: formData.get('employeeId'),
        direction: formData.get('direction'),
        departureDate: formData.get('departureDate'),
        wishes: formData.get('wishes') || 'отсутствуют',
        type: 'flight',
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    // Показываем индикатор загрузки
    showLoading();
    
    // Симулируем отправку заявки
    setTimeout(() => {
        // Сохраняем в localStorage (в реальном приложении здесь будет API вызов)
        let applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.push(flightData);
        localStorage.setItem('applications', JSON.stringify(applications));
        
        hideLoading();
        
        // Показываем уведомление об успехе
        if (window.CrewLife && window.CrewLife.showNotification) {
            window.CrewLife.showNotification('Заявка успешно отправлена!', 'success');
        }
        
        // Переходим в панель управления
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    }, 1500);
}

// Редактирование данных
function editFlightData() {
    // Возвращаемся к первому шагу для редактирования
    currentStep = 1;
    document.querySelector('.form-step.active').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    updateStepButtons();
}

// Выход из системы
function logout() {
    localStorage.removeItem('userData');
    localStorage.removeItem('authToken');
    window.location.href = 'crewlife.html';
}

// Функции календаря
function initCalendar() {
    const datePickerBtn = document.getElementById('datePickerBtn');
    const customCalendar = document.getElementById('customCalendar');
    
    if (datePickerBtn && customCalendar) {
        datePickerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCalendar();
        });
        
        // Закрываем календарь при клике вне его (теперь обрабатывается через затемнение)
        
        // Обработчики навигации
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        
        if (prevMonthBtn) {
            prevMonthBtn.addEventListener('click', function() {
                currentDate.setMonth(currentDate.getMonth() - 1);
                renderCalendar();
            });
        }
        
        if (nextMonthBtn) {
            nextMonthBtn.addEventListener('click', function() {
                currentDate.setMonth(currentDate.getMonth() + 1);
                renderCalendar();
            });
        }
        
        // Обработчики кнопок
        const clearDateBtn = document.getElementById('clearDate');
        const todayDateBtn = document.getElementById('todayDate');
        
        if (clearDateBtn) {
            clearDateBtn.addEventListener('click', function() {
                selectedDate = null;
                const departureDateInput = document.getElementById('departureDate');
                if (departureDateInput) departureDateInput.value = '';
                hideCalendar();
            });
        }
        
        if (todayDateBtn) {
            todayDateBtn.addEventListener('click', function() {
                selectedDate = new Date();
                currentDate = new Date();
                updateDateInput();
                renderCalendar();
                hideCalendar();
            });
        }
        
        // Инициализируем календарь
        renderCalendar();
    }
}

function toggleCalendar() {
    const customCalendar = document.getElementById('customCalendar');
    if (customCalendar) {
        if (calendarVisible) {
            hideCalendar();
        } else {
            showCalendar();
        }
    }
}

function showCalendar() {
    const customCalendar = document.getElementById('customCalendar');
    if (customCalendar) {
        // Создаем затемнение фона
        createCalendarOverlay();
        
        customCalendar.classList.add('show');
        calendarVisible = true;
        renderCalendar();
    }
}

function hideCalendar() {
    const customCalendar = document.getElementById('customCalendar');
    if (customCalendar) {
        customCalendar.classList.remove('show');
        calendarVisible = false;
        
        // Удаляем затемнение фона
        removeCalendarOverlay();
    }
}

function renderCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const calendarMonthYear = document.getElementById('calendarMonthYear');
    
    if (!calendarDays || !calendarMonthYear) return;
    
    // Обновляем заголовок
    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    calendarMonthYear.textContent = `${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    // Очищаем дни
    calendarDays.innerHTML = '';
    
    // Получаем первый день месяца и количество дней
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = (firstDay.getDay() + 6) % 7; // Понедельник = 0
    
    // Добавляем дни предыдущего месяца
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    for (let i = startDay - 1; i >= 0; i--) {
        const day = prevMonth.getDate() - i;
        const dayElement = createDayElement(day, true);
        calendarDays.appendChild(dayElement);
    }
    
    // Добавляем дни текущего месяца
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const isToday = dayDate.toDateString() === today.toDateString();
        const isSelected = selectedDate && dayDate.toDateString() === selectedDate.toDateString();
        const isPast = dayDate < today.setHours(0, 0, 0, 0);
        
        const dayElement = createDayElement(day, false, isToday, isSelected, isPast);
        calendarDays.appendChild(dayElement);
    }
    
    // Добавляем дни следующего месяца
    const remainingDays = 42 - (startDay + daysInMonth);
    for (let day = 1; day <= remainingDays; day++) {
        const dayElement = createDayElement(day, true);
        calendarDays.appendChild(dayElement);
    }
}

function createDayElement(day, isOtherMonth, isToday = false, isSelected = false, isPast = false) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    dayElement.textContent = day;
    
    if (isOtherMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday) {
        dayElement.classList.add('today');
    }
    
    if (isSelected) {
        dayElement.classList.add('selected');
    }
    
    if (isPast) {
        dayElement.classList.add('disabled');
    }
    
    if (!isOtherMonth && !isPast) {
        dayElement.addEventListener('click', function() {
            selectDate(day);
        });
    }
    
    return dayElement;
}

function selectDate(day) {
    selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    updateDateInput();
    hideCalendar();
}

function updateDateInput() {
    const departureDateInput = document.getElementById('departureDate');
    if (departureDateInput && selectedDate) {
        const day = selectedDate.getDate().toString().padStart(2, '0');
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
        const year = selectedDate.getFullYear();
        departureDateInput.value = `${day}.${month}.${year}`;
    }
}

// Функции для затемнения фона календаря
function createCalendarOverlay() {
    // Проверяем, не существует ли уже затемнение
    if (document.getElementById('calendarOverlay')) {
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'calendarOverlay';
    overlay.className = 'calendar-overlay show';
    
    // Закрываем календарь при клике на затемнение
    overlay.addEventListener('click', hideCalendar);
    
    document.body.appendChild(overlay);
}

function removeCalendarOverlay() {
    const overlay = document.getElementById('calendarOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
}

// Функции индикатора загрузки
function showLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Кнопка "Наверх"
function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (scrollToTopBtn) {
        // Показываем/скрываем кнопку при прокрутке
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        });
        
        // Обработчик клика
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Обработка отправки формы заказа рейса
function handleFlightOrderSubmit() {
    const form = document.getElementById('flightOrderForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Собираем данные формы
        const formData = {
            departureCity: document.getElementById('departureCity')?.value,
            arrivalCity: document.getElementById('arrivalCity')?.value,
            departureDate: document.getElementById('departureDate')?.value,
            departureTime: document.getElementById('departureTime')?.value,
            arrivalDate: document.getElementById('arrivalDate')?.value,
            arrivalTime: document.getElementById('arrivalTime')?.value,
            flightNumber: document.getElementById('flightNumber')?.value,
            airline: document.getElementById('airline')?.value,
            purpose: document.getElementById('purpose')?.value,
            priority: document.getElementById('priority')?.value || 'MEDIUM',
            passengers: document.getElementById('passengers')?.value || 1,
            luggageInfo: document.getElementById('luggageInfo')?.value,
            specialRequests: document.getElementById('specialRequests')?.value
        };

        // Валидация формы
        const validation = window.flightBookingAPI.validateForm(formData);
        if (!validation.isValid) {
            if (window.CrewLife && window.CrewLife.showNotification) {
                window.CrewLife.showNotification(validation.errors.join(', '), 'error');
            } else {
                alert('Ошибки в форме: ' + validation.errors.join(', '));
            }
            return;
        }

        // Показываем индикатор загрузки
        showLoading();

        try {
            // Создаем заказ через API
            const result = await window.flightBookingAPI.createFlightOrder(formData);
            
            if (result.success) {
                // Успешно создан
                if (window.CrewLife && window.CrewLife.showNotification) {
                    window.CrewLife.showNotification(result.message, 'success');
                } else {
                    alert(result.message);
                }
                
                // Очищаем форму
                form.reset();
                
                // Перенаправляем на панель управления
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                // Ошибка создания
                if (window.CrewLife && window.CrewLife.showNotification) {
                    window.CrewLife.showNotification(result.error, 'error');
                } else {
                    alert('Ошибка: ' + result.error);
                }
            }
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            if (window.CrewLife && window.CrewLife.showNotification) {
                window.CrewLife.showNotification('Произошла ошибка при создании заказа', 'error');
            } else {
                alert('Произошла ошибка при создании заказа');
            }
        } finally {
            // Скрываем индикатор загрузки
            hideLoading();
        }
    });
}

// Обработка отправки формы заказа рейса
function handleFlightOrderSubmit() {
    const form = document.getElementById('flightOrderForm');
    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Собираем данные формы
        const formData = {
            departureCity: document.getElementById('departureCity')?.value,
            arrivalCity: document.getElementById('arrivalCity')?.value,
            departureDate: document.getElementById('departureDate')?.value,
            departureTime: document.getElementById('departureTime')?.value,
            arrivalDate: document.getElementById('arrivalDate')?.value,
            arrivalTime: document.getElementById('arrivalTime')?.value,
            flightNumber: document.getElementById('flightNumber')?.value,
            airline: document.getElementById('airline')?.value,
            purpose: document.getElementById('purpose')?.value,
            priority: document.getElementById('priority')?.value || 'MEDIUM',
            passengers: document.getElementById('passengers')?.value || 1,
            luggageInfo: document.getElementById('luggageInfo')?.value,
            specialRequests: document.getElementById('specialRequests')?.value
        };

        // Валидация формы
        const validation = window.flightBookingAPI.validateForm(formData);
        if (!validation.isValid) {
            if (window.CrewLife && window.CrewLife.showNotification) {
                window.CrewLife.showNotification(validation.errors.join(', '), 'error');
            } else {
                alert('Ошибки в форме: ' + validation.errors.join(', '));
            }
            return;
        }

        // Показываем индикатор загрузки
        showLoading();

        try {
            // Создаем заказ через API
            const result = await window.flightBookingAPI.createFlightOrder(formData);
            
            if (result.success) {
                // Успешно создан
                if (window.CrewLife && window.CrewLife.showNotification) {
                    window.CrewLife.showNotification(result.message, 'success');
                } else {
                    alert(result.message);
                }
                
                // Очищаем форму
                form.reset();
                
                // Перенаправляем на панель управления
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 2000);
            } else {
                // Ошибка создания
                if (window.CrewLife && window.CrewLife.showNotification) {
                    window.CrewLife.showNotification(result.error, 'error');
                } else {
                    alert('Ошибка: ' + result.error);
                }
            }
        } catch (error) {
            console.error('Ошибка отправки формы:', error);
            if (window.CrewLife && window.CrewLife.showNotification) {
                window.CrewLife.showNotification('Произошла ошибка при создании заказа', 'error');
            } else {
                alert('Произошла ошибка при создании заказа');
            }
        } finally {
            // Скрываем индикатор загрузки
            hideLoading();
        }
    });
}
