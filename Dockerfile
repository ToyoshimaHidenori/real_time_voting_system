FROM node:12.14.1-alpine3.11

WORKDIR /app

COPY app/package*.json ./
RUN npm install
RUN npm install express-generator -g
COPY app/ .

# デフォルトで node が起動するので sh を代わりに起動
CMD node app.js
