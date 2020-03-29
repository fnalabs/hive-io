# hive<sup>io</sup>

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
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
$ npm install --save hive-io
```

## [API](https://fnalabs.github.io/hive-js/)
- [Actor](https://fnalabs.github.io/hive-js/Actor.html)
- [MessageActor](https://fnalabs.github.io/hive-js/MessageActor.html)
- [Model](https://fnalabs.github.io/hive-js/Model.html)
- [Schema](https://fnalabs.github.io/hive-js/Schema.html)
- [System](https://fnalabs.github.io/hive-js/System.html)

## Examples
More examples can be found in the 2 example npm packages:
- [hive-io-rest-example](https://www.npmjs.com/package/hive-io-rest-example)
- [hive-io-domain-example](https://www.npmjs.com/package/hive-io-domain-example)

## Future
- integrate with client-side presentation libraries
- feature requests via [issues](https://github.com/fnalabs/hive-js/issues)

## Contributing
We are currently drafting our contributing guide!

## [Changelog](https://github.com/fnalabs/hive-js/releases)

#### v1.0.0
- initial release (of `js-cqrs-es`)

[npm-image]: https://img.shields.io/npm/v/hive-io.svg
[npm-url]: https://www.npmjs.com/package/hive-io

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-js/blob/master/LICENSE

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/hive-js/v2.0.0.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-js

[depstat-image]: https://img.shields.io/david/fnalabs/hive-js.svg
[depstat-url]: https://david-dm.org/fnalabs/hive-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
