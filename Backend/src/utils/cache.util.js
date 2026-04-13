const NodeCache = require('node-cache');

// Create a cache instance with default TTL of 60 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

console.log('[CACHE] NodeCache initialized with default TTL: 60s');

module.exports = cache;
