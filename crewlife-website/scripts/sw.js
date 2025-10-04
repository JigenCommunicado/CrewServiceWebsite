// Service Worker для CrewLife PWA
const CACHE_NAME = 'crewlife-v2.0.0';
const STATIC_CACHE = 'crewlife-static-v2.0.0';
const DYNAMIC_CACHE = 'crewlife-dynamic-v2.0.0';
const OFFLINE_CACHE = 'crewlife-offline-v2.0.0';

// Критические ресурсы для кэширования
const CRITICAL_RESOURCES = [
  '/',
  '/crewlife.html',
  '/crewlife.css',
  '/crewlife.js',
  '/login.html',
  '/login.css',
  '/login.js',
  '/register.html',
  '/register.css',
  '/register.js',
  '/dashboard.html',
  '/dashboard.css',
  '/dashboard.js',
  '/utils.js',
  '/api.js',
  '/notifications.js',
  '/performance.js',
  '/performance.css',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&display=swap'
];

// Ресурсы для офлайн режима
const OFFLINE_RESOURCES = [
  '/offline.html',
  '/offline.css',
  '/offline.js'
];

// Установка Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Установка Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Кэшируем критические ресурсы
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[SW] Кэширование критических ресурсов');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      // Кэшируем офлайн ресурсы
      caches.open(OFFLINE_CACHE).then((cache) => {
        console.log('[SW] Кэширование офлайн ресурсов');
        return cache.addAll(OFFLINE_RESOURCES);
      })
    ]).then(() => {
      console.log('[SW] Критические ресурсы закэшированы');
      return self.skipWaiting();
    })
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Активация Service Worker');
  
  event.waitUntil(
    Promise.all([
      // Очищаем старые кэши
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== OFFLINE_CACHE) {
              console.log('[SW] Удаление старого кэша:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Берем контроль над всеми клиентами
      self.clients.claim()
    ])
  );
});

// Обработка запросов
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Пропускаем запросы к внешним API
  if (url.origin !== location.origin) {
    return;
  }
  
  // Стратегия кэширования для разных типов ресурсов
  if (request.destination === 'document') {
    // HTML страницы - Network First с fallback на кэш
    event.respondWith(handleDocumentRequest(request));
  } else if (request.destination === 'style' || 
             request.destination === 'script' || 
             request.destination === 'font') {
    // CSS, JS, шрифты - Cache First
    event.respondWith(handleStaticRequest(request));
  } else if (request.destination === 'image') {
    // Изображения - Cache First с fallback
    event.respondWith(handleImageRequest(request));
  } else {
    // Остальные запросы - Network First
    event.respondWith(handleNetworkFirstRequest(request));
  }
});

// Обработка HTML документов
async function handleDocumentRequest(request) {
  try {
    // Пытаемся загрузить из сети
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Кэшируем успешный ответ
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
  } catch (error) {
    console.log('[SW] Сетевой запрос не удался, ищем в кэше');
  }
  
  // Fallback на кэш
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fallback на офлайн страницу
  const offlineResponse = await caches.match('/offline.html');
  if (offlineResponse) {
    return offlineResponse;
  }
  
  // Последний fallback - простая офлайн страница
  return new Response(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CrewLife - Офлайн</title>
      <style>
        body { 
          font-family: 'Montserrat', sans-serif; 
          text-align: center; 
          padding: 50px; 
          background: #f8f9fa; 
        }
        .offline-container { 
          max-width: 400px; 
          margin: 0 auto; 
          background: white; 
          padding: 40px; 
          border-radius: 10px; 
          box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
        }
        .offline-icon { 
          font-size: 48px; 
          color: #FF4D4D; 
          margin-bottom: 20px; 
        }
        h1 { 
          color: #333; 
          margin-bottom: 20px; 
        }
        p { 
          color: #666; 
          margin-bottom: 30px; 
        }
        .retry-btn { 
          background: #FF4D4D; 
          color: white; 
          border: none; 
          padding: 12px 24px; 
          border-radius: 6px; 
          cursor: pointer; 
          font-size: 16px; 
        }
      </style>
    </head>
    <body>
      <div class="offline-container">
        <div class="offline-icon">✈️</div>
        <h1>CrewLife</h1>
        <p>Нет подключения к интернету. Проверьте соединение и попробуйте снова.</p>
        <button class="retry-btn" onclick="window.location.reload()">Попробовать снова</button>
      </div>
    </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
}

// Обработка статических ресурсов (CSS, JS, шрифты)
async function handleStaticRequest(request) {
  // Сначала проверяем кэш
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Загружаем из сети
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Кэшируем успешный ответ
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Ошибка загрузки статического ресурса:', request.url);
    throw error;
  }
}

// Обработка изображений
async function handleImageRequest(request) {
  // Сначала проверяем кэш
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Загружаем из сети
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Кэшируем успешный ответ
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Ошибка загрузки изображения:', request.url);
    // Возвращаем placeholder изображение
    return new Response(`
      <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="#f0f0f0"/>
        <text x="100" y="100" text-anchor="middle" fill="#999" font-family="Arial" font-size="14">
          Изображение недоступно
        </text>
      </svg>
    `, {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
}

// Обработка остальных запросов (Network First)
async function handleNetworkFirstRequest(request) {
  try {
    // Пытаемся загрузить из сети
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Кэшируем успешный ответ
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Сетевой запрос не удался, ищем в кэше');
    
    // Fallback на кэш
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Обработка push уведомлений
self.addEventListener('push', (event) => {
  console.log('[SW] Получено push уведомление');
  
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление от CrewLife',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть',
        icon: '/icons/action-open.png'
      },
      {
        action: 'close',
        title: 'Закрыть',
        icon: '/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('CrewLife', options)
  );
});

// Обработка кликов по уведомлениям
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Клик по уведомлению:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/crewlife.html')
    );
  } else if (event.action === 'close') {
    // Просто закрываем уведомление
    return;
  } else {
    // По умолчанию открываем главную страницу
    event.waitUntil(
      clients.openWindow('/crewlife.html')
    );
  }
});

// Обработка синхронизации в фоне
self.addEventListener('sync', (event) => {
  console.log('[SW] Фоновая синхронизация:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Фоновая синхронизация
async function doBackgroundSync() {
  try {
    // Здесь можно добавить логику синхронизации данных
    console.log('[SW] Выполняется фоновая синхронизация');
    
    // Например, отправка отложенных запросов
    const pendingRequests = await getPendingRequests();
    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        await removePendingRequest(request.id);
      } catch (error) {
        console.log('[SW] Ошибка синхронизации запроса:', error);
      }
    }
  } catch (error) {
    console.log('[SW] Ошибка фоновой синхронизации:', error);
  }
}

// Получение отложенных запросов (заглушка)
async function getPendingRequests() {
  // В реальном приложении здесь будет работа с IndexedDB
  return [];
}

// Удаление отложенного запроса (заглушка)
async function removePendingRequest(id) {
  // В реальном приложении здесь будет работа с IndexedDB
  console.log('[SW] Удаление отложенного запроса:', id);
}

// Обработка сообщений от клиента
self.addEventListener('message', (event) => {
  console.log('[SW] Получено сообщение от клиента:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Периодическая синхронизация (если поддерживается)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Периодическая синхронизация:', event.tag);
  
  if (event.tag === 'content-sync') {
    event.waitUntil(doPeriodicSync());
  }
});

// Периодическая синхронизация контента
async function doPeriodicSync() {
  try {
    console.log('[SW] Выполняется периодическая синхронизация контента');
    
    // Обновляем кэш критических ресурсов
    const cache = await caches.open(STATIC_CACHE);
    await cache.addAll(CRITICAL_RESOURCES);
    
  } catch (error) {
    console.log('[SW] Ошибка периодической синхронизации:', error);
  }
}

console.log('[SW] Service Worker загружен');
