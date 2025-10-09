/**
 * AI Service Unit Tests
 */

const AIService = require('../../src/server/services/aiService');

describe('AIService', () => {
    let aiService;

    beforeEach(() => {
        aiService = new AIService();
    });

    describe('validateInput', () => {
        test('should accept valid input', () => {
            const validContent = 'This is a research paper with sufficient content for analysis. '.repeat(10);
            expect(() => aiService.validateInput(validContent)).not.toThrow();
        });

        test('should reject empty input', () => {
            expect(() => aiService.validateInput('')).toThrow('Invalid content provided');
        });

        test('should reject non-string input', () => {
            expect(() => aiService.validateInput(null)).toThrow('Invalid content provided');
            expect(() => aiService.validateInput(123)).toThrow('Invalid content provided');
        });

        test('should reject too short content', () => {
            expect(() => aiService.validateInput('short')).toThrow('Content too short');
        });
    });

    describe('cleanPaperText', () => {
        test('should clean common OCR issues', () => {
            const messyText = 'thisIsMessyText123withNumbers';
            const cleaned = aiService.cleanPaperText(messyText);
            expect(cleaned).toContain(' ');
        });

        test('should handle empty input', () => {
            expect(aiService.cleanPaperText('')).toBe('');
            expect(aiService.cleanPaperText(null)).toBe('');
        });

        test('should normalize line breaks', () => {
            const textWithBreaks = 'Line one\r\n\r\n\r\nLine two';
            const cleaned = aiService.cleanPaperText(textWithBreaks);
            expect(cleaned).not.toContain('\r');
        });
    });

    describe('createResearchPaperPrompt', () => {
        test('should create proper prompt format', () => {
            const content = 'Sample research paper content';
            const prompt = aiService.createResearchPaperPrompt(content);
            
            expect(prompt).toContain('RESEARCH PAPER CONTENT:');
            expect(prompt).toContain(content);
            expect(prompt).toContain('# RESEARCH SYNTHESIS ANALYSIS');
        });
    });

    describe('getCurrentModel', () => {
        test('should return valid model configuration', () => {
            const model = aiService.getCurrentModel();
            expect(model).toHaveProperty('name');
            expect(model).toHaveProperty('maxTokens');
            expect(model).toHaveProperty('temperature');
        });
    });

    describe('switchToNextModel', () => {
        test('should cycle through available models', () => {
            const initialModel = aiService.getCurrentModel();
            const nextModel = aiService.switchToNextModel();
            
            expect(nextModel.name).not.toBe(initialModel.name);
        });
    });
});
