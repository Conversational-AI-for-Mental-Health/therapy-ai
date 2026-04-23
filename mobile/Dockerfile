FROM node:20-alpine AS base

RUN corepack enable

WORKDIR /app

COPY package.json yarn.lock .yarnrc.yml ./
COPY backend/ ./backend
COPY frontend/ ./frontend
COPY mobile/ ./mobile
COPY packages/ ./packages

RUN yarn install

WORKDIR /app/mobile

EXPOSE 8081 19000 19001 19002 19006

CMD ["yarn", "start", "--lan"]
