// Скрипт для добавления мобильных улучшений во все HTML файлы

const fs = require('fs');
const path = require('path');

// CSS файл мобильных улучшений для добавления
const mobileCSS = `    <link rel="stylesheet" href="mobile-enhancements.css">`;

// JavaScript файл мобильных улучшений для добавления
const mobileJS = `    <script src="scripts/mobile-enhancements.js"></script>`;

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
        
        // Проверяем, есть ли уже мобильные улучшения
        if (content.includes('mobile-enhancements.css')) {
            console.log(`Мобильные улучшения уже добавлены в ${filePath}`);
            return;
        }
        
        // Добавляем CSS мобильных улучшений после accessibility.css
        if (content.includes('accessibility.css')) {
            content = content.replace(
                /<link rel="stylesheet" href="accessibility\.css">/,
                `<link rel="stylesheet" href="accessibility.css">\n${mobileCSS}`
            );
        } else {
            // Если accessibility.css нет, добавляем после последнего CSS файла
            const cssRegex = /<link rel="stylesheet" href="[^"]+\.css">/g;
            const cssMatches = content.match(cssRegex);
            if (cssMatches && cssMatches.length > 0) {
                const lastCss = cssMatches[cssMatches.length - 1];
                content = content.replace(lastCss, `${lastCss}\n${mobileCSS}`);
            }
        }
        
        // Добавляем mobile-enhancements.js после accessibility.js
        if (content.includes('accessibility.js')) {
            content = content.replace(
                /<script src="scripts/accessibility\.js"><\/script>/,
                `<script src="scripts/accessibility.js"></script>\n${mobileJS}`
            );
        } else {
            // Если accessibility.js нет, добавляем после последнего JS файла
            const jsRegex = /<script src="[^"]+\.js"><\/script>/g;
            const jsMatches = content.match(jsRegex);
            if (jsMatches && jsMatches.length > 0) {
                const lastJs = jsMatches[jsMatches.length - 1];
                content = content.replace(lastJs, `${lastJs}\n${mobileJS}`);
            }
        }
        
        // Записываем обновленный файл
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Обновлен ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Ошибка обновления ${filePath}:`, error.message);
    }
}

// Обновляем все HTML файлы
console.log('📱 Начинаем добавление мобильных улучшений...\n');

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        updateHtmlFile(filePath);
    } else {
        console.log(`⚠️  Файл ${file} не найден`);
    }
});

console.log('\n✨ Мобильные улучшения добавлены!');
