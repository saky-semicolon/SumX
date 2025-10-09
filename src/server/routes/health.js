/**
 * Health check and utility routes
 */

const express = require('express');
const router = express.Router();
const appConfig = require('../config/app');

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            environment: appConfig.environment,
            version: process.env.npm_package_version || '1.0.0',
            uptime: process.uptime()
        }
    });
});

/**
 * GET /api/info
 * Application information
 */
router.get('/info', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'SumX Research Paper Analyzer',
            version: process.env.npm_package_version || '1.0.0',
            description: 'AI-powered scientific research paper analysis platform',
            environment: appConfig.environment,
            features: [
                'PDF text extraction',
                'Research paper analysis',
                'Scientific evaluation',
                'Evidence-based assessment',
                'Multiple AI model fallback'
            ],
            limits: {
                maxFileSize: `${appConfig.upload.maxFileSize / (1024 * 1024)}MB`,
                allowedTypes: appConfig.upload.allowedMimeTypes,
                jsonLimit: appConfig.jsonLimit
            }
        }
    });
});

/**
 * GET /api/config
 * Public configuration information
 */
router.get('/config', (req, res) => {
    res.json({
        success: true,
        data: {
            upload: {
                maxFileSize: appConfig.upload.maxFileSize,
                allowedMimeTypes: appConfig.upload.allowedMimeTypes,
                allowedExtensions: appConfig.upload.allowedExtensions
            },
            features: {
                pdfExtraction: true,
                textAnalysis: true,
                multiModel: true,
                fileUpload: true
            }
        }
    });
});

module.exports = router;
