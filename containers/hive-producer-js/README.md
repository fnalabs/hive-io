# hive-producer-js
This is a starter kit for [Hive Stack](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903) Producers in Node.js w/ Koa2 in Docker. There is also a [base image](https://hub.docker.com/r/fnalabs/hive-producer-js/) on Docker Hub to support basic use cases.

## Purpose
Producers represent a simpler implementation where domain Value Objects can be passed through to the log directly with minimal validation. Since Value Objects have no unique identity, they are essentially immutable and should be treated as such. Therefore, this type of validation is superficial and can easily be handled by the Value Object's schema definition. Examples of this type of implementation would include streams of analytics data for user tracking or geolocation data for real-time position tracking.

## Usage
TODO

### Examples
Below is a snippet of a `docker-compose.yml` definition for development. Change values as you see fit.
```
hive-producer-js:
  build:
    context: ../hive-producer-js
    args:
      APP_SOURCE: "."
      NODE_ENV: "development"
  image: hive-producer-js
  environment:
    CLUSTER_SIZE: 1
    EVENT_STORE_URL: "hive-io-kafka-db:2181"
    EVENT_STORE_ID: "producer-client"
  depends_on:
    - hive-io-kafka
  command: npm run start:dev
  expose:
    - "3000"
  volumes:
    - ../hive-producer-js:/opt/app:rw
    - /opt/app/node_modules
    - ../hive-io-domain-example:/opt/app/node_modules/hive-io-domain-example:rw
  networks:
    - hive-io
```

Production builds are a multi-step process that is easily automated. Below is a short script to achieve this goal.
```
npm run build
docker build -t fnalabs/hive-producer-js .
```

### Environment variables
Below is a table describing the possible environment variables to run the Hive Framework Producer. You can override these settings if/when required. This option works great if using the standard setup within a Docker container.

Name                | Type    | Default                   | Description
------------------- | ------- | ------------------------- | -------------------------------------------------------
NODE_ENV            | String  | 'production'              | app runtime environment
PORT                | Number  | 3000                      | app port to listen on
CLUSTER_SIZE        | Number  | [total CPUs available]    | defaults to the total available CPUs allocated to the container or to the size you specify here
ACTOR               | String  | 'ViewActor'               | Actor (Model) the microservice is responsible for
ACTOR_LIB           | String  | 'hive-io-domain-example'  | module where the ACTOR resides
EVENT_STORE_TOPIC   | String  | 'view'                    | Kafka topic the models will be stored under
EVENT_STORE_ID      | String  |                           | unique identifier for Kafka client connection
EVENT_STORE_URL     | String  |                           | URL where Kafka is hosted
EVENT_STORE_TYPE    | String  | 'gzip'                    | compression codec type: `none`, `gzip`, `snappy`, `lz4`
EVENT_STORE_BUFFER  | Number  | 1000                      | time (in `ms`) to buffer incoming messages to batch
