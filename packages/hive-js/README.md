# hive<sup>io</sup>

[![NPM Version][npm-image]][npm-url]
[![License][license-image]][license-url]
[![Build Status][circle-image]][circle-url]
[![BrowserStack Status][browserstack-image]][browserstack-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

A reactive, universal JavaScript library for the [Hive<sup>io</sup>](https://hiveframework.io) framework.

This is where the business logic for your domain model is implemented. The [Actor Model](https://en.wikipedia.org/wiki/Actor_model) is used as the basic building block to implement standardized, reactive microservices. The intent is to clearly define a separation between infrastructure as code and business logic allowing them both to adapt and scale independently. From simple REST services to CQRS/ES microservices, this library is flexible enough to enable the Actors to adopt new roles on the fly.

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

## [API](https://hiveframework.io/api/)

## Examples
More examples can be found in the 2 example npm packages:
- [hive-io-rest-example](https://www.npmjs.com/package/hive-io-rest-example)
- [hive-io-domain-example](https://www.npmjs.com/package/hive-io-domain-example)

## Future
- integrate with client-side presentation libraries
- feature requests via [issues](https://github.com/fnalabs/hive-js/issues)

## Contributing
We are currently drafting our contributing guide!

*Browser compatibility testing provided by:*

<a href="https://browserstack.com"><img height="48" src="https://fnalabs.github.io/fnalabs-assets/assets/Browserstack-logo.svg" alt="BrowserStack"></a>

## Changelog
#### v2.0.0-rc.2
- added browser unit test coverage for `hive-io` classes in all evergreen browsers, desktop and mobile
- improved how data in ingested in Rest, Producer, and Stream Processor
- modified examples
- updated dependencies

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

[browserstack-image]: https://www.browserstack.com/automate/badge.svg?badge_key=aWwzemdqdFZaV3E0QXlXTjF4RXdmZ1k2Ni9EMWI1SnRZV2QvNXVtbllBMD0tLVJkQTkzVXdSS0xVRm04TjZ1OGFPVFE9PQ==--8d7a26586a9a27cc4ebb69405c1e3a41f690c56e
[browserstack-url]: https://www.browserstack.com/automate/public-build/aWwzemdqdFZaV3E0QXlXTjF4RXdmZ1k2Ni9EMWI1SnRZV2QvNXVtbllBMD0tLVJkQTkzVXdSS0xVRm04TjZ1OGFPVFE9PQ==--8d7a26586a9a27cc4ebb69405c1e3a41f690c56e

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/hive-js/v2.0.0.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-js

[depstat-image]: https://img.shields.io/david/fnalabs/hive-js.svg
[depstat-url]: https://david-dm.org/fnalabs/hive-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
