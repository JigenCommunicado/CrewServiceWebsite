// JavaScript для календаря заявок CrewLife
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const userNameElement = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Навигация календаря
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const currentMonthElement = document.getElementById('currentMonth');
    const todayBtn = document.getElementById('todayBtn');
    
    // Фильтры
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const viewFilter = document.getElementById('viewFilter');
    
    // Календарь
    const calendarGrid = document.getElementById('calendarGrid');
    
    // Модальные окна
    const eventModal = document.getElementById('eventModal');
    const eventModalClose = document.getElementById('eventModalClose');
    const eventForm = document.getElementById('eventForm');
    const addEventBtn = document.getElementById('addEventBtn');
    const cancelEventBtn = document.getElementById('cancelEvent');
    const saveEventBtn = document.getElementById('saveEvent');
    
    const eventDetailsModal = document.getElementById('eventDetailsModal');
    const eventDetailsClose = document.getElementById('eventDetailsClose');
    const eventDetailsBody = document.getElementById('eventDetailsBody');
    const closeEventDetailsBtn = document.getElementById('closeEventDetails');
    const editEventBtn = document.getElementById('editEventBtn');
    const deleteEventBtn = document.getElementById('deleteEventBtn');
    
    // Данные
    let currentDate = new Date();
    let events = [];
    let filteredEvents = [];
    let selectedDate = null;
    let selectedEvent = null;
    
    // Инициализация
    init();

    async function init() {
        // Проверяем авторизацию
        if (!checkAuth()) {
            redirectToLogin();
            return;
        }

        // Загружаем данные пользователя
        await loadUserData();
        
        // Загружаем события
        await loadEvents();
        
        // Настраиваем обработчики событий
        setupEventListeners();
        
        // Отображаем календарь
        renderCalendar();
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
            userNameElement.textContent = user.fullName || 'Пользователь';
            return true;
        } catch (error) {
            console.error('Ошибка парсинга данных пользователя:', error);
            return false;
        }
    }

    // Перенаправление на страницу входа
    function redirectToLogin() {
        window.location.href = 'login.html';
    }

    // Загрузка данных пользователя
    async function loadUserData() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            userNameElement.textContent = user.fullName || 'Пользователь';
        }
    }

    // Загрузка событий
    async function loadEvents() {
        try {
            showLoading();
            
            // Симулируем загрузку событий
            events = await simulateEvents();
            filteredEvents = [...events];
            
        } catch (error) {
            console.error('Ошибка загрузки событий:', error);
            if (window.CrewLife) {
                window.CrewLife.showNotification('Ошибка загрузки событий', 'error');
            }
        } finally {
            hideLoading();
        }
    }

    // Симуляция событий
    async function simulateEvents() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const types = ['vacation', 'sick-leave', 'business-trip', 'overtime', 'equipment', 'training', 'other'];
        const statuses = ['new', 'processing', 'approved', 'rejected', 'completed'];
        const priorities = ['low', 'medium', 'high', 'urgent'];
        const titles = [
            'Отпуск',
            'Больничный лист',
            'Командировка в Москву',
            'Сверхурочная работа',
            'Запрос оборудования',
            'Обучение по безопасности',
            'Прочие вопросы'
        ];
        
        const events = [];
        const now = new Date();
        
        for (let i = 1; i <= 30; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];
            const startDate = new Date(now.getTime() + (Math.random() - 0.5) * 60 * 24 * 60 * 60 * 1000);
            const duration = Math.floor(Math.random() * 7) + 1;
            const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);
            
            events.push({
                id: `EVENT-${String(i).padStart(4, '0')}`,
                type: type,
                title: titles[Math.floor(Math.random() * titles.length)],
                description: `Описание события ${i}`,
                startDate: startDate,
                endDate: endDate,
                status: status,
                priority: priority,
                createdDate: new Date(),
                assignedTo: 'Иванов И.И.'
            });
        }
        
        return events;
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Выход из системы
        logoutBtn.addEventListener('click', logout);

        // Навигация календаря
        prevMonthBtn.addEventListener('click', () => changeMonth(-1));
        nextMonthBtn.addEventListener('click', () => changeMonth(1));
        todayBtn.addEventListener('click', goToToday);

        // Фильтры
        typeFilter.addEventListener('change', applyFilters);
        statusFilter.addEventListener('change', applyFilters);
        viewFilter.addEventListener('change', changeView);

        // Модальное окно события
        addEventBtn.addEventListener('click', openEventModal);
        eventModalClose.addEventListener('click', closeEventModal);
        cancelEventBtn.addEventListener('click', closeEventModal);
        saveEventBtn.addEventListener('click', saveEvent);

        // Модальное окно деталей события
        eventDetailsClose.addEventListener('click', closeEventDetails);
        closeEventDetailsBtn.addEventListener('click', closeEventDetails);
        editEventBtn.addEventListener('click', editEvent);
        deleteEventBtn.addEventListener('click', deleteEvent);
    }

    // Изменение месяца
    function changeMonth(direction) {
        currentDate.setMonth(currentDate.getMonth() + direction);
        renderCalendar();
    }

    // Переход к сегодняшней дате
    function goToToday() {
        currentDate = new Date();
        renderCalendar();
    }

    // Применение фильтров
    function applyFilters() {
        let filtered = [...events];
        
        const type = typeFilter.value;
        if (type) {
            filtered = filtered.filter(event => event.type === type);
        }
        
        const status = statusFilter.value;
        if (status) {
            filtered = filtered.filter(event => event.status === status);
        }
        
        filteredEvents = filtered;
        renderCalendar();
    }

    // Изменение вида календаря
    function changeView() {
        const view = viewFilter.value;
        // В будущем можно добавить разные виды календаря
        console.log('Изменение вида на:', view);
    }

    // Отображение календаря
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Обновляем заголовок
        const monthNames = [
            'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
        ];
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;
        
        // Получаем первый день месяца и количество дней
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Понедельник = 0
        
        // Очищаем календарь
        calendarGrid.innerHTML = '';
        
        // Добавляем дни предыдущего месяца
        const prevMonth = new Date(year, month - 1, 0);
        const daysInPrevMonth = prevMonth.getDate();
        
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            const day = daysInPrevMonth - i;
            const dayElement = createDayElement(day, true, new Date(year, month - 1, day));
            calendarGrid.appendChild(dayElement);
        }
        
        // Добавляем дни текущего месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayElement = createDayElement(day, false, date);
            calendarGrid.appendChild(dayElement);
        }
        
        // Добавляем дни следующего месяца
        const totalCells = calendarGrid.children.length;
        const remainingCells = 42 - totalCells; // 6 недель * 7 дней
        
        for (let day = 1; day <= remainingCells; day++) {
            const dayElement = createDayElement(day, true, new Date(year, month + 1, day));
            calendarGrid.appendChild(dayElement);
        }
    }

    // Создание элемента дня
    function createDayElement(day, isOtherMonth, date) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        if (isOtherMonth) {
            dayElement.classList.add('other-month');
        }
        
        // Проверяем, является ли день сегодняшним
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // Создаем номер дня
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);
        
        // Создаем контейнер для событий
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'day-events';
        dayElement.appendChild(eventsContainer);
        
        // Добавляем события для этого дня
        const dayEvents = getEventsForDate(date);
        dayEvents.forEach(event => {
            const eventElement = createEventElement(event);
            eventsContainer.appendChild(eventElement);
        });
        
        // Добавляем обработчик клика
        dayElement.addEventListener('click', () => selectDate(date, dayElement));
        
        return dayElement;
    }

    // Получение событий для конкретной даты
    function getEventsForDate(date) {
        return filteredEvents.filter(event => {
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            
            // Нормализуем даты (убираем время)
            const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
            const startDate = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
            const endDate = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
            
            return checkDate >= startDate && checkDate <= endDate;
        });
    }

    // Создание элемента события
    function createEventElement(event) {
        const eventElement = document.createElement('div');
        eventElement.className = `day-event ${event.type}`;
        eventElement.textContent = event.title;
        eventElement.title = `${event.title} - ${event.description}`;
        
        // Добавляем обработчик клика
        eventElement.addEventListener('click', (e) => {
            e.stopPropagation();
            showEventDetails(event);
        });
        
        return eventElement;
    }

    // Выбор даты
    function selectDate(date, dayElement) {
        // Убираем выделение с предыдущей даты
        const previousSelected = document.querySelector('.calendar-day.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }
        
        // Выделяем новую дату
        dayElement.classList.add('selected');
        selectedDate = date;
        
        // Показываем события для выбранной даты
        const dayEvents = getEventsForDate(date);
        console.log(`События на ${date.toLocaleDateString()}:`, dayEvents);
    }

    // Открытие модального окна события
    function openEventModal() {
        // Устанавливаем дату начала как выбранную дату или сегодня
        const startDate = selectedDate || new Date();
        const endDate = new Date(startDate);
        
        document.getElementById('eventStartDate').value = formatDateForInput(startDate);
        document.getElementById('eventEndDate').value = formatDateForInput(endDate);
        
        eventModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Закрытие модального окна события
    function closeEventModal() {
        eventModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        eventForm.reset();
    }

    // Сохранение события
    async function saveEvent() {
        try {
            const formData = new FormData(eventForm);
            const eventData = {
                id: `EVENT-${Date.now()}`,
                type: formData.get('eventType'),
                title: formData.get('eventTitle'),
                description: formData.get('eventDescription'),
                startDate: new Date(formData.get('eventStartDate')),
                endDate: new Date(formData.get('eventEndDate')),
                status: 'new',
                priority: formData.get('eventPriority'),
                createdDate: new Date(),
                assignedTo: 'Иванов И.И.'
            };
            
            // Добавляем событие
            events.push(eventData);
            applyFilters();
            
            closeEventModal();
            
            if (window.CrewLife) {
                window.CrewLife.showNotification('Событие успешно добавлено', 'success');
            }
            
        } catch (error) {
            console.error('Ошибка сохранения события:', error);
            if (window.CrewLife) {
                window.CrewLife.showNotification('Ошибка сохранения события', 'error');
            }
        }
    }

    // Показ деталей события
    function showEventDetails(event) {
        selectedEvent = event;
        
        eventDetailsBody.innerHTML = `
            <div class="event-details">
                <div>
                    <div class="detail-section">
                        <h4>Основная информация</h4>
                        <div class="detail-item">
                            <span class="detail-label">Название:</span>
                            <span class="detail-value">${event.title}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Тип:</span>
                            <span class="detail-value">${getTypeName(event.type)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Статус:</span>
                            <span class="detail-value">${getStatusName(event.status)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Приоритет:</span>
                            <span class="detail-value">${getPriorityName(event.priority)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Дата начала:</span>
                            <span class="detail-value">${formatDate(event.startDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Дата окончания:</span>
                            <span class="detail-value">${formatDate(event.endDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ответственный:</span>
                            <span class="detail-value">${event.assignedTo}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="detail-section">
                        <h4>Описание</h4>
                        <div class="detail-description">${event.description}</div>
                    </div>
                </div>
            </div>
        `;
        
        eventDetailsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Закрытие модального окна деталей
    function closeEventDetails() {
        eventDetailsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        selectedEvent = null;
    }

    // Редактирование события
    function editEvent() {
        if (selectedEvent) {
            closeEventDetails();
            // Заполняем форму данными события
            document.getElementById('eventType').value = selectedEvent.type;
            document.getElementById('eventTitle').value = selectedEvent.title;
            document.getElementById('eventDescription').value = selectedEvent.description;
            document.getElementById('eventStartDate').value = formatDateForInput(selectedEvent.startDate);
            document.getElementById('eventEndDate').value = formatDateForInput(selectedEvent.endDate);
            document.getElementById('eventPriority').value = selectedEvent.priority;
            
            openEventModal();
        }
    }

    // Удаление события
    function deleteEvent() {
        if (selectedEvent && confirm('Вы уверены, что хотите удалить это событие?')) {
            const index = events.findIndex(e => e.id === selectedEvent.id);
            if (index > -1) {
                events.splice(index, 1);
                applyFilters();
                closeEventDetails();
                
                if (window.CrewLife) {
                    window.CrewLife.showNotification('Событие удалено', 'success');
                }
            }
        }
    }

    // Получение названия типа
    function getTypeName(type) {
        const names = {
            'vacation': 'Отпуск',
            'sick-leave': 'Больничный',
            'business-trip': 'Командировка',
            'overtime': 'Сверхурочные',
            'equipment': 'Оборудование',
            'training': 'Обучение',
            'other': 'Прочее'
        };
        return names[type] || type;
    }

    // Получение названия статуса
    function getStatusName(status) {
        const names = {
            'new': 'Новая',
            'processing': 'В обработке',
            'approved': 'Одобрена',
            'rejected': 'Отклонена',
            'completed': 'Выполнена'
        };
        return names[status] || status;
    }

    // Получение названия приоритета
    function getPriorityName(priority) {
        const names = {
            'low': 'Низкий',
            'medium': 'Средний',
            'high': 'Высокий',
            'urgent': 'Срочный'
        };
        return names[priority] || priority;
    }

    // Форматирование даты для input
    function formatDateForInput(date) {
        return date.toISOString().split('T')[0];
    }

    // Форматирование даты для отображения
    function formatDate(date) {
        return new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    // Выход из системы
    function logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    }

    // Показ индикатора загрузки
    function showLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
        }
    }

    // Скрытие индикатора загрузки
    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
});
