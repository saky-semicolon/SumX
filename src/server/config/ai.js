/**
 * OpenRouter AI service configuration
 */

const aiConfig = {
    // OpenRouter API settings
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    apiKey: process.env.OPENROUTER_API_KEY,
    
    // Model configurations with fallback chain
    models: [
        {
            name: 'meta-llama/llama-3.2-3b-instruct:free',
            description: 'Primary model - Fast and reliable for research analysis',
            maxTokens: 2048,
            temperature: 0.1
        },
        {
            name: 'mistralai/mistral-7b-instruct:free',
            description: 'Fallback model - Excellent for scientific content',
            maxTokens: 2048,
            temperature: 0.1
        },
        {
            name: 'microsoft/phi-3-mini-128k-instruct:free',
            description: 'Secondary fallback - Good for detailed analysis',
            maxTokens: 2048,
            temperature: 0.1
        }
    ],
    
    // Request settings
    timeout: 60000, // 60 seconds
    maxRetries: 3,
    retryDelay: 2000, // 2 seconds
    
    // Content limits
    maxInputLength: 50000, // characters
    minInputLength: 100 // characters
};

module.exports = aiConfig;
