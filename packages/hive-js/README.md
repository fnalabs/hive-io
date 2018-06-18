# hive<sup>io</sup>

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Build Status][circle-image]][circle-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

A reactive, universal JavaScript library for the [Hive<sup>io</sup>](https://hiveframework.io) framework.

This is where the business logic exists in your codebase. The [Actor Model](https://en.wikipedia.org/wiki/Actor_model) is used as the basic building block to implement standardized, reactive microservices. The intent is to clearly define a separation between infrastructure as code and business logic allowing them both to adapt and scale independently. From simple REST services to CQRS/ES microservices, this library is flexible enough to enable the Actors to adopt new roles on the fly.

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

## [API](https://hiveframework.io/api/)

## Examples
More examples can be found in the 2 example npm packages:
- [hive-io-rest-example](https://www.npmjs.com/package/hive-io-rest-example)
- [hive-io-domain-example](https://www.npmjs.com/package/hive-io-domain-example)

## Future
- integrate with client-side presentation libraries
- feature requests via [issues](https://github.com/fnalabs/hive-js/issues)

## Changelog
#### v2.0.0-rc.1
- modified Stream Processor for pessimistic concurrency
- modified Stream Processor to publish to Log if in `stream-processor` mode and Actors return values from their `perform` method
- updated routes in `hive-io-domain-example`

#### v2.0.0-rc
- level set version for all framework components
- fix error handling on components
- update documentation

#### v2.0.0-beta.6
- bug fix in Actor

#### v2.0.0-beta.5
- bug fix in MessageActor
- more updates to documentation

#### v2.0.0-beta.4
- making Schemas optional for Actors whose only role is routing.
- updated the default Schema on Model to accept any model data object.
- more updates to documentation

#### v2.0.0-beta.3
- bug fix in System

#### v2.0.0-beta.2
- replaced JSON API specification with Flux Standard Action specification
- added System class for internal Actor message bus
  - this required a breaking change in the argument order on the `Actor.perform` method
- added browser tests for most recent Chrome and Firefox

#### v2.0.0-beta.1
- added documentation

#### v2.0.0-beta
- updated name and organization
- renamed Handler to Actor and added Aggregate functionality to it
- removed Schema for more robust JSON Schema solution (refactored into `schema-json-js` dependency)
- removed Message|Command|Event since these can be represented as Model|Schema and performed with Actors
- adopted JSON API and JSON Schema specifications

#### v1.0.0
- initial release (of `js-cqrs-es`)

#### pre-v1.0.0
![nothing to see here](https://www.reactiongifs.us/wp-content/uploads/2016/04/nothing_to_see_here_naked_gun.gif)

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
