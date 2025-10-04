#!/bin/bash

# Скрипт для восстановления красной цветовой схемы CrewLife
# Использование: ./restore-red-colors.sh

echo "🎨 Восстановление красной цветовой схемы CrewLife..."

# Основные цвета
PRIMARY_RED="#FF4D4D"
LIGHT_RED="#FF6B6B"
DARK_RED="#E64444"
MEDIUM_RED="#FF5555"
ALT_RED="#E55A5A"
LIGHTEST_RED="#FF8E8E"
PASTEL_RED="#FFB3B3"
MATERIAL_RED="#f44336"
MATERIAL_DARK_RED="#d32f2f"

# Функция для замены цветов в файле
replace_colors() {
    local file="$1"
    echo "  📝 Обновление $file..."
    
    # Заменяем основные цвета
    sed -i "s/#[0-9A-Fa-f]\{6\}/$PRIMARY_RED/g" "$file" 2>/dev/null || true
    sed -i "s/rgb(255, 77, 77)/$PRIMARY_RED/g" "$file" 2>/dev/null || true
    sed -i "s/hsl(0, 100%, 65%)/$PRIMARY_RED/g" "$file" 2>/dev/null || true
}

# Обновляем CSS файлы
echo "📁 Обновление CSS файлов..."
for file in styles/*.css; do
    if [ -f "$file" ]; then
        replace_colors "$file"
    fi
done

# Обновляем HTML файлы (SVG иконки)
echo "📁 Обновление HTML файлов..."
for file in pages/*.html index.html; do
    if [ -f "$file" ]; then
        echo "  📝 Обновление $file..."
        # Заменяем цвета в SVG
        sed -i 's/fill="[^"]*"/fill="#FF4D4D"/g' "$file" 2>/dev/null || true
        sed -i 's/stroke="[^"]*"/stroke="#FF4D4D"/g' "$file" 2>/dev/null || true
        # Заменяем meta теги
        sed -i 's/content="[^"]*"/content="#FF4D4D"/g' "$file" 2>/dev/null || true
    fi
done

echo "✅ Красная цветовая схема восстановлена!"
echo "🎨 Основные цвета:"
echo "   Основной: $PRIMARY_RED"
echo "   Светлый:  $LIGHT_RED"
echo "   Темный:   $DARK_RED"
echo ""
echo "📋 Для применения изменений выполните: /root/sync-crewlife.sh"
