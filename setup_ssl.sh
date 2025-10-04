#!/bin/bash
# Скрипт настройки SSL сертификатов для CrewLife

echo "🔒 Настройка SSL сертификатов для CrewLife"
echo "=========================================="

# Проверяем, установлен ли certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Устанавливаем certbot..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Проверяем, установлен ли nginx
if ! command -v nginx &> /dev/null; then
    echo "📦 Устанавливаем nginx..."
    apt install -y nginx
fi

# Создаем конфигурацию nginx для CrewLife
echo "⚙️  Создаем конфигурацию nginx..."

cat > /etc/nginx/sites-available/crewlife << 'EOF'
server {
    listen 80;
    server_name crewlife.ru www.crewlife.ru;
    
    # Редирект на HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name crewlife.ru www.crewlife.ru;
    
    # SSL конфигурация (будет обновлена certbot)
    ssl_certificate /etc/letsencrypt/live/crewlife.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/crewlife.ru/privkey.pem;
    
    # SSL настройки безопасности
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Безопасность
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    
    # Статические файлы фронтенда
    location / {
        root /root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/crewlife-website;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        # Кэширование статических файлов
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API проксирование
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Логи
    access_log /var/log/nginx/crewlife_access.log;
    error_log /var/log/nginx/crewlife_error.log;
}
EOF

# Активируем сайт
ln -sf /etc/nginx/sites-available/crewlife /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Проверяем конфигурацию nginx
echo "🔍 Проверяем конфигурацию nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Конфигурация nginx корректна"
    systemctl reload nginx
else
    echo "❌ Ошибка в конфигурации nginx"
    exit 1
fi

echo ""
echo "📋 Следующие шаги для получения SSL сертификата:"
echo "1. Убедитесь, что домен crewlife.ru указывает на этот сервер"
echo "2. Запустите: sudo certbot --nginx -d crewlife.ru -d www.crewlife.ru"
echo "3. Настройте автоматическое обновление: sudo crontab -e"
echo "   Добавьте: 0 12 * * * /usr/bin/certbot renew --quiet"
echo ""
echo "🔒 SSL конфигурация готова!"
