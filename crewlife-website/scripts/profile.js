// JavaScript для страницы профиля CrewLife
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const userNameElement = document.getElementById('userName');
    const profileNameElement = document.getElementById('profileName');
    const profilePositionElement = document.getElementById('profilePosition');
    const profileLocationElement = document.getElementById('profileLocation');
    const totalRequestsElement = document.getElementById('totalRequests');
    const memberSinceElement = document.getElementById('memberSince');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Формы
    const personalForm = document.getElementById('personalForm');
    const securityForm = document.getElementById('securityForm');

    // Табы настроек
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const settingsContents = document.querySelectorAll('.settings-content');

    // Элементы форм
    const fullNameInput = document.getElementById('fullName');
    const employeeIdInput = document.getElementById('employeeId');
    const positionDisplay = document.getElementById('positionDisplay');
    const locationDisplay = document.getElementById('locationDisplay');
    const currentPasswordInput = document.getElementById('currentPassword');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordStrengthElement = document.getElementById('passwordStrength');




    // Данные пользователя
    let currentUser = null;
    let userSettings = {};

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
        
        // Загружаем настройки
        await loadUserSettings();
        
        // Настраиваем обработчики событий
        setupEventListeners();
        
        // Загружаем статистику
        await loadUserStats();
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
            // Обновляем отображение
            userNameElement.textContent = currentUser.fullName || 'Пользователь';
            profileNameElement.textContent = currentUser.fullName || 'Пользователь';
            profilePositionElement.textContent = currentUser.position || 'Должность';
            profileLocationElement.textContent = currentUser.location || 'Локация';
            
            // Заполняем форму
            fullNameInput.value = currentUser.fullName || '';
            employeeIdInput.value = currentUser.employeeId || currentUser.username || '';
            positionDisplay.value = getPositionDisplayName(currentUser.position) || '';
            locationDisplay.value = currentUser.location || '';
        }
    }

    // Функция для получения читаемого названия должности
    function getPositionDisplayName(positionCode) {
        const positionMap = {
            'БП': 'Бортпроводник (БП)',
            'БП BS': 'Бортпроводник BS (БП BS)',
            'СБЭ': 'Старший бортпроводник-экипажа (СБЭ)',
            'ИПБ': 'Инструктор-проводник бортовой (ИПБ)'
        };
        return positionMap[positionCode] || positionCode;
    }

    // Загрузка настроек пользователя
    async function loadUserSettings() {
        try {
            // Загружаем настройки из localStorage
            const savedSettings = localStorage.getItem('userSettings');
            if (savedSettings) {
                userSettings = JSON.parse(savedSettings);
            } else {
            }
            
            
        } catch (error) {
            console.error('Ошибка загрузки настроек:', error);
        }
    }

    // Применение настроек

    // Загрузка статистики пользователя
    async function loadUserStats() {
        try {
            // Симулируем загрузку статистики
            const stats = await simulateUserStats();
            
            // Обновляем отображение
            totalRequestsElement.textContent = stats.totalRequests;
            memberSinceElement.textContent = stats.memberSince;
            
            // Обновляем статистику активности
            updateActivityStats(stats);
            
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }

    // Симуляция статистики пользователя
    async function simulateUserStats() {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        return {
            totalRequests: Math.floor(Math.random() * 50) + 10,
            memberSince: Math.floor(Math.random() * 365) + 30,
            monthlyRequests: Math.floor(Math.random() * 20) + 5,
            avgResponseTime: Math.floor(Math.random() * 48) + 2,
            approvalRate: Math.floor(Math.random() * 30) + 70
        };
    }

    // Обновление статистики активности
    function updateActivityStats(stats) {
        document.getElementById('monthlyRequests').textContent = stats.monthlyRequests;
        document.getElementById('avgResponseTime').textContent = stats.avgResponseTime + ' ч';
        document.getElementById('approvalRate').textContent = stats.approvalRate + '%';
        
        // Создаем простой график активности
        createActivityChart(stats);
    }

    // Создание графика активности
    function createActivityChart(stats) {
        const canvas = document.getElementById('activityChart');
        const ctx = canvas.getContext('2d');
        
        // Очищаем canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Простой график активности за последние 7 дней
        const data = Array.from({length: 7}, () => Math.floor(Math.random() * 10) + 1);
        const maxValue = Math.max(...data);
        
        ctx.strokeStyle = '#FF4D4D';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = (index / (data.length - 1)) * (canvas.width - 40) + 20;
            const y = canvas.height - 20 - (value / maxValue) * (canvas.height - 40);
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Добавляем точки
        ctx.fillStyle = '#FF4D4D';
        data.forEach((value, index) => {
            const x = (index / (data.length - 1)) * (canvas.width - 40) + 20;
            const y = canvas.height - 20 - (value / maxValue) * (canvas.height - 40);
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Навигация
        dashboardBtn.addEventListener('click', function() {
            window.location.href = 'dashboard.html';
        });

        logoutBtn.addEventListener('click', logout);

        // Табы настроек
        settingsTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.dataset.tab;
                switchTab(targetTab);
            });
        });

        // Формы
        personalForm.addEventListener('submit', handlePersonalFormSubmit);
        securityForm.addEventListener('submit', handleSecurityFormSubmit);



        // Валидация пароля
        newPasswordInput.addEventListener('input', validatePassword);
        confirmPasswordInput.addEventListener('input', validatePasswordConfirmation);
    }

    // Переключение табов
    function switchTab(tabName) {
        // Убираем активный класс со всех табов и контента
        settingsTabs.forEach(tab => tab.classList.remove('active'));
        settingsContents.forEach(content => content.classList.remove('active'));

        // Активируем выбранный таб и контент
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`${tabName}Tab`).classList.add('active');
    }

    // Обработка отправки формы личных данных
    async function handlePersonalFormSubmit(e) {
        e.preventDefault();
        
        try {
            showLoading();
            
            // Собираем данные формы
            const formData = new FormData(personalForm);
            const personalData = {
                fullName: formData.get('fullName'),
                position: formData.get('position'),
                location: formData.get('location'),
                email: formData.get('email'),
                phone: formData.get('phone')
            };
            
            // Обновляем данные пользователя
            currentUser = { ...currentUser, ...personalData };
            localStorage.setItem('userData', JSON.stringify(currentUser));
            
            // Обновляем отображение
            await loadUserData();
            
            // Показываем уведомление
            if (window.CrewLife) {
                console.log('Личные данные успешно обновлены');
            }
            
        } catch (error) {
            console.error('Ошибка сохранения личных данных:', error);
            if (window.CrewLife) {
                console.error('Ошибка сохранения данных');
            }
        } finally {
            hideLoading();
        }
    }

    // Обработка отправки формы безопасности
    async function handleSecurityFormSubmit(e) {
        e.preventDefault();
        
        try {
            showLoading();
            
            const formData = new FormData(securityForm);
            const currentPassword = formData.get('currentPassword');
            const newPassword = formData.get('newPassword');
            const confirmPassword = formData.get('confirmPassword');
            
            // Валидация
            if (newPassword !== confirmPassword) {
                throw new Error('Пароли не совпадают');
            }
            
            if (newPassword.length < 6) {
                throw new Error('Пароль должен содержать минимум 6 символов');
            }
            
            // Симулируем смену пароля
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Очищаем форму
            securityForm.reset();
            
            // Показываем уведомление
            if (window.CrewLife) {
                console.log('Пароль успешно изменен');
            }
            
        } catch (error) {
            console.error('Ошибка смены пароля:', error);
            if (window.CrewLife) {
                console.error(error.message);
            }
        } finally {
            hideLoading();
        }
    }



    // Валидация пароля
    function validatePassword() {
        const password = newPasswordInput.value;
        const strength = calculatePasswordStrength(password);
        
        passwordStrengthElement.className = `password-strength ${strength}`;
    }

    // Валидация подтверждения пароля
    function validatePasswordConfirmation() {
        const password = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword && password !== confirmPassword) {
            confirmPasswordInput.style.borderColor = '#DC3545';
        } else {
            confirmPasswordInput.style.borderColor = '#E0E0E0';
        }
    }

    // Расчет силы пароля
    function calculatePasswordStrength(password) {
        let score = 0;
        if (password.length >= 6) score += 1;
        if (password.length >= 8) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/\d/.test(password)) score += 1;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

        if (score <= 2) return 'weak';
        if (score <= 4) return 'medium';
        return 'strong';
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
});
