#!/bin/bash

# Скрипт для включения/отключения кнопок входа и регистрации

if [ "$1" = "disable" ]; then
    echo "🔒 Отключаем кнопки входа и регистрации..."
    
    # Добавляем класс temporarily-disabled к кнопкам
    sed -i 's/class="header-btn login-btn"/class="header-btn login-btn temporarily-disabled"/g' /root/crewlife-website/index.html
    sed -i 's/class="header-btn register-btn"/class="header-btn register-btn temporarily-disabled"/g' /root/crewlife-website/index.html
    sed -i 's/class="mobile-nav-link" id="mobileLoginLink"/class="mobile-nav-link temporarily-disabled" id="mobileLoginLink"/g' /root/crewlife-website/index.html
    sed -i 's/class="mobile-nav-link" id="mobileRegisterLink"/class="mobile-nav-link temporarily-disabled" id="mobileRegisterLink"/g' /root/crewlife-website/index.html
    
    echo "✅ Кнопки отключены!"
    
elif [ "$1" = "enable" ]; then
    echo "🔓 Включаем кнопки входа и регистрации..."
    
    # Убираем класс temporarily-disabled с кнопок
    sed -i 's/class="header-btn login-btn temporarily-disabled"/class="header-btn login-btn"/g' /root/crewlife-website/index.html
    sed -i 's/class="header-btn register-btn temporarily-disabled"/class="header-btn register-btn"/g' /root/crewlife-website/index.html
    sed -i 's/class="mobile-nav-link temporarily-disabled" id="mobileLoginLink"/class="mobile-nav-link" id="mobileLoginLink"/g' /root/crewlife-website/index.html
    sed -i 's/class="mobile-nav-link temporarily-disabled" id="mobileRegisterLink"/class="mobile-nav-link" id="mobileRegisterLink"/g' /root/crewlife-website/index.html
    
    echo "✅ Кнопки включены!"
    
else
    echo "Использование: $0 [enable|disable]"
    echo "  enable  - включить кнопки входа и регистрации"
    echo "  disable - отключить кнопки входа и регистрации"
    exit 1
fi

# Синхронизируем с сервером
echo "🔄 Синхронизация с сервером..."
/root/sync-crewlife.sh
