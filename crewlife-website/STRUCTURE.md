# Структура проекта CrewLife Website

## 📁 Организация папок

```
crewlife-website/
├── index.html                 # Главная страница (crewlife.html)
├── start.sh                   # Скрипт запуска сервера
├── update-paths.js            # Скрипт обновления путей
│
├── pages/                     # HTML страницы
│   ├── crewlife.html          # Главная страница (дубликат index.html)
│   ├── login.html             # Страница входа
│   ├── register.html          # Страница регистрации
│   ├── dashboard.html         # Панель управления
│   ├── profile.html           # Профиль пользователя
│   ├── requests.html          # Заявки
│   ├── calendar.html          # Календарь
│   ├── help.html              # Помощь
│   ├── flight-booking.html    # Заказ рейса
│   ├── aeroexpress.html       # Заказ аэроэкспресса
│   ├── hotel.html             # Заказ гостиницы
│   ├── weekend.html           # Заказ выходных дней
│   └── offline.html           # Страница офлайн режима
│
├── styles/                    # CSS стили
│   ├── crewlife.css           # Основные стили
│   ├── login.css              # Стили входа
│   ├── register.css           # Стили регистрации
│   ├── dashboard.css          # Стили панели управления
│   ├── profile.css            # Стили профиля
│   ├── requests.css           # Стили заявок
│   ├── calendar.css           # Стили календаря
│   ├── help.css               # Стили помощи
│   ├── flight-booking.css     # Стили заказа рейса
│   ├── aeroexpress.css        # Стили аэроэкспресса
│   ├── hotel.css              # Стили гостиницы
│   ├── weekend.css            # Стили выходных дней
│   ├── accessibility.css      # Стили доступности
│   ├── mobile-enhancements.css # Мобильные улучшения
│   ├── performance.css        # Стили производительности
│   └── offline.css            # Стили офлайн режима
│
├── scripts/                   # JavaScript файлы
│   ├── crewlife.js            # Основная логика
│   ├── login.js               # Логика входа
│   ├── register.js            # Логика регистрации
│   ├── dashboard.js           # Логика панели управления
│   ├── profile.js             # Логика профиля
│   ├── requests.js            # Логика заявок
│   ├── calendar.js            # Логика календаря
│   ├── help.js                # Логика помощи
│   ├── flight-booking.js      # Логика заказа рейса
│   ├── aeroexpress.js         # Логика аэроэкспресса
│   ├── hotel.js               # Логика гостиницы
│   ├── weekend.js             # Логика выходных дней
│   ├── utils.js               # Утилиты
│   ├── notifications.js       # Уведомления
│   ├── api.js                 # API функции
│   ├── performance.js         # Производительность
│   ├── accessibility.js       # Доступность
│   ├── mobile-enhancements.js # Мобильные улучшения
│   ├── pwa.js                 # PWA функциональность
│   ├── sw.js                  # Service Worker
│   ├── offline.js             # Офлайн логика
│   └── update-*.js            # Скрипты обновления
│
├── config/                    # Конфигурационные файлы
│   ├── manifest.json          # PWA манифест
│   ├── browserconfig.xml      # Windows PWA конфиг
│   └── package.json           # Метаданные проекта
│
├── assets/                    # Статические ресурсы
│   └── icons/                 # Иконки PWA
│       └── icon-192x192.svg   # Иконка приложения
│
└── docs/                      # Документация
    ├── README.md              # Основная документация
    ├── PROJECT_BRIEF.md       # Техническое задание
    ├── DEVELOPMENT.md         # Руководство разработчика
    ├── CHANGELOG.md           # История изменений
    └── DEVELOPMENT_REPORT.md  # Отчет о разработке
```

## 🚀 Запуск проекта

```bash
# Запуск локального сервера
./start.sh

# Или вручную
python3 -m http.server 3001
```

## 📝 Особенности структуры

### ✅ Преимущества новой организации:

1. **Четкое разделение** - HTML, CSS, JS файлы в отдельных папках
2. **Легкая навигация** - все файлы логически сгруппированы
3. **Масштабируемость** - легко добавлять новые страницы и стили
4. **Обслуживание** - проще находить и редактировать файлы
5. **Конфигурация** - все настройки в одной папке

### 🔧 Обновленные пути:

- CSS файлы: `styles/filename.css`
- JS файлы: `scripts/filename.js`
- HTML страницы: `pages/filename.html`
- Конфигурация: `config/filename.json`
- Иконки: `assets/icons/filename.svg`

### 📱 PWA функциональность:

- Манифест: `config/manifest.json`
- Service Worker: `scripts/sw.js`
- Офлайн страница: `pages/offline.html`

## 🎯 Главная страница

`index.html` - это копия `pages/crewlife.html` с обновленными путями для работы из корневой папки.

## 🔄 Обновление путей

Если нужно обновить пути в файлах, используйте:
```bash
node update-paths.js
```

Этот скрипт автоматически обновит все ссылки в HTML и JS файлах для работы с новой структурой папок.

## 📁 Организация папок

```
crewlife-website/
├── index.html                 # Главная страница (crewlife.html)
├── start.sh                   # Скрипт запуска сервера
├── update-paths.js            # Скрипт обновления путей
│
├── pages/                     # HTML страницы
│   ├── crewlife.html          # Главная страница (дубликат index.html)
│   ├── login.html             # Страница входа
│   ├── register.html          # Страница регистрации
│   ├── dashboard.html         # Панель управления
│   ├── profile.html           # Профиль пользователя
│   ├── requests.html          # Заявки
│   ├── calendar.html          # Календарь
│   ├── help.html              # Помощь
│   ├── flight-booking.html    # Заказ рейса
│   ├── aeroexpress.html       # Заказ аэроэкспресса
│   ├── hotel.html             # Заказ гостиницы
│   ├── weekend.html           # Заказ выходных дней
│   └── offline.html           # Страница офлайн режима
│
├── styles/                    # CSS стили
│   ├── crewlife.css           # Основные стили
│   ├── login.css              # Стили входа
│   ├── register.css           # Стили регистрации
│   ├── dashboard.css          # Стили панели управления
│   ├── profile.css            # Стили профиля
│   ├── requests.css           # Стили заявок
│   ├── calendar.css           # Стили календаря
│   ├── help.css               # Стили помощи
│   ├── flight-booking.css     # Стили заказа рейса
│   ├── aeroexpress.css        # Стили аэроэкспресса
│   ├── hotel.css              # Стили гостиницы
│   ├── weekend.css            # Стили выходных дней
│   ├── accessibility.css      # Стили доступности
│   ├── mobile-enhancements.css # Мобильные улучшения
│   ├── performance.css        # Стили производительности
│   └── offline.css            # Стили офлайн режима
│
├── scripts/                   # JavaScript файлы
│   ├── crewlife.js            # Основная логика
│   ├── login.js               # Логика входа
│   ├── register.js            # Логика регистрации
│   ├── dashboard.js           # Логика панели управления
│   ├── profile.js             # Логика профиля
│   ├── requests.js            # Логика заявок
│   ├── calendar.js            # Логика календаря
│   ├── help.js                # Логика помощи
│   ├── flight-booking.js      # Логика заказа рейса
│   ├── aeroexpress.js         # Логика аэроэкспресса
│   ├── hotel.js               # Логика гостиницы
│   ├── weekend.js             # Логика выходных дней
│   ├── utils.js               # Утилиты
│   ├── notifications.js       # Уведомления
│   ├── api.js                 # API функции
│   ├── performance.js         # Производительность
│   ├── accessibility.js       # Доступность
│   ├── mobile-enhancements.js # Мобильные улучшения
│   ├── pwa.js                 # PWA функциональность
│   ├── sw.js                  # Service Worker
│   ├── offline.js             # Офлайн логика
│   └── update-*.js            # Скрипты обновления
│
├── config/                    # Конфигурационные файлы
│   ├── manifest.json          # PWA манифест
│   ├── browserconfig.xml      # Windows PWA конфиг
│   └── package.json           # Метаданные проекта
│
├── assets/                    # Статические ресурсы
│   └── icons/                 # Иконки PWA
│       └── icon-192x192.svg   # Иконка приложения
│
└── docs/                      # Документация
    ├── README.md              # Основная документация
    ├── PROJECT_BRIEF.md       # Техническое задание
    ├── DEVELOPMENT.md         # Руководство разработчика
    ├── CHANGELOG.md           # История изменений
    └── DEVELOPMENT_REPORT.md  # Отчет о разработке
```

## 🚀 Запуск проекта

```bash
# Запуск локального сервера
./start.sh

# Или вручную
python3 -m http.server 3001
```

## 📝 Особенности структуры

### ✅ Преимущества новой организации:

1. **Четкое разделение** - HTML, CSS, JS файлы в отдельных папках
2. **Легкая навигация** - все файлы логически сгруппированы
3. **Масштабируемость** - легко добавлять новые страницы и стили
4. **Обслуживание** - проще находить и редактировать файлы
5. **Конфигурация** - все настройки в одной папке

### 🔧 Обновленные пути:

- CSS файлы: `styles/filename.css`
- JS файлы: `scripts/filename.js`
- HTML страницы: `pages/filename.html`
- Конфигурация: `config/filename.json`
- Иконки: `assets/icons/filename.svg`

### 📱 PWA функциональность:

- Манифест: `config/manifest.json`
- Service Worker: `scripts/sw.js`
- Офлайн страница: `pages/offline.html`

## 🎯 Главная страница

`index.html` - это копия `pages/crewlife.html` с обновленными путями для работы из корневой папки.

## 🔄 Обновление путей

Если нужно обновить пути в файлах, используйте:
```bash
node update-paths.js
```

Этот скрипт автоматически обновит все ссылки в HTML и JS файлах для работы с новой структурой папок.
