# hive-consumer-js

[![Docker Image][docker-image]][docker-url]
[![License][license-image]][license-url]
[![Build Status][circle-image]][circle-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

This is the [Hive Framework](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903) Consumer in Node.js with [Micro](https://www.npmjs.com/package/micro) in Docker. There is the [base image](https://hub.docker.com/r/fnalabs/hive-consumer-js/) on Docker Hub to support most use cases.

#### Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
  - [Examples](#examples)
  - [Environment Variables](#environment-variables)
- [Future](#future)

## Getting Started
Consumers handle the query responsibilities in the CQRS pattern. They are responsible for translating single or multiple event streams into denormalized formats that can be queried by user applications. Since all of the data has been validated before it is logged, they free themselves from that requirement and can focus on translating and serving data.

### Prerequisites
To use, you'll need:
- **Required**
  - [Docker](https://www.docker.com/)
  - [Kafka](https://kafka.apache.org/)
- **Recommended**
  - Load Balancer (Layer 7)

### Installing
To start using in your own infrastructure, pull the base image:
```sh
$ docker pull fnalabs/hive-consumer-js:<[release]|latest>
```

### Examples
To use, write your own Dockerfile and add any additional dependencies, including the package with your domain Actors.
```
FROM fnalabs/hive-consumer-js:latest
RUN npm install hive-io-domain-example
```

### Environment variables
Below is a table describing the possible environment variables to run the Hive Framework Consumer. You can override these settings if/when required. This option works great if using the standard setup within a Docker container.

Name                  | Type    | Default                   | Description
--------------------- | ------- | ------------------------- | -------------------------------------------------------
NODE_ENV              | String  | 'production'              | app runtime environment
PORT                  | Number  | 3000                      | app port to listen on
CLUSTER_SIZE          | Number  | [total CPUs available]    | defaults to the total available CPUs allocated to the container or to the size you specify here
AGGREGATE_LIST        | String  | 'content,view'            | comma separated list of aggregates to consume
ACTOR                 | String  | 'PostEventActor'          | Actor to denormalize the aggregates
ACTOR_LIB             | String  | 'hive-io-domain-example'  | library where the PROJECTION resides
EVENT_STORE_ID        | String  |                           | unique identifier for Kafka client connection
EVENT_STORE_URL       | String  |                           | URL where Kafka is hosted
EVENT_STORE_TIMEOUT   | Number  | 15000                     | Kafka ConsumerGroup connection timeout in milliseconds
EVENT_STORE_PROTOCOL  | String  | 'roundrobin'              | Kafka ConsumerGroup load balancing protocol
EVENT_STORE_OFFSET    | String  | 'latest'                  | Kafka ConsumerGroup read log starting point

## Future
- feature requests via [issues](https://github.com/fnalabs/hive-consumer-js/issues)

[docker-image]: https://images.microbadger.com/badges/version/fnalabs/hive-consumer-js:2.0.0-beta.svg
[docker-url]: https://hub.docker.com/r/fnalabs/hive-consumer-js/

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-consumer-js/blob/master/LICENSE

[circle-image]: https://img.shields.io/circleci/project/github/fnalabs/hive-consumer-js.svg
[circle-url]: https://circleci.com/gh/fnalabs/hive-consumer-js

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/hive-consumer-js.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-consumer-js

[depstat-image]: https://img.shields.io/david/fnalabs/hive-consumer-js.svg
[depstat-url]: https://david-dm.org/fnalabs/hive-consumer-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
