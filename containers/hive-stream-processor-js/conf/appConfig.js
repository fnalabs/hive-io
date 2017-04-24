module.exports = Object.freeze({
    PROCESSOR_TYPE: process.env.PROCESSOR_TYPE || 'producer',
    AGGREGATE: process.env.AGGREGATE || 'content',
    AGGREGATE_LIB: process.env.AGGREGATE_LIB || './domain',
    COMMAND_LIB: process.env.COMMAND_LIB || './commands',
    CACHE_URL: process.env.CACHE_URL,
    EVENT_STORE_ID: process.env.EVENT_STORE_ID,
    EVENT_STORE_URL: process.env.EVENT_STORE_URL,
    EVENT_STORE_TYPE: process.env.EVENT_STORE_TYPE || 2,
    EVENT_STORE_TIMEOUT: process.env.EVENT_STORE_TIMEOUT || 15000,
    EVENT_STORE_PROTOCOL: process.env.EVENT_STORE_PROTOCOL || 'roundrobin',
    EVENT_STORE_OFFSET: process.env.EVENT_STORE_OFFSET || 'latest',
    LOCK_TTL: process.env.LOCK_TTL || 1000,
    LOCK_DRIFT_FACTOR: process.env.LOCK_DRIFT_FACTOR || 0.01,
    LOCK_RETRY_COUNT: process.env.LOCK_RETRY_COUNT || 0,
    LOCK_RETRY_DELAY: process.env.LOCK_RETRY_DELAY || 400,
    LOCK_RETRY_JITTER: process.env.LOCK_RETRY_JITTER || 400
});
