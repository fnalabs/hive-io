export const SPEC = Symbol('reference to Specification object that defines the data model');

export default class Schema {

    constructor(spec = { id: String }) {
        this[SPEC] = spec;
    }

    get spec() {
        return { ...this[SPEC] };
    }

    /*
     * create
     */
    create(data, spec = this[SPEC]) {
        for (let property in spec) {

            // if property is a nested Schema, recursively create them too
            if (spec[property].constructor.name === 'Schema') this.create(data[property], spec[property].spec);

            else {
                if (spec[property].default) {
                    data[property] = this.evalProperty(spec[property].default);
                }

                if (spec[property].value) {
                    data[property] = this.evalProperty(spec[property].value);
                }
            }
        }

        return data;
    }

    /*
     * update
     */
    update(data, spec = this[SPEC]) {
        for (let property in spec) {

            // if property is a nested Schema, recursively update them too
            if (spec[property].constructor.name === 'Schema') this.update(data[property], spec[property].spec);

            else if (spec[property].value) {
                data[property] = this.evalProperty(spec[property].value);
            }
        }

        return data;
    }

    /*
     * validate
     */
    validate(data, spec = this[SPEC]) {
        let valid = true;

        // loop over properties in the spec to validate the data
        for (let property in spec) {

            // if property is a nested Schema to recursively validate nested Schemas
            if (spec[property].constructor.name === 'Schema') this.validate(data[property], spec[property].spec);

            // else if only the data type has been provided
            else if (!spec[property].type) valid = this.assertType(data[property], spec[property]);

            else {
                if (data[property] && spec[property].type) valid = this.assertType(data[property], spec[property].type);

                // if still valid, validate if property is required
                if (valid && spec[property].required && !data[property]) valid = false;

                // if still valid, validate if custom validation function is defined
                if (valid && typeof spec[property].validate === 'function') valid = spec[property].validate(data[property]);
            }

            // break loop immediately on first error
            if (!valid) break;
        }

        return valid;
    }

    /*
     * assertions
     */
    assertType(value, type) {
        if (Array.isArray(type) && Array.isArray(value)) return this.assertList(value, type[0].spec);

        return typeof value === type.name.toLowerCase();
    }

    assertList(list, spec) {
        for (let value of list) {
            if (!this.validate(value, spec)) return false;
        }

        return true;
    }

    /*
     * utility method(s)
     */
    evalProperty(value) {
        return typeof value === 'function' ? value() : value;
    }

}
