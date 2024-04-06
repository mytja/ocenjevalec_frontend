FROM node:20-alpine3.19 as build
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
COPY package.json ./
COPY package-lock.json ./
COPY . ./
RUN npm i
RUN npm run build

FROM nginx:1.25.4-alpine
COPY --from=build /app/dist /usr/share/nginx/html