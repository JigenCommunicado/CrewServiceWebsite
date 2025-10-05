// Обработка кнопок запросов
document.addEventListener('DOMContentLoaded', function() {
    const requestButtons = document.querySelectorAll('.request-btn');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileMenuClose = document.getElementById('mobileMenuClose');
    const mobileLoginLink = document.getElementById('mobileLoginLink');
    const mobileRegisterLink = document.getElementById('mobileRegisterLink');
    const mobileDashboardLink = document.getElementById('mobileDashboardLink');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const scrollToTopBtn = document.getElementById('scrollToTop');

    // Словарь для типов запросов
    const requestTypes = {
        'flight': {
            title: 'Заказ рейса',
            message: 'Ваш заказ рейса успешно отправлен! Мы обработаем его в течение 24 часов и уведомим вас о результате.'
        },
        'aeroexpress': {
            title: 'Заказ билета на аэроэкспресс',
            message: 'Ваш заказ билета на аэроэкспресс успешно отправлен! Информация о расписании будет предоставлена в ближайшее время.'
        },
        'hotel': {
            title: 'Заказ гостиницы',
            message: 'Ваш заказ гостиницы успешно отправлен! Мы подберем для вас лучшие варианты размещения.'
        },
        'weekend': {
            title: 'Заказ выходных дней',
            message: 'Ваш заказ выходных дней успешно отправлен! График работы будет скорректирован с учетом ваших пожеланий.'
        }
    };

    // Проверка авторизации при загрузке страницы
    checkAuthStatus();

    // Обработчики для кнопок входа и регистрации (временно отключены)
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Временно отключено
            return false;
        });
    }

    // registerBtn теперь ссылка, не нужен обработчик

    if (dashboardBtn) {
        dashboardBtn.addEventListener('click', function() {
            window.location.href = 'pages/dashboard.html';
        });
    }

    // Мобильное меню
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            toggleMobileMenu();
        });
    }

    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', function() {
            closeMobileMenu();
        });
    }

    if (mobileLoginLink) {
        mobileLoginLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Временно отключено
            return false;
        });
    }

    if (mobileRegisterLink) {
        mobileRegisterLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            // Временно отключено
            return false;
        });
    }

    if (mobileDashboardLink) {
        mobileDashboardLink.addEventListener('click', function(e) {
            e.preventDefault();
            closeMobileMenu();
            window.location.href = 'pages/dashboard.html';
        });
    }

    // Закрытие мобильного меню при клике вне его
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function(e) {
            if (e.target === mobileMenu) {
                closeMobileMenu();
            }
        });
    }

    // Функция проверки статуса авторизации
    function checkAuthStatus() {
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        if (authToken && userData) {
            // Пользователь авторизован
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            dashboardBtn.style.display = 'inline-block';
            mobileLoginLink.style.display = 'none';
            mobileRegisterLink.style.display = 'none';
            mobileDashboardLink.style.display = 'block';
        } else {
            // Пользователь не авторизован
            loginBtn.style.display = 'inline-block';
            registerBtn.style.display = 'inline-block';
            dashboardBtn.style.display = 'none';
            mobileLoginLink.style.display = 'block';
            mobileRegisterLink.style.display = 'block';
            mobileDashboardLink.style.display = 'none';
        }
    }

    // Функции мобильного меню
    function toggleMobileMenu() {
        if (mobileMenu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    function openMobileMenu() {
        mobileMenu.style.display = 'block';
        mobileMenu.classList.add('active');
        mobileMenuBtn.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Анимация появления
        setTimeout(() => {
            mobileMenu.style.opacity = '1';
        }, 10);
    }

    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
        document.body.style.overflow = 'auto';
        
        // Скрываем меню после анимации
        setTimeout(() => {
            mobileMenu.style.display = 'none';
        }, 300);
    }

    // Обработчики событий для кнопок запросов
    requestButtons.forEach(button => {
        button.addEventListener('click', function() {
            const requestType = this.getAttribute('data-type');
            
            // Пропускаем обработку для ссылок (они имеют href)
            if (button.tagName === 'A') {
                return;
            }
            
            const requestData = requestTypes[requestType];
            
            if (requestData) {
                // Показываем индикатор загрузки
                showLoading();
                
                // Симулируем обработку запроса
                setTimeout(() => {
                    hideLoading();
                    
                    // Используем новую систему уведомлений
                    if (window.CrewLife) {
                        window.CrewLife.showNotification(requestData.message, 'success');
                    } else {
                        // Fallback к простому уведомлению
                        alert(requestData.message);
                    }
                }, 2000);
            }
        });

        // Добавляем эффект нажатия
        button.addEventListener('mousedown', function() {
            this.style.transform = 'translateY(-2px) scale(0.98)';
        });

        button.addEventListener('mouseup', function() {
            this.style.transform = 'translateY(-5px) scale(1)';
        });

        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Функция показа модального окна




    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Анимация появления элементов при прокрутке
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Наблюдаем за карточками преимуществ
    document.querySelectorAll('.advantage-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });

    // Наблюдаем за кнопками запросов
    document.querySelectorAll('.request-btn').forEach(btn => {
        btn.style.opacity = '0';
        btn.style.transform = 'translateY(30px)';
        btn.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(btn);
    });

    // Добавляем эффект параллакса для hero секции
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        
        if (hero && heroContent) {
            const rate = scrolled * -0.5;
            heroContent.style.transform = `translateY(${rate}px)`;
        }
    });

    // Добавляем интерактивность для карточек преимуществ
    document.querySelectorAll('.advantage-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Добавляем звуковые эффекты (опционально)
    function playClickSound() {
        // Создаем простой звуковой эффект
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // Добавляем звук к кнопкам (можно отключить)
    // requestButtons.forEach(button => {
    //     button.addEventListener('click', playClickSound);
    // });

    // Добавляем анимацию клика для кнопок (только для не-ссылок)
    requestButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Для ссылок добавляем только анимацию клика
            if (button.tagName === 'A') {
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 150);
                return; // Разрешаем переход по ссылке
            }
            
            // Для кнопок (не ссылок) - показываем индикатор загрузки
            const originalText = this.querySelector('.btn-text').textContent;
            const btnText = this.querySelector('.btn-text');
            
            // Показываем индикатор загрузки
            btnText.textContent = 'Отправка...';
            this.style.pointerEvents = 'none';
            
            // Симулируем задержку отправки
            setTimeout(() => {
                btnText.textContent = originalText;
                this.style.pointerEvents = 'auto';
            }, 1000);
        });
    });

    // Добавляем эффект печатания для заголовка
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

    // Применяем эффект печатания к заголовку при загрузке
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        typeWriter(heroTitle, originalText, 150);
    }

    // Функции для индикатора загрузки
    function showLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    // Анимация статистики
    function animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'));
            const duration = 2000; // 2 секунды
            const increment = target / (duration / 16); // 60 FPS
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = Math.floor(current).toLocaleString('ru-RU');
            }, 16);
        });
    }

    // Загрузка данных статистики из базы данных
    async function loadStatsData() {
        try {
            // Используем API для получения данных
            const statsData = await window.CrewLifeAPI.getStats();
            
            // Обновляем значения
            const usersCountElement = document.getElementById('usersCount');
            const requestsCountElement = document.getElementById('requestsCount');
            
            if (usersCountElement) {
                usersCountElement.setAttribute('data-target', statsData.users);
                usersCountElement.textContent = '0';
            }
            
            if (requestsCountElement) {
                requestsCountElement.setAttribute('data-target', statsData.requests);
                requestsCountElement.textContent = '0';
            }
            
            // Запускаем анимацию после обновления данных
            setTimeout(() => {
                animateStats();
            }, 100);
            
            // Показываем уведомление об успешной загрузке
            if (window.CrewLife) {
                window.CrewLife.showNotification('Статистика обновлена', 'success', 2000);
            }
            
        } catch (error) {
            // Показываем уведомление об ошибке
            if (window.CrewLife) {
                window.CrewLife.showNotification('Ошибка загрузки статистики', 'error');
            }
        }
    }

    // Обновление статистики в реальном времени
    function updateStatsInRealTime() {
        // Обновляем статистику каждые 30 секунд
        setInterval(async () => {
            try {
                const statsData = await window.CrewLifeAPI.getStats();
                
                const usersCountElement = document.getElementById('usersCount');
                const requestsCountElement = document.getElementById('requestsCount');
                
                if (usersCountElement) {
                    const currentUsers = parseInt(usersCountElement.getAttribute('data-target'));
                    const newUsers = statsData.users;
                    
                    if (newUsers !== currentUsers) {
                        usersCountElement.setAttribute('data-target', newUsers);
                        animateSingleStat(usersCountElement, currentUsers, newUsers);
                    }
                }
                
                if (requestsCountElement) {
                    const currentRequests = parseInt(requestsCountElement.getAttribute('data-target'));
                    const newRequests = statsData.requests;
                    
                    if (newRequests !== currentRequests) {
                        requestsCountElement.setAttribute('data-target', newRequests);
                        animateSingleStat(requestsCountElement, currentRequests, newRequests);
                    }
                }
                
            } catch (error) {
                // Ошибка обновления статистики
            }
        }, 30000); // 30 секунд
    }

    // Анимация отдельного счетчика
    function animateSingleStat(element, from, to) {
        const duration = 1000; // 1 секунда
        const increment = (to - from) / (duration / 16); // 60 FPS
        let current = from;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= to) || (increment < 0 && current <= to)) {
                current = to;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current).toLocaleString('ru-RU');
        }, 16);
    }

    // Обработчик кнопки "Наверх"
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // Показ/скрытие кнопки "Наверх" при прокрутке
    window.addEventListener('scroll', function() {
        if (scrollToTopBtn) {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('show');
            } else {
                scrollToTopBtn.classList.remove('show');
            }
        }
    });

    // Загрузка и анимация статистики при появлении в поле зрения
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadStatsData();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statsObserver.observe(statsSection);
    }

    // Запускаем обновление статистики в реальном времени
    updateStatsInRealTime();

    // Улучшенная анимация появления элементов
    const animatedElements = document.querySelectorAll('.advantage-card, .request-btn, .stat-item');
    animatedElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        element.style.transitionDelay = `${index * 0.1}s`;
    });

    // Наблюдатель для анимации элементов
    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    animatedElements.forEach(element => {
        animationObserver.observe(element);
    });

    // Добавляем эффект печатания к подзаголовку
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (heroSubtitle) {
        setTimeout(() => {
            const originalText = heroSubtitle.textContent;
            typeWriter(heroSubtitle, originalText, 50);
        }, 1000);
    }

    // Улучшенные эффекты для карточек преимуществ
    document.querySelectorAll('.advantage-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 25px 50px rgba(0, 0, 0, 0.15)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.08)';
        });
    });

    // Добавляем звуковые эффекты (опционально)
    function playNotificationSound() {
        if (window.CrewLife && window.CrewLife.storage.get('soundEnabled', true)) {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        }
    }

    // Применяем звуковой эффект к кнопкам (только для не-ссылок)
    requestButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Для ссылок не воспроизводим звук, чтобы не мешать переходам
            if (button.tagName === 'A') {
                return;
            }
            playNotificationSound();
        });
    });
});

// Добавляем поддержку сенсорных устройств
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function() {}, true);
}

// Оптимизация производительности
let ticking = false;

function updateAnimations() {
    // Здесь можно добавить дополнительные анимации
    ticking = false;
}

function requestTick() {
    if (!ticking) {
        requestAnimationFrame(updateAnimations);
        ticking = true;
    }
}

window.addEventListener('scroll', requestTick);

// Функции для формы заказа рейса
let currentStep = 1;
const totalSteps = 3;

// Переменные для календаря
let currentDate = new Date();
let selectedDate = null;
let calendarVisible = false;


function resetFlightForm() {
    currentStep = 1;
    document.getElementById('flightBookingForm').reset();
    
    // Скрываем все шаги
    document.querySelectorAll('.form-step').forEach(step => {
        step.classList.remove('active');
    });
    
    // Показываем первый шаг
    document.getElementById('step1').classList.add('active');
    
    // Обновляем кнопки
    updateStepButtons();
    
    // Загружаем данные пользователя если авторизован
    loadUserData();
}

function loadUserData() {
    // Проверяем, есть ли данные пользователя в localStorage
    const userData = localStorage.getItem('userData');
    if (userData) {
        try {
            const user = JSON.parse(userData);
            document.getElementById('fullName').value = user.fullName || '';
            document.getElementById('employeeId').value = user.employeeId || '';
        } catch (e) {
            // Ошибка загрузки данных пользователя
        }
    }
}

function updateStepButtons() {
    const prevBtn = document.getElementById('prevStep');
    const nextBtn = document.getElementById('nextStep');
    const submitBtn = document.getElementById('submitFlight');
    const editBtn = document.getElementById('editFlight');
    
    // Скрываем все кнопки
    prevBtn.style.display = 'none';
    nextBtn.style.display = 'none';
    submitBtn.style.display = 'none';
    editBtn.style.display = 'none';
    
    if (currentStep === 1) {
        nextBtn.style.display = 'inline-block';
    } else if (currentStep === 2) {
        prevBtn.style.display = 'inline-block';
        nextBtn.style.display = 'inline-block';
    } else if (currentStep === 3) {
        prevBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
        editBtn.style.display = 'inline-block';
    }
}

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

function fillConfirmationData() {
    const formData = new FormData(document.getElementById('flightBookingForm'));
    
    document.getElementById('summaryLocation').textContent = formData.get('location') || '';
    document.getElementById('summaryDivision').textContent = formData.get('division') || '';
    document.getElementById('summaryPosition').textContent = formData.get('position') || '';
    document.getElementById('summaryFullName').textContent = formData.get('fullName') || '';
    document.getElementById('summaryEmployeeId').textContent = formData.get('employeeId') || '';
    document.getElementById('summaryDirection').textContent = formData.get('direction') || '';
    
    // Форматируем дату
    const departureDate = formData.get('departureDate');
    if (departureDate) {
        const date = new Date(departureDate);
        document.getElementById('summaryDepartureDate').textContent = date.toLocaleDateString('ru-RU');
    } else {
        document.getElementById('summaryDepartureDate').textContent = '';
    }
    
    // Пожелания
    const wishes = formData.get('wishes');
    document.getElementById('summaryWishes').textContent = wishes || 'отсутствуют';
}

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
    
    // Сохраняем в localStorage (в реальном приложении здесь будет API вызов)
    let applications = JSON.parse(localStorage.getItem('applications') || '[]');
    applications.push(flightData);
    localStorage.setItem('applications', JSON.stringify(applications));
    
    // Закрываем форму заказа
    closeFlightBookingModal();
    
    // Показываем модальное окно успеха
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.add('show');
    }
}

function editFlightData() {
    // Возвращаемся к первому шагу для редактирования
    currentStep = 1;
    document.querySelector('.form-step.active').classList.remove('active');
    document.getElementById('step1').classList.add('active');
    updateStepButtons();
}

function goToDashboard() {
    // Закрываем модальное окно успеха
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.remove('show');
    }
    
    // Переходим в панель управления
    window.location.href = 'dashboard.html';
}


// Функции для кастомного календаря
function initCalendar() {
    const datePickerBtn = document.getElementById('datePickerBtn');
    const customCalendar = document.getElementById('customCalendar');
    const departureDateInput = document.getElementById('departureDate');
    
    if (datePickerBtn && customCalendar) {
        datePickerBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleCalendar();
        });
        
        // Закрываем календарь при клике вне его
        document.addEventListener('click', function(e) {
            if (!customCalendar.contains(e.target) && !datePickerBtn.contains(e.target)) {
                hideCalendar();
            }
        });
        
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
                departureDateInput.value = '';
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

// Обработчики событий для формы заказа рейса
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем календарь
    initCalendar();
    
    
    // Кнопки навигации по шагам
    const nextStepBtn = document.getElementById('nextStep');
    if (nextStepBtn) {
        nextStepBtn.addEventListener('click', nextStep);
    }
    
    const prevStepBtn = document.getElementById('prevStep');
    if (prevStepBtn) {
        prevStepBtn.addEventListener('click', prevStep);
    }
    
    // Кнопки отправки и редактирования
    const submitFlightBtn = document.getElementById('submitFlight');
    if (submitFlightBtn) {
        submitFlightBtn.addEventListener('click', submitFlightBooking);
    }
    
    const editFlightBtn = document.getElementById('editFlight');
    if (editFlightBtn) {
        editFlightBtn.addEventListener('click', editFlightData);
    }
    
    // Кнопка перехода в панель управления
    const goToDashboardBtn = document.getElementById('goToDashboard');
    if (goToDashboardBtn) {
        goToDashboardBtn.addEventListener('click', goToDashboard);
    }
    
    // Закрытие модальных окон по клику вне их
    
    // Анимация появления элементов при скролле
    initScrollAnimations();
    
    // Инициализация FAQ
    initFAQ();
    
    // Анимация счетчиков статистики
    initStatsAnimation();
    
    // Эффект печатающегося текста
    initTypingEffect();
    
    // Оптимизация для медленных соединений
    initPerformanceOptimizations();
});

// Функция для инициализации анимаций при скролле
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Отключаем наблюдение после анимации для оптимизации
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами, которые должны анимироваться
    const animatedElements = document.querySelectorAll('.advantage-card, .stat-item, .request-btn, .testimonial-card');
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// Функция для инициализации FAQ
function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const faqId = this.getAttribute('data-faq');
            const answer = document.getElementById(`faq-${faqId}`);
            
            // Закрываем все открытые ответы
            faqQuestions.forEach(q => {
                if (q !== this) {
                    q.classList.remove('active');
                    const otherFaqId = q.getAttribute('data-faq');
                    const otherAnswer = document.getElementById(`faq-${otherFaqId}`);
                    if (otherAnswer) {
                        otherAnswer.classList.remove('active');
                    }
                }
            });
            
            // Переключаем текущий ответ
            this.classList.toggle('active');
            if (answer) {
                answer.classList.toggle('active');
            }
        });
    });
}

// Функция для анимации счетчиков статистики
function initStatsAnimation() {
    const usersCountEl = document.getElementById('usersCount');
    const requestsCountEl = document.getElementById('requestsCount');
    
    if (!usersCountEl || !requestsCountEl) return;
    
    // Симулируем данные статистики
    const statsData = {
        users: 1247,
        requests: 8934
    };
    
    // Анимация счетчика пользователей
    animateCounter(usersCountEl, statsData.users, 2000);
    
    // Анимация счетчика заявок
    animateCounter(requestsCountEl, statsData.requests, 2500);
}

// Функция анимации счетчика с оптимизацией
function animateCounter(element, targetValue, duration) {
    const startValue = 0;
    const increment = targetValue / (duration / 16); // 60 FPS
    let currentValue = startValue;
    let animationId;
    
    function updateCounter() {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            element.textContent = Math.floor(currentValue).toLocaleString();
            return;
        }
        element.textContent = Math.floor(currentValue).toLocaleString();
        animationId = requestAnimationFrame(updateCounter);
    }
    
    animationId = requestAnimationFrame(updateCounter);
}

// Функция эффекта печатающегося текста
function initTypingEffect() {
    const heroSubtitle = document.querySelector('.hero-subtitle');
    if (!heroSubtitle) return;
    
    const originalText = heroSubtitle.textContent;
    const texts = [
        "Ваши запросы — наш приоритет. Просто и быстро.",
        "Современная система подачи заявок для бортпроводников",
        "Быстро, удобно, надежно"
    ];
    
    let currentTextIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;
    
    function typeText() {
        const currentText = texts[currentTextIndex];
        
        if (isDeleting) {
            heroSubtitle.textContent = currentText.substring(0, currentCharIndex - 1);
            currentCharIndex--;
        } else {
            heroSubtitle.textContent = currentText.substring(0, currentCharIndex + 1);
            currentCharIndex++;
        }
        
        let typeSpeed = isDeleting ? 50 : 100;
        
        if (!isDeleting && currentCharIndex === currentText.length) {
            typeSpeed = 2000; // Пауза в конце
            isDeleting = true;
        } else if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            currentTextIndex = (currentTextIndex + 1) % texts.length;
            typeSpeed = 500; // Пауза перед новым текстом
        }
        
        setTimeout(typeText, typeSpeed);
    }
    
    // Запускаем эффект через 1 секунду после загрузки
    setTimeout(typeText, 1000);
}

// Функция оптимизации производительности
function initPerformanceOptimizations() {
    // Определяем медленное соединение
    if (navigator.connection && navigator.connection.effectiveType) {
        const connectionType = navigator.connection.effectiveType;
        if (connectionType === 'slow-2g' || connectionType === '2g') {
            document.body.classList.add('slow-connection');
        }
    }
    
    // Определяем сенсорное устройство
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.body.classList.add('touch-device');
    }
    
    // Оптимизация для пользователей с предпочтением reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.body.classList.add('reduced-motion');
    }
    
    // Дебаунсинг для событий скролла
    let scrollTimeout;
    window.addEventListener('scroll', function() {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(function() {
            // Обработка скролла
        }, 16);
    }, { passive: true });
    
    // Ленивая загрузка изображений
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    img.classList.add('loaded');
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}
