export const CACHE = Symbol('reference to the data cache for internal processing');
export const SCHEMA = Symbol('reference to the Schema associated with the Aggregate');

export default class Aggregate {

    constructor(id, schema, data) {
        this[CACHE] = { id, version: -1 };
        this[SCHEMA] = schema;

        if (data) this[CACHE] = this.apply(data);
    }

    /*
     * getters/setters
     */
    get cache() {
        return { ...this[CACHE] };
    }

    get schema() {
        return { ...this[SCHEMA] };
    }

    /*
     * apply methods
     */
    apply(data) {
        if (Array.isArray(data)) return this.applySequence(data);

        return {
            ...this[CACHE],
            ...data,
            version: data.sequence
        };
    }

    applySequence(data) {
        return data.reduce(log => this.apply(log), this[CACHE]);
    }

    /*
     * utility methods
     */
    validate(data) {
        if (data.sequence !== this[CACHE].version + 1) return false;

        return this[SCHEMA].validate(data);
    }

}
