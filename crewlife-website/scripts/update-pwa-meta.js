// Скрипт для обновления PWA мета-тегов во всех HTML файлах

const fs = require('fs');
const path = require('path');

// PWA мета-теги для добавления
const pwaMetaTags = `    <!-- PWA Meta Tags -->
    <meta name="description" content="CrewLife - Система подачи заявок для бортпроводников">
    <meta name="theme-color" content="#FF4D4D">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="CrewLife">
    <meta name="msapplication-TileColor" content="#FF4D4D">
    <meta name="msapplication-config" content="/browserconfig.xml">
    
    <!-- Manifest -->
    <link rel="manifest" href="manifest.json">
    
    <!-- Icons -->
    <link rel="icon" type="image/png" sizes="32x32" href="icons/icon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="icons/icon-16x16.png">
    <link rel="apple-touch-icon" href="icons/icon-192x192.png">
    <link rel="apple-touch-icon" sizes="152x152" href="icons/icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="icons/icon-192x192.png">
    <link rel="apple-touch-icon" sizes="167x167" href="icons/icon-192x192.png">`;

// PWA скрипт для добавления
const pwaScript = `    <script src="scripts/pwa.js"></script>`;

// Список HTML файлов для обновления
const htmlFiles = [
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
        
        // Проверяем, есть ли уже PWA мета-теги
        if (content.includes('manifest.json')) {
            console.log(`PWA мета-теги уже добавлены в ${filePath}`);
            return;
        }
        
        // Добавляем PWA мета-теги после viewport
        content = content.replace(
            /<meta name="viewport" content="width=device-width, initial-scale=1\.0">/,
            `<meta name="viewport" content="width=device-width, initial-scale=1.0">\n${pwaMetaTags}`
        );
        
        // Добавляем PWA скрипт перед закрывающим тегом head
        content = content.replace(
            /<\/head>/,
            `${pwaScript}\n</head>`
        );
        
        // Записываем обновленный файл
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Обновлен ${filePath}`);
        
    } catch (error) {
        console.error(`❌ Ошибка обновления ${filePath}:`, error.message);
    }
}

// Обновляем все HTML файлы
console.log('🚀 Начинаем обновление PWA мета-тегов...\n');

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        updateHtmlFile(filePath);
    } else {
        console.log(`⚠️  Файл ${file} не найден`);
    }
});

console.log('\n✨ Обновление завершено!');
