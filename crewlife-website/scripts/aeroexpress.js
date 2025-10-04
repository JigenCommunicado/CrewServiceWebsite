// Aeroexpress Form JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('aeroexpressForm');
    const nextStepBtn = document.getElementById('nextStepBtn');
    
    // Загружаем данные пользователя
    loadUserData();
    
    // Обработчик кнопки "Далее"
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Проверяем валидность формы
            if (validateForm()) {
                // Показываем уведомление об успешной отправке
                showSuccessMessage();
            }
        });
    }
    
    // Функция загрузки данных пользователя
    function loadUserData() {
        const userData = JSON.parse(localStorage.getItem('userData') || '{}');
        
        if (userData.fullName) {
            const fullNameInput = document.getElementById('fullName');
            if (fullNameInput) {
                fullNameInput.value = userData.fullName;
            }
        }
        
        if (userData.employeeId) {
            const employeeIdInput = document.getElementById('employeeId');
            if (employeeIdInput) {
                employeeIdInput.value = userData.employeeId;
            }
        }
    }
    
    // Функция валидации формы
    function validateForm() {
        const requiredFields = [
            'location',
            'department', 
            'position',
            'fullName',
            'employeeId'
        ];
        
        let isValid = true;
        
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            if (field) {
                if (!field.value.trim()) {
                    field.style.borderColor = '#FF4D4D';
                    isValid = false;
                } else {
                    field.style.borderColor = '#E0E0E0';
                }
            }
        });
        
        if (!isValid) {
            alert('Пожалуйста, заполните все обязательные поля');
        }
        
        return isValid;
    }
    
    // Функция показа сообщения об успехе
    function showSuccessMessage() {
        // Собираем данные формы
        const formData = {
            location: document.getElementById('location').value,
            department: document.getElementById('department').value,
            position: document.getElementById('position').value,
            fullName: document.getElementById('fullName').value,
            employeeId: document.getElementById('employeeId').value,
            timestamp: new Date().toISOString()
        };
        
        // Сохраняем данные в localStorage
        localStorage.setItem('aeroexpressRequest', JSON.stringify(formData));
        
        // Показываем уведомление
        alert('Заявка на заказ билета аэроэкспресса успешно отправлена!');
        
        // Перенаправляем на главную страницу
        window.location.href = '../index.html';
    }
    
    // Добавляем стили для валидации
    const style = document.createElement('style');
    style.textContent = `
        .form-input.error {
            border-color: #FF4D4D !important;
            box-shadow: 0 0 0 3px rgba(255, 77, 77, 0.1) !important;
        }
        
        .form-input.success {
            border-color: #4CAF50 !important;
            box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1) !important;
        }
    `;
    document.head.appendChild(style);
    
    // Добавляем обработчики для полей ввода
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim()) {
                this.classList.remove('error');
                this.classList.add('success');
            } else {
                this.classList.remove('success');
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required') && !this.value.trim()) {
                this.classList.add('error');
            }
        });
    });
});