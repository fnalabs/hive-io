export default class Schema {

    constructor(spec = { id: String }) {
        this.assign(spec);
    }

    /*
     * validate
     */
    validate(value, rule) {
        // if only the data type has been provided
        if (value !== null && typeof value !== 'undefined' && !rule.type) this.assertType(value, rule);

        else {
            // if property is required and not defined
            if (rule.required && typeof value === 'undefined') {
                throw new ReferenceError('expected a required value to exist');
            }

            // if property is set and type is defined, then assert type
            if (value !== null && typeof value !== 'undefined') this.assertType(value, rule.type);

            // if custom validation function is defined
            if (typeof rule.validate === 'function') rule.validate(value);
        }
    }

    /*
     * assertion(s)
     */
    assertType(value, type) {
        if (Array.isArray(type)) {
            if (!Array.isArray(value)) throw new TypeError(`expected ${JSON.stringify(value)} to be an Array`);
            else if (typeof type[0] === 'function') this.assertTypedArray(value, type[0]);
        }
        else if (typeof value !== type.name.toLowerCase()) {
            throw new TypeError(`expected ${JSON.stringify(value)} to be a(n) ${type.name}`);
        }
    }

    assertTypedArray(array, type) {
        if (!Array.isArray(array)) throw new TypeError(`expected ${JSON.stringify(array)} is not an Array`);
        else {
            for (const value of array) {
                this.assertType(value, type);
            }
        }
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
                if (value && typeof value === 'object' && value.constructor.name !== 'Schema') {
                    if (Array.isArray(value)) object[key] = assign([], value);
                    else object[key] = assign({}, value);
                }
                else object[key] = value;
            }
            return object;
        };
        return assign(this, data);
    }

    evalProperty(value) {
        return typeof value === 'function' ? value() : value;
    }

}
