#!/bin/bash
# Скрипт для создания ежедневных отчетов CrewLife

echo "📊 Создание ежедневного отчета CrewLife"
echo "======================================"

# Создаем директорию для отчетов
REPORTS_DIR="/root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite/reports"
mkdir -p "$REPORTS_DIR"

# Генерируем имя файла с датой
DATE=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORTS_DIR/crewlife_daily_report_$DATE.xlsx"

echo "📅 Дата создания: $(date '+%Y-%m-%d %H:%M:%S')"
echo "📁 Файл отчета: $REPORT_FILE"

# Проверяем, что веб-мониторинг работает
if ! curl -s http://localhost:5001/api/stats > /dev/null; then
    echo "❌ Веб-мониторинг не доступен на порту 5001"
    echo "🔄 Попытка запуска веб-мониторинга..."
    
    cd /root/CrewServiceWebsite/CrewServiceWebsite/CrewServiceWebsite
    python3 web_db_monitor.py &
    sleep 5
    
    if ! curl -s http://localhost:5001/api/stats > /dev/null; then
        echo "❌ Не удалось запустить веб-мониторинг"
        exit 1
    fi
fi

echo "✅ Веб-мониторинг доступен"

# Создаем отчет
echo "📊 Создание Excel отчета..."
if curl -s -o "$REPORT_FILE" http://localhost:5001/api/export/excel; then
    if [ -f "$REPORT_FILE" ] && [ -s "$REPORT_FILE" ]; then
        FILE_SIZE=$(du -h "$REPORT_FILE" | cut -f1)
        echo "✅ Отчет успешно создан"
        echo "📁 Размер файла: $FILE_SIZE"
        echo "📍 Путь: $REPORT_FILE"
        
        # Создаем симлинк на последний отчет
        LATEST_LINK="$REPORTS_DIR/latest_report.xlsx"
        ln -sf "$REPORT_FILE" "$LATEST_LINK"
        echo "🔗 Создан симлинк: $LATEST_LINK"
        
        # Показываем статистику
        echo ""
        echo "📈 Статистика отчета:"
        curl -s http://localhost:5001/api/stats | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f'   👥 Активных пользователей: {data.get(\"active_users\", \"N/A\")}')
    print(f'   📝 Всего заявок: {data.get(\"total_requests\", \"N/A\")}')
    print(f'   ⏳ Заявок в обработке: {data.get(\"pending_requests\", \"N/A\")}')
    print(f'   💾 Размер БД: {data.get(\"db_size_mb\", \"N/A\")} MB')
except:
    print('   ❌ Ошибка получения статистики')
"
        
    else
        echo "❌ Ошибка: Файл отчета пуст или не создан"
        exit 1
    fi
else
    echo "❌ Ошибка создания отчета"
    exit 1
fi

# Очистка старых отчетов (старше 30 дней)
echo ""
echo "🧹 Очистка старых отчетов..."
OLD_REPORTS=$(find "$REPORTS_DIR" -name "crewlife_daily_report_*.xlsx" -mtime +30)
if [ -n "$OLD_REPORTS" ]; then
    echo "$OLD_REPORTS" | while read -r file; do
        echo "🗑️  Удаление: $(basename "$file")"
        rm -f "$file"
    done
    echo "✅ Старые отчеты удалены"
else
    echo "ℹ️  Старых отчетов не найдено"
fi

echo ""
echo "🎉 Ежедневный отчет создан успешно!"
echo "📊 Для просмотра откройте: $REPORT_FILE"
echo "🌐 Веб-мониторинг: http://localhost:5001"
