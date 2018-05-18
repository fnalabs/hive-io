# hive<sup>io</sup>

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Build Status][circle-image]][circle-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

A reactive, cloud-native, universal JavaScript library for [hive<sup>io</sup>](https://hiveframework.io).

This is where the business logic exists in your codebase. The [Actor Model](https://en.wikipedia.org/wiki/Actor_model) is used as the basic building block to implement standardized, reactive microservices that employ the Actors. The intent is to clearly define a separation between infrastructure as code and business logic allowing them both to adapt and scale independently. From simple REST services to CQRS/ES microservices, this library is flexible enough to enable the Actors to adopt new roles on the fly.

#### Contents
- [Installing](#installing)
- [API](#api)
- [Examples](#examples)
- [Future](#future)
- [Changelog](#changelog)

## Installing
Install using `npm`:
```sh
$ npm install hive-io
```

## [API](https://fnalabs.github.io/hive-js/)
Click on the link in the header above to go to the API page.

## Examples
More examples can be found in the 2 example npm packages:
- [hive-io-rest-example](https://www.npmjs.com/package/hive-io-rest-example)
- [hive-io-domain-example](https://www.npmjs.com/package/hive-io-domain-example)

## Future
- website with more info
- feature requests via [issues](https://github.com/fnalabs/hive-js/issues)

## Changelog
#### v2.0.0
- updated name and organization
- renamed Handler to Actor and added Aggregate functionality to it
- removed Schema for more robust JSON Schema solution (refactored into `schema-json-js` dependency)
- removed Message|Command|Event since these can be represented as Model|Schema and performed with Actors
- adopted JSON API and JSON Schema specifications
- added documentation

#### v1.0.0
- initial release (of `js-cqrs-es`)

#### pre-v1.0.0
- the dark days

[npm-image]: https://img.shields.io/npm/v/hive-io.svg
[npm-url]: https://www.npmjs.com/package/hive-io

[license-image]: https://img.shields.io/badge/License-Apache%202.0-blue.svg
[license-url]: https://github.com/fnalabs/hive-js/blob/master/LICENSE

[circle-image]: https://img.shields.io/circleci/project/github/fnalabs/hive-js.svg
[circle-url]: https://circleci.com/gh/fnalabs/hive-js

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/hive-js/v2.0.0.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-js

[depstat-image]: https://img.shields.io/david/fnalabs/hive-js.svg
[depstat-url]: https://david-dm.org/fnalabs/hive-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
