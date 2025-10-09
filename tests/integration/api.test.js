/**
 * API Integration Tests
 */

const request = require('supertest');
const SumXServer = require('../../src/server/app');

describe('API Integration Tests', () => {
    let app;
    let server;

    beforeAll(() => {
        server = new SumXServer();
        app = server.app;
    });

    describe('Health Endpoints', () => {
        test('GET /api/health should return healthy status', async () => {
            const response = await request(app)
                .get('/api/health')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.status).toBe('healthy');
        });

        test('GET /api/info should return application info', async () => {
            const response = await request(app)
                .get('/api/info')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe('SumX Research Paper Analyzer');
        });

        test('GET /api/config should return configuration', async () => {
            const response = await request(app)
                .get('/api/config')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.upload).toBeDefined();
            expect(response.body.data.features).toBeDefined();
        });
    });

    describe('Analysis Endpoints', () => {
        test('POST /api/analyze/text should reject empty content', async () => {
            const response = await request(app)
                .post('/api/analyze/text')
                .send({ paperContent: '' })
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('POST /api/analyze/file should reject missing file', async () => {
            const response = await request(app)
                .post('/api/analyze/file')
                .expect(400);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('No file uploaded');
        });

        test('POST /api/analyze/extract should reject missing file', async () => {
            const response = await request(app)
                .post('/api/analyze/extract')
                .expect(400);

            expect(response.body.success).toBe(false);
        });

        test('GET /api/analyze/models should return model information', async () => {
            const response = await request(app)
                .get('/api/analyze/models')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.models).toBeInstanceOf(Array);
            expect(response.body.data.currentModel).toBeDefined();
        });
    });

    describe('Static File Serving', () => {
        test('GET / should serve index.html', async () => {
            const response = await request(app)
                .get('/')
                .expect(200);

            expect(response.header['content-type']).toMatch(/html/);
        });
    });

    describe('Error Handling', () => {
        test('GET /api/nonexistent should return 404', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.error).toBe('Not Found');
        });
    });
});
