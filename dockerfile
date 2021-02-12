FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

RUN apk --no-cache add g++ gcc libgcc libstdc++ linux-headers make python
RUN npm install --quiet node-gyp -g

COPY ./client/package*.json ./client/
RUN cd client && npm install

COPY ./server/package*.json ./server/
RUN cd server && npm install

COPY . .

RUN cd client && npm run build

EXPOSE 10010

WORKDIR /usr/src/app/server
CMD [ "sh", "-c", "npm run pm2:start && npx pm2 logs" ]
