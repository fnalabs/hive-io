# hive-consumer-js

[![Docker Image][docker-image]][docker-url]
[![License][license-image]][license-url]
[![Code Coverage][codecov-image]][codecov-url]
[![JavaScript Style Guide][style-image]][style-url]

This is the [Hive<sup>io</sup>](https://hiveframework.io) framework Consumer microservice leveraging Node.js with Fastify in Docker. There is the [base image](https://hub.docker.com/r/fnalabs/hive-consumer-js/) on Docker Hub to support most use cases.

#### Contents

- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installing](#installing)
    - [Examples](#examples)
    - [Environment Variables](#environment-variables)
- [Future](#future)

## Getting Started

Consumers handle the Query responsibilities in the CQRS pattern. They are responsible for translating single or multiple event streams into denormalized formats that can be queried by user applications. Since all of the data has been validated before it is logged, they free themselves from that requirement and can focus on translating and serving data.

### Prerequisites

To use, you'll need:

- **Required**
    - [Docker](https://www.docker.com)
    - [Kafka](https://kafka.apache.org)
- **Recommended**
    - [OpenTelemetry Collector](https://hub.docker.com/r/otel/opentelemetry-collector)
    - [Zipkin](https://hub.docker.com/r/openzipkin/zipkin)
    - Load Balancer or Service Mesh

### Installing

To start using in your own infrastructure, pull the base image:

```sh
docker pull fnalabs/hive-consumer-js:<[release]|latest>
```

### Examples

To use, write your own Dockerfile and add any additional dependencies, including the package with your domain Actors.

```dockerfile
FROM fnalabs/hive-consumer-js:latest
RUN npm install hive-io-domain-example
```

### Environment variables

Below is a table describing the possible environment variables to run the Hive<sup>io</sup> framework Consumer microservice. You can override these settings if/when required. This option works great if using the standard setup within a Docker container.

Name                    | Type    | Default                       | Description
----------------------- | ------- | ----------------------------- | -------------------------------------------------------
NODE_ENV                | String  | 'production'                  | microservice runtime environment
DEPLOY_ENV              | String  | `NODE_ENV`                    | microservice deployment environment (QA, Stage, etc)
HOSTNAME                | String  |                               | microservice hostname
PORT                    | Number  | 3000                          | microservice port to listen on
HTTP_VERSION            | Number  | 2                             | HTTP version for backward compatibility
SECURE                  | String  | 'false'                       | whether to run microservice secure or not. defaults to 'false' since we cannot provide certifications
CLUSTER_SIZE            | Number  | [total CPUs available]        | defaults to the total available CPUs allocated to the container or to the size you specify here
SSL_CERT                | String  | '/opt/app/cert/ssl-cert.pem'  | default path for SSL certificate file or the full certificate
SSL_KEY                 | String  | '/opt/app/cert/ssl-key.pem'   | default path for SSL key file or the full key
PING_URL                | String  | '/ping'                       | URL to use for shallow health checks for the microservice
ACTOR                   | String  |                               | Actor to denormalize the aggregates
ACTOR_LIB               | String  |                               | library where the ACTOR resides
ACTOR_URLS              | String  |                               | comma-separated URLs associated with the Actor
TELEMETRY               | String  | 'false'                       | whether to run OpenTelemetry integration
TELEMETRY_PLUGINS       | String  |                               | JSON string of OpenTelemetry plugins to enable
TELEMETRY_SERVICE_NAME  | String  | hive-consumer-js              | service name for OpenTelemetry
TELEMETRY_URL_METRICS   | String  |                               | OpenTelemetry Collector URL for metrics
TELEMETRY_URL_TRACES    | String  |                               | OpenTelemetry Collector URL for traces
EVENT_STORE_TOPIC       | String  |                               | Kafka topic the events will be consumed from
EVENT_STORE_ID          | String  |                               | unique identifier for Kafka client connection
EVENT_STORE_GROUP_ID    | String  |                               | defines Kafka Consumer group id
EVENT_STORE_BROKERS     | String  |                               | comma separated URLs where Kafka is hosted
EVENT_STORE_FROM_START  | String  | 'false'                       | tells Consumer whether or not to start at the beginning of the topic
EVENT_STORE_PARTITIONS  | Number  | 1                             | tells Consumer how many partitions to consume
EVENT_STORE_BUFFER      | Number  | null                          | maximum number of incoming messages to batch
EVENT_STORE_TIMEOUT     | Number  | null                          | time (in `ms`) to poll Kafka for delivery reports

## Future

- feature requests via [issues](https://github.com/fnalabs/hive-io/issues)

[docker-image]: https://img.shields.io/docker/v/fnalabs/hive-consumer-js?sort=semver
[docker-url]: https://hub.docker.com/r/fnalabs/hive-consumer-js/

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-io/blob/master/containers/hive-consumer-js/LICENSE

[codecov-image]: https://codecov.io/gh/fnalabs/hive-io/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-io

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
