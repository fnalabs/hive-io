# js-cqrs-es-domain-module
This is an example domain module to help describe implementation guidelines when leveraging the [js-cqrs-es](https://www.npmjs.com/package/js-cqrs-es) library. This is developed in parallel to prove the [Hive Pattern](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903) theory. It is the structure that the [Hive Stack Components](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903#hive-stack-components) are built upon.

## Structure
The structure of the domain module is defined below. This is the general structure that the Producer, Consumer, and Stream Processor services follow by default. Again, this is a suggested structure to keep domain logic separate from application/infrastructure logic because it makes the code far more portable than it would have otherwise been. This is fine for smaller domain models. To manage complex domain models, see the [advanced use cases](#advanced-use-cases) below.
```
module
    |- projection
    |   |- denormalizer
    |   |   `- Denormalizers
    |   `- store
    |       `- Mongoose Schemas
    `- domain
        |- schema
        |   `- Schemas
        |- model
        |   |- Entities
        |   `- Value Objects
        `- aggregate
            `- Aggregate namespaces { class, commands, events, handlers }
```

## Advanced Use Cases
For larger domain models, an even greater degree of separation with multiple domain modules is strongly recommended. Teams will maintain their own domain modules in their area of responsibility for the overall domain model.

Another strong recommendation is to separate the domain module into multiple modules to manage dependencies and portability better. Commands should be put in their own module so that they can be reused in the UI layer. Projections should also be split out into their own module as well because of the extra DB dependencies. Here is an example of how these multiple modules could be defined:
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

- ***NOTE:*** This approach will require you to use the [Hive Stack](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903#hive-stack-components) starter kits rather than the Docker base images.

## Example
The example provided here is an attempt to showcase as much of the features of the [js-cqrs-es](https://www.npmjs.com/package/js-cqrs-es) framework as possible. It is a contrived representation of a Twitter Tweet [Content](./src/js/domain/aggregate/content.js) aggregate and an analytics [View](./src/js/domain/model/view.js) value object to track views over time. The data is denormalized on the Consumer side to represent the complete [Post](./src/js/projection/denormalizer/post.js) and tracks the number of Views each Post has received. This is also the default domain module applied to the [Hive Stack](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903) for testing implementation details. I've provided a diagram for the domain model below.

![js-cqrs-es contrived example domain model](cqrs_es_contrived_example_domain.png "js-cqrs-es contrived example domain model")
