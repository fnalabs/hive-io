# Hive<sup>io</sup>

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Code Coverage][codecov-image]][codecov-url]
[![JavaScript Style Guide][style-image]][style-url]

A reactive, universal JavaScript library for the [Hive<sup>io</sup>](https://hiveframework.io) framework.

This is where the domain logic for your domain model is implemented. The [Actor Model](https://en.wikipedia.org/wiki/Actor_model) is used as the basic building block to implement standardized, reactive microservices. The intent is to clearly define a separation between infrastructure as code and domain logic allowing them both to adapt and scale independently. From simple REST services to CQRS/ES microservices, this library is flexible enough to enable the Actors to adopt new roles on the fly.

#### Contents

- [Installing](#installing)
- [API](#api)
- [Examples](#examples)
- [Future](#future)
- [Contributing](#contributing)
- [Changelog](#changelog)

## Installing

Install using `npm`:

```sh
npm install --save hive-io
```

## [API](https://fnalabs.github.io/hive-io/)

- [Actor](https://fnalabs.github.io/hive-io/Actor.html)
- [MessageActor](https://fnalabs.github.io/hive-io/MessageActor.html)
- [Model](https://fnalabs.github.io/hive-io/Model.html)
- [Schema](https://fnalabs.github.io/hive-io/Schema.html)
- [System](https://fnalabs.github.io/hive-io/System.html)
- [Bus](https://fnalabs.github.io/hive-io/Bus.html)

## Examples

More examples can be found in the 2 example npm packages:

- [hive-io-rest-example](https://www.npmjs.com/package/hive-io-rest-example)
- [hive-io-domain-example](https://www.npmjs.com/package/hive-io-domain-example)

## Future

- integrate with client-side presentation libraries
- feature requests via [issues](https://github.com/fnalabs/hive-io/issues)

## Contributing

We are still drafting our contributing guide!

## [Changelog](https://github.com/fnalabs/hive-io/releases)

[npm-image]: https://img.shields.io/npm/v/hive-io.svg
[npm-url]: https://www.npmjs.com/package/hive-io

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-io/blob/master/packages/hive-js/LICENSE

[codecov-image]: https://codecov.io/gh/fnalabs/hive-io/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-io

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
