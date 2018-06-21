# hive-io-domain-example

[![NPM Version][npm-image]][npm-url]
[![Build Status][circle-image]][circle-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

An example CQRS/ES domain module to help describe implementation details when leveraging the [Hive<sup>io</sup>](https://hiveframework.io) framework.

#### Contents
- [Overview](#overview)
    - [Endpoints](#endpoints)
    - [Source Code](#source-code)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installing](#installing)
    - [Environment Variables](#environment-variables)

## Overview
This example evolves the previous [hive-io-rest-example](https://www.npmjs.com/package/hive-io-rest-example) into a highly distributed architecture in order to handle different magnitudes of network traffic for `viewed` metrics and `content` management. It is a contrived but robust example to illustrate different ways to use Actors in the [Hive<sup>io</sup> framework](https://hiveframework.io).

### Endpoints
Once you get the app running using the [setup instructions](#getting-started) below, you can use the application from the following endpoint(s):
- `http://localhost/posts (GET, POST)`
    - POST [API JSON Schema](https://github.com/fnalabs/hive-js-rest-example/blob/master/src/schemas/json/Post.json)
        ```
        {
          "text": "something"
        }
        ```
- `http://localhost/posts/<postId> (GET, PATCH, DELETE)`
    - PATCH [API JSON Schema](https://github.com/fnalabs/hive-js-rest-example/blob/master/src/schemas/json/Post.json)
        ```
        {
          "text": "something different"
        }
        ```
    - DELETE

***NOTE:*** Network [data payloads](https://fnalabs.github.io/hive-js/#data-interface) follow the Flux Standard Action specification for network transport. `type` and `payload` are derived from the routes and data sent respectively in this example.

### [Source Code](https://github.com/fnalabs/hive-js-domain-example)

## Getting Started
This is a straight forward CQRS/ES example of a `Post` Entity that contains text, a couple boolean flags, and a count of how many views it has. It is a highly distributed application with the expectation that `viewed` traffic will be much larger than `content` management traffic. It stores these `Post`s in MongoDB. It implements an Actor System to handle logging to Fluentd. Here's how to use it.

### Prerequisites
To use, you'll need:
- **Required**
    - [Docker](https://www.docker.com/)
    - [Docker Compose](https://docs.docker.com/compose/)

### Installing
To start using:
1. Create the following files:
    - `Producer.dockerfile`
        ```
        FROM fnalabs/hive-producer-js:latest
        RUN npm install hive-io-domain-example
        ```
    - `Stream-Processor.dockerfile`
        ```
        FROM fnalabs/hive-stream-processor-js:latest
        RUN npm install hive-io-domain-example
        ```
    - `Consumer.dockerfile`
        ```
        FROM fnalabs/hive-consumer-js:latest
        RUN npm install hive-io-domain-example
        ```
    - `Rest.dockerfile`
        ```
        FROM fnalabs/hive-rest-js:latest
        RUN npm install hive-io-domain-example
        ```
    - `docker-compose.yml`
        ```
        version: '3.5'
        services:
          # proxy for layer 7 routing
          hive-io-proxy:
            image: fnalabs/hive-io-proxy:latest
            depends_on:
              - hive-producer-js
              - hive-rest-js
              - hive-stream-processor-js
            ports:
              - 80:80
            networks:
              - hive-io
            restart: on-failure
          fluentd:
            image: fluent/fluentd:v1.2.1
            networks:
              - hive-io
            restart: on-failure

          # producers
          hive-producer-js:
            build:
              context: .
              dockerfile: Producer.dockerfile
            image: hive-producer-js
            environment:
              CLUSTER_SIZE: 1
              EVENT_STORE_URL: "kafka:9092"
              EVENT_STORE_ID: "producer-client"
              FLUENTD_HOST: fluentd
              FLUENTD_PORT: 24224
              FLUENTD_TIMEOUT: 3.0
              FLUENTD_RECONNECT: 600000
            depends_on:
              - kafka
              - fluentd
            networks:
              - hive-io

          # stream processors
          hive-stream-processor-js:
            build:
              context: .
              dockerfile: Stream-Processor.dockerfile
            image: hive-stream-processor-js
            environment:
              CLUSTER_SIZE: 1
              CACHE_URL: "redis://redis:6379"
              EVENT_STORE_URL: "kafka:9092"
              EVENT_STORE_ID: stream-processor-client
              FLUENTD_HOST: fluentd
              FLUENTD_PORT: 24224
              FLUENTD_TIMEOUT: 3.0
              FLUENTD_RECONNECT: 600000
            depends_on:
              - redis
              - kafka
              - fluentd
            networks:
              - hive-io
          redis:
            image: redis:4.0.9-alpine
            networks:
              - hive-io
            restart: on-failure

          # log stream containers
          kafka:
            image: confluentinc/cp-kafka:4.1.1-2
            depends_on:
              - zookeeper
            environment:
              KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
              KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
              KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
            networks:
              - hive-io
            restart: on-failure
          zookeeper:
            image: confluentinc/cp-zookeeper:4.1.1-2
            environment:
              ZOOKEEPER_CLIENT_PORT: 2181
            networks:
              - hive-io
            restart: on-failure

          # consumers
          hive-consumer-js:
            build:
              context: .
              dockerfile: Consumer.dockerfile
            image: hive-consumer-js
            environment:
              CLUSTER_SIZE: 1
              MONGO_URL: "mongodb://mongo:27017/post"
              EVENT_STORE_URL: "kafka:9092"
              EVENT_STORE_ID: consumer-client
              EVENT_STORE_OFFSET: earliest
              FLUENTD_HOST: fluentd
              FLUENTD_PORT: 24224
              FLUENTD_TIMEOUT: 3.0
              FLUENTD_RECONNECT: 600000
            depends_on:
              - mongo
              - kafka
              - fluentd
            networks:
              - hive-io
          mongo:
            image: mongo:3.6.5
            networks:
              - hive-io
            restart: on-failure

          # rest services
          hive-rest-js:
            build:
              context: .
              dockerfile: Rest.dockerfile
            image: hive-rest-js
            environment:
              ACTOR: PostQueryActor
              ACTOR_LIB: hive-io-domain-example
              CLUSTER_SIZE: 1
              MONGO_URL: "mongodb://mongo:27017/post"
              FLUENTD_HOST: fluentd
              FLUENTD_PORT: 24224
              FLUENTD_TIMEOUT: 3.0
              FLUENTD_RECONNECT: 600000
            depends_on:
              - mongo
              - fluentd
            networks:
              - hive-io

        # networking specifics
        networks:
          hive-io:
            driver: bridge
        ```
2. Run the following commands:
    ```
    $ docker-compose up
    ```

### Environment Variables
The table below contains a reference to the custom environment variables used in the example. Standard environment variables are documented for the following service containers:
- [hive-producer-js](https://github.com/fnalabs/hive-producer-js#environment-variables)
- [hive-stream-processor-js](https://github.com/fnalabs/hive-stream-processor-js#environment-variables)
- [hive-consumer-js](https://github.com/fnalabs/hive-consumer-js#environment-variables)
- [hive-rest-js](https://github.com/fnalabs/hive-rest-js#environment-variables)

Name               | Type    | Default                       | Description
------------------ | ------- | ----------------------------- | -------------------------------------------------------
MONGO_URL          | String  | 'mongodb://mongo:27017/post'  | url to connect to MongoDB instance
FLUENTD_HOST       | String  | 'fluentd'                     | Hostname of Fluentd instance
FLUENTD_PORT       | Number  | 24224                         | Port of Fluentd instance
FLUENTD_TIMEOUT    | Number  | 3.0                           | Timeout (in sec) for Fluentd client
FLUENTD_RECONNECT  | Number  | 600000                        | Reconnect Interval (in sec) for Fluentd client

[npm-image]: https://img.shields.io/npm/v/hive-io-domain-example.svg
[npm-url]: https://www.npmjs.com/package/hive-io-domain-example

[circle-image]: https://img.shields.io/circleci/project/github/fnalabs/hive-js-domain-example.svg
[circle-url]: https://circleci.com/gh/fnalabs/hive-js-domain-example

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/hive-js-domain-example.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-js-domain-example

[depstat-image]: https://img.shields.io/david/fnalabs/hive-js-domain-example.svg
[depstat-url]: https://david-dm.org/fnalabs/hive-js-domain-example

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
