FROM node:latest

LABEL MAINTAINER="Chris \"August\" Hernandez <august@augu.dev>"
WORKDIR /opt/webhooks
COPY package*.json .
COPY . .
RUN yarn
RUN npm i -g eslint
RUN npm run lint

CMD [ "npm", "start" ]
