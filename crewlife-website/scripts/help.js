// JavaScript для страницы помощи CrewLife
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const helpSearchInput = document.getElementById('helpSearch');
    const searchBtn = document.getElementById('searchBtn');
    const searchSuggestions = document.getElementById('searchSuggestions');
    const categoryCards = document.querySelectorAll('.category-card');
    const faqItems = document.querySelectorAll('.faq-item');
    const faqCategories = document.querySelectorAll('.faq-category');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Данные для поиска
    const searchData = [
        { question: "Как зарегистрироваться в системе?", answer: "Для регистрации нажмите кнопку 'Регистрация' на главной странице", category: "getting-started" },
        { question: "Как войти в систему?", answer: "Используйте ваш табельный номер и пароль", category: "getting-started" },
        { question: "Какие браузеры поддерживаются?", answer: "Chrome, Firefox, Safari, Edge последних версий", category: "getting-started" },
        { question: "Как создать новую заявку?", answer: "В панели управления нажмите на кнопку с нужным типом заявки", category: "requests" },
        { question: "Как отследить статус заявки?", answer: "В разделе 'Мои заявки' или через уведомления", category: "requests" },
        { question: "Можно ли отменить заявку?", answer: "Только в статусе 'Новая'", category: "requests" },
        { question: "Как изменить личные данные?", answer: "В разделе 'Профиль' - вкладка 'Личные данные'", category: "account" },
        { question: "Как изменить пароль?", answer: "В разделе 'Профиль' - вкладка 'Безопасность'", category: "account" },
        { question: "Что делать, если страница не загружается?", answer: "Обновить страницу, очистить кэш, проверить интернет", category: "technical" },
        { question: "Как включить уведомления?", answer: "В разделе 'Профиль' - вкладка 'Уведомления'", category: "technical" }
    ];

    // Инициализация
    init();

    function init() {
        // Проверяем авторизацию
        checkAuthStatus();
        
        // Настраиваем обработчики событий
        setupEventListeners();
        
        // Инициализируем FAQ
        initFAQ();
    }

    // Проверка статуса авторизации
    function checkAuthStatus() {
        const authToken = localStorage.getItem('authToken');
        const userData = localStorage.getItem('userData');
        
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const dashboardBtn = document.getElementById('dashboardBtn');
        const profileBtn = document.getElementById('profileBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        if (authToken && userData) {
            // Пользователь авторизован
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
            dashboardBtn.style.display = 'inline-block';
            profileBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'inline-block';
        } else {
            // Пользователь не авторизован
            loginBtn.style.display = 'inline-block';
            registerBtn.style.display = 'inline-block';
            dashboardBtn.style.display = 'none';
            profileBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
        }
    }

    // Настройка обработчиков событий
    function setupEventListeners() {
        // Поиск
        helpSearchInput.addEventListener('input', handleSearch);
        searchBtn.addEventListener('click', performSearch);
        helpSearchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });

        // Категории
        categoryCards.forEach(card => {
            card.addEventListener('click', function() {
                const category = this.dataset.category;
                filterByCategory(category);
            });
        });

        // FAQ элементы
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', function() {
                toggleFAQItem(item);
            });
        });

        // Выход из системы
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
    }

    // Инициализация FAQ
    function initFAQ() {
        // Добавляем анимацию появления
        faqItems.forEach((item, index) => {
            item.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Обработка поиска
    function handleSearch() {
        const query = helpSearchInput.value.trim().toLowerCase();
        
        if (query.length === 0) {
            searchSuggestions.style.display = 'none';
            showAllCategories();
            showAllFAQItems();
            return;
        }

        if (query.length < 2) {
            searchSuggestions.style.display = 'none';
            return;
        }

        // Поиск предложений
        const suggestions = searchData.filter(item => 
            item.question.toLowerCase().includes(query) || 
            item.answer.toLowerCase().includes(query)
        ).slice(0, 5);

        displaySuggestions(suggestions, query);
    }

    // Отображение предложений
    function displaySuggestions(suggestions, query) {
        if (suggestions.length === 0) {
            searchSuggestions.style.display = 'none';
            return;
        }

        searchSuggestions.innerHTML = suggestions.map(item => `
            <div class="suggestion-item" data-category="${item.category}">
                <strong>${highlightText(item.question, query)}</strong>
                <div style="font-size: 0.9rem; color: #666; margin-top: 4px;">
                    ${highlightText(item.answer, query)}
                </div>
            </div>
        `).join('');

        // Добавляем обработчики для предложений
        searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', function() {
                const category = this.dataset.category;
                helpSearchInput.value = '';
                searchSuggestions.style.display = 'none';
                filterByCategory(category);
                scrollToCategory(category);
            });
        });

        searchSuggestions.style.display = 'block';
    }

    // Выделение найденного текста
    function highlightText(text, query) {
        if (!query) return text;
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
    }

    // Выполнение поиска
    function performSearch() {
        const query = helpSearchInput.value.trim().toLowerCase();
        
        if (query.length === 0) {
            showAllCategories();
            showAllFAQItems();
            return;
        }

        showLoading();
        
        setTimeout(() => {
            // Фильтруем FAQ по запросу
            filterFAQByQuery(query);
            hideLoading();
        }, 500);
    }

    // Фильтрация FAQ по запросу
    function filterFAQByQuery(query) {
        let hasResults = false;

        faqCategories.forEach(category => {
            const items = category.querySelectorAll('.faq-item');
            let categoryHasResults = false;

            items.forEach(item => {
                const question = item.querySelector('.faq-question h4').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
                
                if (question.includes(query) || answer.includes(query)) {
                    item.classList.remove('hidden');
                    categoryHasResults = true;
                    hasResults = true;
                } else {
                    item.classList.add('hidden');
                }
            });

            if (categoryHasResults) {
                category.classList.remove('hidden');
            } else {
                category.classList.add('hidden');
            }
        });

        // Показываем сообщение, если нет результатов
        if (!hasResults) {
            showNoResultsMessage();
        } else {
            hideNoResultsMessage();
        }
    }

    // Фильтрация по категории
    function filterByCategory(categoryName) {
        // Убираем активный класс со всех карточек
        categoryCards.forEach(card => {
            card.classList.remove('active');
        });

        // Добавляем активный класс к выбранной карточке
        const selectedCard = document.querySelector(`[data-category="${categoryName}"]`);
        if (selectedCard) {
            selectedCard.classList.add('active');
        }

        // Фильтруем FAQ
        faqCategories.forEach(category => {
            if (category.dataset.category === categoryName) {
                category.classList.remove('hidden');
                category.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                category.classList.add('hidden');
            }
        });

        // Показываем все элементы в выбранной категории
        const selectedCategory = document.querySelector(`.faq-category[data-category="${categoryName}"]`);
        if (selectedCategory) {
            const items = selectedCategory.querySelectorAll('.faq-item');
            items.forEach(item => {
                item.classList.remove('hidden');
            });
        }
    }

    // Показ всех категорий
    function showAllCategories() {
        faqCategories.forEach(category => {
            category.classList.remove('hidden');
        });
        categoryCards.forEach(card => {
            card.classList.remove('active');
        });
    }

    // Показ всех FAQ элементов
    function showAllFAQItems() {
        faqItems.forEach(item => {
            item.classList.remove('hidden');
        });
        hideNoResultsMessage();
    }

    // Прокрутка к категории
    function scrollToCategory(categoryName) {
        const category = document.querySelector(`.faq-category[data-category="${categoryName}"]`);
        if (category) {
            category.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    // Переключение FAQ элемента
    function toggleFAQItem(item) {
        const isActive = item.classList.contains('active');
        
        // Закрываем все другие элементы
        faqItems.forEach(otherItem => {
            if (otherItem !== item) {
                otherItem.classList.remove('active');
            }
        });
        
        // Переключаем текущий элемент
        if (isActive) {
            item.classList.remove('active');
        } else {
            item.classList.add('active');
        }
    }

    // Показ сообщения об отсутствии результатов
    function showNoResultsMessage() {
        let noResultsMsg = document.getElementById('noResultsMessage');
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.id = 'noResultsMessage';
            noResultsMsg.className = 'no-results-message';
            noResultsMsg.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #666;">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom: 20px; opacity: 0.5;">
                        <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <h3>Результаты не найдены</h3>
                    <p>Попробуйте изменить поисковый запрос или выберите категорию выше</p>
                </div>
            `;
            document.querySelector('.faq-container').appendChild(noResultsMsg);
        }
        noResultsMsg.style.display = 'block';
    }

    // Скрытие сообщения об отсутствии результатов
    function hideNoResultsMessage() {
        const noResultsMsg = document.getElementById('noResultsMessage');
        if (noResultsMsg) {
            noResultsMsg.style.display = 'none';
        }
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

    // Закрытие предложений при клике вне поиска
    document.addEventListener('click', function(e) {
        if (!helpSearchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
            searchSuggestions.style.display = 'none';
        }
    });

    // Анимация появления элементов при прокрутке
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами
    document.querySelectorAll('.category-card, .faq-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
