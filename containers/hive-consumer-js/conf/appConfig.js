module.exports = Object.freeze({
    // application configurations
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 3000,
    // domain configurations
    AGGREGATE: process.env.AGGREGATE || 'content',
    AGGREGATE_LIB: process.env.AGGREGATE_LIB || 'js-cqrs-es-domain-module',
    AGGREGATE_LIST: process.env.AGGREGATE_LIST && Array.from(process.env.AGGREGATE_LIST) || ['content', 'view'],
    PROJECTION: process.env.PROJECTION || 'content',
    PROJECTION_LIB: process.env.PROJECTION_LIB || 'js-cqrs-es-domain-module',
    // event store configurations
    EVENT_STORE_ID: process.env.EVENT_STORE_ID,
    EVENT_STORE_URL: process.env.EVENT_STORE_URL,
    EVENT_STORE_TIMEOUT: process.env.EVENT_STORE_TIMEOUT || 15000,
    EVENT_STORE_PROTOCOL: process.env.EVENT_STORE_PROTOCOL || 'roundrobin',
    EVENT_STORE_OFFSET: process.env.EVENT_STORE_OFFSET || 'latest',
    // query db configurations
    MONGO_URL: process.env.MONGO_URL,
    UPDATE_OPTIONS: {
        runValidators: true,
        setDefaultsOnInsert: true,
        upsert: true
    }
});
