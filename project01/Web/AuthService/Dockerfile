FROM node:latest
WORKDIR /app
COPY . .
RUN npm install
RUN npm install react

EXPOSE 3001
CMD ["node", "server.js"]