# hive-consumer-js
This is a starter kit for [Hive Stack](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903) Consumers in Node.js w/ Koa2 in Docker. There is also a [base image](https://hub.docker.com/r/fnalabs/hive-consumer-js/) on Docker Hub to support basic use cases.

## Purpose
Consumers handle the query responsibilities in the CQRS pattern. They are responsible for translating single or multiple event streams into denormalized formats that can be queried by user applications. Since all of the data has been validated before it is logged, they free themselves from that requirement and can focus on translating and serving data.

The Hive Framework leverages MongoDB as a storage solution for these microservices because of its rich data modeling and querying capabilities. Apache Cassandra also seems like a viable solution for this requirement because of its ability to handle high-volume reads/writes and a rich query language.

## Usage
This starter kit extends all of the features of [docker-nodejs-starter](https://github.com/fnalabs/docker-nodejs-starter).

### Examples
Below is a snippet of a `docker-compose.yml` definition for development. Change values as you see fit.
```
hive-consumer-js:
  build:
    context: ../hive-consumer-js
    args:
      APP_SOURCE: "."
      NODE_ENV: "development"
  image: hive-consumer-js
  environment:
    EVENT_STORE_URL: "hive-io-kafka-db:2181"
    EVENT_STORE_ID: "consumer-client"
  depends_on:
    - hive-io-kafka
  command: npm run start:dev
  expose:
    - "3000"
  volumes:
    - ../hive-consumer-js:/opt/app:rw
    - /opt/app/node_modules
    - ../hive-io-domain-example:/opt/app/node_modules/hive-io-domain-example:rw
  networks:
    - hive-io
  mongo:
    image: mongo:3.4.4
    expose:
      - "27017"
    networks:
      - hive-io
    restart: always
```

Production builds are a multi-step process that is easily automated. Below is a short script to achieve this goal.
```
npm run build
docker build -t fnalabs/hive-consumer-js .
```

### Environment variables
Below is a table describing the possible environment variables to run the Hive Framework Consumer. You can override these settings if/when required. This option works great if using the standard setup within a Docker container.

Name                  | Type    | Default                     | Description
--------------------- | ------- | ------------------------- | -------------------------------------------------------
NODE_ENV              | String  | 'production'              | app runtime environment
PORT                  | Number  | 3000                      | app port to listen on
AGGREGATE_LIST        | String  | 'content,view'            | comma separated list of aggregates to consume
ACTOR                 | String  | 'PostActor'               | Actor to denormalize the aggregates
ACTOR_LIB             | String  | 'hive-io-domain-example'  | library where the PROJECTION resides
EVENT_STORE_ID        | String  |                           | unique identifier for Kafka client connection
EVENT_STORE_URL       | String  |                           | URL where Kafka is hosted
EVENT_STORE_TIMEOUT   | Number  | 15000                     | Kafka ConsumerGroup connection timeout in milliseconds
EVENT_STORE_PROTOCOL  | String  | 'roundrobin'              | Kafka ConsumerGroup load balancing protocol
EVENT_STORE_OFFSET    | String  | 'latest'                  | Kafka ConsumerGroup read log starting point
