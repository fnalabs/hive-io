# js-cqrs-es-domain-module
This is an example domain module to help describe implementation guidelines when leveraging the [js-cqrs-es](https://www.npmjs.com/package/js-cqrs-es) framework.

## Structure
The structure of the domain module is defined below. This is the general structure that the Producer, Consumer, and Stream Processor services follow by default. Again, this is a suggested structure to keep domain logic separate from application/infrastructure logic because it makes the code more far more portable than it would have otherwise been. This is fine for smaller domain models. To manage complex domain models, see the [advanced use cases](#advanced-use-cases) below.
```
module
    |- projection
    |   |- Projections
    |   `- (etc.)
    `- domain
        |- schema
        |   `- Schemas
        |- model
        |   |- Entities
        |   |- Value Objects
        |   `- (etc.)
        `- aggregate
            |- Aggregate namespaces { class, commands, events, handlers }
            `- (etc.)
```

## Advanced Use Cases
For larger domain models, an even greater degree of separation with multiple domain modules is strongly recommended. Teams will maintain their own domain modules in their area of responsibility for the overall domain model.

Another strong recommendation is to separate the domain module into multiple modules to manage dependencies and portability better. Commands should be put in their own module so that they can be reused in the UI layer. Projections should also be split out into their own module as well because of the extra DB dependencies. Here is an example of how these multiple modules would be defined:
```
commands-module
    |- Commands
    |
    `- dependencies
        `- js-cqrs-es

domain-module
    |- Schemas
    |- Entities
    |- Value Objects
    |- Aggregate namespaces { class, events, handlers }
    |
    |- dependencies
        `- commands-module

projections-module
    |- Denormalizers
    |- Projections
    |
    `- dependencies
        |- domain-module
        `- odm-framework
```

- ***NOTE:*** This approach will require you to use the [Hive Stack](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903) starter kits rather than the Docker base images.

## Example
The example provided here is an attempt to showcase as much of the features of the [js-cqrs-es](https://www.npmjs.com/package/js-cqrs-es) framework as possible. It is a contrived representation of a Twitter Tweet [Content](./src/js/domain/aggregate/content.js) aggregate and an analytics [View](./src/js/domain/model/view.js) value object to track views over time. This is also the default domain module applied to the [Hive Stack](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903) for testing implementation details. I've provided a diagram for the domain model below.

![contrived example domain model](cqrs_es_contrived_example_domain.png "js-cqrs-es contrived example domain model")

- ***NOTE:*** To be clear, the Content aggregate handles a small amount of denormalization to track views on the Consumer. This is ***NOT*** the recommended approach! It is there to make development and testing easier. Separate Denormalizers should be written that should extend the Aggregate class and reuse existing Schemas to define the denormalized structure for [Hive Stack](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903) Consumers. [Read](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903#aggregates-and-denormalization) more about why.
