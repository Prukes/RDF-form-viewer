FROM node:15.4 as build 

WORKDIR /react-app

COPY package*.json .
COPY *.tgz .
 
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM nginx:1.19

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf

COPY --from=build /react-app/build /usr/share/nginx/html