/**
 * SumX Server Application
 * Professional research paper analysis platform
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import configurations
const appConfig = require('./config/app');

// Import middleware
const { errorHandler, notFoundHandler, requestLogger, corsOptions } = require('./middleware/errorHandler');

// Import routes
const analysisRoutes = require('./routes/analysis');
const healthRoutes = require('./routes/health');

class SumXServer {
    constructor() {
        this.app = express();
        this.port = appConfig.port;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    /**
     * Setup application middleware
     */
    setupMiddleware() {
        // Request logging
        if (appConfig.environment === 'development') {
            this.app.use(requestLogger);
        }

        // CORS configuration
        this.app.use(cors(corsOptions));

        // Body parsing
        this.app.use(express.json({ limit: appConfig.jsonLimit }));
        this.app.use(express.urlencoded({ extended: true, limit: appConfig.jsonLimit }));

        // Static files serving
        this.app.use(express.static(path.join(__dirname, '../client')));
        
        // Serve CSS and JS assets with correct MIME types
        this.app.use('/assets', express.static(path.join(__dirname, '../client/assets'), {
            setHeaders: (res, path) => {
                if (path.endsWith('.css')) {
                    res.setHeader('Content-Type', 'text/css');
                } else if (path.endsWith('.js')) {
                    res.setHeader('Content-Type', 'application/javascript');
                }
            }
        }));
    }

    /**
     * Setup application routes
     */
    setupRoutes() {
        // API routes
        this.app.use('/api/analyze', analysisRoutes);
        this.app.use('/api', healthRoutes);

        // Legacy route compatibility (for existing frontend)
        this.app.post('/summarize', async (req, res, next) => {
            try {
                // Redirect to new analysis endpoint
                req.url = '/api/analyze/text';
                analysisRoutes(req, res, next);
            } catch (error) {
                next(error);
            }
        });

        // Serve main application
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../client/index.html'));
        });

        // Additional routes can be added here
    }

    /**
     * Setup error handling
     */
    setupErrorHandling() {
        // 404 handler for API routes - handle in main error handler
        
        // Global error handler
        this.app.use(errorHandler);
    }

    /**
     * Start the server
     */
    start() {
        this.app.listen(this.port, () => {
            console.log(`
🔬 SumX Research Paper Analyzer
════════════════════════════════
Server running on: http://localhost:${this.port}
Environment: ${appConfig.environment}
Static files: ${path.join(__dirname, '../client')}
API endpoints: /api/*
════════════════════════════════
Ready for scientific analysis! 🚀
            `);
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down SumX server...');
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 Shutting down SumX server...');
            process.exit(0);
        });
    }
}

// Start the application
if (require.main === module) {
    const server = new SumXServer();
    server.start();
}

module.exports = SumXServer;
