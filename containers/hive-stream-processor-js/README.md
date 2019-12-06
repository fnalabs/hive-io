# hive-stream-processor-js

[![Docker Image][docker-image]][docker-url]
[![License][license-image]][license-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

This is the [Hive<sup>io</sup>](https://hiveframework.io/) framework Stream Processor in Node.js in Docker. There is the [base image](https://hub.docker.com/r/fnalabs/hive-stream-processor-js/) on Docker Hub to support most use cases.

#### Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
  - [Examples](#examples)
  - [Environment Variables](#environment-variables)
- [Future](#future)

## Getting Started
Stream Processors are multi-faceted in their responsibilities. By default, they handle the command responsibilities in the CQRS pattern. Therefore, they are integrated with the domain layer to take commands and get existing aggregate data to pass to the domain layer for business-specific logic and validation. Once validated, it passes the returned event to the log and stores the updated snapshot of the aggregate to the caching layer. Depending on the needs of the domain model, the Stream Processor allows for transactional consistency if required. Essentially this makes it a Stream Producer as it is performing more than the Producer above, but for similar tasks.

The second role of the Stream Processor is to rebuild the caching layer from the transactional log. This is valuable when standing up new environments for various reasons like A/B testing, debugging, and deploying geolocated instances of the application stack. Essentially this makes it a Stream Consumer as it is performing the specific task of rebuilding the cache as opposed to the translations and queries of the Consumer above. Typically these would be a short-lived implementation and not used nearly as often as the default Stream Processor definition above.

The third role of the Stream Processor is the most complex and likely least used. For more complex domain models, sometimes the need for a saga (or process manager) is required. A saga's job is to manage the complexities of inter-aggregate communication should the need arise. Since a Stream Processor is able to read events from the logs and also write to the logs (defined separately above), it is able to issue commands to the domain layer based on the events from one aggregate to another.

The Hive<sup>io</sup> Framework leverages Redis for a caching layer due to its high availability, distribution, and performance capabilities. Also, it employs the Redlock algorithm to provide transactional consistency and manage concurrency. Riak also seems like a viable solution for this requirement as it is a similar product that also provides strong consistency concepts.

### Prerequisites
To use, you'll need:
- **Required**
  - [Docker](https://www.docker.com/)
  - [Kafka](https://kafka.apache.org/)
  - [Redis](https://redis.io/)
- **Recommended**
  - Load Balancer (Layer 7)

### Installing
To start using in your own infrastructure, pull the base image:
```sh
$ docker pull fnalabs/hive-stream-processor-js:<[release]|latest>
```

### Examples
To use, write your own Dockerfile and add any additional dependencies, including the package with your domain Actors.
```
FROM fnalabs/hive-stream-processor-js:latest
RUN npm install hive-io-domain-example
```

### Environment variables
Below is a table describing the possible environment variables to run the Hive<sup>io</sup> Framework Stream Processor. You can override these settings if/when required. This option works great if using the standard setup within a Docker container.

Name                        | Type     | Default                   | Description
--------------------------- | -------- | ------------------------- | -------------------------------------------------------
NODE_ENV                    | String   | 'production'              | app runtime environment
PORT                        | Number   | 3000                      | app port to listen on
CLUSTER_SIZE                | Number   | [total CPUs available]    | defaults to the total available CPUs allocated to the container or to the size you specify here
HTTP_VERSION                | Number   | 2                         | HTTP version for backward compatibility
SECURE                      | Boolean  | false                     | whether to run server as a secure server or not. defaults to false for certifications
CONTENT_TYPE                | String   | 'application/json'        | HTTP Content Type header to check
PING_URL                    | String   | '/ping'                   | URL to use for shallow health checks for the service
PROCESSOR_TYPE              | String   | 'producer'                | type of Stream Processor you wish to run (can also be 'consumer' or 'stream_processor')
ACTOR                       | String   |                           | Actor (Model) the microservice is responsible for
ACTOR_LIB                   | String   |                           | module where the ACTOR resides
EVENT_STORE_PRODUCER_TOPIC  | String   |                           | Kafka topic the events will be stored under
EVENT_STORE_CONSUMER_TOPIC  | String   |                           | Kafka topic the events will be consumed from
EVENT_STORE_ID              | String   |                           | unique identifier for Kafka client connection
EVENT_STORE_GROUP_ID        | String   |                           | defines Kafka Stream Processor group id
EVENT_STORE_BROKERS         | String   |                           | comma separated URLs where Kafka is hosted
EVENT_STORE_FROM_START      | Boolean  | false                     | tells Stream Processor whether or not to start at the beginning of the topic
EVENT_STORE_PARTITIONS      | Number   | 1                         | tells Stream Processor how many partitions to consume
EVENT_STORE_BUFFER          | Number   | 100                       | maximum number of incoming messages to batch
EVENT_STORE_TIMEOUT         | Number   | 2000                      | time (in `ms`) to poll Kafka for delivery reports
CACHE_URL                   | String   |                           | URL where Redis is hosted
LOCK_TTL                    | Number   | 2000                      | Redlock time to live before lock is released
LOCK_DRIFT_FACTOR           | Number   | 0.01                      | Redlock drift factor setting
LOCK_RETRY_COUNT            | Number   | 0                         | Redlock retry count setting, should be set to zero for concurrency
LOCK_RETRY_DELAY            | Number   | 400                       | Redlock retry delay in milliseconds
LOCK_RETRY_JITTER           | Number   | 400                       | Redlock random retry jitter in milliseconds to randomize retries

## Future
- feature requests via [issues](https://github.com/fnalabs/hive-stream-processor-js/issues)

[docker-image]: https://images.microbadger.com/badges/version/fnalabs/hive-stream-processor-js.svg
[docker-url]: https://hub.docker.com/r/fnalabs/hive-stream-processor-js/

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-stream-processor-js/blob/master/LICENSE

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/hive-stream-processor-js.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-stream-processor-js

[depstat-image]: https://img.shields.io/david/fnalabs/hive-stream-processor-js.svg
[depstat-url]: https://david-dm.org/fnalabs/hive-stream-processor-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
