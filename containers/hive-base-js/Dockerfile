#
# Development build
#
FROM node:14.15.3-alpine as development

# set environment variables
ENV APP_PATH="/opt/app" \
    NODE_ENV="development" \
    PORT="3000" \
    SSL_CERT="/opt/app/cert/ssl-cert.pem" \
    SSL_KEY="/opt/app/cert/ssl-key.pem"

# Project code
COPY . ${APP_PATH}/

# change to workspace and run project install script
WORKDIR ${APP_PATH}
RUN apk --no-cache add bash-completion coreutils grep tree && \
    bash -e ./bin/install && \
    npm run release

# start with Alpine Linux Base image
FROM node:14.15.3-alpine as production

# set environment variables
ENV APP_PATH="/opt/app" \
    NODE_ENV="production" \
    PORT="3000" \
    SSL_CERT="/opt/app/cert/ssl-cert.pem" \
    SSL_KEY="/opt/app/cert/ssl-key.pem"

COPY --from=development ${APP_PATH}/dist ${APP_PATH}/dist/
COPY bin ${APP_PATH}/bin/
COPY package.json LICENSE README.md ${APP_PATH}/

# change to workspace and run project install script
WORKDIR ${APP_PATH}
RUN apk --no-cache add bash && \
    bash -e ./bin/install

# expose standard Node.js port of 3000
EXPOSE ${PORT}

# NOTE: change CMD to be command to start node app
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
