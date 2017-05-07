module.exports = Object.freeze({
    // application configurations
    NODE_ENV: process.env.NODE_ENV || 'production',
    PORT: process.env.PORT || 3000,
    // domain configurations
    MODEL: process.env.MODEL || 'view',
    MODEL_LIB: process.env.MODEL_LIB || 'js-cqrs-es-domain-module',
    // storage configurations
    EVENT_STORE_ID: process.env.EVENT_STORE_ID,
    EVENT_STORE_URL: process.env.EVENT_STORE_URL,
    EVENT_STORE_TYPE: process.env.EVENT_STORE_TYPE || 3
});
