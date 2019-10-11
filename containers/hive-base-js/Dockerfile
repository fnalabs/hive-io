#
# Development build
#
FROM node:10.16.3-alpine as development

# NOTE: if user created, change APP_PATH to user's workspace
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
    bash ./bin/install && \
    npm run release

# start with Alpine Linux Base image
# NOTE: change 'ARG IMG_VER="..."' statement to preferred Node.js image
FROM node:10.16.3-alpine as production

# set environment variables
ENV APP_PATH="/opt/app" \
    NODE_ENV="production" \
    PORT="3000"

COPY --from=development ${APP_PATH}/bin ${APP_PATH}/bin/
COPY --from=development ${APP_PATH}/conf ${APP_PATH}/conf/
COPY --from=development ${APP_PATH}/dist ${APP_PATH}/dist/
COPY --from=development ${APP_PATH}/package.json ${APP_PATH}/
COPY --from=development ${APP_PATH}/package-lock.json ${APP_PATH}/

# change to workspace and run project install script
WORKDIR ${APP_PATH}
RUN apk --no-cache add bash-completion && \
    bash ./bin/install

# expose standard Node.js port of 3000
EXPOSE ${PORT}

# NOTE: change CMD to be command to start node app
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
