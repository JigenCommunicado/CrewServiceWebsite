#!/usr/bin/env python3
"""
WSGI конфигурация для CrewLife API
Для запуска на Apache с mod_wsgi
"""

import sys
import os

# Добавляем путь к приложению
sys.path.insert(0, '/var/www/html/crewlife/backend')

# Импортируем приложение
from api import app as application

if __name__ == "__main__":
    application.run()
