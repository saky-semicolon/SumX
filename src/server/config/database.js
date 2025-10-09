/**
 * Database configuration
 * Currently using in-memory storage for simplicity
 * Can be extended to use MongoDB, PostgreSQL, etc.
 */

const config = {
    // Future database configurations
    mongodb: {
        url: process.env.MONGODB_URL || 'mongodb://localhost:27017/sumx',
        options: {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    },
    
    // In-memory storage settings
    memory: {
        maxDocuments: 100,
        ttl: 3600000 // 1 hour in milliseconds
    }
};

module.exports = config;
