# hive-base-js

[![Docker Image][docker-image]][docker-url]
[![License][license-image]][license-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

This is the [Hive<sup>io</sup>](https://hiveframework.io/) framework REST service in Node.js in Docker. There is the [base image](https://hub.docker.com/r/fnalabs/hive-base-js/) on Docker Hub to support most use cases.

#### Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
  - [Examples](#examples)
  - [Environment Variables](#environment-variables)
- [Future](#future)

## Getting Started
This is the most basic building block of infrastructure in the Hive<sup>io</sup> Framework. It provides a RESTful interface for your Actors and enforces the JSON API specification Top Level Document payload structure.

### Prerequisites
To use, you'll need:
- **Required**
  - [Docker](https://www.docker.com/)

### Installing
To start using in your own infrastructure, pull the base image:
```sh
$ docker pull fnalabs/hive-base-js:<[release]|latest>
```

### Examples
To use, write your own Dockerfile and add any additional dependencies, including the package with your RESTful Actors.
```
FROM fnalabs/hive-base-js:latest
RUN npm install hive-io-rest-example
```

### Environment variables
Below is a table describing the possible environment variables to run the Hive<sup>io</sup> Framework REST service. You can override these settings if/when required. This option works great if using the standard setup within a Docker container.

Name               | Type     | Default                 | Description
------------------ | -------  | ----------------------- | -------------------------------------------------------
NODE_ENV           | String   | 'production'            | app runtime environment
PORT               | Number   | 3000                    | app port to listen on
HTTP_VERSION       | Number   | 2                       | HTTP version for backward compatibility
SECURE             | Boolean  | false                   | whether to run server as a secure server or not. defaults to false for certifications
CLUSTER_SIZE       | Number   | [total CPUs available]  | defaults to the total available CPUs allocated to the container or to the size you specify here
CONTENT_TYPE       | String   | 'application/json'      | HTTP Content Type header to check
PING_URL           | String   | '/ping'                 | URL to use for shallow health checks for the service
ACTOR              | String   |                         | Actor (Model) the microservice is responsible for
ACTOR_LIB          | String   |                         | module where the ACTOR resides

## Future
- feature requests via [issues](https://github.com/fnalabs/hive-base-js/issues)

[docker-image]: https://images.microbadger.com/badges/version/fnalabs/hive-base-js.svg
[docker-url]: https://hub.docker.com/r/fnalabs/hive-base-js/

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-base-js/blob/master/LICENSE

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/hive-base-js.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-base-js

[depstat-image]: https://img.shields.io/david/fnalabs/hive-base-js.svg
[depstat-url]: https://david-dm.org/fnalabs/hive-base-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
