/**
 * Analysis routes
 * Handles research paper analysis endpoints
 */

const express = require('express');
const router = express.Router();
const AIService = require('../services/aiService');
const FileService = require('../services/fileService');
const upload = require('../middleware/upload');

// Initialize services
const aiService = new AIService();
const fileService = new FileService();

/**
 * POST /api/analyze/text
 * Analyze research paper from text input
 */
router.post('/text', async (req, res, next) => {
    try {
        const { paperContent } = req.body;

        if (!paperContent) {
            return res.status(400).json({
                success: false,
                error: 'Missing required field',
                details: 'paperContent is required'
            });
        }

        // Clean the input text
        const cleanedContent = aiService.cleanPaperText(paperContent);
        
        // Analyze the research paper
        const result = await aiService.analyzeResearchPaper(cleanedContent);

        res.json({
            success: true,
            data: {
                analysis: result.analysis,
                model: result.model,
                attempt: result.attempt,
                wordCount: fileService.countWords(cleanedContent),
                characterCount: cleanedContent.length
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/analyze/file
 * Analyze research paper from uploaded file
 */
router.post('/file', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
                details: 'Please upload a PDF or TXT file'
            });
        }

        // Process the uploaded file
        const fileResult = await fileService.processFile(req.file);
        
        if (!fileResult.success) {
            return res.status(400).json({
                success: false,
                error: 'File processing failed',
                details: fileResult.error,
                fileInfo: fileResult.data
            });
        }

        // Clean the extracted text
        const cleanedContent = aiService.cleanPaperText(fileResult.data.text);
        
        // Analyze the research paper
        const analysisResult = await aiService.analyzeResearchPaper(cleanedContent);

        res.json({
            success: true,
            data: {
                analysis: analysisResult.analysis,
                model: analysisResult.model,
                attempt: analysisResult.attempt,
                fileInfo: {
                    filename: fileResult.data.filename,
                    size: fileResult.data.size,
                    type: fileResult.data.type,
                    pages: fileResult.data.pages,
                    wordCount: fileResult.data.wordCount,
                    characterCount: fileResult.data.characterCount
                },
                extractedText: cleanedContent.substring(0, 500) + '...' // Preview
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * POST /api/extract
 * Extract text from uploaded file without analysis
 */
router.post('/extract', upload.single('file'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded',
                details: 'Please upload a PDF or TXT file'
            });
        }

        // Process the uploaded file
        const result = await fileService.processFile(req.file);
        
        if (!result.success) {
            return res.status(400).json({
                success: false,
                error: 'File processing failed',
                details: result.error,
                fileInfo: result.data
            });
        }

        // Clean the extracted text
        const cleanedContent = aiService.cleanPaperText(result.data.text);

        res.json({
            success: true,
            data: {
                filename: result.data.filename,
                text: cleanedContent,
                fileInfo: {
                    size: result.data.size,
                    type: result.data.type,
                    pages: result.data.pages,
                    wordCount: fileService.countWords(cleanedContent),
                    characterCount: cleanedContent.length,
                    info: result.data.info
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

/**
 * GET /api/models
 * Get available AI models information
 */
router.get('/models', (req, res) => {
    res.json({
        success: true,
        data: {
            models: aiService.config.models,
            currentModel: aiService.getCurrentModel()
        }
    });
});

module.exports = router;
