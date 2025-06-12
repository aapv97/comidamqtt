FROM node:18

WORKDIR /app

RUN apt-get update && apt-get install -y netcat-openbsd

COPY . .

RUN chmod +x espera-mysql.sh

RUN npm install

CMD ["./espera-mysql.sh", "node", "server.js"]
