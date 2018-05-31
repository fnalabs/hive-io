# hive-io-rest-example
An example REST module to help describe implementation details when leveraging the [Hive<sup>io</sup> framework](https://hiveframework.io).

#### Contents
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installing](#installing)
  - [Environment Variables](#environment-variables)

## Getting Started
This is a straight forward example of a `Post` Entity that contains text, a couple boolean flags, and a count of how many views it has. It stores these `Post`s in MongoDB. It implements an Actor System to handle logging to Fluentd. Here's how to use it.

### Prerequisites
To use, you'll need a few things:
- **Required**
  - [Docker](https://www.docker.com/)
  - [Docker Compose](https://docs.docker.com/compose/)

### Installing
To start using:
1. Create the following files:
  - `Dockerfile`
    ```
    FROM fnalabs/hive-rest-js:latest
    RUN npm install --save hive-io-rest-example
    ```
  - `docker-compose.yml`
    ```
    version: '3.5'
    services:
      hive-rest-js:
        build: .
        image: hive-rest-js
        environment:
          CLUSTER_SIZE: 1
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
        image: fluent/fluentd:v1.2.1
        networks:
          - hive-io
        restart: on-failure
      mongo:
        image: mongo:3.6.5
        networks:
          - hive-io
        restart: on-failure
    # networking specifics
    networks:
      hive-io:
        driver: bridge
    ```
2. Run the following commands:
  ```
  $ docker-compose up
  ```

### Environment Variables
The table below contains a reference the the environment variables used in the example.

Name               | Type    | Default                       | Description
------------------ | ------- | ----------------------------- | -------------------------------------------------------
NODE_ENV           | String  | 'production'                  | app runtime environment
PORT               | Number  | 3000                          | app port to listen on
CLUSTER_SIZE       | Number  | [total CPUs available]        | defaults to the total available CPUs allocated to the container or to the size you specify here
ACTOR              | String  | 'PostActor'                   | Actor (Model) the microservice is responsible for
ACTOR_LIB          | String  | 'hive-io-rest-example'        | module where the ACTOR resides
MONGO_URL          | String  | 'mongodb://mongo:27017/post'  | url to connect to MongoDB instance
FLUENTD_HOST       | String  | 'fluentd'                     | Hostname of Fluentd instance
FLUENTD_PORT       | Number  | 24224                         | Port of Fluentd instance
FLUENTD_TIMEOUT    | Number  | 3.0                           | Timeout (in sec) for Fluentd client
FLUENTD_RECONNECT  | Number  | 600000                        | Reconnect Interval (in sec) for Fluentd client
