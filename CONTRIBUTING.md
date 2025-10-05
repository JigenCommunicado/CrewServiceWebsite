# 🤝 Руководство по внесению вклада в CrewServiceWebsite

Спасибо за интерес к улучшению проекта! Эта документация поможет вам начать.

## 📋 Содержание

1. [Кодекс поведения](#кодекс-поведения)
2. [Как начать](#как-начать)
3. [Процесс разработки](#процесс-разработки)
4. [Стандарты кода](#стандарты-кода)
5. [Тестирование](#тестирование)
6. [Коммиты и Pull Requests](#коммиты-и-pull-requests)
7. [Документация](#документация)

---

## 📜 Кодекс поведения

### Наши стандарты

- ✅ Будьте уважительны и дружелюбны
- ✅ Приветствуйте новых участников
- ✅ Конструктивная критика
- ✅ Фокусируйтесь на проблеме, а не на личностях
- ❌ Оскорбления и личные атаки
- ❌ Троллинг и провокации
- ❌ Публикация личной информации других людей

---

## 🚀 Как начать

### 1. Настройка окружения

```bash
# Клонируйте репозиторий
git clone https://github.com/JigenCommunicado/CrewServiceWebsite.git
cd CrewServiceWebsite

# Установите зависимости
./scripts/install.sh

# Создайте ветку для работы
git checkout -b feature/your-feature-name
```

### 2. Структура проекта

Ознакомьтесь со структурой:
- `crewlife-backend/` - Node.js API сервер
- `crewlife-website/` - Фронтенд приложение
- `scripts/` - Скрипты автоматизации
- `docs/` - Документация
- `docker/` - Docker конфигурации
- `tests/` - Тесты

### 3. Переменные окружения

Создайте файл `.env` на основе `config/env.example`:
```bash
cp config/env.example .env
# Отредактируйте .env под ваши нужды
```

---

## 💻 Процесс разработки

### Рабочий процесс

1. **Создайте Issue**
   - Опишите проблему или предложение
   - Добавьте соответствующие метки
   - Дождитесь обсуждения перед началом работы

2. **Создайте ветку**
   ```bash
   # Для новой функции
   git checkout -b feature/feature-name
   
   # Для исправления бага
   git checkout -b fix/bug-name
   
   # Для документации
   git checkout -b docs/documentation-update
   ```

3. **Разработка**
   - Пишите чистый и понятный код
   - Следуйте стандартам кода (см. ниже)
   - Добавляйте комментарии где необходимо
   - Пишите тесты для новой функциональности

4. **Тестирование**
   ```bash
   # Запустите тесты
   cd tests
   pytest
   
   # Проверьте линтер
   npm run lint  # для Node.js
   flake8       # для Python
   ```

5. **Коммит изменений**
   ```bash
   git add .
   git commit -m "feat: описание изменений"
   ```

6. **Push и создание PR**
   ```bash
   git push origin feature/feature-name
   # Создайте Pull Request на GitHub
   ```

---

## 📏 Стандарты кода

### JavaScript/Node.js

#### Стиль кода
```javascript
// ✅ Хорошо
const getUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    logger.error(`Error fetching user: ${error.message}`);
    throw error;
  }
};

// ❌ Плохо
const getUser = async (id) => {
  return await User.findById(id)
};
```

#### Правила
- Используйте `const` и `let`, избегайте `var`
- Названия переменных в camelCase
- Названия классов в PascalCase
- Названия констант в UPPER_SNAKE_CASE
- Используйте async/await вместо callbacks
- Всегда обрабатывайте ошибки
- Добавляйте JSDoc комментарии для публичных функций

#### Линтер
```bash
npm run lint       # Проверка
npm run lint:fix   # Автоматическое исправление
```

### Python

#### Стиль кода (PEP 8)
```python
# ✅ Хорошо
def get_user_by_id(user_id: int) -> dict:
    """
    Получает пользователя по ID.
    
    Args:
        user_id: ID пользователя
        
    Returns:
        dict: Данные пользователя
    """
    try:
        user = User.query.get(user_id)
        return user.to_dict()
    except Exception as e:
        logger.error(f"Error fetching user: {str(e)}")
        raise

# ❌ Плохо
def getUser(id):
    return User.query.get(id).to_dict()
```

#### Правила
- Следуйте PEP 8
- Используйте type hints
- Названия переменных и функций в snake_case
- Названия классов в PascalCase
- Docstrings для всех публичных функций и классов
- Максимальная длина строки: 88 символов (Black)

#### Линтер и форматирование
```bash
flake8           # Проверка стиля
black .          # Автоформатирование
mypy .           # Проверка типов
```

### HTML/CSS

#### HTML
```html
<!-- ✅ Хорошо -->
<div class="user-card" data-user-id="123">
  <h2 class="user-card__title">Имя пользователя</h2>
  <p class="user-card__description">Описание</p>
</div>

<!-- ❌ Плохо -->
<div class="userCard">
  <h2>Имя пользователя</h2>
  <p>Описание</p>
</div>
```

#### CSS
```css
/* ✅ Хорошо - BEM методология */
.user-card {
  padding: 20px;
  border-radius: 8px;
}

.user-card__title {
  font-size: 24px;
  font-weight: bold;
}

.user-card--featured {
  background-color: #f0f0f0;
}

/* ❌ Плохо */
.card {
  padding: 20px;
}

.card h2 {
  font-size: 24px;
}
```

---

## 🧪 Тестирование

### Написание тестов

#### Node.js (Jest)
```javascript
describe('User API', () => {
  test('should create new user', async () => {
    const userData = {
      username: 'testuser',
      email: 'test@example.com'
    };
    
    const response = await request(app)
      .post('/api/users')
      .send(userData);
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

#### Python (pytest)
```python
def test_get_user(client):
    """Тест получения пользователя"""
    response = client.get('/api/users/1')
    
    assert response.status_code == 200
    assert 'username' in response.json
```

### Запуск тестов

```bash
# Node.js тесты
cd crewlife-backend
npm test

# Python тесты
cd tests
pytest

# С покрытием кода
pytest --cov=. --cov-report=html
```

### Требования к тестам

- ✅ Покрытие кода не менее 80%
- ✅ Тесты для всех новых функций
- ✅ Тесты для исправлений багов
- ✅ Unit тесты для бизнес-логики
- ✅ Integration тесты для API endpoints

---

## 📝 Коммиты и Pull Requests

### Формат коммитов

Используем [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Типы коммитов:
- `feat`: Новая функция
- `fix`: Исправление бага
- `docs`: Изменения в документации
- `style`: Форматирование (не влияет на код)
- `refactor`: Рефакторинг кода
- `perf`: Улучшение производительности
- `test`: Добавление тестов
- `chore`: Рутинные задачи, обновление зависимостей

#### Примеры:
```bash
# Хорошо
git commit -m "feat(auth): add JWT token refresh"
git commit -m "fix(api): resolve user registration bug"
git commit -m "docs(readme): update installation instructions"

# Плохо
git commit -m "fixes"
git commit -m "update"
git commit -m "work in progress"
```

### Pull Request

#### Название PR
```
[TYPE] Brief description

Пример:
[FEAT] Add user profile editing
[FIX] Resolve login timeout issue
```

#### Шаблон описания PR

```markdown
## Описание
Краткое описание изменений

## Тип изменения
- [ ] Bug fix (исправление)
- [ ] New feature (новая функция)
- [ ] Breaking change (критическое изменение)
- [ ] Documentation update (документация)

## Как протестировано
Описание проведенных тестов

## Checklist
- [ ] Код следует стандартам проекта
- [ ] Добавлена документация
- [ ] Добавлены тесты
- [ ] Все тесты проходят
- [ ] Обновлен CHANGELOG.md (если нужно)
```

### Процесс ревью

1. Минимум 1 одобрение от мейнтейнера
2. Все проверки CI/CD должны пройти
3. Нет конфликтов с main веткой
4. Код-ревью может запросить изменения

---

## 📚 Документация

### Что документировать

- ✅ Все публичные API endpoints
- ✅ Сложную бизнес-логику
- ✅ Настройки и конфигурацию
- ✅ Процесс установки и развертывания
- ✅ Примеры использования

### Где документировать

- **README.md** - Общая информация, быстрый старт
- **docs/** - Подробная документация
- **Код** - Inline комментарии, JSDoc, docstrings
- **API** - OpenAPI/Swagger спецификация

### Стиль документации

```markdown
# Заголовок

## Описание
Краткое описание функциональности

## Использование
\`\`\`javascript
// Пример кода
const result = doSomething();
\`\`\`

## Параметры
- `param1` (string) - Описание параметра
- `param2` (number) - Описание параметра

## Возвращаемое значение
Описание того, что возвращает функция

## Примечания
Дополнительная информация
```

---

## 🐛 Сообщение об ошибках

### Создание Issue

Используйте следующий шаблон:

```markdown
## Описание проблемы
Четкое описание того, что не работает

## Шаги для воспроизведения
1. Шаг 1
2. Шаг 2
3. Шаг 3

## Ожидаемое поведение
Что должно было произойти

## Фактическое поведение
Что произошло на самом деле

## Окружение
- ОС: [например, Ubuntu 22.04]
- Node.js: [например, 18.16.0]
- Python: [например, 3.10.6]
- Браузер: [если применимо]

## Дополнительная информация
Логи, скриншоты, и т.д.
```

---

## 🎯 Приоритеты и метки

### Метки приоритета
- `P0: Critical` - Критические проблемы (блокируют работу)
- `P1: High` - Высокий приоритет
- `P2: Medium` - Средний приоритет
- `P3: Low` - Низкий приоритет

### Метки типа
- `bug` - Ошибка в коде
- `feature` - Новая функциональность
- `documentation` - Улучшение документации
- `enhancement` - Улучшение существующей функции
- `question` - Вопрос
- `help wanted` - Требуется помощь
- `good first issue` - Подходит для новичков

---

## 🔒 Безопасность

### Сообщение об уязвимостях

**НЕ создавайте публичные issue для уязвимостей!**

Отправьте приватное сообщение:
- Email: security@crewlife.example
- Укажите детали уязвимости
- Дайте время на исправление (обычно 90 дней)

### Безопасные практики

- ❌ Никогда не коммитьте пароли, API ключи, токены
- ❌ Не используйте hardcoded credentials
- ✅ Используйте переменные окружения
- ✅ Шифруйте чувствительные данные
- ✅ Валидируйте все пользовательские вводы

---

## 💬 Контакты и поддержка

### Где получить помощь

- 📝 **GitHub Issues** - Вопросы и проблемы
- 💬 **GitHub Discussions** - Общие вопросы и обсуждения
- 📧 **Email** - support@crewlife.example

### Ресурсы

- [Документация](docs/INDEX.md)
- [API Reference](docs/API.md)
- [FAQ](docs/FAQ.md)

---

## 🎉 Благодарности

Спасибо всем, кто вносит вклад в проект! Ваша работа ценится и помогает делать CrewServiceWebsite лучше.

### Список контрибьюторов

См. [CONTRIBUTORS.md](CONTRIBUTORS.md)

---

**Последнее обновление:** 5 октября 2025
