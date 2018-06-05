# hive-producer-js

[![Docker Image][docker-image]][docker-url]
[![License][license-image]][license-url]
[![Build Status][circle-image]][circle-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

This is the [Hive Framework](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903) Producer in Node.js with [Micro](https://www.npmjs.com/package/micro) in Docker. There is the [base image](https://hub.docker.com/r/fnalabs/hive-producer-js/) on Docker Hub to support most use cases.

#### Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
  - [Examples](#examples)
  - [Environment Variables](#environment-variables)
- [Future](#future)

## Getting Started
Producers represent a straight forward implementation where domain `Entities|Value Objects` can be passed through to the log directly with minimal validation. Entities can pass through to queue messages for domain validation later in the stream. Value Objects have no unique identity, they are essentially immutable and should be treated as such. Therefore, this type of validation is superficial and can easily be handled by the `Entity's|Value Object's` Schema definition. Examples of this type of implementation would include streams of analytics data for user tracking or geo-location data for real-time position tracking.

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
$ docker pull fnalabs/hive-producer-js:<[release]|latest>
```

### Examples
To use, write your own Dockerfile and add any additional dependencies, including the package with your domain Actors.
```
FROM fnalabs/hive-producer-js:latest
RUN npm install hive-io-domain-example
```

### Environment Variables
Below is a table describing the possible environment variables to run the Hive Framework Producer. You can override these settings if/when required. This option works great if using the standard setup within a Docker container.

Name                       | Type    | Default                   | Description
-------------------------- | ------- | ------------------------- | -------------------------------------------------------
NODE_ENV                   | String  | 'production'              | app runtime environment
PORT                       | Number  | 3000                      | app port to listen on
CLUSTER_SIZE               | Number  | [total CPUs available]    | defaults to the total available CPUs allocated to the container or to the size you specify here
ACTOR                      | String  | 'ViewActor'               | Actor (Model) the microservice is responsible for
ACTOR_LIB                  | String  | 'hive-io-domain-example'  | module where the ACTOR resides
EVENT_STORE_TOPIC          | String  | 'view'                    | Kafka topic the models will be stored under
EVENT_STORE_ID             | String  |                           | unique identifier for Kafka client connection
EVENT_STORE_URL            | String  |                           | URL where Kafka is hosted
EVENT_STORE_TYPE           | String  | 'gzip'                    | compression codec type: `none`, `gzip`, `snappy`, `lz4`
EVENT_STORE_BUFFER         | Number  | 500                       | time (in `ms`) to buffer incoming messages to batch
EVENT_STORE_POLL_INTERVAL  | Number  | 1000                      | time (in `ms`) to poll Kafka for delivery reports

## Future
- feature requests via [issues](https://github.com/fnalabs/hive-producer-js/issues)

[docker-image]: https://images.microbadger.com/badges/version/fnalabs/hive-producer-js:2.0.0-beta.svg
[docker-url]: https://hub.docker.com/r/fnalabs/hive-producer-js/

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-producer-js/blob/master/LICENSE

[circle-image]: https://img.shields.io/circleci/project/github/fnalabs/hive-producer-js.svg
[circle-url]: https://circleci.com/gh/fnalabs/hive-producer-js

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/hive-producer-js.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-producer-js

[depstat-image]: https://img.shields.io/david/fnalabs/hive-producer-js.svg
[depstat-url]: https://david-dm.org/fnalabs/hive-producer-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
