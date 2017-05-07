# docker-nodejs-producer-starter
This is a starter kit for [Hive Stack](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903) Producers in Node.js w/ Koa2 in Docker. There is also a [base image](https://hub.docker.com/r/aeilers/docker-nodejs-producer/) on Docker Hub to support basic use cases.

## Purpose
Producers represent a simpler implementation where domain Entities and Value Objects can be passed through to the log directly with minimal validation. This type of validation is superficial and can easily be handled by the model's schema definition. Examples of this type of implementation would include streams of analytics data for user tracking or geolocation data for real-time position tracking.

## Example
Below is a snippet of a `docker-compose.yml` definition for development. Change values as you see fit.
```
docker-nodejs-producer-starter:
  build:
    context: ../docker-nodejs-producer-starter
    args:
      APP_SOURCE: "."
      NODE_ENV: "development"
  image: docker-nodejs-producer-starter
  environment:
    EVENT_STORE_URL: "docker-kafka-db:2181"
    EVENT_STORE_ID: "producer-client"
  depends_on:
    - docker-kafka
  command: npm run start:dev
  expose:
    - "3000"
  volumes:
    - ../docker-nodejs-producer-starter:/opt/app:rw
    - /opt/app/node_modules
    - ../js-cqrs-es-domain-module:/opt/app/node_modules/js-cqrs-es-domain-module:rw
  networks:
    - js-cqrs-es
```

Production builds are a multi-step process that is easily automated. Below is a short script to achieve this goal.
```
npm run build
docker build -t aeilers/docker-nodejs-producer .
```

## Environment variables
Below is a table describing the possible environment variables to run the Hive Stack Producer. You can override these settings if/when required. This option works great if using the standard setup within a Docker container.

Name              | Type    | Default                     | Description
----------------- | ------- | --------------------------- | -------------------------------------------------------
NODE_ENV          | String  | 'production'                | app runtime environment
PORT              | Number  | 3000                        | app port to listen on
MODEL             | String  | 'view'                      | entity/value object the microservice is responsible for
MODEL_LIB         | String  | 'js-cqrs-es-domain-module'  | library where the MODEL resides
EVENT_STORE_ID    | String  |                             | unique identifier for Kafka client connection
EVENT_STORE_URL   | String  |                             | URL where Kafka is hosted
EVENT_STORE_TYPE  | Number  | 3                           | keyed partitioner type to guarantee order
