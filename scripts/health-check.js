#!/usr/bin/env node
/**
 * SumX Health Check Script
 * Verifies application health for Docker containers
 */

const http = require('http');
const process = require('process');

const HEALTH_CONFIG = {
    host: 'localhost',
    port: process.env.PORT || 3000,
    path: '/api/health',
    timeout: 5000,
    retries: 3,
    retryDelay: 1000
};

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkHealth(attempt = 1) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: HEALTH_CONFIG.host,
            port: HEALTH_CONFIG.port,
            path: HEALTH_CONFIG.path,
            method: 'GET',
            timeout: HEALTH_CONFIG.timeout,
            headers: {
                'User-Agent': 'SumX-HealthCheck/1.0'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                if (res.statusCode === 200) {
                    try {
                        const healthData = JSON.parse(data);
                        if (healthData.success && healthData.data.status === 'healthy') {
                            resolve({
                                status: 'healthy',
                                attempt: attempt,
                                statusCode: res.statusCode,
                                data: healthData
                            });
                        } else {
                            reject(new Error(`Health check failed: Invalid response format`));
                        }
                    } catch (parseError) {
                        reject(new Error(`Health check failed: Invalid JSON response`));
                    }
                } else {
                    reject(new Error(`Health check failed: HTTP ${res.statusCode}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`Health check failed: ${error.message}`));
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error(`Health check failed: Request timeout (${HEALTH_CONFIG.timeout}ms)`));
        });

        req.end();
    });
}

async function performHealthCheck() {
    console.log(`🔍 Starting SumX health check...`);
    console.log(`📍 Target: http://${HEALTH_CONFIG.host}:${HEALTH_CONFIG.port}${HEALTH_CONFIG.path}`);

    for (let attempt = 1; attempt <= HEALTH_CONFIG.retries; attempt++) {
        try {
            console.log(`🔄 Attempt ${attempt}/${HEALTH_CONFIG.retries}...`);
            
            const result = await checkHealth(attempt);
            
            console.log(`✅ Health check passed!`);
            console.log(`📊 Status: ${result.status}`);
            console.log(`🔢 HTTP Status: ${result.statusCode}`);
            console.log(`⏱️  Uptime: ${result.data.data.uptime}s`);
            console.log(`🔧 Environment: ${result.data.data.environment}`);
            
            process.exit(0);
            
        } catch (error) {
            console.log(`❌ Attempt ${attempt} failed: ${error.message}`);
            
            if (attempt < HEALTH_CONFIG.retries) {
                console.log(`⏳ Waiting ${HEALTH_CONFIG.retryDelay}ms before retry...`);
                await sleep(HEALTH_CONFIG.retryDelay);
            }
        }
    }

    console.log(`💥 Health check failed after ${HEALTH_CONFIG.retries} attempts`);
    console.log(`🔍 Troubleshooting tips:`);
    console.log(`   1. Check if SumX server is running`);
    console.log(`   2. Verify port ${HEALTH_CONFIG.port} is accessible`);
    console.log(`   3. Check application logs: docker-compose logs sumx`);
    console.log(`   4. Verify health endpoint: curl http://localhost:${HEALTH_CONFIG.port}/api/health`);
    
    process.exit(1);
}

// Handle process signals gracefully
process.on('SIGTERM', () => {
    console.log('🛑 Health check interrupted');
    process.exit(1);
});

process.on('SIGINT', () => {
    console.log('🛑 Health check interrupted');
    process.exit(1);
});

// Run health check
performHealthCheck().catch((error) => {
    console.error(`💥 Unexpected error: ${error.message}`);
    process.exit(1);
});
