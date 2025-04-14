
#!/bin/bash

# Установка зависимостей проекта
echo "Установка зависимостей..."
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..

echo "Структура проекта инициализирована!"
echo "Для запуска проекта используйте команду: npm run dev"
