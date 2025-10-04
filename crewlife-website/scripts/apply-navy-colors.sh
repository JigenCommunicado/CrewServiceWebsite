#!/bin/bash

# Скрипт для применения Navy цветовой схемы к CrewLife
# Использование: ./apply-navy-colors.sh

echo "🔵 Применение Navy цветовой схемы к CrewLife..."

# Navy цвета
NAVY_PRIMARY="#1E3A8A"
NAVY_LIGHT="#3B82F6"
NAVY_DARK="#1E40AF"
NAVY_MEDIUM="#2563EB"
NAVY_ALT="#1D4ED8"
NAVY_LIGHTEST="#60A5FA"
NAVY_PASTEL="#93C5FD"
NAVY_MATERIAL="#1976D2"
NAVY_MATERIAL_DARK="#0D47A1"

# Функция для замены цветов в файле
replace_colors() {
    local file="$1"
    echo "  📝 Обновление $file..."
    
    # Заменяем основные красные цвета на Navy
    sed -i "s/#FF4D4D/$NAVY_PRIMARY/g" "$file" 2>/dev/null || true
    sed -i "s/#FF6B6B/$NAVY_LIGHT/g" "$file" 2>/dev/null || true
    sed -i "s/#E64444/$NAVY_DARK/g" "$file" 2>/dev/null || true
    sed -i "s/#FF5555/$NAVY_MEDIUM/g" "$file" 2>/dev/null || true
    sed -i "s/#E55A5A/$NAVY_ALT/g" "$file" 2>/dev/null || true
    sed -i "s/#FF8E8E/$NAVY_LIGHTEST/g" "$file" 2>/dev/null || true
    sed -i "s/#FFB3B3/$NAVY_PASTEL/g" "$file" 2>/dev/null || true
    sed -i "s/#f44336/$NAVY_MATERIAL/g" "$file" 2>/dev/null || true
    sed -i "s/#d32f2f/$NAVY_MATERIAL_DARK/g" "$file" 2>/dev/null || true
    
    # Заменяем RGB значения
    sed -i "s/rgb(255, 77, 77)/$NAVY_PRIMARY/g" "$file" 2>/dev/null || true
    sed -i "s/rgb(255, 107, 107)/$NAVY_LIGHT/g" "$file" 2>/dev/null || true
    sed -i "s/rgb(230, 68, 68)/$NAVY_DARK/g" "$file" 2>/dev/null || true
    sed -i "s/rgb(255, 85, 85)/$NAVY_MEDIUM/g" "$file" 2>/dev/null || true
    sed -i "s/rgb(229, 90, 90)/$NAVY_ALT/g" "$file" 2>/dev/null || true
    sed -i "s/rgb(255, 142, 142)/$NAVY_LIGHTEST/g" "$file" 2>/dev/null || true
    sed -i "s/rgb(255, 179, 179)/$NAVY_PASTEL/g" "$file" 2>/dev/null || true
    sed -i "s/rgb(244, 67, 54)/$NAVY_MATERIAL/g" "$file" 2>/dev/null || true
    sed -i "s/rgb(211, 50, 47)/$NAVY_MATERIAL_DARK/g" "$file" 2>/dev/null || true
}

# Обновляем CSS файлы
echo "📁 Обновление CSS файлов..."
for file in styles/*.css; do
    if [ -f "$file" ]; then
        replace_colors "$file"
    fi
done

# Обновляем HTML файлы (SVG иконки и meta теги)
echo "📁 Обновление HTML файлов..."
for file in pages/*.html index.html; do
    if [ -f "$file" ]; then
        echo "  📝 Обновление $file..."
        # Заменяем цвета в SVG
        sed -i 's/fill="#FF4D4D"/fill="'$NAVY_PRIMARY'"/g' "$file" 2>/dev/null || true
        sed -i 's/stroke="#FF4D4D"/stroke="'$NAVY_PRIMARY'"/g' "$file" 2>/dev/null || true
        # Заменяем meta теги
        sed -i 's/content="#FF4D4D"/content="'$NAVY_PRIMARY'"/g' "$file" 2>/dev/null || true
    fi
done

echo "✅ Navy цветовая схема применена!"
echo "🔵 Новые цвета:"
echo "   Основной: $NAVY_PRIMARY"
echo "   Светлый:  $NAVY_LIGHT"
echo "   Темный:   $NAVY_DARK"
echo ""
echo "📋 Для применения изменений выполните: /root/sync-crewlife.sh"
