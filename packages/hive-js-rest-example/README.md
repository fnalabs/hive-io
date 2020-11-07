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

This example contains a single resource to handle CRUD functionality of a `Post` object in a Restful implementation. It is a contrived but robust example to illustrate different ways to use Actors in the [Hive<sup>io</sup>](https://hiveframework.io) framework.

### Endpoints

Once you get the app running using the [setup instructions](#getting-started) below, you can use the application from the following endpoint(s):

- `http://localhost/posts (GET, POST)`
    - POST [API JSON Schema](https://github.com/fnalabs/hive-io/blob/master/packages/hive-js-rest-example/src/schemas/json/Post.json)
        ```json
        {
          "text": "something"
        }
        ```
- `http://localhost/posts/<postId> (GET, PATCH, DELETE)`
    - PATCH [API JSON Schema](https://github.com/fnalabs/hive-io/blob/master/packages/hive-js-rest-example/src/schemas/json/Post.json)
        ```json
        {
          "text": "something different"
        }
        ```
    - DELETE

***NOTE:*** Network [data models](https://hiveframework.io/model) follow the Flux Standard Action specification for network transport. `type` and `payload` are derived from the routes and data sent respectively in this example.

### [Source Code](https://github.com/fnalabs/hive-io/tree/master/packages/hive-js-rest-example)

## Getting Started

This is a straight forward CRUD example of a `Post` Entity that contains text, a couple Boolean flags, and a count of how many views it has. It stores these `Post`s in MongoDB. It implements an Actor System to handle logging to Fluentd. Here's how to use it.

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
            image: hive-base-js
            environment:
              ACTOR: PostActor
              ACTOR_LIB: hive-io-rest-example
              ACTOR_URLS: "/posts,/posts/:postId"
              CLUSTER_SIZE: 1
              HTTP_VERSION: 1
              SECURE: "false"
              MONGO_URL: "mongodb://mongo:27017/post"
              FLUENTD_HOST: fluentd
              FLUENTD_PORT: 24224
              FLUENTD_TIMEOUT: 3.0
              FLUENTD_RECONNECT: 600000
            depends_on:
              - mongo
              - fluentd
            ports:
              - 80:3000
            networks:
              - hive-io
          fluentd:
            image: fluent/fluentd:v1.7.4-1.0
            networks:
              - hive-io
            restart: on-failure
          mongo:
            image: mongo:4.2.1
            networks:
              - hive-io
            restart: on-failure
        # networking specifics
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

Name               | Type    | Default                       | Description
------------------ | ------- | ----------------------------- | -------------------------------------------------------
MONGO_URL          | String  | 'mongodb://mongo:27017/post'  | url to connect to MongoDB instance
FLUENTD_HOST       | String  | 'fluentd'                     | Hostname of Fluentd instance
FLUENTD_PORT       | Number  | 24224                         | Port of Fluentd instance
FLUENTD_TIMEOUT    | Number  | 3.0                           | Timeout (in sec) for Fluentd client
FLUENTD_RECONNECT  | Number  | 600000                        | Reconnect Interval (in sec) for Fluentd client

[npm-image]: https://img.shields.io/npm/v/hive-io-rest-example.svg
[npm-url]: https://www.npmjs.com/package/hive-io-rest-example

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-io/blob/master/packages/hive-js-rest-example/LICENSE

[codecov-image]: https://codecov.io/gh/fnalabs/hive-io/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-io

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
