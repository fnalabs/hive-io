// private methods
const ASSERT_DEF = Symbol('reference to method that checks if data is defined and not null');
const ASSERT_TYPE = Symbol('reference to method that checks data type against schema definition');
const ASSIGN = Symbol('reference to method that assigns schema definitions to the class instance');
const ITERATOR = Symbol('reference to method that iterates over non-iterable data structures');


export default class Schema {

    constructor(spec = { id: String }) {
        this[ASSIGN](spec);
    }

    /*
     * validate
     */
    validate(value, rule) {
        // if only the data type has been provided
        if (this[ASSERT_DEF](value) && typeof rule === 'function') this[ASSERT_TYPE](value, rule);

        else {
            if (rule.required && typeof value === 'undefined') {
                throw new ReferenceError('expected a required value to exist');
            }

            if (this[ASSERT_DEF](value)) this[ASSERT_TYPE](value, rule.type);

            // if custom validation function is defined
            if (typeof rule.validate === 'function') rule.validate(value);
        }
    }

    /*
     * assertion(s)
     */
    [ASSERT_DEF](value) {
        return value !== null && typeof value !== 'undefined';
    }

    [ASSERT_TYPE](value, type) {
        if (typeof value !== type.name.toLowerCase()) {
            throw new TypeError(`expected ${JSON.stringify(value)} to be a(n) ${type.name}`);
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

    *[ITERATOR](obj) {
        const keys = Object.keys(obj);

        for (const key of keys) {
            yield [key, obj[key]];
        }
    }

    /*
     * utility method(s)
     */
    [ASSIGN](data) {
        const assign = (object, source) => {
            // iterate over object/array passed as source data
            for (let [key, value] of this[ITERATOR](source)) {
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
