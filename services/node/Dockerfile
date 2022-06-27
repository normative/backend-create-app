FROM node:14.19.1-bullseye-slim

ARG root_dir=/usr/src/app
RUN apt-get -y update \
    && apt-get -y upgrade \
    && apt-get -y install tini \
    && apt-get -y install python3 python make g++ \
    && mkdir -p $root_dir

#Copying over current base application
WORKDIR $root_dir
COPY package.json .

#Installing base dependencies & cleaning up
RUN npm install -g npm@latest \
    && yarn install \
    && yarn install --dev \
    && yarn global add nodemon \
    && yarn global add mocha \
    && yarn cache clean

#Copying over all files
COPY . .

#Main directories to be customized/replaced. Mount alternatives
VOLUME $root_dir/app.js
VOLUME $root_dir/config
VOLUME $root_dir/libs
VOLUME $root_dir/middleware
VOLUME $root_dir/models
VOLUME $root_dir/public
VOLUME $root_dir/routes
VOLUME $root_dir/serverless
VOLUME $root_dir/tests
VOLUME $root_dir/views

#Environment
ENV NODE_ENV=development

#Setting main ports
ENV PORT 80
EXPOSE 80

EXPOSE 4001

ENV PORT_INSPECT 9229
EXPOSE 9229

#Setting main thread
CMD ["tini", "--", "nodemon", "-e", "js,mjs,json,graphql", "--inspect=0.0.0.0", "--trace-warnings", "./app.js"]
