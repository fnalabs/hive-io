# hive-rest-js

[![Docker Image][docker-image]][docker-url]
[![License][license-image]][license-url]
[![Build Status][circle-image]][circle-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

The Hive Framework basic REST service in Node.js w/ [Micro](https://www.npmjs.com/package/micro) in Docker. There is the [base image](https://hub.docker.com/r/fnalabs/hive-rest-js/) on Docker Hub to support most use cases.

#### Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
  - [Examples](#examples)
  - [Environment Variables](#environment-variables)
- [Future](#future)
- [Changelog](#changelog)

## Getting Started
This is the most basic building block of infrastructure in the Hive Framework. It provides a RESTful interface for your Actors and enforces the JSON API specification Top Level Document payload structure.

### Prerequisites
To use, you'll need a few things:
- **Required**
  - [Docker](https://www.docker.com/)

### Installing
To start using in your own infrastructure, pull the base image:
```sh
$ docker pull fnalabs/hive-rest-js:<[release]|latest>
```

### Examples
To use, write your own Dockerfile and add any additional dependencies, including the package with your RESTful Actors.
```
FROM fnalabs/hive-rest-js:latest
RUN npm install hive-io-rest-example
```

### Environment variables
Below is a table describing the possible environment variables to run the Hive Framework REST service. You can override these settings if/when required. This option works great if using the standard setup within a Docker container.

Name               | Type    | Default                 | Description
------------------ | ------- | ----------------------- | -------------------------------------------------------
NODE_ENV           | String  | 'production'            | app runtime environment
PORT               | Number  | 3000                    | app port to listen on
CLUSTER_SIZE       | Number  | [total CPUs available]  | defaults to the total available CPUs allocated to the container or to the size you specify here
ACTOR              | String  | 'PostActor'             | Actor (Model) the microservice is responsible for
ACTOR_LIB          | String  | 'hive-io-rest-example'  | module where the ACTOR resides

## Future
- feature requests via [issues](https://github.com/fnalabs/hive-rest-js/issues)

## Changelog
TODO

[docker-image]: https://images.microbadger.com/badges/version/fnalabs/hive-rest-js.svg
[docker-url]: https://hub.docker.com/r/fnalabs/hive-rest-js/

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-rest-js/blob/master/LICENSE

[circle-image]: https://img.shields.io/circleci/project/github/fnalabs/hive-rest-js.svg
[circle-url]: https://circleci.com/gh/fnalabs/hive-rest-js

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/hive-rest-js.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-rest-js

[depstat-image]: https://img.shields.io/david/fnalabs/hive-rest-js.svg
[depstat-url]: https://david-dm.org/fnalabs/hive-rest-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
