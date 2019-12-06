#
# Development build
#
FROM node:12.13.1-alpine as development
ARG APP_MODULE

# set environment variables
ENV APP_PATH="/opt/app" \
    NODE_ENV="development" \
    PORT="3000"

# Project code
COPY . ${APP_PATH}/

# change to workspace and run project install script
WORKDIR ${APP_PATH}
RUN apk --no-cache add bash-completion && \
    bash -e ./bin/install && \
    npm run release

# start with Alpine Linux Base image
FROM node:12.13.1-alpine as production

# set environment variables
ENV APP_PATH="/opt/app" \
    NODE_ENV="production" \
    PORT="3000"

COPY --from=development ${APP_PATH}/dist ${APP_PATH}/dist/
COPY bin ${APP_PATH}/bin/
COPY conf ${APP_PATH}/conf/
COPY package.json package-lock.json README.md LICENSE ${APP_PATH}/

# change to workspace and run project install script
WORKDIR ${APP_PATH}
RUN apk --no-cache add bash-completion && \
    bash -e ./bin/install

# expose standard Node.js port of 3000
EXPOSE ${PORT}

# NOTE: change CMD to be command to start node app
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
