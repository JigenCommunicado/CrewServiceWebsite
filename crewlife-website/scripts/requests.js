// JavaScript для страницы истории заявок CrewLife
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const userNameElement = document.getElementById('userName');
    const logoutBtn = document.getElementById('logoutBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    
    // Фильтры и поиск
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const statusFilter = document.getElementById('statusFilter');
    const typeFilter = document.getElementById('typeFilter');
    const periodFilter = document.getElementById('periodFilter');
    const sortFilter = document.getElementById('sortFilter');
    const dateFromInput = document.getElementById('dateFrom');
    const dateToInput = document.getElementById('dateTo');
    const priorityFilter = document.getElementById('priorityFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    const toggleAdvancedBtn = document.getElementById('toggleAdvanced');
    const advancedFilters = document.getElementById('advancedFilters');
    const exportBtn = document.getElementById('exportBtn');
    
    // Представления
    const tableViewBtn = document.getElementById('tableViewBtn');
    const cardViewBtn = document.getElementById('cardViewBtn');
    const tableView = document.getElementById('tableView');
    const cardView = document.getElementById('cardView');
    const requestsTableBody = document.getElementById('requestsTableBody');
    const requestsCards = document.getElementById('requestsCards');
    
    // Пагинация
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const paginationPages = document.getElementById('paginationPages');
    const paginationInfo = document.getElementById('paginationInfo');
    
    // Модальное окно
    const requestDetailsModal = document.getElementById('requestDetailsModal');
    const requestDetailsClose = document.getElementById('requestDetailsClose');
    const requestDetailsBody = document.getElementById('requestDetailsBody');
    const closeRequestDetailsBtn = document.getElementById('closeRequestDetails');
    
    // Статистика
    const totalRequestsElement = document.getElementById('totalRequests');
    const pendingRequestsElement = document.getElementById('pendingRequests');
    const approvedRequestsElement = document.getElementById('approvedRequests');
    const completedRequestsElement = document.getElementById('completedRequests');
    
    // Данные
    let allRequests = [];
    let filteredRequests = [];
    let currentPage = 1;
    let itemsPerPage = 10;
    let currentView = 'table';
    
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
        await loadRequests();
        
        // Настраиваем обработчики событий
        setupEventListeners();
        
        // Применяем фильтры
        applyFilters();
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

    // Загрузка заявок
    async function loadRequests() {
        try {
            showLoading();
            
            // Симулируем загрузку заявок
            allRequests = await simulateRequests();
            filteredRequests = [...allRequests];
            
            // Обновляем статистику
            updateStatistics();
            
            // Отображаем заявки
            displayRequests();
            
        } catch (error) {
            console.error('Ошибка загрузки заявок:', error);
            if (window.CrewLife) {
                window.CrewLife.showNotification('Ошибка загрузки заявок', 'error');
            }
        } finally {
            hideLoading();
        }
    }

    // Симуляция заявок
    async function simulateRequests() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const types = ['vacation', 'sick-leave', 'business-trip', 'overtime', 'equipment', 'training', 'other'];
        const statuses = ['new', 'processing', 'approved', 'rejected', 'completed'];
        const priorities = ['low', 'medium', 'high', 'urgent'];
        const descriptions = [
            'Заявка на отпуск',
            'Больничный лист',
            'Командировка в Москву',
            'Сверхурочная работа',
            'Запрос оборудования',
            'Обучение по безопасности',
            'Прочие вопросы'
        ];
        
        const requests = [];
        const now = new Date();
        
        for (let i = 1; i <= 50; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const status = statuses[Math.floor(Math.random() * statuses.length)];
            const priority = priorities[Math.floor(Math.random() * priorities.length)];
            const createdDate = new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000);
            
            requests.push({
                id: `REQ-${String(i).padStart(4, '0')}`,
                type: type,
                typeName: getTypeName(type),
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                status: status,
                statusName: getStatusName(status),
                priority: priority,
                priorityName: getPriorityName(priority),
                createdDate: createdDate,
                updatedDate: new Date(createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000),
                assignedTo: 'Иванов И.И.',
                comments: generateComments(status),
                attachments: Math.random() > 0.7 ? ['document.pdf'] : []
            });
        }
        
        return requests.sort((a, b) => b.createdDate - a.createdDate);
    }

    // Получение названия типа заявки
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

    // Генерация комментариев
    function generateComments(status) {
        const comments = [];
        const now = new Date();
        
        comments.push({
            text: 'Заявка создана',
            author: 'Система',
            date: new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
        
        if (status !== 'new') {
            comments.push({
                text: 'Заявка принята в обработку',
                author: 'Иванов И.И.',
                date: new Date(now.getTime() - Math.random() * 5 * 24 * 60 * 60 * 1000)
            });
        }
        
        if (status === 'approved' || status === 'completed') {
            comments.push({
                text: 'Заявка одобрена',
                author: 'Петров П.П.',
                date: new Date(now.getTime() - Math.random() * 2 * 24 * 60 * 60 * 1000)
            });
        }
        
        if (status === 'completed') {
            comments.push({
                text: 'Заявка выполнена',
                author: 'Сидоров С.С.',
                date: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000)
            });
        }
        
        return comments.sort((a, b) => a.date - b.date);
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Выход из системы
        logoutBtn.addEventListener('click', logout);

        // Поиск
        searchInput.addEventListener('input', debounce(applyFilters, 300));
        searchBtn.addEventListener('click', applyFilters);

        // Фильтры
        statusFilter.addEventListener('change', applyFilters);
        typeFilter.addEventListener('change', applyFilters);
        periodFilter.addEventListener('change', handlePeriodChange);
        sortFilter.addEventListener('change', applyFilters);
        dateFromInput.addEventListener('change', applyFilters);
        dateToInput.addEventListener('change', applyFilters);
        priorityFilter.addEventListener('change', applyFilters);

        // Кнопки управления
        clearFiltersBtn.addEventListener('click', clearFilters);
        toggleAdvancedBtn.addEventListener('click', toggleAdvancedFilters);
        exportBtn.addEventListener('click', exportRequests);

        // Представления
        tableViewBtn.addEventListener('click', () => switchView('table'));
        cardViewBtn.addEventListener('click', () => switchView('card'));

        // Пагинация
        prevPageBtn.addEventListener('click', () => changePage(currentPage - 1));
        nextPageBtn.addEventListener('click', () => changePage(currentPage + 1));

        // Модальное окно
        requestDetailsClose.addEventListener('click', closeRequestDetails);
        closeRequestDetailsBtn.addEventListener('click', closeRequestDetails);
    }

    // Применение фильтров
    function applyFilters() {
        let filtered = [...allRequests];
        
        // Поиск по тексту
        const searchText = searchInput.value.toLowerCase().trim();
        if (searchText) {
            filtered = filtered.filter(request => 
                request.id.toLowerCase().includes(searchText) ||
                request.description.toLowerCase().includes(searchText) ||
                request.typeName.toLowerCase().includes(searchText)
            );
        }
        
        // Фильтр по статусу
        const status = statusFilter.value;
        if (status) {
            filtered = filtered.filter(request => request.status === status);
        }
        
        // Фильтр по типу
        const type = typeFilter.value;
        if (type) {
            filtered = filtered.filter(request => request.type === type);
        }
        
        // Фильтр по периоду
        const period = periodFilter.value;
        if (period) {
            filtered = filterByPeriod(filtered, period);
        }
        
        // Фильтр по приоритету
        const priority = priorityFilter.value;
        if (priority) {
            filtered = filtered.filter(request => request.priority === priority);
        }
        
        // Сортировка
        const sort = sortFilter.value;
        filtered = sortRequests(filtered, sort);
        
        filteredRequests = filtered;
        currentPage = 1;
        displayRequests();
    }

    // Фильтрация по периоду
    function filterByPeriod(requests, period) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (period) {
            case 'today':
                return requests.filter(request => 
                    request.createdDate >= today
                );
            case 'week':
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                return requests.filter(request => 
                    request.createdDate >= weekAgo
                );
            case 'month':
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                return requests.filter(request => 
                    request.createdDate >= monthAgo
                );
            case 'quarter':
                const quarterAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                return requests.filter(request => 
                    request.createdDate >= quarterAgo
                );
            case 'year':
                const yearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000);
                return requests.filter(request => 
                    request.createdDate >= yearAgo
                );
            case 'custom':
                const dateFrom = dateFromInput.value;
                const dateTo = dateToInput.value;
                if (dateFrom) {
                    requests = requests.filter(request => 
                        request.createdDate >= new Date(dateFrom)
                    );
                }
                if (dateTo) {
                    requests = requests.filter(request => 
                        request.createdDate <= new Date(dateTo + 'T23:59:59')
                    );
                }
                return requests;
            default:
                return requests;
        }
    }

    // Сортировка заявок
    function sortRequests(requests, sort) {
        switch (sort) {
            case 'newest':
                return requests.sort((a, b) => b.createdDate - a.createdDate);
            case 'oldest':
                return requests.sort((a, b) => a.createdDate - b.createdDate);
            case 'status':
                return requests.sort((a, b) => a.status.localeCompare(b.status));
            case 'type':
                return requests.sort((a, b) => a.type.localeCompare(b.type));
            default:
                return requests;
        }
    }

    // Обработка изменения периода
    function handlePeriodChange() {
        const period = periodFilter.value;
        if (period === 'custom') {
            advancedFilters.style.display = 'block';
        } else {
            advancedFilters.style.display = 'none';
        }
        applyFilters();
    }

    // Очистка фильтров
    function clearFilters() {
        searchInput.value = '';
        statusFilter.value = '';
        typeFilter.value = '';
        periodFilter.value = '';
        sortFilter.value = 'newest';
        dateFromInput.value = '';
        dateToInput.value = '';
        priorityFilter.value = '';
        advancedFilters.style.display = 'none';
        applyFilters();
    }

    // Переключение расширенных фильтров
    function toggleAdvancedFilters() {
        const isVisible = advancedFilters.style.display === 'block';
        advancedFilters.style.display = isVisible ? 'none' : 'block';
        toggleAdvancedBtn.textContent = isVisible ? 'Расширенные фильтры' : 'Скрыть фильтры';
    }

    // Экспорт заявок
    function exportRequests() {
        if (window.CrewLife) {
            window.CrewLife.showNotification('Функция экспорта будет добавлена в следующей версии', 'info');
        }
    }

    // Переключение представления
    function switchView(view) {
        currentView = view;
        
        // Обновляем кнопки
        tableViewBtn.classList.toggle('active', view === 'table');
        cardViewBtn.classList.toggle('active', view === 'card');
        
        // Показываем нужное представление
        tableView.style.display = view === 'table' ? 'block' : 'none';
        cardView.style.display = view === 'card' ? 'block' : 'none';
        
        // Перерисовываем заявки
        displayRequests();
    }

    // Отображение заявок
    function displayRequests() {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageRequests = filteredRequests.slice(startIndex, endIndex);
        
        if (currentView === 'table') {
            displayTableView(pageRequests);
        } else {
            displayCardView(pageRequests);
        }
        
        updatePagination();
    }

    // Табличное представление
    function displayTableView(requests) {
        if (requests.length === 0) {
            requestsTableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        <h3>Заявки не найдены</h3>
                        <p>Попробуйте изменить фильтры поиска</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        requestsTableBody.innerHTML = requests.map(request => `
            <tr>
                <td>${request.id}</td>
                <td>${request.typeName}</td>
                <td>${request.description}</td>
                <td><span class="status-badge status-${request.status}">${request.statusName}</span></td>
                <td>${formatDate(request.createdDate)}</td>
                <td><span class="priority-badge priority-${request.priority}">${request.priorityName}</span></td>
                <td>
                    <button class="action-btn action-btn-primary" onclick="showRequestDetails('${request.id}')">
                        Подробнее
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // Карточное представление
    function displayCardView(requests) {
        if (requests.length === 0) {
            requestsCards.innerHTML = `
                <div class="empty-state">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h3>Заявки не найдены</h3>
                    <p>Попробуйте изменить фильтры поиска</p>
                </div>
            `;
            return;
        }
        
        requestsCards.innerHTML = requests.map(request => `
            <div class="request-card">
                <div class="request-card-header">
                    <div class="request-number">${request.id}</div>
                    <div class="request-type">${request.typeName}</div>
                </div>
                <div class="request-description">${request.description}</div>
                <div class="request-meta">
                    <div>
                        <span class="status-badge status-${request.status}">${request.statusName}</span>
                        <span class="priority-badge priority-${request.priority}">${request.priorityName}</span>
                    </div>
                    <div class="request-date">${formatDate(request.createdDate)}</div>
                </div>
                <div class="request-actions">
                    <button class="action-btn action-btn-primary" onclick="showRequestDetails('${request.id}')">
                        Подробнее
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Обновление статистики
    function updateStatistics() {
        const total = allRequests.length;
        const pending = allRequests.filter(r => r.status === 'processing').length;
        const approved = allRequests.filter(r => r.status === 'approved').length;
        const completed = allRequests.filter(r => r.status === 'completed').length;
        
        totalRequestsElement.textContent = total;
        pendingRequestsElement.textContent = pending;
        approvedRequestsElement.textContent = approved;
        completedRequestsElement.textContent = completed;
    }

    // Обновление пагинации
    function updatePagination() {
        const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, filteredRequests.length);
        
        // Информация о странице
        paginationInfo.textContent = `Показано ${startItem}-${endItem} из ${filteredRequests.length} заявок`;
        
        // Кнопки навигации
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages;
        
        // Номера страниц
        paginationPages.innerHTML = '';
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
        
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = `pagination-page ${i === currentPage ? 'active' : ''}`;
            pageBtn.textContent = i;
            pageBtn.addEventListener('click', () => changePage(i));
            paginationPages.appendChild(pageBtn);
        }
    }

    // Смена страницы
    function changePage(page) {
        const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
        if (page >= 1 && page <= totalPages) {
            currentPage = page;
            displayRequests();
        }
    }

    // Показ деталей заявки
    function showRequestDetails(requestId) {
        const request = allRequests.find(r => r.id === requestId);
        if (!request) return;
        
        requestDetailsBody.innerHTML = `
            <div class="request-details">
                <div>
                    <div class="detail-section">
                        <h4>Основная информация</h4>
                        <div class="detail-item">
                            <span class="detail-label">Номер заявки:</span>
                            <span class="detail-value">${request.id}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Тип:</span>
                            <span class="detail-value">${request.typeName}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Статус:</span>
                            <span class="detail-value">
                                <span class="status-badge status-${request.status}">${request.statusName}</span>
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Приоритет:</span>
                            <span class="detail-value">
                                <span class="priority-badge priority-${request.priority}">${request.priorityName}</span>
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Дата создания:</span>
                            <span class="detail-value">${formatDate(request.createdDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Последнее обновление:</span>
                            <span class="detail-value">${formatDate(request.updatedDate)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Ответственный:</span>
                            <span class="detail-value">${request.assignedTo}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div class="detail-section">
                        <h4>Описание</h4>
                        <div class="detail-description">${request.description}</div>
                    </div>
                    <div class="detail-section">
                        <h4>История изменений</h4>
                        <div class="timeline">
                            ${request.comments.map(comment => `
                                <div class="timeline-item">
                                    <div class="timeline-icon"></div>
                                    <div class="timeline-content">
                                        <div class="timeline-title">${comment.text}</div>
                                        <div class="timeline-date">${formatDate(comment.date)} - ${comment.author}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        requestDetailsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    // Закрытие модального окна
    function closeRequestDetails() {
        requestDetailsModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    // Форматирование даты
    function formatDate(date) {
        return new Intl.DateTimeFormat('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    // Debounce функция
    function debounce(func, wait) {
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

    // Глобальные функции для onclick
    window.showRequestDetails = showRequestDetails;
});
