FROM node:18

WORKDIR /app

COPY . .

ENV NODE_ENV=development

RUN npm install

RUN npm run build

EXPOSE 5173

CMD ["npm", "run", "preview", "--", "--host"]
