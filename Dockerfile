# Официальный Node.js
FROM node:18

# Рабочая директория
WORKDIR /app

# Сначала только package*.json для кеша зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install --omit=dev

# Копируем остальной код
COPY . .

# Переменные окружения (Railway подставит OPENAI_API_KEY и PORT)
ENV NODE_ENV=production

# Запускаем сервер
CMD ["node", "server.js"]
