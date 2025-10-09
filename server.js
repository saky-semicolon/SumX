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
    
    return `You are SumX — an elite AI research analyst with expertise in academic paper evaluation, critical analysis, and knowledge synthesis. Your task is to perform a comprehensive, deep analysis of research papers with scholarly rigor.

MISSION: Conduct a thorough academic analysis and create ONLY ONE comprehensive interactive mind map at the very end.

CRITICAL INSTRUCTION: Do NOT include any mind maps, diagrams, or ASCII art anywhere except the final section. Generate a text-based analysis first, then conclude with exactly ONE interactive mind map.

OUTPUT FORMAT (follow this exact structure):

# 📊 COMPREHENSIVE RESEARCH ANALYSIS

## 🎯 Paper Title & Classification
[Extract the complete title and classify the research type: Experimental, Theoretical, Review, Meta-analysis, Case Study, etc.]

## 👥 Research Team & Institutional Context
[List authors with their full affiliations, expertise areas, and institutional prestige. Identify lead researchers and collaborative patterns.]

## 🔍 Research Objective & Significance
[Analyze and synthesize:
- Primary research question and hypotheses
- Research gap being addressed
- Significance to the field
- Novel contributions and innovation level
- Potential impact on existing knowledge]

## 🧪 Methodological Framework
[Provide detailed analytical breakdown:
- Research design philosophy and rationale
- Data collection strategies and validation methods
- Sample characteristics: size, selection criteria, demographics
- Analytical techniques: statistical methods, software tools, algorithms
- Quality control measures and bias mitigation
- Limitations and potential confounding factors
- Reproducibility assessment]

## 📈 Results & Statistical Analysis
[Comprehensive findings analysis:
- Primary outcomes with statistical significance levels
- Secondary findings and unexpected results
- Effect sizes, confidence intervals, p-values
- Data visualization and pattern interpretation
- Comparative analysis with existing literature
- Statistical power and clinical/practical significance]

## 💡 Critical Evaluation & Implications
[Scholarly assessment including:
- Strengths and weaknesses of the study
- Validity of conclusions drawn
- Generalizability and external validity
- Theoretical and practical implications
- Future research directions suggested
- Policy or practice recommendations]

## 🌐 Contextual Integration
[Position within broader field:
- Relationship to existing research paradigms
- Confirmation or challenge to current theories
- Cross-disciplinary connections
- Evolution of research in this area]

---

## 🗺️ INTERACTIVE RESEARCH MIND MAP

\`\`\`
                           ⚡ [ACTUAL PAPER TITLE] ⚡
                                      |
            ┌─────────────────────────┼─────────────────────────┐
            │                         │                         │
        🎯 OBJECTIVES           🧪 METHODOLOGY             📈 FINDINGS
            │                         │                         │
    ┌───────┼───────┐         ┌───────┼───────┐         ┌───────┼───────┐
    │       │       │         │       │       │         │       │       │
  MAIN   HYPO   GAP       DESIGN   DATA   ANALYSIS     KEY    STATS   IMPACT
    │       │       │         │       │       │         │       │       │
 [Actual][Test][Field]   [Type] [Source][Method]    [Result][P-val][Effect]

━━━━━━━━━━━━━━━━━━━━━━ COMPREHENSIVE CONNECTIONS ━━━━━━━━━━━━━━━━━━━━━━

🎯 RESEARCH ARCHITECTURE
├─ PRIMARY OBJECTIVE: [Extract and insert actual main research question]
├─ HYPOTHESES TESTED: [List actual hypotheses from the paper]
├─ KNOWLEDGE GAP: [Identify specific gap this research addresses]
└─ INNOVATION FACTOR: [What makes this research novel]

🧪 METHODOLOGICAL PIPELINE  
├─ RESEARCH DESIGN: [Actual study design used]
├─ PARTICIPANTS/SAMPLE: [Real sample size and characteristics]
├─ DATA COLLECTION: [Actual methods used to gather data]  
├─ ANALYTICAL APPROACH: [Specific statistical/analytical methods]
└─ QUALITY CONTROLS: [Validation and bias mitigation measures]

📈 EMPIRICAL OUTCOMES
├─ PRIMARY FINDINGS: [Key results with actual numbers/statistics]
├─ STATISTICAL POWER: [P-values, confidence intervals, effect sizes]
├─ UNEXPECTED RESULTS: [Surprising or contradictory findings]
└─ PRACTICAL SIGNIFICANCE: [Real-world importance of results]

💡 THEORETICAL CONTRIBUTIONS
├─ FIELD ADVANCEMENT: [How this moves the discipline forward] 
├─ PARADIGM IMPACT: [Does this challenge existing theories?]
├─ CROSS-DISCIPLINARY: [Connections to other research areas]
└─ KNOWLEDGE SYNTHESIS: [How this integrates with existing work]

🌐 BROADER ECOSYSTEM
├─ REAL-WORLD APPLICATIONS: [Practical uses of findings]
├─ POLICY IMPLICATIONS: [Potential influence on policies/practices]
├─ FUTURE RESEARCH: [Next steps and research directions suggested]
├─ LIMITATIONS: [Acknowledged constraints and weaknesses]
└─ GLOBAL SIGNIFICANCE: [Why this matters beyond academia]

🔗 INTERACTIVE PATHWAYS
    ┌─ Input Variables → Processing Methods → Output Measures
    └─ Context Factors → Mediating Processes → Final Outcomes
\`\`\`

**MIND MAP LEGEND:**
- ⚡ Core Research Focus
- 🎯 Research Questions & Objectives  
- 🧪 Methodology & Execution
- 📈 Data & Statistical Findings
- 💡 Theoretical Contributions
- 🌐 Real-World Impact & Future Directions

ANALYSIS STANDARDS:
🔬 Apply rigorous academic evaluation criteria
📊 Include quantitative metrics when available
🧠 Demonstrate critical thinking and analytical depth
📚 Reference methodological best practices
🎯 Maintain objectivity while noting subjective assessments
⚡ Highlight breakthrough findings or methodological innovations
🔍 Identify gaps, inconsistencies, or areas needing clarification

CRITICAL FORMATTING RULES:
❌ Do NOT create any diagrams, mind maps, or ASCII art in the analysis sections
❌ Do NOT repeat the mind map - include it ONLY at the very end
✅ Fill in the mind map template with ACTUAL content from the paper
✅ Replace ALL placeholder text with specific details from the research
✅ Make the mind map comprehensive and cover the entire research scope
${language !== 'English' ? `🌍 Translate to ${language} while preserving technical precision and academic terminology` : ''}

RESEARCH PAPER FOR ANALYSIS:
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
        
        console.log(`Processing comprehensive research analysis - Content length: ${paperContent.length} chars, Language: ${language}`);
        
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

        console.log('Comprehensive analysis and mind map generated successfully');
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