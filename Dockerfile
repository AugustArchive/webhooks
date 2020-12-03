FROM node:alpine

LABEL MAINTAINER="Chris \"August\" Hernandez <august@augu.dev>"
WORKDIR /opt/webhooks
COPY package*.json .
COPY . .
RUN npm i -g eslint
RUN npm ci
RUN npm run lint

ENV CONTAINER=true

CMD [ "npm", "run", "start" ]
