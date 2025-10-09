/**
 * Application configuration
 */

const appConfig = {
    // Server settings
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    
    // Environment
    environment: process.env.NODE_ENV || 'development',
    
    // Static files
    staticPath: './src/client',
    
    // File upload settings
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
            'application/pdf',
            'text/plain'
        ],
        allowedExtensions: ['.pdf', '.txt']
    },
    
    // Request limits
    jsonLimit: '50mb',
    
    // CORS settings
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true
    },
    
    // Security settings
    security: {
        rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
        rateLimitMax: 100, // requests per window
        helmetEnabled: true
    },
    
    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'combined'
    }
};

module.exports = appConfig;
