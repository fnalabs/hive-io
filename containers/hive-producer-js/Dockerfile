# start with Alpine Linux Base image
# NOTE: change FROM statement to preferred Node.js image
FROM node:6.10.2-alpine
MAINTAINER Adam Eilers <adam.eilers@gmail.com>

# NOTE: if user created, change APP_PATH to user's workspace
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
RUN apk update \
    && apk add bash-completion \
    && bash ./bin/install

# expose standard Node.js port of 3000
EXPOSE 3000

# NOTE: change CMD to be command to start node app
CMD ["npm", "start"]
