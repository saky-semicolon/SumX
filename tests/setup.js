/**
 * Test setup configuration
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.OPENROUTER_API_KEY = 'test-api-key';

// Global test timeout
jest.setTimeout(30000);

// Suppress console.log during tests unless debugging
if (!process.env.DEBUG) {
    global.console = {
        ...console,
        log: jest.fn(),
        info: jest.fn(),
        warn: jest.fn()
    };
}
