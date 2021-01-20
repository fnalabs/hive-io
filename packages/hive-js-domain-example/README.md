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

This example evolves the previous [hive-io-rest-example](https://www.npmjs.com/package/hive-io-rest-example) into a highly distributed architecture in order to handle different magnitudes of network traffic for `viewed` metrics and `text` management. It is a contrived but slightly more robust example to illustrate different ways to use Actors in the [Hive<sup>io</sup>](https://hiveframework.io) framework.

### Endpoints

Once you get the app running using the [setup instructions](#getting-started) below, you can use the application from the following endpoint(s):

- `https://localhost/contents (GET, POST)`
    - POST [API JSON Schema](https://github.com/fnalabs/hive-io/blob/master/packages/hive-js-domain-example/src/schemas/json/commands/CreateContent.json)
        ```json
        {
          "text": "something"
        }
        ```
- `https://localhost/contents/<id> (GET, PATCH, DELETE)`
    - PATCH [API JSON Schema](https://github.com/fnalabs/hive-io/blob/master/packages/hive-js-domain-example/src/schemas/json/commands/EditContent.json)
        ```json
        {
          "text": "something different"
        }
        ```
    - DELETE

***NOTE:*** Network [data models](https://hiveframework.io/model) follow the Flux Standard Action specification for network transport. `type` and `payload` are derived from the routes and data sent respectively in this example.

***NOTE:*** The services are using locally generated SSL certs for the example so you may get a warning in a browser or change configuration in Postman to disable `SSL certificate verification`, etc.

### [Source Code](https://github.com/fnalabs/hive-io/tree/master/packages/hive-js-domain-example)

## Getting Started

This is a straight forward CQRS/ES example of a `Content` Entity that contains text, a couple Boolean flags, and a count of how many views it has. It is a highly distributed application with the expectation that `viewed` traffic will be much larger than `text` management traffic. It stores these `Content`s in MongoDB. It leverages Hive<sup>io</sup>'s built-in telemetry solution with OpenTelemetry. Here's how to use it.

***NOTE:*** This does not include robust error handling, authentication, and other strategies to keep the example straight forward.

### Prerequisites

To use, you'll need:

- **Required**
    - [Docker](https://www.docker.com/)
    - [Docker Compose](https://docs.docker.com/compose/)
    - Proxy/Load Balancer ([HAProxy](https://hub.docker.com/_/haproxy))

### Installing

To start using:

**NOTE:** There is a chicken or egg scenario when you run this example for the first time. In this example, the topics are not created until events are sent from `hive-producer-js` and `hive-stream-processor-js`. Therefore, you will need to restart `hive-consumer-js` after the topics are created to finally see events flow through the system.

**NOTE:** Because Kafka takes some time to start, you may need to restart the Hive<sup>io</sup> services once Kafka has stabilized.

1. Create the following files:
    - `Producer.dockerfile`
        ```dockerfile
        FROM fnalabs/hive-producer-js:latest
        RUN npm install --production --no-optional hive-io-domain-example
        ```
    - `Stream-Processor.dockerfile`
        ```dockerfile
        FROM fnalabs/hive-stream-processor-js:latest
        RUN npm install --production --no-optional hive-io-domain-example
        ```
    - `Consumer.dockerfile`
        ```dockerfile
        FROM fnalabs/hive-consumer-js:latest
        RUN npm install --production --no-optional hive-io-domain-example
        ```
    - `Rest.dockerfile`
        ```dockerfile
        FROM fnalabs/hive-base-js:latest
        RUN npm install --production --no-optional hive-io-domain-example
        ```
    - `Proxy.dockerfile`
        ```dockerfile
        FROM haproxy:2.3.4-alpine
        RUN apk --no-cache add \
                ca-certificates
        EXPOSE 443
        ```
    - `docker-compose.yml`
        ```yml
        version: '3.5'
        services:
          # proxy for layer 7 routing
          # TODO: you will need to define your own config for this example
          #       https://github.com/fnalabs/hive-io/blob/master/dev/docker/domain/example/haproxy.cfg
          proxy:
            build:
              context: .
              dockerfile: Proxy.dockerfile
            image: hive-proxy:production
            container_name: proxy
            depends_on:
              - hive-base-js
              - hive-stream-processor-js
            ports:
              - 443:443
            volumes:
              - .:/usr/local/etc/haproxy:rw
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
              ACTOR_URLS: "/contents/:id"
              CLUSTER_SIZE: 1
              SECURE: "true"
              SSL_CERT: "/opt/app/cert/ssl-cert.pem"
              SSL_KEY: "/opt/app/cert/ssl-key.pem"
              TELEMETRY: "true"
              TELEMETRY_SERVICE_NAME: produce
              TELEMETRY_URL_METRICS: "http://collector:55681/v1/metrics"
              TELEMETRY_URL_TRACES: "http://collector:55681/v1/trace"
              EVENT_STORE_TOPIC: view
              EVENT_STORE_BROKERS: "kafka:29092"
              EVENT_STORE_ID: producer-client
            depends_on:
              - collector
              - kafka
            volumes:
              - ./cert:/opt/app/cert:rw
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
              ACTOR: ContentCommandActor
              ACTOR_LIB: hive-io-domain-example
              ACTOR_URLS: "/contents,/contents/:id"
              CLUSTER_SIZE: 1
              SECURE: "true"
              SSL_CERT: "/opt/app/cert/ssl-cert.pem"
              SSL_KEY: "/opt/app/cert/ssl-key.pem"
              TELEMETRY: "true"
              TELEMETRY_SERVICE_NAME: stream
              TELEMETRY_URL_METRICS: "http://collector:55681/v1/metrics"
              TELEMETRY_URL_TRACES: "http://collector:55681/v1/trace"
              CACHE_URL: "redis://redis:6379"
              EVENT_STORE_PRODUCER_TOPIC: content
              EVENT_STORE_BROKERS: "kafka:29092"
              EVENT_STORE_ID: stream-processor-client
            depends_on:
              - collector
              - kafka
              - redis
            volumes:
              - ./cert:/opt/app/cert:rw
            networks:
              - hive-io
          redis:
            image: redis:6.0.10-alpine
            container_name: redis
            networks:
              - hive-io
            restart: on-failure

          # log stream containers
          kafka:
            image: confluentinc/cp-kafka:6.0.1
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
            image: confluentinc/cp-zookeeper:6.0.1
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
              ACTOR: ContentEventActor
              ACTOR_LIB: hive-io-domain-example
              CLUSTER_SIZE: 1
              SECURE: "true"
              SSL_CERT: "/opt/app/cert/ssl-cert.pem"
              SSL_KEY: "/opt/app/cert/ssl-key.pem"
              TELEMETRY: "true"
              TELEMETRY_PLUGINS: '{"mongodb":{"enabled":true,"path":"@opentelemetry/plugin-mongodb"},"mongoose":{"enabled":true,"path":"@wdalmut/opentelemetry-plugin-mongoose"}}'
              TELEMETRY_SERVICE_NAME: consume
              TELEMETRY_URL_METRICS: "http://collector:55681/v1/metrics"
              TELEMETRY_URL_TRACES: "http://collector:55681/v1/trace"
              EVENT_STORE_TOPIC: "content|view"
              EVENT_STORE_BROKERS: "kafka:29092"
              EVENT_STORE_ID: consumer-client
              EVENT_STORE_GROUP_ID: consumer-group
              EVENT_STORE_FROM_START: "true"
              MONGO_URL: "mongodb://mongo:27017/contents"
            depends_on:
              - collector
              - kafka
              - mongo
            volumes:
              - ./cert:/opt/app/cert:rw
            networks:
              - hive-io
          mongo:
            image: mongo:4.4.3
            container_name: mongo
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
              ACTOR: ContentQueryActor
              ACTOR_LIB: hive-io-domain-example
              ACTOR_URLS: "/contents,/contents/:id"
              CLUSTER_SIZE: 1
              SECURE: "true"
              SSL_CERT: "/opt/app/cert/ssl-cert.pem"
              SSL_KEY: "/opt/app/cert/ssl-key.pem"
              TELEMETRY: "true"
              TELEMETRY_PLUGINS: '{"mongodb":{"enabled":true,"path":"@opentelemetry/plugin-mongodb"},"mongoose":{"enabled":true,"path":"@wdalmut/opentelemetry-plugin-mongoose"}}'
              TELEMETRY_SERVICE_NAME: query
              TELEMETRY_URL_METRICS: "http://collector:55681/v1/metrics"
              TELEMETRY_URL_TRACES: "http://collector:55681/v1/trace"
              MONGO_URL: "mongodb://mongo:27017/contents"
            depends_on:
              - collector
              - hive-producer-js
              - mongo
            volumes:
              - ./cert:/opt/app/cert:rw
            networks:
              - hive-io

          # telemetry
          # TODO: you will need to define your own config for this example
          #       https://github.com/fnalabs/hive-io/blob/master/dev/collector/collector-config.yml
          collector:
            image: otel/opentelemetry-collector:0.18.0
            container_name: collector
            command: ["--config=/conf/collector-config.yml", "--log-level=ERROR"]
            depends_on:
              - zipkin
            volumes:
              - ./collector-config.yml:/conf/collector-config.yml
            networks:
              - hive-io
            restart: on-failure
          zipkin:
            image: openzipkin/zipkin:2.23.2
            container_name: zipkin
            ports:
              - 9411:9411
            networks:
              - hive-io
            restart: on-failure

        # networking
        networks:
          hive-io:
            driver: bridge
        ```
2. Run the following commands:
    ```sh
    mkdir cert
    rm -f cert/ssl.pem cert/ssl-cert.pem cert/ssl-key.pem
    openssl req -x509 -out cert/ssl-cert.pem -keyout cert/ssl-key.pem \
      -newkey rsa:2048 -nodes -sha256 \
      -subj '/CN=localhost' -extensions EXT -config <( \
      printf "keyUsage=digitalSignature\nextendedKeyUsage=serverAuth\n[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=@alt_names\n[alt_names]\nDNS.1=localhost\nDNS.2=proxy\nDNS.3=hive-base-js\nDNS.4=hive-consumer-js\nDNS.5=hive-producer-js\nDNS.6=hive-stream-processor-js")
    cat cert/ssl-key.pem cert/ssl-cert.pem >> cert/ssl.pem
    docker-compose up
    ```

### Environment Variables

The table below contains a reference to the custom environment variables used in the example. [Standard environment variables](https://hiveframework.io/environments) are documented for all service containers.

Name       | Type    | Default                           | Description
---------- | ------- | --------------------------------- | -----------------------------------
MONGO_URL  | String  | 'mongodb://mongo:27017/contents'  | url to connect to MongoDB instance

[npm-image]: https://img.shields.io/npm/v/hive-io-domain-example.svg
[npm-url]: https://www.npmjs.com/package/hive-io-domain-example

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-io/blob/master/packages/hive-js-domain-example/LICENSE

[codecov-image]: https://codecov.io/gh/fnalabs/hive-io/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-io

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
