module.exports = Object.freeze({
    // application configurations
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 3000,
    // domain configurations
    PROJECTION: process.env.PROJECTION || 'post',
    PROJECTION_LIB: process.env.PROJECTION_LIB || './domain',
    AGGREGATE_LIST: Array.from(process.env.AGGREGATE_LIST) || ['content', 'view'],
    MODEL: process.env.MODEL || 'post',
    MODEL_LIB: process.env.MODEL_LIB || './model',
    // event store configurations
    EVENT_STORE_ID: process.env.EVENT_STORE_ID,
    EVENT_STORE_URL: process.env.EVENT_STORE_URL,
    EVENT_STORE_TIMEOUT: process.env.EVENT_STORE_TIMEOUT || 15000,
    EVENT_STORE_PROTOCOL: process.env.EVENT_STORE_PROTOCOL || 'roundrobin',
    EVENT_STORE_OFFSET: process.env.EVENT_STORE_OFFSET || 'latest',
    // query db configurations
    MONGO_URL: process.env.MONGO_URL,
    UPDATE_OPTIONS: {
        upsert: true
    }
});
