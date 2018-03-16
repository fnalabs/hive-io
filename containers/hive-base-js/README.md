# hive-rest-js

TODO

### Environment variables
Below is a table describing the possible environment variables to run the Hive Framework Rest Service. You can override these settings if/when required. This option works great if using the standard setup within a Docker container.

Name               | Type    | Default                 | Description
------------------ | ------- | ----------------------- | -------------------------------------------------------
NODE_ENV           | String  | 'production'            | app runtime environment
PORT               | Number  | 3000                    | app port to listen on
ACTOR              | String  | 'PostActor'             | Actor (Model) the microservice is responsible for
ACTOR_LIB          | String  | 'hive-io-rest-example'  | module where the ACTOR resides
