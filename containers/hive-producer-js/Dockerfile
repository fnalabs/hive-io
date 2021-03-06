#
# Development build
#
FROM node:14.15.4-alpine as development

# set environment variables
ENV APP_PATH="/opt/app" \
    NODE_ENV="development" \
    PORT="3000"

# Project code
COPY . ${APP_PATH}/

# change to workspace and run project install script
WORKDIR ${APP_PATH}
RUN apk --no-cache add \
        ca-certificates \
        coreutils \
        grep \
        dumb-init \
        openssl \
        tree && \
    mkdir cert && \
    openssl req -x509 -newkey rsa:2048 -nodes -sha256 -subj '/CN=localhost' \
        -keyout cert/ssl-key.pem -out cert/ssl-cert.pem && \
    npm install --quiet --no-optional && \
    npm run release

#
# Production build
#
FROM node:14.15.4-alpine as production

# set environment variables
ENV APP_PATH="/opt/app" \
    NODE_ENV="production" \
    PORT="3000"

COPY --from=development ${APP_PATH}/dist ${APP_PATH}/dist/
COPY bin ${APP_PATH}/bin/
COPY package.json LICENSE README.md ${APP_PATH}/

# change to workspace and run project install script
WORKDIR ${APP_PATH}
RUN apk --no-cache add \
        ca-certificates \
        dumb-init \
        openssl && \
    npm install --quiet --no-optional --production && \
    npm prune --production && \
    npm cache clean --force

# expose standard Node.js port of 3000
EXPOSE ${PORT}

# NOTE: change CMD to be command to start node app
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
