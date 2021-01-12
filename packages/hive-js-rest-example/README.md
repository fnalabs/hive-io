# hive-io-rest-example

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Code Coverage][codecov-image]][codecov-url]
[![JavaScript Style Guide][style-image]][style-url]

An example REST module to help describe implementation details when leveraging the [Hive<sup>io</sup>](https://hiveframework.io) framework.

#### Contents

- [Overview](#overview)
    - [Endpoints](#endpoints)
    - [Source Code](#source-code)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installing](#installing)
    - [Environment Variables](#environment-variables)

## Overview

This example contains a single resource to handle CRUD functionality of a generic `Content` object in a Restful implementation. It is a contrived but fairly robust example to illustrate different ways to use Actors in the [Hive<sup>io</sup>](https://hiveframework.io) framework.

### Endpoints

Once you get the app running using the [setup instructions](#getting-started) below, you can use the application from the following endpoint(s):

- `http://localhost/contents (GET, POST)`
    - POST [API JSON Schema](https://github.com/fnalabs/hive-io/blob/master/packages/hive-js-rest-example/src/schemas/json/Content.json)
        ```json
        {
          "text": "something"
        }
        ```
- `http://localhost/contents/<id> (GET, PATCH, DELETE)`
    - PATCH [API JSON Schema](https://github.com/fnalabs/hive-io/blob/master/packages/hive-js-rest-example/src/schemas/json/Content.json)
        ```json
        {
          "text": "something different"
        }
        ```
    - DELETE

***NOTE:*** Network [data models](https://hiveframework.io/model) follow the Flux Standard Action specification for network transport. `type` and `payload` are derived from the routes and data sent respectively in this example.

### [Source Code](https://github.com/fnalabs/hive-io/tree/master/packages/hive-js-rest-example)

## Getting Started

This is a straight forward CRUD example of a `Content` Entity that contains text, a couple Boolean flags, and a count of how many views it has. It stores these `Content`s in MongoDB. It leverages Hive<sup>io</sup>'s built-in telemetry solution with OpenTelemetry. Here's how to use it.

***NOTE:*** This does not include error handling, authentication, and other strategies to keep the example straight forward.

### Prerequisites

To use, you'll need:

- **Required**
    - [Docker](https://www.docker.com)
    - [Docker Compose](https://docs.docker.com/compose/)

### Installing

To start using:

1. Create the following files:
    - `Dockerfile`
        ```dockerfile
        FROM fnalabs/hive-base-js:latest
        RUN npm install hive-io-rest-example
        ```
    - `docker-compose.yml`
        ```yml
        version: '3.5'
        services:
          hive-base-js:
            build: .
            image: hive-base-js:production
            environment:
              ACTOR: ContentActor
              ACTOR_LIB: hive-io-rest-example
              ACTOR_URLS: "/contents,/contents/:id"
              CLUSTER_SIZE: 1
              HTTP_VERSION: 1
              SECURE: "false"
              TELEMETRY: "true"
              TELEMETRY_PLUGINS: '{"mongodb":{"enabled":true,"path":"@opentelemetry/plugin-mongodb"},"mongoose":{"enabled":true,"path":"@wdalmut/opentelemetry-plugin-mongoose"}}'
              TELEMETRY_URL_METRICS: "http://collector:55681/v1/metrics"
              TELEMETRY_URL_TRACES: "http://collector:55681/v1/trace"
              MONGO_URL: "mongodb://mongo:27017/contents"
            depends_on:
              - collector
              - mongo
            ports:
              - 80:3000
            networks:
              - hive-io
          mongo:
            image: mongo:4.4.3
            container_name: mongo
            networks:
              - hive-io
            restart: on-failure

          # telemetry
          # NOTE: you will need to provide a configuration for the collector
          #       see https://github.com/fnalabs/hive-io/blob/master/dev/collector/collector-config.yml
          collector:
            image: otel/opentelemetry-collector:0.17.0
            container_name: collector
            command: ["--config=/conf/collector-config.yml", "--log-level=ERROR"]
            depends_on:
              - zipkin
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
    docker-compose up
    ```

### Environment Variables

The table below contains a reference to the custom environment variables used in the example. Standard environment variables are documented for the following microservice containers:

- [hive-base-js](https://github.com/fnalabs/hive-io/tree/master/containers/hive-base-js#environment-variables)

Name               | Type    | Default                          | Description
------------------ | ------- | -------------------------------- | -------------------------------------------------------
MONGO_URL          | String  | 'mongodb://mongo:27017/content'  | url to connect to MongoDB instance

[npm-image]: https://img.shields.io/npm/v/hive-io-rest-example.svg
[npm-url]: https://www.npmjs.com/package/hive-io-rest-example

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-io/blob/master/packages/hive-js-rest-example/LICENSE

[codecov-image]: https://codecov.io/gh/fnalabs/hive-io/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-io

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
