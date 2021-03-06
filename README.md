# Hive<sup>io</sup>

Welcome to the development repository for the [Hive<sup>io</sup>](https://hiveframework.io) framework. We decided it would be best to keep the core library, service containers, and examples together in a monorepo for improved code management and development experiences. We have achieved this leveraging Lerna to hoist `devDependencies` for the library and examples since nearly all of the `devDependencies` between the projects below are identical.

***NOTE:*** The Containers need to keep their `devDependencies` at the project level due to the nature of how containers work.

- Library
    - [hive-io](./packages/hive-js#hiveio)
- Containers
    - [base](./containers/hive-base-js#hive-base-js)
    - [producer](./containers/hive-producer-js#hive-producer-js)
    - [consumer](./containers/hive-consumer-js#hive-consumer-js)
    - [stream processor](./containers/hive-stream-processor-js#hive-stream-processor-js)
- Examples
    - [hive-io-rest-example](./packages/hive-js-rest-example#hive-io-rest-example)
    - [hive-io-domain-example](./packages/hive-js-domain-example#hive-io-domain-example)

Check back soon for more details on a contributing guide!
