import Schema from './Schema';


export const SPEC = Symbol('reference to Schema object that defines the data model');

export default class Model {

    constructor(data = { id: 'id' }, spec = new Schema()) {
        this[SPEC] = spec;

        this.create(data);
    }

    /*
     * create
     */
    create(data) {
        const create = (source, spec = this[SPEC]) => {
            for (let [property, specification] of spec) {
                // if specification is a nested Schema, recursively create them too
                if (specification instanceof Schema) create(source[property], specification);
                else if (Array.isArray(specification)) create(source[property], specification[0]);
                else {
                    spec.validate(source[property], specification);

                    // if a default value/function is defined, use it
                    if (specification.value) {
                        source[property] = spec.evalProperty(specification.value);
                    }

                    else if (specification.default && !source[property]) {
                        source[property] = spec.evalProperty(specification.default);
                    }
                }
            }

            return this.assign(source);
        };
        return create(data);
    }

    /*
     * update
     */
    update(data) {
        const update = (source, spec = this[SPEC]) => {
            for (let [property, specification] of spec) {
                // if specification is a nested Schema, recursively update them too
                if (specification instanceof Schema) update(source[property], specification);
                else if (Array.isArray(specification)) update(source[property], specification[0]);
                else {
                    // if specification is defined, validate the source value
                    if (specification) spec.validate(source[property], specification);

                    // if a default value/function is defined, use it
                    if (specification.value) {
                        source[property] = spec.evalProperty(specification.value);
                    }
                }

            }

            return this.assign(source);
        };
        return update(data);
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

    *iterator(obj) {
        const keys = Object.keys(obj);

        for (const key of keys) {
            yield [key, obj[key]];
        }
    }

    /*
     * utility method(s)
     */
    assign(data) {
        const assign = (object, source) => {
            // iterate over object/array passed as source data
            for (let [key, value] of this.iterator(source)) {
                if (value && typeof value === 'object') {
                    if (Array.isArray(value)) object[key] = assign([], value);
                    else object[key] = assign({}, value);
                }
                else object[key] = value;
            }
            return object;
        };
        return assign(this, data);
    }

}
