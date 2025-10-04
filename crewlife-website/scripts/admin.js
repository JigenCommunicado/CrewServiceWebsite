/**
 * Админ-панель CrewLife v3.0.0
 */

class AdminPanel {
    constructor() {
        this.currentTab = 'dashboard';
        this.users = [];
        this.requests = [];
        this.settings = {};
        this.logs = [];
        // Автоматическое определение API URL
        this.apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'http://localhost:5000/api' 
            : 'https://crewlife.ru/api';
        this.isAuthenticated = false;
        this.currentUser = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthentication();
    }
    
    // === API МЕТОДЫ ===
    
    async apiRequest(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        };
        
        const config = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Ошибка API');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
    
    async checkAuthentication() {
        try {
            const response = await this.apiRequest('/auth/check');
            this.isAuthenticated = true;
            this.currentUser = response.user;
            this.updateUserInfo();
            this.loadDashboardData();
        } catch (error) {
            console.warn('Не аутентифицирован:', error.message);
            this.showLoginModal();
        }
    }
    
    async login(email, password) {
        try {
            const response = await this.apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            this.isAuthenticated = true;
            this.currentUser = response.user;
            this.updateUserInfo();
            this.hideLoginModal();
            this.loadDashboardData();
            
            this.showNotification('Успешный вход в систему', 'success');
        } catch (error) {
            this.showNotification(error.message, 'error');
        }
    }
    
    async logout() {
        try {
            await this.apiRequest('/auth/logout', { method: 'POST' });
            this.isAuthenticated = false;
            this.currentUser = null;
            this.showLoginModal();
            this.showNotification('Выход из системы', 'info');
        } catch (error) {
            console.error('Ошибка выхода:', error);
        }
    }
    
    updateUserInfo() {
        if (this.currentUser) {
            const adminNameElement = document.getElementById('adminName');
            if (adminNameElement) {
                adminNameElement.textContent = `${this.currentUser.first_name} ${this.currentUser.last_name}`;
            }
        }
    }
    
    showLoginModal() {
        // Создаем модальное окно входа
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = 'loginModal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Вход в админ-панель</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="loginForm">
                        <div class="form-group">
                            <label for="loginEmail">Email:</label>
                            <input type="email" id="loginEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Пароль:</label>
                            <input type="password" id="loginPassword" required>
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn-primary">Войти</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Обработчик формы входа
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            await this.login(email, password);
        });
        
        // Обработчик закрытия
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.hideLoginModal();
        });
    }
    
    hideLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.remove();
        }
    }

    setupEventListeners() {
        // Мобильное меню
        this.setupMobileMenu();
        
        // Навигация по вкладкам
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = item.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Кнопки действий
        document.getElementById('refreshDashboardBtn')?.addEventListener('click', () => {
            this.loadDashboardData();
        });

        document.getElementById('addUserBtn')?.addEventListener('click', () => {
            this.showAddUserModal();
        });

        document.getElementById('exportUsersBtn')?.addEventListener('click', () => {
            this.exportUsers();
        });

        document.getElementById('refreshUsersBtn')?.addEventListener('click', () => {
            this.loadUsers();
        });

        // Поиск пользователей
        document.getElementById('userSearchBtn')?.addEventListener('click', () => {
            this.searchUsers();
        });

        document.getElementById('userSearch')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchUsers();
            }
        });

        // Фильтры пользователей
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.filterUsers(tab.dataset.filter);
            });
        });

        // Модальные окна
        this.setupModalListeners();

        // Выход
        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
        
        document.getElementById('mobileLogoutBtn')?.addEventListener('click', () => {
            this.logout();
        });
        
        // Кнопка "Наверх"
        this.setupScrollToTop();
    }
    
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileMenuClose = document.getElementById('mobileMenuClose');

        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('show');
                mobileMenuBtn.setAttribute('aria-expanded', 
                    mobileMenu.classList.contains('show') ? 'true' : 'false'
                );
            });

            mobileMenuClose?.addEventListener('click', () => {
                mobileMenu.classList.remove('show');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            });
            
            // Закрытие меню при клике на ссылку
            document.querySelectorAll('.mobile-nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.remove('show');
                    mobileMenuBtn.setAttribute('aria-expanded', 'false');
                });
            });
        }
    }
    
    setupScrollToTop() {
        const scrollToTopBtn = document.getElementById('scrollToTop');
        
        if (scrollToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.classList.add('show');
                } else {
                    scrollToTopBtn.classList.remove('show');
                }
            });

            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    setupModalListeners() {
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                this.hideModal(modal);
            });
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal(modal);
                }
            });
        });

        document.getElementById('addUserSubmit')?.addEventListener('click', () => {
            this.addUser();
        });

        document.getElementById('addUserCancel')?.addEventListener('click', () => {
            this.hideModal(document.getElementById('addUserModal'));
        });
    }

    switchTab(tabName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        document.querySelectorAll('.admin-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;

        switch (tabName) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'users':
                this.loadUsers();
                break;
        }
    }

    async loadDashboardData() {
        if (!this.isAuthenticated) return;
        
        this.showLoading();
        
        try {
            // Загрузка статистики с API
            const response = await this.apiRequest('/dashboard/stats');
            this.updateStatsCards(response.stats);
            
            // Загрузка последних действий
            const actions = await this.fetchRecentActions();
            this.updateRecentActions(actions);
            
            this.updateCharts(response.stats);
            
        } catch (error) {
            console.error('Ошибка загрузки данных дашборда:', error);
            this.showNotification('Ошибка загрузки данных', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async fetchStats() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    totalUsers: 156,
                    totalRequests: 1247,
                    pendingRequests: 23,
                    unreadNotifications: 8,
                    usersChange: 12.5,
                    requestsChange: 8.3,
                    pendingChange: -5.2,
                    notificationsChange: 25.0
                });
            }, 1000);
        });
    }

    async fetchRecentActions() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        text: 'Новый пользователь зарегистрирован',
                        time: '2 минуты назад'
                    },
                    {
                        id: 2,
                        text: 'Заявка #1234 одобрена',
                        time: '15 минут назад'
                    },
                    {
                        id: 3,
                        text: 'Система обновлена до версии 3.0.0',
                        time: '1 час назад'
                    }
                ]);
            }, 500);
        });
    }

    updateStatsCards(stats) {
        document.getElementById('totalUsers').textContent = stats.totalUsers;
        document.getElementById('totalRequests').textContent = stats.totalRequests;
        document.getElementById('pendingRequests').textContent = stats.pendingRequests;
        document.getElementById('unreadNotifications').textContent = stats.unreadNotifications;
        
        document.getElementById('usersChange').textContent = `+${stats.usersChange}%`;
        document.getElementById('requestsChange').textContent = `+${stats.requestsChange}%`;
        document.getElementById('pendingChange').textContent = `${stats.pendingChange}%`;
        document.getElementById('notificationsChange').textContent = `+${stats.notificationsChange}%`;
    }

    updateRecentActions(actions) {
        const container = document.getElementById('recentActionsList');
        if (!container) return;

        container.innerHTML = actions.map(action => `
            <div class="action-item">
                <div class="action-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 21V19C16 17.9391 15.5786 16.9217 14.8284 16.1716C14.0783 15.4214 13.0609 15 12 15C10.9391 15 9.92172 15.4214 9.17157 16.1716C8.42143 16.9217 8 17.9391 8 19V21M12 7C12 9.20914 10.2091 11 8 11C5.79086 11 4 9.20914 4 7C4 4.79086 5.79086 3 8 3C10.2091 3 12 4.79086 12 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="action-content">
                    <div class="action-text">${action.text}</div>
                    <div class="action-time">${action.time}</div>
                </div>
            </div>
        `).join('');
    }

    updateCharts(stats) {
        const usersCtx = document.getElementById('usersActivityChart');
        if (usersCtx && typeof Chart !== 'undefined') {
            new Chart(usersCtx, {
                type: 'line',
                data: {
                    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
                    datasets: [{
                        label: 'Активные пользователи',
                        data: [45, 52, 48, 61, 55, 67, 73],
                        borderColor: '#FF4D4D',
                        backgroundColor: 'rgba(255, 77, 77, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        const requestsCtx = document.getElementById('requestsChart');
        if (requestsCtx && typeof Chart !== 'undefined') {
            new Chart(requestsCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Одобрены', 'В обработке', 'Отклонены'],
                    datasets: [{
                        data: [85, 12, 3],
                        backgroundColor: ['#28A745', '#FFC107', '#DC3545'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    async loadUsers() {
        if (!this.isAuthenticated) return;
        
        this.showLoading();
        
        try {
            const response = await this.apiRequest('/users');
            this.users = response.users;
            this.renderUsersTable();
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            this.showNotification('Ошибка загрузки пользователей', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async fetchUsers() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    {
                        id: 1,
                        firstName: 'Анна',
                        lastName: 'Петрова',
                        employeeId: 'EMP001',
                        position: 'flight-attendant',
                        location: 'moscow',
                        email: 'anna.petrova@example.com',
                        registrationDate: '2024-01-15',
                        lastLogin: '2024-01-20',
                        status: 'active',
                        role: 'user'
                    },
                    {
                        id: 2,
                        firstName: 'Михаил',
                        lastName: 'Соколов',
                        employeeId: 'EMP002',
                        position: 'senior-flight-attendant',
                        location: 'spb',
                        email: 'mikhail.sokolov@example.com',
                        registrationDate: '2024-01-10',
                        lastLogin: '2024-01-19',
                        status: 'active',
                        role: 'admin'
                    }
                ]);
            }, 800);
        });
    }

    renderUsersTable(users) {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <input type="checkbox" class="checkbox user-checkbox" data-user-id="${user.id}">
                </td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.employeeId}</td>
                <td>${this.getPositionLabel(user.position)}</td>
                <td>${this.getLocationLabel(user.location)}</td>
                <td>${this.formatDate(user.registrationDate)}</td>
                <td>${this.formatDate(user.lastLogin)}</td>
                <td>
                    <span class="status-badge ${user.status}">${this.getStatusLabel(user.status)}</span>
                </td>
                <td>
                    <div class="table-actions">
                        <button class="btn-small btn-edit" onclick="adminPanel.editUser(${user.id})">
                            Редактировать
                        </button>
                        <button class="btn-small btn-toggle" onclick="adminPanel.toggleUserStatus(${user.id})">
                            ${user.status === 'active' ? 'Деактивировать' : 'Активировать'}
                        </button>
                        <button class="btn-small btn-delete" onclick="adminPanel.deleteUser(${user.id})">
                            Удалить
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    getPositionLabel(position) {
        const positions = {
            'flight-attendant': 'Бортпроводник',
            'senior-flight-attendant': 'Старший бортпроводник',
            'instructor': 'Инструктор-проводник',
            'supervisor': 'Супервайзер'
        };
        return positions[position] || position;
    }

    getLocationLabel(location) {
        const locations = {
            'moscow': 'Москва',
            'spb': 'Санкт-Петербург',
            'ekaterinburg': 'Екатеринбург',
            'novosibirsk': 'Новосибирск'
        };
        return locations[location] || location;
    }

    getStatusLabel(status) {
        const statuses = {
            'active': 'Активен',
            'inactive': 'Неактивен',
            'pending': 'Ожидает'
        };
        return statuses[status] || status;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    searchUsers() {
        const searchTerm = document.getElementById('userSearch').value.toLowerCase();
        const filteredUsers = this.users.filter(user => 
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.employeeId.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
        this.renderUsersTable(filteredUsers);
    }

    filterUsers(filter) {
        let filteredUsers = this.users;
        
        switch (filter) {
            case 'active':
                filteredUsers = this.users.filter(user => user.status === 'active');
                break;
            case 'inactive':
                filteredUsers = this.users.filter(user => user.status === 'inactive');
                break;
            case 'admin':
                filteredUsers = this.users.filter(user => user.role === 'admin');
                break;
        }
        
        this.renderUsersTable(filteredUsers);
    }

    showAddUserModal() {
        const modal = document.getElementById('addUserModal');
        if (modal) {
            this.showModal(modal);
            document.getElementById('addUserForm').reset();
        }
    }

    async addUser() {
        const form = document.getElementById('addUserForm');
        const formData = new FormData(form);
        
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            employeeId: formData.get('employeeId'),
            position: formData.get('position'),
            location: formData.get('location'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role')
        };

        if (!userData.firstName || !userData.lastName || !userData.employeeId) {
            this.showNotification('Заполните все обязательные поля', 'error');
            return;
        }

        try {
            this.showLoading();
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const newUser = {
                id: Date.now(),
                ...userData,
                registrationDate: new Date().toISOString().split('T')[0],
                lastLogin: '-',
                status: 'active'
            };
            
            this.users.unshift(newUser);
            this.renderUsersTable(this.users);
            
            this.hideModal(document.getElementById('addUserModal'));
            this.showNotification('Пользователь успешно добавлен', 'success');
            
        } catch (error) {
            console.error('Ошибка добавления пользователя:', error);
            this.showNotification('Ошибка добавления пользователя', 'error');
        } finally {
            this.hideLoading();
        }
    }

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) {
            this.showNotification(`Редактирование пользователя ${user.firstName} ${user.lastName}`, 'info');
        }
    }

    async toggleUserStatus(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        try {
            this.showLoading();
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            user.status = user.status === 'active' ? 'inactive' : 'active';
            this.renderUsersTable(this.users);
            
            this.showNotification(
                `Пользователь ${user.firstName} ${user.lastName} ${user.status === 'active' ? 'активирован' : 'деактивирован'}`,
                'success'
            );
            
        } catch (error) {
            console.error('Ошибка изменения статуса пользователя:', error);
            this.showNotification('Ошибка изменения статуса', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (!confirm(`Вы уверены, что хотите удалить пользователя ${user.firstName} ${user.lastName}?`)) {
            return;
        }

        try {
            this.showLoading();
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            this.users = this.users.filter(u => u.id !== userId);
            this.renderUsersTable(this.users);
            
            this.showNotification(
                `Пользователь ${user.firstName} ${user.lastName} удален`,
                'success'
            );
            
        } catch (error) {
            console.error('Ошибка удаления пользователя:', error);
            this.showNotification('Ошибка удаления пользователя', 'error');
        } finally {
            this.hideLoading();
        }
    }

    exportUsers() {
        const csvContent = this.generateUsersCSV(this.users);
        this.downloadCSV(csvContent, 'users.csv');
        this.showNotification('Данные пользователей экспортированы', 'success');
    }

    generateUsersCSV(users) {
        const headers = ['ID', 'Имя', 'Фамилия', 'Табельный номер', 'Должность', 'Локация', 'Email', 'Статус', 'Роль', 'Дата регистрации'];
        const rows = users.map(user => [
            user.id,
            user.firstName,
            user.lastName,
            user.employeeId,
            this.getPositionLabel(user.position),
            this.getLocationLabel(user.location),
            user.email,
            this.getStatusLabel(user.status),
            user.role,
            user.registrationDate
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    showModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#DC3545' : type === 'success' ? '#28A745' : '#17A2B8'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);

        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    logout() {
        if (confirm('Вы уверены, что хотите выйти из системы?')) {
            localStorage.removeItem('adminToken');
            sessionStorage.clear();
            window.location.href = '/';
        }
    }
}

// Инициализация
let adminPanel;

// Инициализация админ-панели
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🚀 Инициализация админ-панели...');
        adminPanel = new AdminPanel();
        console.log('✅ Админ-панель успешно инициализирована');
    } catch (error) {
        console.error('❌ Ошибка инициализации админ-панели:', error);
        // Fallback - базовая функциональность
        setupBasicFunctionality();
    }
});

// Базовая функциональность если основной скрипт не работает
function setupBasicFunctionality() {
    console.log('🔧 Запуск базовой функциональности...');
    
    // Переключение вкладок
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const tab = item.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Мобильное меню
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('show');
        });
    }
    
    // Загрузка демо-данных
    loadDemoData();
}

function switchTab(tabName) {
    // Скрыть все вкладки
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убрать активный класс с навигации
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Показать нужную вкладку
    const targetTab = document.getElementById(`${tabName}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // Добавить активный класс к навигации
    const activeNav = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeNav) {
        activeNav.classList.add('active');
    }
}

function loadDemoData() {
    // Демо-данные для дашборда
    document.getElementById('totalUsers').textContent = '127';
    document.getElementById('totalRequests').textContent = '45';
    document.getElementById('pendingRequests').textContent = '12';
    document.getElementById('newNotifications').textContent = '3';
    
    console.log('✅ Демо-данные загружены');
}

// Стили для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .notification {
        font-family: 'Montserrat', sans-serif;
        font-weight: 500;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 15px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        opacity: 0.8;
    }
`;
document.head.appendChild(notificationStyles);