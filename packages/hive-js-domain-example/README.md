# hive-io-domain-example

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Code Coverage][codecov-image]][codecov-url]
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

This example evolves the previous [hive-io-rest-example](https://www.npmjs.com/package/hive-io-rest-example) into a highly distributed architecture in order to handle different magnitudes of network traffic for `viewed` metrics and `content` management. It is a contrived but more robust example to illustrate different ways to use Actors in the [Hive<sup>io</sup>](https://hiveframework.io) framework.

### Endpoints

Once you get the app running using the [setup instructions](#getting-started) below, you can use the application from the following endpoint(s):

- `http://localhost/posts (GET, POST)`
    - POST [API JSON Schema](https://github.com/fnalabs/hive-io/blob/master/packages/hive-js-domain-example/src/schemas/json/commands/CreateContent.json)
        ```json
        {
          "text": "something"
        }
        ```
- `http://localhost/posts/<postId> (GET, PATCH, DELETE)`
    - PATCH [API JSON Schema](https://github.com/fnalabs/hive-io/blob/master/packages/hive-js-domain-example/src/schemas/json/commands/EditContent.json)
        ```json
        {
          "text": "something different"
        }
        ```
    - DELETE

***NOTE:*** Network [data models](https://hiveframework.io/model) follow the Flux Standard Action specification for network transport. `type` and `payload` are derived from the routes and data sent respectively in this example.

### [Source Code](https://github.com/fnalabs/hive-io/tree/master/packages/hive-js-domain-example)

## Getting Started

This is a straight forward CQRS/ES example of a `Post` Entity that contains text, a couple Boolean flags, and a count of how many views it has. It is a highly distributed application with the expectation that `viewed` traffic will be much larger than `content` management traffic. It stores these `Post`s in MongoDB. It implements an Actor System to handle logging to Fluentd. Here's how to use it.

### Prerequisites

To use, you'll need:

- **Required**
    - [Docker](https://www.docker.com/)
    - [Docker Compose](https://docs.docker.com/compose/)
    - Proxy/Load Balancer ([HAProxy](https://hub.docker.com/_/haproxy))

### Installing

To start using:

1. Create the following files:
    - `Producer.dockerfile`
        ```dockerfile
        FROM fnalabs/hive-producer-js:latest
        RUN npm install hive-io-domain-example
        ```
    - `Stream-Processor.dockerfile`
        ```dockerfile
        FROM fnalabs/hive-stream-processor-js:latest
        RUN npm install hive-io-domain-example
        ```
    - `Consumer.dockerfile`
        ```dockerfile
        FROM fnalabs/hive-consumer-js:latest
        RUN npm install hive-io-domain-example
        ```
    - `Rest.dockerfile`
        ```dockerfile
        FROM fnalabs/hive-base-js:latest
        RUN npm install hive-io-domain-example
        ```
    - `docker-compose.yml`
        ```yml
        version: '3.5'
        services:
          # proxy for layer 7 routing
          # NOTE: this is an example, you will need to define your own
          #       ex. https://github.com/fnalabs/hive-io/tree/master/dev/proxy
          proxy:
            image: haproxy:1.8.23-alpine
            container_name: proxy
            depends_on:
              - hive-base-js
              - hive-stream-processor-js
            ports:
              - 80:80
            networks:
              - hive-io
            restart: on-failure
          fluentd:
            image: fluent/fluentd:v1.11.4-2.0
            container_name: fluentd
            networks:
              - hive-io
            restart: on-failure

          # producers
          hive-producer-js:
            build:
              context: .
              dockerfile: Producer.dockerfile
            image: hive-producer-js:production
            container_name: hive-producer-js
            environment:
              ACTOR: ViewContentActor
              ACTOR_LIB: hive-io-domain-example
              ACTOR_URLS: "/posts/:id"
              CLUSTER_SIZE: 1
              HTTP_VERSION: 1
              SECURE: "false"
              EVENT_STORE_TOPIC: view
              EVENT_STORE_BROKERS: "kafka:29092"
              EVENT_STORE_ID: producer-client
              FLUENTD_HOST: fluentd
              FLUENTD_PORT: 24224
              FLUENTD_TIMEOUT: 3.0
              FLUENTD_RECONNECT: 600000
            depends_on:
              - fluentd
              - kafka
            networks:
              - hive-io

          # stream processors
          hive-stream-processor-js:
            build:
              context: .
              dockerfile: Stream-Processor.dockerfile
            image: hive-stream-processor-js:production
            container_name: hive-stream-processor-js
            environment:
              ACTOR: PostCommandActor
              ACTOR_LIB: hive-io-domain-example
              ACTOR_URLS: "/posts,/posts/:id"
              CLUSTER_SIZE: 1
              HTTP_VERSION: 1
              SECURE: "false"
              CACHE_URL: "redis://redis:6379"
              EVENT_STORE_PRODUCER_TOPIC: content
              EVENT_STORE_BROKERS: "kafka:29092"
              EVENT_STORE_ID: stream-processor-client
              FLUENTD_HOST: fluentd
              FLUENTD_PORT: 24224
              FLUENTD_TIMEOUT: 3.0
              FLUENTD_RECONNECT: 600000
            depends_on:
              - fluentd
              - kafka
              - redis
            networks:
              - hive-io
          redis:
            image: redis:6.0.9-alpine
            container_name: redis
            networks:
              - hive-io
            restart: on-failure

          # log stream containers
          kafka:
            image: confluentinc/cp-kafka:5.4.3
            container_name: kafka
            depends_on:
              - zookeeper
            environment:
              KAFKA_ZOOKEEPER_CONNECT: "zookeeper:32181"
              KAFKA_ADVERTISED_LISTENERS: "PLAINTEXT://kafka:29092"
              KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
              KAFKA_COMPRESSION_TYPE: gzip
            expose:
              - 29092
            networks:
              - hive-io
            restart: on-failure
          zookeeper:
            image: confluentinc/cp-zookeeper:5.4.3
            container_name: zookeeper
            environment:
              ZOOKEEPER_CLIENT_PORT: 32181
            expose:
              - 32181
            networks:
              - hive-io
            restart: on-failure

          # consumers
          hive-consumer-js:
            build:
              context: .
              dockerfile: Consumer.dockerfile
            image: hive-consumer-js:production
            container_name: hive-consumer-js
            environment:
              ACTOR: PostEventActor
              ACTOR_LIB: hive-io-domain-example
              CLUSTER_SIZE: 1
              HTTP_VERSION: 1
              SECURE: "false"
              MONGO_URL: "mongodb://mongo:27017/post"
              EVENT_STORE_TOPIC: "content|view"
              EVENT_STORE_BROKERS: "kafka:29092"
              EVENT_STORE_ID: consumer-client
              EVENT_STORE_GROUP_ID: consumer-group
              EVENT_STORE_FROM_START: "true"
              FLUENTD_HOST: fluentd
              FLUENTD_PORT: 24224
              FLUENTD_TIMEOUT: 3.0
              FLUENTD_RECONNECT: 600000
            depends_on:
              - fluentd
              - kafka
              - mongo
            networks:
              - hive-io
          mongo:
            image: mongo:4.4.1
            networks:
              - hive-io
            restart: on-failure

          # rest services
          hive-base-js:
            build:
              context: .
              dockerfile: Rest.dockerfile
            image: hive-base-js:production
            container_name: hive-base-js
            environment:
              ACTOR: PostQueryActor
              ACTOR_LIB: hive-io-domain-example
              ACTOR_URLS: "/posts,/posts/:id"
              CLUSTER_SIZE: 1
              HTTP_VERSION: 1
              SECURE: "false"
              MONGO_URL: "mongodb://mongo:27017/post"
              FLUENTD_HOST: fluentd
              FLUENTD_PORT: 24224
              FLUENTD_TIMEOUT: 3.0
              FLUENTD_RECONNECT: 600000
            depends_on:
              - fluentd
              - hive-producer-js
              - mongo
            networks:
              - hive-io

        # networking specifics
        networks:
          hive-io:
            driver: bridge
        ```
2. Run the following commands:
    ```sh
    docker-compose up
    ```

**NOTE:** There is a chicken or egg scenario when you run this example for the first time. In this example, the topics are not created until events are sent from `hive-producer-js` and `hive-stream-processor-js`. Therefore, you will need to restart `hive-consumer-js` after the topics are created to finally see events flow through the system.

### Environment Variables

The table below contains a reference to the custom environment variables used in the example. [Standard environment variables](https://hiveframework.io/environments) are documented for all service containers.

Name               | Type    | Default                       | Description
------------------ | ------- | ----------------------------- | -------------------------------------------------------
MONGO_URL          | String  | 'mongodb://mongo:27017/post'  | url to connect to MongoDB instance
FLUENTD_HOST       | String  | 'fluentd'                     | Hostname of Fluentd instance
FLUENTD_PORT       | Number  | 24224                         | Port of Fluentd instance
FLUENTD_TIMEOUT    | Number  | 3.0                           | Timeout (in sec) for Fluentd client
FLUENTD_RECONNECT  | Number  | 600000                        | Reconnect Interval (in sec) for Fluentd client

[npm-image]: https://img.shields.io/npm/v/hive-io-domain-example.svg
[npm-url]: https://www.npmjs.com/package/hive-io-domain-example

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-io/blob/master/packages/hive-js-domain-example/LICENSE

[codecov-image]: https://codecov.io/gh/fnalabs/hive-io/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-io

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
