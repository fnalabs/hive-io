# docker-nodejs-stream-processor-starter
This is a starter kit for [Hive Stack](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903) Stream Processors in Node.js w/ Koa2 in Docker. There is also a [base image](https://hub.docker.com/r/aeilers/docker-nodejs-stream-processor/) on Docker Hub to support basic use cases.

## Purpose
Stream Processors are multi-faceted in their responsibilities. By default, they handle the command responsibilities in the CQRS pattern. Therefore, they are integrated with the domain layer to take commands and get existing aggregate data to pass to the domain layer for business-specific logic and validation. Once validated, it passes the returned event to the log and stores the updated snapshot of the aggregate to the caching layer. Depending on the needs of the domain model, the Stream Processor allows for transactional consistency if required. Essentially this makes it a Stream Producer as it is performing more than the Producer above, but for similar tasks.

The second role of the Stream Processor is to rebuild the caching layer from the transactional log. This is valuable when standing up new environments for various reasons like A/B testing, debugging, and deploying geolocated instances of the application stack. Essentially this makes it a Stream Consumer as it is performing the specific task of rebuilding the cache as opposed to the translations and queries of the Consumer above. Typically these would be a short-lived implementation and not used nearly as often as the default Stream Processor definition above.

The third role of the Stream Processor is the most complex and likely least used. For more complex domain models, sometimes the need for a saga (or process manager) is required. A saga's job is to manage the complexities of inter-aggregate communication should the need arise. Since a Stream Processor is able to read events from the logs and also write to the logs (defined separately above), it is able to issue commands to the domain layer based on the events from one aggregate to another.

The Hive Stack leverages Redis for a caching layer due to its high availability, distribution, and performance capabilities. Also, it employs the Redlock algorithm to provide transactional consistency and manage concurrency. Riak also seems like a viable solution for this requirement as it is a similar product that also provides strong consistency concepts.

## Example
Below is a snippet of a `docker-compose.yml` definition for development. Change values as you see fit.
```
docker-nodejs-stream-processor-starter:
  build:
    context: ../docker-nodejs-stream-processor-starter
    args:
      APP_SOURCE: "."
      NODE_ENV: "development"
  image: docker-nodejs-stream-processor-starter
  environment:
    CACHE_URL: "redis://redis-cache:6379"
    EVENT_STORE_URL: "docker-kafka-db:2181"
    EVENT_STORE_ID: "stream-processor-client"
  depends_on:
    - redis-cache
    - docker-kafka
  command: npm run start:dev
  expose:
    - "3000"
  volumes:
    - ../docker-nodejs-stream-processor-starter:/opt/app:rw
    - /opt/app/node_modules
    - ../js-cqrs-es-domain-module:/opt/app/node_modules/js-cqrs-es-domain-module:rw
  networks:
    - js-cqrs-es
  redis-cache:
    image: redis:3.2.8-alpine
    expose:
      - "6379"
    networks:
      - js-cqrs-es
    restart: always
```

Production builds are a multi-step process that is easily automated. Below is a short script to achieve this goal.
```
npm run build
docker build -t aeilers/docker-nodejs-stream-processor .
```

## Environment variables
Below is a table describing the possible environment variables to run the Hive Stack Stream Processor. You can override these settings if/when required. This option works great if using the standard setup within a Docker container.

Name                  | Type    | Default                     | Description
--------------------- | ------- | --------------------------- | -------------------------------------------------------
NODE_ENV              | String  | 'production'                | app runtime environment
PORT                  | Number  | 3000                        | app port to listen on
PROCESSOR_TYPE        | String  | 'producer'                  | type of Stream Processor you wish to run (can also be 'consumer' or 'stream_processor')
AGGREGATE             | String  | 'content'                   | aggregate root the microservice is responsible for
AGGREGATE_LIB         | String  | 'js-cqrs-es-domain-module'  | library where the AGGREGATE resides
EVENT_STORE_ID        | String  |                             | unique identifier for Kafka client connection
EVENT_STORE_URL       | String  |                             | URL where Kafka is hosted
EVENT_STORE_TYPE      | Number  | 3                           | Kafka HighLevelProducer keyed partitioner type to guarantee order
EVENT_STORE_TIMEOUT   | Number  | 15000                       | Kafka ConsumerGroup connection timeout in milliseconds
EVENT_STORE_PROTOCOL  | String  | 'roundrobin'                | Kafka ConsumerGroup load balancing protocol
EVENT_STORE_OFFSET    | String  | 'latest'                    | Kafka ConsumerGroup read log starting point
CACHE_URL             | String  |                             | URL where Redis is hosted
LOCK_TTL              | Number  | 1000                        | Redlock time to live before lock is released
LOCK_DRIFT_FACTOR     | Number  | 0.01                        | Redlock drift factor setting
LOCK_RETRY_COUNT      | Number  | 0                           | Redlock retry count setting, should be set to zero for concurrency
LOCK_RETRY_DELAY      | Number  | 400                         | Redlock retry delay in milliseconds
LOCK_RETRY_JITTER     | Number  | 400                         | Redlock random retry jitter in milliseconds to randomize retries
