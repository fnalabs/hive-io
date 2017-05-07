// export module namespaces
exports.domain = {
    aggregate: require('./dist/js/domain/aggregate'),
    model: require('./dist/js/domain/model')
};
exports.projection = {
    denormalizer: require('./dist/js/projection/denormalizer'),
    store: require('./dist/js/projection/store')
};
