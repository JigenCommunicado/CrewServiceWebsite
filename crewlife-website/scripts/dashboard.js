// JavaScript для панели управления CrewLife
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const userNameElement = document.getElementById('userName');
    const profileBtn = document.getElementById('profileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const requestsList = document.getElementById('requestsList');
    const notificationsList = document.getElementById('notificationsList');
    const myRequestsCount = document.getElementById('myRequestsCount');
    const pendingRequestsCount = document.getElementById('pendingRequestsCount');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const scrollToTopBtn = document.getElementById('scrollToTop');

    // Данные пользователя
    let currentUser = null;
    let userRequests = [];
    let userNotifications = [];

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
        
        // Загружаем заявки
        await loadUserRequests();
        
        // Загружаем уведомления
        await loadNotifications();
        
        // Настраиваем обработчики событий
        setupEventListeners();
        
        // Запускаем обновление данных
        startDataRefresh();
    }

    // Проверка авторизации
    function checkAuth() {
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (!authToken || !userData) {
            return false;
        }
        
        try {
            currentUser = JSON.parse(userData);
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
        if (currentUser) {
            userNameElement.textContent = currentUser.fullName || 'Пользователь';
        }
    }

    // Загрузка заявок пользователя
    async function loadUserRequests() {
        try {
            showLoading();
            
            // Симулируем загрузку заявок
            userRequests = await simulateUserRequests();
            
            // Обновляем счетчики
            updateCounters();
            
            // Отображаем заявки
            displayRequests();
            
        } catch (error) {
            console.error('Ошибка загрузки заявок:', error);
            if (window.CrewLife) {
                console.error('Ошибка загрузки заявок');
            }
        } finally {
            hideLoading();
        }
    }

    // Загрузка уведомлений
    async function loadNotifications() {
        try {
            // Симулируем загрузку уведомлений
            userNotifications = await simulateNotifications();
            
            // Отображаем уведомления
            displayNotifications();
            
        } catch (error) {
            console.error('Ошибка загрузки уведомлений:', error);
        }
    }

    // Симуляция заявок пользователя
    async function simulateUserRequests() {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const requestTypes = ['flight', 'aeroexpress', 'hotel', 'weekend'];
        const statuses = ['pending', 'approved', 'rejected'];
        const requests = [];
        
        // Генерируем 5-10 случайных заявок
        const count = Math.floor(Math.random() * 6) + 5;
        
        for (let i = 0; i < count; i++) {
            const type = requestTypes[Math.floor(Math.random() * requestTypes.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            
            requests.push({
                id: `req_${i + 1}`,
                type: type,
                status: status,
                title: getRequestTitle(type),
                date: date,
                details: generateRequestDetails(type),
                description: generateRequestDescription(type)
            });
        }
        
        return requests.sort((a, b) => b.date - a.date);
    }

    // Симуляция уведомлений
    async function simulateNotifications() {
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const notifications = [
            {
                id: 'notif_1',
                type: 'success',
                title: 'Заявка одобрена',
                message: 'Ваша заявка на рейс SU-1234 была одобрена',
                time: new Date(Date.now() - 2 * 60 * 60 * 1000)
            },
            {
                id: 'notif_2',
                type: 'warning',
                title: 'Требуется подтверждение',
                message: 'Пожалуйста, подтвердите бронирование гостиницы',
                time: new Date(Date.now() - 5 * 60 * 60 * 1000)
            },
            {
                id: 'notif_3',
                type: 'info',
                title: 'Новое уведомление',
                message: 'Система обновлена. Доступны новые функции',
                time: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
        ];
        
        return notifications;
    }

    // Получение заголовка заявки
    function getRequestTitle(type) {
        const titles = {
            flight: 'Заявка на рейс',
            aeroexpress: 'Заявка на аэроэкспресс',
            hotel: 'Заявка на гостиницу',
            weekend: 'Заявка на выходные дни'
        };
        return titles[type] || 'Заявка';
    }

    // Генерация деталей заявки
    function generateRequestDetails(type) {
        const details = {
            flight: {
                'Номер рейса': 'SU-1234',
                'Дата вылета': '15.01.2025',
                'Время': '14:30',
                'Маршрут': 'Москва - Сочи'
            },
            aeroexpress: {
                'Дата': '15.01.2025',
                'Время': '08:00',
                'Направление': 'Аэропорт - Центр',
                'Количество билетов': '1'
            },
            hotel: {
                'Город': 'Сочи',
                'Дата заезда': '15.01.2025',
                'Дата выезда': '17.01.2025',
                'Количество ночей': '2'
            },
            weekend: {
                'Дата начала': '15.01.2025',
                'Дата окончания': '17.01.2025',
                'Количество дней': '3',
                'Причина': 'Личные дела'
            }
        };
        return details[type] || {};
    }

    // Генерация описания заявки
    function generateRequestDescription(type) {
        const descriptions = {
            flight: 'Заявка на командировочный рейс в Сочи',
            aeroexpress: 'Билет на аэроэкспресс до аэропорта',
            hotel: 'Бронирование гостиницы в Сочи на 2 ночи',
            weekend: 'Заявка на выходные дни с 15 по 17 января'
        };
        return descriptions[type] || 'Описание заявки';
    }

    // Обновление счетчиков
    function updateCounters() {
        const totalRequests = userRequests.length;
        const pendingRequests = userRequests.filter(req => req.status === 'pending').length;
        
        myRequestsCount.textContent = totalRequests;
        pendingRequestsCount.textContent = pendingRequests;
    }

    // Отображение заявок
    function displayRequests(filter = 'all') {
        const filteredRequests = filter === 'all' 
            ? userRequests 
            : userRequests.filter(req => req.status === filter);
        
        if (filteredRequests.length === 0) {
            requestsList.innerHTML = `
                <div class="empty-state">
                    <p>Заявки не найдены</p>
                </div>
            `;
            return;
        }
        
        requestsList.innerHTML = filteredRequests.map(request => `
            <div class="request-item ${request.status}">
                <div class="request-header">
                    <h3 class="request-title">${request.title}</h3>
                    <span class="request-status ${request.status}">${getStatusText(request.status)}</span>
                </div>
                <div class="request-details">
                    ${Object.entries(request.details).map(([key, value]) => `
                        <div class="request-detail">
                            <span class="request-detail-label">${key}:</span>
                            <span class="request-detail-value">${value}</span>
                        </div>
                    `).join('')}
                </div>
                <p class="request-description">${request.description}</p>
                <div class="request-actions">
                    <button class="request-action-btn" onclick="viewRequest('${request.id}')">Подробнее</button>
                    ${request.status === 'pending' ? `
                        <button class="request-action-btn primary" onclick="editRequest('${request.id}')">Изменить</button>
                        <button class="request-action-btn" onclick="cancelRequest('${request.id}')">Отменить</button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Отображение уведомлений
    function displayNotifications() {
        if (userNotifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="empty-state">
                    <p>Уведомления отсутствуют</p>
                </div>
            `;
            return;
        }
        
        notificationsList.innerHTML = userNotifications.map(notification => `
            <div class="notification-item ${notification.type}">
                <div class="notification-header">
                    <h4 class="notification-title">${notification.title}</h4>
                    <span class="notification-time">${formatTime(notification.time)}</span>
                </div>
                <p class="notification-message">${notification.message}</p>
            </div>
        `).join('');
    }

    // Получение текста статуса
    function getStatusText(status) {
        const statusTexts = {
            pending: 'В обработке',
            approved: 'Одобрена',
            rejected: 'Отклонена'
        };
        return statusTexts[status] || status;
    }

    // Форматирование времени
    function formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);
        
        if (days > 0) {
            return `${days} дн. назад`;
        } else if (hours > 0) {
            return `${hours} ч. назад`;
        } else {
            return 'Только что';
        }
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Навигация
        profileBtn.addEventListener('click', function() {
            window.location.href = 'profile.html';
        });
        
        // Выход из системы
        logoutBtn.addEventListener('click', logout);
        
        // Фильтры заявок
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                displayRequests(this.dataset.filter);
            });
        });
        
        // Кнопки быстрых действий
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const requestType = this.dataset.type;
                
                // Открываем соответствующие страницы
                switch (requestType) {
                    case 'flight':
                        window.location.href = 'flight-booking.html';
                        break;
                    case 'aeroexpress':
                        window.location.href = 'aeroexpress.html';
                        break;
                    case 'hotel':
                        window.location.href = 'hotel.html';
                        break;
                    case 'weekend':
                        window.location.href = 'weekend.html';
                        break;
                    default:
                        console.log('Неизвестный тип заявки:', requestType);
                }
            });
        });
        
        // Кнопка "Наверх"
        if (scrollToTopBtn) {
            scrollToTopBtn.addEventListener('click', function() {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
        
        // Показ/скрытие кнопки "Наверх"
        window.addEventListener('scroll', function() {
            if (scrollToTopBtn) {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.add('show');
                } else {
                    scrollToTopBtn.classList.remove('show');
                }
            }
        });
    }

    // Выход из системы
    function logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        window.location.href = '../index.html';
    }


    // Показ индикатора загрузки
    function showLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Скрытие индикатора загрузки
    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Запуск обновления данных
    function startDataRefresh() {
        // Обновляем данные каждые 5 минут
        setInterval(async () => {
            await loadUserRequests();
            await loadNotifications();
        }, 5 * 60 * 1000);
    }

    // Глобальные функции для вызова из HTML
    window.viewRequest = function(id) {
        console.log('Просмотр заявки:', id);
        // Здесь будет логика просмотра заявки
    };
    
    window.editRequest = function(id) {
        console.log('Редактирование заявки:', id);
        // Здесь будет логика редактирования заявки
    };
    
    window.cancelRequest = function(id) {
        if (confirm('Вы уверены, что хотите отменить эту заявку?')) {
            userRequests = userRequests.filter(req => req.id !== id);
            updateCounters();
            displayRequests();
            if (window.CrewLife) {
                console.log('Заявка отменена');
            }
        }
    };
});
