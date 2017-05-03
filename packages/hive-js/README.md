# js-cqrs-es
A JavaScript Command Query Responsibility Segregation (CQRS) and Event Sourcing (ES) library.

## Library
The library contains a base set of classes that can be used to implement your domain layer of your CQRS/ES application. It contains all the basic building blocks for defining Aggregates, Entities, and Value Objects backed by a rich Schema specification that is meant to translate to/from [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#JavaScript_Object_Notation) for easy network transport. It also provides extensible Command and Event Messages to support your Aggregate implementation.

### Schema
Let's start with [Schema](./src/js/Schema.js) first. Inspired by [Mongoose](http://mongoosejs.com/) Schemas, it has very similar features but some very distinct differences. A Schema is a specification for your data models to provide a reference for validation when instantiating and/or applying data to your models. Each property ***must*** have one of the valid JSON primitive/complex data types defined:
- `Boolean`
- `Number`
- `String`
- `Object` (as a nested Schema)
- `Array` (as an Array literal)
- `null`

Property definitions can be as simple as providing the one of the data types above or as complex as a object literal containing the following properties:
- `type` = use one of the types listed above
- (Optional) `required` = set as a [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value
- (Optional) `validate` = custom validation method that ***must*** throw an [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Error_types) on a failed validation
- (Optional) `default` = a default value/function for the property
- (Optional) `value` = a *hard-coded* value/function

While Schema only provides two public methods, it does quite a bit more under the hood to support the definitions above. It is defined as an iterable object with the same signature as a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) so Aggregates/Models can iterate over the schema using `for...of` instead of `for...in w/ hasOwnProperty`. While the Aggregates/Models iterate over the Schema, they call the following methods for support:
- `validate(value, rule)` - called by Aggregate/Model to validate each property while being assigned. `value` is the value to validate and `rule` is a reference to the property's Schema definition.
- `evalProperty()` - not as evil as it sounds, this method is used to return the value or execute the function assigned to either `default` or `value` definitions above.

### Model
Next is [Model](./src/js/Model.js). The Model class, in conjunction with a Schema reference, is used to define Entities and Value Objects in your CQRS implementation. Just like Schema, it is implemented as an iterable object with the same signature as a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map). It exposes two public methods but it also does quite a bit under the hood.
- `update(data)` - used to create the object's data properties initially and also when updating data against the Schema definition. it uses three internal setter methods to iterate over the Schema to validate and set data properties accordingly.
- `toJSON()` - can be called directly but is typically called by `JSON.stringify(object)` to add the class name of the object for network transport and reconstruction.

### Aggregate
The [Aggregate](./src/js/Aggregate.js) class extends Model to add aggregate specific methods. Therefore, it has the same base functionality and public methods as the Model class but with a few additions. Namely, it has two `apply` methods to support different use cases.
- `applyData(data)` - applies the event data from an object literal to the object. It first validates that the version of the data being applied is not out of sequence. If version validation passes, then it uses Model's `update` method to apply the new data on top of the existing state.
- `applySequence(data)` - applies a list of data to the object to support a traditional CQRS Aggregate implementation. This method is for instantiating the state of the object from the list of events returned from your event store. This is not the default use case for the Aggregate class but can be achieved by chaining the constructor call like so `new Aggregate(data.shift(), schema).applySequence(data)`.

### Message
The [Message](./src/js/Message.js) class is a base class for Command and Event messages that are passed through a CQRS/ES application. It provides the most basic definition of these messages, an id and sequence. It has a single public method defined below:
- `toJSON()` - can be called directly but is typically called by `JSON.stringify(object)` to add the class name of the object for network transport and reconstruction.

### Command
The [Command](./src/js/Command.js) class extends Message by adding an abstract method for Command validation. It is meant to be extended directly to define your Commands in your CQRS implementation. Validations are meant to be superficial and are only concerned with specific data points attached to the command if there are any. Validate is called on Command construction automatically but is publicly exposed if it needs to be called directly.
- `validate()` - abstract method that returns undefined by default. Override for specific validation requirements (if any). Be sure to throw an appropriate [Error](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Error_types) if your validation fails.

### Event
The [Event](./src/js/Event.js) class is very much like the Command class above but is used for logging and event messaging. The only difference from the Message class it extends is that it adds an ISO timestamp before it's logged. It has no public methods but can be extended to suite your needs.

### Handler
Last but not least, the [Handler](./src/js/Handler.js) class is responsible for translating Commands, Events, and Aggregates at all of your service endpoints. It is essentially the glue that binds all of the above objects together in a CQRS/ES implementation. It only has one public method and should be able to cover most use cases. The class can be extended for specific handling requirements.
- `handle(data, aggregate)` - takes the raw `data` passed through the network and instantiates the Command it's associated with. The `aggregate` is an instance of the Aggregate class and is created in the Application layer either from existing event store data or with new/default data in a `create` command/event.

## Example
[This](https://www.npmjs.com/package/js-cqrs-es-domain-module) is an example implementation of a contrived domain model using this library. It is an over-simplified example of Twitter content and view analytics to showcase all of the classes above.

The example is also paired with the [Hive Stack](https://gist.github.com/aeilers/30aa0047187e5a5d573a478abc581903), an enterprise CQRS/ES stack implementing micro-service applications around a [Kafka](https://kafka.apache.org) streaming event store with [Redis](https://redis.io/)/[Redlock](https://redis.io/topics/distlock) as a cache layer and [MongoDB](https://www.mongodb.com/) for projections.

## Future
- adding a little more rigitity/defensive coding to the data model to enforce JSON modeling
- feature requests via [issues](https://github.com/aeilers/js-cqrs-es/issues)
