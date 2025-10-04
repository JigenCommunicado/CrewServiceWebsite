// Service Worker для CrewLife
const CACHE_NAME = 'crewlife-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/pages/dashboard.html',
    '/pages/login.html',
    '/pages/register.html',
    '/pages/profile.html',
    '/pages/help.html',
    '/pages/requests.html',
    '/pages/calendar.html',
    '/pages/flight-booking.html',
    '/styles/crewlife.css',
    '/styles/dashboard.css',
    '/styles/profile.css',
    '/styles/help.css',
    '/styles/requests.css',
    '/styles/calendar.css',
    '/styles/flight-booking.css',
    '/scripts/crewlife.js',
    '/scripts/dashboard.js',
    '/scripts/login.js',
    '/scripts/register.js',
    '/scripts/profile.js',
    '/scripts/help.js',
    '/scripts/requests.js',
    '/scripts/calendar.js',
    '/scripts/flight-booking.js',
    '/scripts/utils.js',
    '/scripts/api.js',
    '/scripts/performance.js'
];

// Установка Service Worker
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Кэш открыт');
                return cache.addAll(urlsToCache);
            })
    );
});

// Активация Service Worker
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Удаление старого кэша:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Перехват запросов
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Возвращаем кэшированную версию или загружаем из сети
                return response || fetch(event.request);
            }
        )
    );
});




