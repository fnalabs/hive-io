# js-cqrs-es-domain-module
This is an example domain module to help describe implementation guidelines when leveraging the [js-cqrs-es](https://www.npmjs.com/package/js-cqrs-es) framework.

## Structure
The structure of the domain module is defined below. This is the general structure that the Producer, Consumer, and Stream Processor services follow by default. Again, this is a suggested structure to keep domain logic separate from application/infrastructure logic because it makes the code more far more portable than it would have otherwise been. For larger domain models, an even greater degree of separation with multiple domain modules is recommended. Teams will maintain their own domain modules in their area of responsibility in the domain model.
```
module
    |- projection
    |   |- Projections
    |   `- (etc.)
    `- domain
        |- model
        |   |- Entities
        |   |- Value Objects
        |   `- (etc.)
        `- aggregate
            |- Aggregate namespaces { class, commands, events, handlers }
            `- (etc.)
```

## Example
The example provided here is an attempt to showcase as much of the features of the [js-cqrs-es](https://www.npmjs.com/package/js-cqrs-es) framework as possible. It is a contrived representation of a Twitter Tweet [Content](./src/js/domain/aggregate/content.js) aggregate and an analytics [View](./src/js/domain/model/view.js) value object to track views over time. This is also the default domain module applied to the Hive Stack for testing implementation details. I've provided a diagram for the domain model below.

![contrived example domain model](cqrs_es_contrived_example_domain.png "js-cqrs-es contrived example domain model")

- ***NOTE:*** To be clear, the Content aggregate handles a small amount of de-normalization to track views on the Consumer. [Read](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903) more about why.
