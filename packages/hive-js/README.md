# hive-io

[![NPM Version][npm-image]][npm-url]
[![Build Status][circle-image]][circle-url]
[![Code Coverage][codecov-image]][codecov-url]
[![Dependency Status][depstat-image]][depstat-url]
[![JavaScript Style Guide][style-image]][style-url]

A reactive, serverless JavaScript framework.

TODO

## Changelog
#### v2.0.0
- updated name and organization
- renamed Handler to Actor and added Aggregate functionality to it
- removed Schema for more robust JSON Schema solution (refactored into `schema-json-js` dependency)
- removed Message|Command|Event since these can be modeled conceptually using Model|Schema and performed with Actors
- adopted JSON API and JSON Schema specifications

#### v1.0.0
- initial release (of `js-cqrs-es`)

[npm-image]: https://img.shields.io/npm/v/hive-io.svg
[npm-url]: https://www.npmjs.com/package/hive-io

[circle-image]: https://img.shields.io/circleci/project/github/fnalabs/hive-js.svg
[circle-url]: https://circleci.com/gh/fnalabs/hive-js

[codecov-image]: https://img.shields.io/codecov/c/github/fnalabs/hive-js.svg
[codecov-url]: https://codecov.io/gh/fnalabs/hive-js

[depstat-image]: https://img.shields.io/david/fnalabs/hive-js.svg
[depstat-url]: https://david-dm.org/fnalabs/hive-js

[style-image]: https://img.shields.io/badge/code_style-standard-brightgreen.svg
[style-url]: https://standardjs.com
