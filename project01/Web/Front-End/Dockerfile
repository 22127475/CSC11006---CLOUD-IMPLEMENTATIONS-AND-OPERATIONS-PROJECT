FROM node:24-alpine
WORKDIR /app
COPY . .
RUN npm install

EXPOSE 8080
CMD ["node", "app.js"]