# Hive<sup>io</sup>

Welcome to the development repository for the [Hive<sup>io</sup> framework](https://hiveframework.io/). We decided it would be best to keep the core library, service containers, and examples together in a monorepo for improved code management and development experiences. We have achieved this leveraging Lerna to hoist `devDependencies` for the library and examples since nearly all of the `devDependencies` between the projects below are identical.

***NOTE:*** The Containers need to keep their `devDependencies` at the project level due to the nature of how containers work.

* Library
    * [hive-io](./packages/hive-js)
* Containers
    * [base](./containers/hive-base-js)
    * [producer](./containers/hive-producer-js)
    * [consumer](./containers/hive-consumer-js)
    * [stream processor](./containers/hive-js)
* Examples
    * [hive-io-rest-example](./packages/hive-js-rest-example)
    * [hive-io-domain-example](./packages/hive-js-domain-example)

Check back soon for more details on a contributing guide!
