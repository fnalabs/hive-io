# hive-producer-js

[![Docker Image][docker-image]][docker-url]
[![License][license-image]][license-url]
[![Code Coverage][codecov-image]][codecov-url]
[![JavaScript Style Guide][style-image]][style-url]

This is the [Hive<sup>io</sup>](https://hiveframework.io) framework Producer microservice leveraging Node.js in Docker. There is the [base image](https://hub.docker.com/r/fnalabs/hive-producer-js/) on Docker Hub to support most use cases.

#### Contents

- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installing](#installing)
    - [Examples](#examples)
    - [Environment Variables](#environment-variables)
- [Future](#future)

## Getting Started

Producers handle the Command responsibilities in the CQRS pattern. Producers represent a straight forward implementation where domain `Entities|Value Objects` can be passed through to the log directly with minimal validation. Entities can pass through to queue messages for domain validation later in the stream. Value Objects have no unique identity, they are essentially immutable and should be treated as such. Therefore, this type of validation is superficial and can easily be handled by the `Entity's|Value Object's` Schema definition. Examples of this type of implementation would include streams of analytics data for user tracking or geo-location data for real-time position tracking.

### Prerequisites

To use, you'll need:

- **Required**
    - [Docker](https://www.docker.com)
    - [Kafka](https://kafka.apache.org)
- **Recommended**
    - Load Balancer (Layer 7)

### Installing

To start using in your own infrastructure, pull the base image:

```sh
docker pull fnalabs/hive-producer-js:<[release]|latest>
```

### Examples

To use, write your own Dockerfile and add any additional dependencies, including the package with your domain Actors.

```dockerfile
FROM fnalabs/hive-producer-js:latest
RUN npm install hive-io-domain-example
```

### Environment Variables

Below is a table describing the possible environment variables to run the Hive<sup>io</sup> framework Producer microservice. You can override these settings if/when required. This option works great if using the standard setup within a Docker container.

Name                 | Type    | Default                       | Description
-------------------- | ------- | ----------------------------- | -------------------------------------------------------
NODE_ENV             | String  | 'production'                  | microservice runtime environment
PORT                 | Number  | 3000                          | microservice port to listen on
HTTP_VERSION         | Number  | 2                             | HTTP version for backward compatibility
SECURE               | String  | 'false'                       | whether to run microservice secure or not. defaults to 'false' since we cannot provide certifications
CLUSTER_SIZE         | Number  | [total CPUs available]        | defaults to the total available CPUs allocated to the container or to the size you specify here
SSL_CERT_PATH        | String  | '/opt/app/cert/ssl-cert.pem'  | default path for SSL certificate file
SSL_KEY_PATH         | String  | '/opt/app/cert/ssl-key.pem'   | default path for SSL key file
PING_URL             | String  | '/ping'                       | URL to use for shallow health checks for the microservice
ACTOR                | String  |                               | Actor (Model) the microservice is responsible for
ACTOR_LIB            | String  |                               | module where the ACTOR resides
ACTOR_URLS           | String  |                               | comma-separated URLs associated with the Actor
EVENT_STORE_TOPIC    | String  |                               | Kafka topic the events will be stored under
EVENT_STORE_ID       | String  |                               | unique identifier for Kafka client connection
EVENT_STORE_BROKERS  | String  |                               | comma separated URLs where Kafka is hosted
EVENT_STORE_BUFFER   | Number  | 100                           | maximum number of incoming messages to batch
EVENT_STORE_TIMEOUT  | Number  | 2000                          | time (in `ms`) to poll Kafka for delivery reports

## Future

- feature requests via [issues](https://github.com/fnalabs/hive-io/issues)

[docker-image]: https://images.microbadger.com/badges/version/fnalabs/hive-producer-js.svg
[docker-url]: https://hub.docker.com/r/fnalabs/hive-producer-js/

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-io/blob/master/containers/hive-producer-js/LICENSE

[codecov-image]: https://codecov.io/gh/fnalabs/hive-io/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-io

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
