const express = require('express');
const axios = require('axios');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for large research papers

// Serve static files
app.use(express.static('.'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept PDF and text files
        if (file.mimetype === 'application/pdf' || 
            file.mimetype === 'text/plain' || 
            file.originalname.toLowerCase().endsWith('.txt')) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and TXT files are supported'), false);
        }
    }
});

// Text cleaning function for better PDF/OCR text handling
const cleanPaperText = (text) => {
    if (!text) return '';
    
    return text
        // Fix common OCR issues
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space between lowercase and uppercase
        .replace(/(\d)([A-Za-z])/g, '$1 $2') // Add space between numbers and letters
        .replace(/([A-Za-z])(\d)/g, '$1 $2') // Add space between letters and numbers
        
        // Fix line breaks and spacing
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Reduce multiple line breaks to double
        .replace(/\r\n/g, '\n') // Normalize line endings
        .replace(/\t/g, ' ') // Replace tabs with spaces
        .replace(/ {3,}/g, '  ') // Reduce multiple spaces to double
        
        // Fix common PDF extraction issues
        .replace(/- (\w)/g, '$1') // Remove hyphenation at line breaks
        .replace(/(\w)-\n(\w)/g, '$1$2') // Join hyphenated words across lines
        .replace(/\n(\w)/g, ' $1') // Join single words on new lines
        
        // Fix punctuation spacing
        .replace(/([.!?])\s*([A-Z])/g, '$1 $2') // Ensure space after sentence endings
        .replace(/([,;:])\s*(\w)/g, '$1 $2') // Ensure space after punctuation
        
        // Fix common reference and citation issues
        .replace(/\[\s*(\d+)\s*\]/g, '[$1]') // Clean reference numbers
        .replace(/\(\s*(\d{4})\s*\)/g, '($1)') // Clean year citations
        
        // Trim and normalize
        .trim()
        .replace(/\s+/g, ' '); // Final cleanup of multiple spaces
};

const createResearchPaperPrompt = (paperContent, language = 'English') => {
    const cleanedContent = cleanPaperText(paperContent);
    
    return `You are SumX — an expert AI assistant specialized in analyzing research papers with high accuracy.

TASK: Create a structured academic summary from the provided research paper content.

OUTPUT FORMAT (use this exact structure):

# Title
[Extract and clearly state the paper's main title]

## Authors & Affiliations  
[List all authors with their institutional affiliations. If unclear, extract what's available]

## Abstract Summary
[Provide a clear, concise summary of the research purpose, scope, and main objectives]

## Methodology
[Describe in detail:
- Research design and approach
- Data collection methods  
- Sample size and selection criteria
- Analytical techniques and tools used
- Experimental procedures if applicable]

## Key Findings / Results
[Present the main discoveries:
- Primary results and outcomes
- Statistical findings with numbers/percentages when provided
- Key conclusions and implications
- Significant patterns or trends identified]

IMPORTANT GUIDELINES:
✓ Extract information ONLY from the provided text - never fabricate data
✓ If text appears garbled from PDF extraction, interpret context intelligently  
✓ Use clear, academic language appropriate for researchers
✓ Include specific numbers, percentages, and statistical data when mentioned
✓ If any section cannot be determined from the text, state "Information not clearly provided in the source material"
✓ Maintain factual accuracy above all else
${language !== 'English' ? `✓ Translate the final summary to ${language} while preserving technical accuracy` : ''}

RESEARCH PAPER CONTENT TO ANALYZE:
${cleanedContent}`;
};

// Content validation function
const validatePaperContent = (content) => {
    const cleanContent = content.trim();
    const wordCount = cleanContent.split(/\s+/).length;
    
    if (cleanContent.length < 100) {
        return { valid: false, error: 'Content too short. Please provide at least 100 characters.' };
    }
    
    if (wordCount < 50) {
        return { valid: false, error: 'Content too brief. Please provide at least 50 words for meaningful analysis.' };
    }
    
    // Check for basic academic paper indicators
    const academicKeywords = [
        'abstract', 'introduction', 'method', 'result', 'conclusion', 'research', 
        'study', 'analysis', 'data', 'experiment', 'hypothesis', 'literature',
        'paper', 'article', 'journal', 'proceedings', 'conference'
    ];
    
    const hasAcademicContent = academicKeywords.some(keyword => 
        cleanContent.toLowerCase().includes(keyword)
    );
    
    if (!hasAcademicContent && wordCount < 200) {
        return { 
            valid: false, 
            error: 'Content does not appear to be from a research paper. Please provide academic paper content.' 
        };
    }
    
    return { valid: true };
};

// File upload and processing endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        let extractedText = '';
        
        if (req.file.mimetype === 'application/pdf') {
            console.log('Processing PDF file:', req.file.originalname);
            
            try {
                const pdfData = await pdfParse(req.file.buffer);
                extractedText = pdfData.text;
                
                if (!extractedText || extractedText.trim().length === 0) {
                    throw new Error('No text could be extracted from the PDF');
                }
                
                console.log(`Extracted ${extractedText.length} characters from PDF`);
                
            } catch (pdfError) {
                console.error('PDF parsing error:', pdfError.message);
                return res.status(400).json({ 
                    error: 'Failed to extract text from PDF. The file might be scanned, corrupted, or password-protected.',
                    details: pdfError.message
                });
            }
            
        } else if (req.file.mimetype === 'text/plain' || req.file.originalname.toLowerCase().endsWith('.txt')) {
            console.log('Processing text file:', req.file.originalname);
            extractedText = req.file.buffer.toString('utf-8');
            
        } else {
            return res.status(400).json({ error: 'Unsupported file type' });
        }

        // Clean and validate the extracted text
        const cleanedText = cleanPaperText(extractedText);
        
        if (cleanedText.length < 100) {
            return res.status(400).json({ 
                error: 'Extracted text is too short. Please ensure the file contains substantial research content.' 
            });
        }

        res.json({ 
            extractedText: cleanedText,
            metadata: {
                filename: req.file.originalname,
                fileSize: req.file.size,
                extractedLength: cleanedText.length,
                wordCount: cleanedText.split(/\s+/).length
            }
        });

    } catch (error) {
        console.error('File processing error:', error);
        res.status(500).json({ 
            error: 'Failed to process the uploaded file',
            details: error.message
        });
    }
});

app.post('/summarize', async (req, res) => {
    const { paperContent, language = 'English' } = req.body;
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!openRouterApiKey) {
        return res.status(500).json({ error: 'OpenRouter API key not found.' });
    }

    if (!paperContent || paperContent.trim().length === 0) {
        return res.status(400).json({ error: 'No research paper content provided.' });
    }

    // Validate content quality
    const validation = validatePaperContent(paperContent);
    if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
    }

    try {
        const prompt = createResearchPaperPrompt(paperContent, language);
        
        console.log(`Processing paper summary request - Content length: ${paperContent.length} chars, Language: ${language}`);
        
        // List of fallback models in order of preference
        const models = [
            'meta-llama/llama-3.2-3b-instruct:free',
            'mistralai/mistral-7b-instruct:free',
            'microsoft/phi-3-mini-128k-instruct:free'
        ];
        
        let response;
        let usedModel = '';
        
        // Try each model until one works
        for (const model of models) {
            try {
                console.log(`Trying model: ${model}`);
                response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                    model: model,
                    messages: [
                        { 
                            role: 'system', 
                            content: 'You are an expert academic research assistant specialized in analyzing and summarizing research papers with exceptional accuracy. Always follow the exact structure provided and maintain academic rigor. Handle poorly formatted or OCR-extracted text gracefully by interpreting context intelligently.'
                        },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.2,
                    max_tokens: model.includes('phi-3') ? 4000 : 2000,
                    top_p: 0.9
                }, {
                    headers: {
                        'Authorization': `Bearer ${openRouterApiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'http://localhost:3000',
                        'X-Title': 'SumX Research Paper Summarizer'
                    }
                });
                
                usedModel = model;
                console.log(`Successfully using model: ${model}`);
                break;
                
            } catch (modelError) {
                console.log(`Model ${model} failed:`, modelError.response?.data?.error?.message || modelError.message);
                if (model === models[models.length - 1]) {
                    // If this is the last model, throw the error
                    throw modelError;
                }
                // Otherwise, continue to the next model
                continue;
            }
        }

        if (!response.data.choices || response.data.choices.length === 0) {
            throw new Error('No response generated from AI model');
        }

        const summary = response.data.choices[0].message.content;
        
        // Validate that we got a proper summary
        if (!summary || summary.trim().length < 100) {
            throw new Error('Generated summary is too short or empty');
        }

        console.log('Summary generated successfully');
        res.json({ 
            summary: summary,
            metadata: {
                model: usedModel,
                inputLength: paperContent.length,
                outputLength: summary.length,
                language: language
            }
        });
    } catch (error) {
        console.error('Summarization Error:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });
        
        let errorMessage = 'An error occurred while analyzing the research paper.';
        
        if (error.response?.status === 429) {
            errorMessage = 'API rate limit exceeded. Please wait a moment and try again.';
        } else if (error.response?.status === 401) {
            errorMessage = 'API authentication failed. Please check your API key.';
        } else if (error.response?.data?.error?.message) {
            errorMessage = `AI Model Error: ${error.response.data.error.message}`;
        }
        
        res.status(error.response?.status || 500).json({ 
            error: errorMessage,
            details: error.response?.data?.error || error.message
        });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});