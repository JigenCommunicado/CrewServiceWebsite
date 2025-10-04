// Скрипт для добавления поддержки доступности во все HTML файлы

const fs = require('fs');
const path = require('path');

// CSS файл доступности для добавления
const accessibilityCSS = `    <link rel="stylesheet" href="accessibility.css">`;

// JavaScript файл доступности для добавления
const accessibilityJS = `    <script src="scripts/accessibility.js"></script>`;

// Список HTML файлов для обновления
const htmlFiles = [
    'crewlife.html',
    'dashboard.html',
    'login.html',
    'register.html',
    'profile.html',
    'requests.html',
    'calendar.html',
    'help.html',
    'flight-booking.html'
];

// Функция для обновления HTML файла
function updateHtmlFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Проверяем, есть ли уже поддержка доступности
        if (content.includes('accessibility.css')) {
            console.log(`Поддержка доступности уже добавлена в ${filePath}`);
            return;
        }
        
        // Добавляем CSS доступности после dark-theme.css
        if (content.includes('dark-theme.css')) {
            content = content.replace(
                /<link rel="stylesheet" href="dark-theme\.css">/,
                `<link rel="stylesheet" href="dark-theme.css">\n${accessibilityCSS}`
            );
        } else {
            // Если dark-theme.css нет, добавляем после последнего CSS файла
            const cssRegex = /<link rel="stylesheet" href="[^"]+\.css">/g;
            const cssMatches = content.match(cssRegex);
            if (cssMatches && cssMatches.length > 0) {
                const lastCss = cssMatches[cssMatches.length - 1];
                content = content.replace(lastCss, `${lastCss}\n${accessibilityCSS}`);
            }
        }
        
        // Добавляем accessibility.js после theme-manager.js
        if (content.includes('theme-manager.js')) {
            content = content.replace(
                /<script src="scripts/theme-manager\.js"><\/script>/,
                `<script src="scripts/theme-manager.js"></script>\n${accessibilityJS}`
            );
        } else {
            // Если theme-manager.js нет, добавляем после последнего JS файла
            const jsRegex = /<script src="[^"]+\.js"><\/script>/g;
            const jsMatches = content.match(jsRegex);
            if (jsMatches && jsMatches.length > 0) {
                const lastJs = jsMatches[jsMatches.length - 1];
                content = content.replace(lastJs, `${lastJs}\n${accessibilityJS}`);
            }
        }
        
        // Добавляем основные ARIA атрибуты
        content = addAriaAttributes(content);
        
        // Записываем обновленный файл
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Обновлен ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Ошибка обновления ${filePath}:`, error.message);
    }
}

// Добавление ARIA атрибутов
function addAriaAttributes(content) {
    // Добавляем role="main" к main
    content = content.replace(
        /<main([^>]*)>/g,
        '<main$1 role="main">'
    );
    
    // Добавляем role="banner" к header
    content = content.replace(
        /<header([^>]*)>/g,
        '<header$1 role="banner">'
    );
    
    // Добавляем role="contentinfo" к footer
    content = content.replace(
        /<footer([^>]*)>/g,
        '<footer$1 role="contentinfo">'
    );
    
    // Добавляем role="navigation" к nav
    content = content.replace(
        /<nav([^>]*)>/g,
        '<nav$1 role="navigation">'
    );
    
    // Добавляем aria-label к кнопкам без текста
    content = content.replace(
        /<button([^>]*class="[^"]*close[^"]*"[^>]*)>/g,
        '<button$1 aria-label="Закрыть">'
    );
    
    content = content.replace(
        /<button([^>]*class="[^"]*menu[^"]*"[^>]*)>/g,
        '<button$1 aria-label="Открыть меню">'
    );
    
    // Добавляем aria-expanded к кнопкам меню
    content = content.replace(
        /<button([^>]*id="mobileMenuBtn"[^>]*)>/g,
        '<button$1 aria-expanded="false" aria-controls="mobileMenu">'
    );
    
    // Добавляем aria-hidden к декоративным элементам
    content = content.replace(
        /<svg([^>]*class="[^"]*icon[^"]*"[^>]*)>/g,
        '<svg$1 aria-hidden="true">'
    );
    
    // Добавляем aria-describedby к полям с ошибками
    content = content.replace(
        /<input([^>]*required[^>]*)>/g,
        '<input$1 aria-describedby="error-${this.generateFieldId($1)}">'
    );
    
    return content;
}

// Генерация ID для поля
function generateFieldId(inputAttrs) {
    const nameMatch = inputAttrs.match(/name="([^"]*)"/);
    const idMatch = inputAttrs.match(/id="([^"]*)"/);
    
    if (idMatch) {
        return idMatch[1];
    }
    
    if (nameMatch) {
        return nameMatch[1];
    }
    
    return 'field-' + Date.now();
}

// Обновляем все HTML файлы
console.log('♿ Начинаем добавление поддержки доступности...\n');

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        updateHtmlFile(filePath);
    } else {
        console.log(`⚠️  Файл ${file} не найден`);
    }
});

console.log('\n✨ Поддержка доступности добавлена!');
