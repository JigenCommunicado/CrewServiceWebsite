// Обработка страницы регистрации
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const homeBtn = document.getElementById('homeBtn');

    // Обработчик показа/скрытия пароля
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const currentType = passwordInput.getAttribute('type');
            const newType = currentType === 'password' ? 'text' : 'password';
            
            passwordInput.setAttribute('type', newType);
            
            // Меняем иконку
            const icon = passwordToggle.querySelector('svg');
            if (icon) {
                if (newType === 'text') {
                    // Иконка "скрыть пароль" (глаз с перечеркнутой линией)
                    icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';
                } else {
                    // Иконка "показать пароль" (обычный глаз)
                    icon.innerHTML = '<path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>';
                }
            }
        });
    }

    // Обработчик отправки формы регистрации
    if (registerForm) {
        console.log('Register form found:', registerForm);
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            const employeeId = document.getElementById('employeeId').value.trim();
            const fullName = document.getElementById('fullName').value.trim();
            const password = document.getElementById('password').value;
            const position = document.getElementById('position').value;
            const location = document.getElementById('location').value;
            
            // Валидация полей
            if (!validateForm()) {
                return;
            }
            
            // Добавляем эффект загрузки
            const registerBtn = registerForm.querySelector('.register-btn');
            const originalText = registerBtn.textContent;
            registerBtn.textContent = 'Регистрация...';
            registerBtn.classList.add('loading');
            registerBtn.disabled = true;
            
            // Регистрация через API
            const userData = {
                fullName: fullName,
                employeeId: employeeId,
                password: password,
                position: position,
                location: location
            };

            console.log('Registering user via API:', userData);
            
            // Проверяем доступность API клиента
            if (window.crewLifeAPI) {
                // Используем API для регистрации
                window.crewLifeAPI.register(userData).then(result => {
                    console.log('API registration result:', result);
                    registerBtn.textContent = originalText;
                    registerBtn.classList.remove('loading');
                    registerBtn.disabled = false;
                    
                    // Сохраняем токен авторизации
                    localStorage.setItem('authToken', result.token);
                    localStorage.setItem('userData', JSON.stringify(result.user));
                    
                    alert(`Успешная регистрация!\n\nДобро пожаловать в систему CrewLife, ${fullName}!\nВаш аккаунт успешно создан.`);
                    window.location.href = 'dashboard.html';
                }).catch(error => {
                    console.error('API registration error:', error);
                    registerBtn.textContent = originalText;
                    registerBtn.classList.remove('loading');
                    registerBtn.disabled = false;
                    alert(`Ошибка регистрации: ${error.message}`);
                });
            } else {
                // API клиент недоступен
                registerBtn.textContent = originalText;
                registerBtn.classList.remove('loading');
                registerBtn.disabled = false;
                alert('Ошибка: API клиент не загружен. Обновите страницу.');
            }
        });
    }

    // Обработчик кнопки "На главную"
    if (homeBtn) {
        homeBtn.addEventListener('click', function() {
            window.location.href = '../index.html';
        });
    }

    // Функция валидации формы
    function validateForm() {
        let isValid = true;
        
        // Валидация табельного номера
        const employeeId = document.getElementById('employeeId');
        const employeeIdValue = employeeId.value.trim();
        if (!employeeIdValue) {
            showFieldError(employeeId, 'Табельный номер обязателен');
            isValid = false;
        } else if (!/^\d+$/.test(employeeIdValue)) {
            showFieldError(employeeId, 'Табельный номер должен содержать только цифры');
            isValid = false;
        } else {
            clearFieldError(employeeId);
        }
        
        // Валидация ФИО
        const fullName = document.getElementById('fullName');
        const fullNameValue = fullName.value.trim();
        if (!fullNameValue) {
            showFieldError(fullName, 'ФИО обязательно');
            isValid = false;
        } else if (fullNameValue.split(' ').length < 3) {
            showFieldError(fullName, 'Введите полное ФИО (Имя Отчество Фамилия)');
            isValid = false;
        } else {
            clearFieldError(fullName);
        }
        
        // Валидация пароля
        const password = document.getElementById('password');
        const passwordValue = password.value;
        if (!passwordValue) {
            showFieldError(password, 'Пароль обязателен');
            isValid = false;
        } else if (passwordValue.length < 8) {
            showFieldError(password, 'Пароль должен содержать минимум 8 символов');
            isValid = false;
        } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(passwordValue)) {
            showFieldError(password, 'Пароль должен содержать буквы и цифры');
            isValid = false;
        } else {
            clearFieldError(password);
        }
        
        // Валидация должности
        const position = document.getElementById('position');
        const positionValue = position.value;
        if (!positionValue) {
            showFieldError(position, 'Выберите должность');
            isValid = false;
        } else {
            clearFieldError(position);
        }
        
        // Валидация локации
        const location = document.getElementById('location');
        const locationValue = location.value;
        if (!locationValue) {
            showFieldError(location, 'Выберите локацию');
            isValid = false;
        } else {
            clearFieldError(location);
        }
        
        return isValid;
    }

    function showFieldError(field, message) {
        clearFieldError(field);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        
        field.classList.add('error');
        field.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.classList.remove('error');
    }

    // Валидация полей в реальном времени
    const inputs = document.querySelectorAll('.form-input, .form-select');
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
        const fieldName = field.previousElementSibling ? field.previousElementSibling.textContent : 'Поле';
        
        if (!value) {
            showFieldError(field, `${fieldName} обязательно`);
            return false;
        }
        
        if (field.id === 'employeeId' && !/^\d+$/.test(value)) {
            showFieldError(field, 'Табельный номер должен содержать только цифры');
            return false;
        }
        
        if (field.id === 'fullName' && value.split(' ').length < 3) {
            showFieldError(field, 'Введите полное ФИО (Имя Отчество Фамилия)');
            return false;
        }
        
        if (field.id === 'password' && value.length < 8) {
            showFieldError(field, 'Пароль должен содержать минимум 8 символов');
            return false;
        }
        
        clearFieldError(field);
        return true;
    }

    // Анимация появления формы
    const formContainer = document.querySelector('.register-form-container');
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

    // Автофокус на первое поле
    const firstInput = document.getElementById('employeeId');
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
    if (headerTitle && headerTitle.textContent) {
        const originalText = headerTitle.textContent;
        typeWriter(headerTitle, originalText, 150);
    }

    // Анимация для select элементов
    const selects = document.querySelectorAll('.form-select');
    selects.forEach(select => {
        select.addEventListener('change', function() {
            if (this.value) {
                this.style.color = '#333333';
            } else {
                this.style.color = '#999999';
            }
        });
    });
});