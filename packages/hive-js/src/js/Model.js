import Schema from './Schema';

// private properties
const SPEC = Symbol('reference to Schema object that defines the data model');

// private methods
const INIT_SCHEMA = Symbol('reference to method that initializes data against the Schema');
const INIT_ARRAY = Symbol('reference to method that initializes Array data');
const INIT_PROPERTY = Symbol('reference to method that initializes property data');


export default class Model {

    constructor(data = { id: 'id' }, spec = new Schema()) {
        this[SPEC] = spec;

        this.update(data);
    }

    /*
     * update
     */
    update(data) {
        return this[INIT_SCHEMA](this, data, this[SPEC]);
    }

    /*
     * iterator(s)
     */
    *[Symbol.iterator]() {
        const keys = Object.keys(this);

        for (const key of keys) {
            yield [key, this[key]];
        }
    }

    /*
     * private methods
     */
    [INIT_ARRAY](source, spec) {
        if (typeof source === 'undefined') source = [];

        if (spec[0] instanceof Schema) {
            return source.map(value => this[INIT_SCHEMA]({}, value, spec[0]));
        }

        return source.map(value => this[INIT_PROPERTY](value, spec[0]));
    }

    [INIT_PROPERTY](value, spec) {
        // if a default value/function is defined, use it
        if (typeof spec.value !== 'undefined') {
            return this[SPEC].evalProperty(spec.value);
        }

        else if (typeof spec.default !== 'undefined' && typeof value === 'undefined') {
            return this[SPEC].evalProperty(spec.default);
        }

        this[SPEC].validate(value, spec);

        return value;
    }

    [INIT_SCHEMA](object, source, spec) {
        if (typeof source === 'undefined') source = {};

        // iterate over object/array passed as source data
        for (let [property, specification] of spec) {
            // if specification is a nested Schema
            if (specification instanceof Schema) {
                object[property] = this[INIT_SCHEMA]({}, source[property], specification);
            }
            // else if specification is an Array
            else if (Array.isArray(specification)) {
                object[property] = this[INIT_ARRAY](source[property], specification);
            }
            // else initialize property
            else object[property] = this[INIT_PROPERTY](source[property], specification);
        }

        return object;
    }

}
