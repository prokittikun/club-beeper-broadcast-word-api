FROM node:18.14.2

#  Navigate to the container working directory 
WORKDIR /usr/src/app
#  Copy package.json
COPY package*.json ./

RUN yarn
COPY . .
RUN yarn build
CMD [ "node", "dist/main.js" ]