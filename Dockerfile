FROM node:14-alpine
WORKDIR /opt/app
ADD package.json package.json
RUN npm install --force
ADD . .
RUN npm run build
COPY .env /opt/app/dist/.env
RUN npm prune --production
CMD ["node", "./dist/main.js"]
