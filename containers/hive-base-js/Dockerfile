# start with Alpine Linux Base image
# NOTE: change 'ARG IMG_VER="..."' statement to preferred Node.js image
ARG IMG_VER="8.9.4-alpine"
FROM node:${IMG_VER}
LABEL maintainer="Adam Eilers"

# NOTE: if user created, change APP_PATH to user's workspace
ARG APP_MODULE="hive-io-rest-example"
ARG APP_PATH="/opt/app"
ARG APP_SOURCE="app.tar.gz"
ARG NODE_ENV
ARG PORT

# set environment variables
ENV NODE_ENV="${NODE_ENV:-production}" \
    PORT="${PORT:-3000}"

# Project code
# NOTE: APP_SOURCE can use build process compressed output for smaller production builds
ADD ${APP_SOURCE} ${APP_PATH}

# change to workspace and run project install script
WORKDIR ${APP_PATH}
RUN apk add --update bash-completion && bash ./bin/install

# expose standard Node.js port of 3000
EXPOSE ${PORT}

# NOTE: change CMD to be command to start node app
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
