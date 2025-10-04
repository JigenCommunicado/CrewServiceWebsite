FROM python:3.12-slim

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    mariadb-client \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Создание пользователя для приложения
RUN useradd -m -s /bin/bash crewlife

# Установка рабочей директории
WORKDIR /app

# Копирование файлов зависимостей
COPY requirements.docker.txt requirements.txt

# Установка Python зависимостей
RUN pip install --no-cache-dir -r requirements.txt

# Копирование исходного кода
COPY . .

# Создание необходимых директорий
RUN mkdir -p /app/logs /app/backups /app/reports /app/data

# Установка прав доступа
RUN chown -R crewlife:crewlife /app
RUN chmod +x *.sh

# Переключение на пользователя приложения
USER crewlife

# Открытие портов
EXPOSE 5000 5001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Точка входа
CMD ["python3", "web_db_monitor.py"]
