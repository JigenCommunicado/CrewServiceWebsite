// Обработка страницы входа
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerLink = document.getElementById('registerLink');
    const homeBtn = document.getElementById('homeBtn');
    const modal = document.getElementById('notificationModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalClose = document.getElementById('modalClose');
    const modalOk = document.getElementById('modalOk');

    // Обработчик отправки формы входа
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Добавляем эффект загрузки
            const loginBtn = loginForm.querySelector('.login-btn');
            const originalText = loginBtn.textContent;
            loginBtn.textContent = 'Вход...';
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
            
            // Симулируем процесс входа
            setTimeout(async () => {
                loginBtn.textContent = originalText;
                loginBtn.classList.remove('loading');
                loginBtn.disabled = false;
                
                // Авторизация через API
                console.log('Проверка учетных данных:', username, password);
                
                // Проверяем доступность API
                const isAPIAvailable = await window.crewLifeAPI.checkConnection();
                
                if (isAPIAvailable) {
                    // Используем API
                    try {
                        const result = await window.crewLifeAPI.login(username, password);
                        
                        // Сохраняем данные пользователя
                        localStorage.setItem('userData', JSON.stringify(result.user));
                        
                        console.log('Пользователь авторизован через API:', result.user);
                        
                        // Показываем уведомление
                        console.log(`Добро пожаловать в систему CrewLife, ${result.user.fullName}!`);
                        
                        // Принудительное перенаправление через 2 секунды
                        setTimeout(() => {
                            console.log('Перенаправляем на dashboard.html');
                            window.location.href = 'dashboard.html';
                        }, 2000);
                    } catch (error) {
                        console.error('Ошибка API авторизации:', error);
                        alert(error.message || 'Неверный логин или пароль. Попробуйте еще раз.');
                    }
                } else {
                    // Fallback на локальную базу данных
                    console.log('API недоступен, используем локальную базу данных');
                    window.userDB.authenticateUser(username, password).then(result => {
                        if (result.success) {
                            // Сохраняем данные пользователя
                            localStorage.setItem('userData', JSON.stringify(result.user));
                            localStorage.setItem('authToken', 'user_token_' + Date.now());
                            
                            console.log('Пользователь авторизован через локальную БД:', result.user);
                            
                            // Показываем уведомление
                            console.log(`Добро пожаловать в систему CrewLife, ${result.user.fullName}!`);
                            
                            // Принудительное перенаправление через 2 секунды
                            setTimeout(() => {
                                console.log('Перенаправляем на dashboard.html');
                                window.location.href = 'dashboard.html';
                            }, 2000);
                        } else {
                            // Неверные учетные данные
                            alert(result.error || 'Неверный логин или пароль. Попробуйте еще раз.');
                        }
                    }).catch(error => {
                        console.error('Ошибка локальной авторизации:', error);
                        alert('Произошла ошибка при входе. Попробуйте еще раз.');
                    });
                }
            }, 2000);
        });
    }

    // Обработчик ссылки регистрации
    if (registerLink) {
        registerLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'register.html';
        });
    }

    // Обработчик кнопки "На главную"
    if (homeBtn) {
        homeBtn.addEventListener('click', function() {
            window.location.href = 'crewlife.html';
        });
    }

    // Функция показа модального окна
    function showModal(title, message) {
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Анимация появления
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    }

    // Функция скрытия модального окна
    function hideModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }

    // Обработчики закрытия модального окна
    if (modalClose) {
        modalClose.addEventListener('click', hideModal);
    }
    
    if (modalOk) {
        modalOk.addEventListener('click', hideModal);
    }

    // Закрытие по клику вне модального окна
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                hideModal();
            }
        });
    }

    // Закрытие по нажатию Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            hideModal();
        }
    });

    // Анимация появления формы
    const formContainer = document.querySelector('.login-form-container');
    if (formContainer) {
        formContainer.style.opacity = '0';
        formContainer.style.transform = 'translateY(30px)';
        
        setTimeout(() => {
            formContainer.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            formContainer.style.opacity = '1';
            formContainer.style.transform = 'translateY(0)';
        }, 300);
    }

    // Анимация появления заголовочного блока
    const headerContent = document.querySelector('.header-content');
    if (headerContent) {
        headerContent.style.opacity = '0';
        headerContent.style.transform = 'translateY(-30px)';
        
        setTimeout(() => {
            headerContent.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            headerContent.style.opacity = '1';
            headerContent.style.transform = 'translateY(0)';
        }, 100);
    }

    // Валидация полей в реальном времени
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });

    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.previousElementSibling.textContent;
        
        if (!value) {
            showFieldError(field, `${fieldName} не может быть пустым`);
            return false;
        }
        
        if (field.type === 'password' && value.length < 3) {
            showFieldError(field, 'Пароль должен содержать минимум 3 символа');
            return false;
        }
        
        clearFieldError(field);
        return true;
    }

    function showFieldError(field, message) {
        clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#FF4D4D';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '5px';
        
        field.style.borderColor = '#FF4D4D';
        field.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.style.borderColor = '#E0E0E0';
    }

    // Автофокус на первое поле
    const firstInput = document.getElementById('username');
    if (firstInput) {
        setTimeout(() => {
            firstInput.focus();
        }, 500);
    }

    // Обработка Enter в полях
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const form = this.closest('form');
                if (form) {
                    form.dispatchEvent(new Event('submit'));
                }
            }
        });
    });

    // Эффект печатания для заголовка
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // Применяем эффект печатания к заголовку
    const headerTitle = document.querySelector('.header-title');
    if (headerTitle) {
        const originalText = headerTitle.textContent;
        typeWriter(headerTitle, originalText, 150);
    }
});
