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

const createResearchPaperPrompt = (paperContent) => {
    const cleanedContent = cleanPaperText(paperContent);
    
    return `You are SumX — an elite AI research scientist and analyst with doctoral-level expertise in academic paper evaluation, statistical analysis, and scientific methodology. Your task is to conduct a rigorous, comprehensive scientific analysis with the depth expected in top-tier academic journals.

MISSION: Perform a systematic, evidence-based scientific analysis following peer-review standards with rigorous statistical evaluation and methodological scrutiny.

CRITICAL INSTRUCTION: Do NOT include any mind maps, diagrams, or ASCII art anywhere except the final section. Generate a comprehensive scientific analysis first, then conclude with exactly ONE research synthesis map.

SCIENTIFIC ANALYSIS FRAMEWORK (follow this exact structure):

# SCIENTIFIC RESEARCH ANALYSIS

## 1. BIBLIOMETRIC OVERVIEW
**Title:** [Extract complete title verbatim]
**Study Type:** [Classify: RCT, Observational, Systematic Review, Meta-analysis, Cross-sectional, Longitudinal, etc.]
**Research Domain:** [Primary discipline and subdiscipline]
**Publication Metrics:** [Journal, impact factor if mentioned, publication date]

## 2. AUTHOR CREDENTIALS & INSTITUTIONAL ANALYSIS
**Primary Investigator:** [Lead author with credentials]
**Co-investigators:** [Key contributors with expertise]
**Institutional Affiliations:** [Research institutions, universities, medical centers]
**Research Group Profile:** [Track record, specialization, funding sources if mentioned]

## 3. RESEARCH HYPOTHESIS & OBJECTIVES
**Primary Research Question:** [Main hypothesis being tested]
**Specific Aims:** [Numbered objectives]
**Scientific Rationale:** [Theoretical foundation and literature gap]
**Expected Outcomes:** [A priori predictions]
**Clinical/Practical Significance:** [Real-world relevance]

## 4. METHODOLOGY & EXPERIMENTAL DESIGN
**Study Architecture:** [Detailed design: randomized, blinded, controlled, etc.]
**Population & Sampling:**
  - Target population characteristics
  - Sample size calculation and power analysis
  - Inclusion/exclusion criteria
  - Recruitment methodology
**Data Collection Protocol:**
  - Primary and secondary endpoints
  - Measurement instruments and validation
  - Data quality assurance procedures
  - Timeline and follow-up periods
**Statistical Analysis Plan:**
  - Primary statistical tests and assumptions
  - Multiple comparison corrections
  - Missing data handling
  - Sensitivity analyses planned

## 5. RESULTS & STATISTICAL FINDINGS
**Participant Flow:** [Enrollment, randomization, completion rates]
**Baseline Characteristics:** [Demographics, key variables]
**Primary Outcomes:**
  - Main results with exact statistics (means, SDs, CIs, p-values)
  - Effect sizes and clinical significance
**Secondary Outcomes:** [Additional findings]
**Statistical Analysis Quality:**
  - Appropriate statistical tests used
  - Assumptions met/violated
  - Multiple testing corrections applied
  - Confidence intervals interpretation

## 6. CRITICAL METHODOLOGICAL ASSESSMENT
**Study Strengths:**
  - Methodological rigor
  - Statistical power adequacy
  - Internal validity measures
**Methodological Limitations:**
  - Potential bias sources
  - Confounding factors
  - External validity concerns
  - Statistical limitations
**Risk of Bias Assessment:** [Selection, performance, detection, attrition, reporting bias]

## 7. SCIENTIFIC INTERPRETATION & IMPLICATIONS
**Evidence Quality:** [Level of evidence using standard hierarchies]
**Clinical Significance:** [Beyond statistical significance]
**Theoretical Contributions:** [Advancement to scientific understanding]
**Practice Implications:** [Real-world applications]
**Policy Relevance:** [Regulatory or guideline implications]

## 8. RESEARCH CONTEXT & FUTURE DIRECTIONS
**Literature Positioning:** [How findings fit with existing evidence]
**Scientific Consensus:** [Agreement or disagreement with field]
**Knowledge Gaps Addressed:** [What questions were answered]
**Future Research Priorities:** [Logical next steps]
**Replication Needs:** [Reproducibility considerations]

---

## 9. RESEARCH SYNTHESIS MAP

\`\`\`
                    ╔═══════════════════════════════════════════════╗
                    ║            [ACTUAL PAPER TITLE]               ║
                    ╚═══════════════════════════════════════════════╝
                                         │
                 ┌───────────────────────┼───────────────────────┐
                 │                       │                       │
         ┌───────▼───────┐      ┌────────▼────────┐     ┌───────▼───────┐
         │   HYPOTHESIS   │      │   METHODOLOGY   │     │    RESULTS    │
         │ & OBJECTIVES   │      │  & ANALYSIS     │     │ & VALIDATION  │
         └───────┬───────┘      └────────┬────────┘     └───────┬───────┘
                 │                       │                       │
    ┌────────────┼────────────┐         │              ┌────────┼────────┐
    │            │            │         │              │        │        │
┌───▼───┐   ┌───▼───┐   ┌────▼───┐ ┌───▼───┐     ┌────▼───┐ ┌──▼──┐ ┌──▼──┐
│ H₀/H₁  │   │ AIMS  │   │ RATIONALE│ │DESIGN│     │PRIMARY │ │STATS│ │POWER│
│       │   │       │   │          │ │      │     │ENDPOINT│ │     │ │     │
└───────┘   └───────┘   └──────────┘ └──────┘     └────────┘ └─────┘ └─────┘

═══════════════════════ SCIENTIFIC EVALUATION MATRIX ═══════════════════════

🔬 METHODOLOGICAL RIGOR
├─ STUDY DESIGN: [Actual design type with controls]
├─ SAMPLE SIZE: [N= with power calculation if provided]  
├─ RANDOMIZATION: [Method and allocation concealment]
├─ BLINDING: [Participants, investigators, analysts]
├─ BIAS CONTROL: [Selection, performance, detection, attrition]
└─ STATISTICAL PLAN: [Primary tests, corrections, assumptions]

� STATISTICAL EVIDENCE
├─ PRIMARY OUTCOME: [Main result with CI and p-value]
├─ EFFECT SIZE: [Clinical significance and magnitude]
├─ STATISTICAL POWER: [Post-hoc or planned power analysis]
├─ CONFIDENCE INTERVALS: [Precision and clinical relevance]
├─ P-VALUE INTERPRETATION: [Statistical vs clinical significance]
└─ MULTIPLE COMPARISONS: [Corrections applied if relevant]

🎯 SCIENTIFIC CONTRIBUTION
├─ EVIDENCE LEVEL: [Grade using standard hierarchies]
├─ CLINICAL IMPACT: [Number needed to treat, harm, etc.]
├─ THEORETICAL ADVANCE: [Novel mechanisms or pathways]
├─ METHODOLOGICAL INNOVATION: [New techniques or approaches]
└─ REPRODUCIBILITY: [Materials, protocols, data availability]

🌐 RESEARCH ECOSYSTEM IMPACT
├─ LITERATURE INTEGRATION: [Systematic review context]
├─ PRACTICE GUIDELINES: [Potential policy implications]
├─ FUTURE RESEARCH: [Identified priorities and gaps]
├─ TRANSLATIONAL POTENTIAL: [Bench to bedside applications]
└─ GLOBAL HEALTH RELEVANCE: [Population-level significance]

� QUALITY ASSESSMENT SUMMARY
    Risk of Bias: [Low/Moderate/High with justification]
    External Validity: [Generalizability assessment]
    Internal Validity: [Causal inference strength]
    Reporting Quality: [CONSORT, STROBE, PRISMA compliance]
\`\`\`

**EVIDENCE SYNTHESIS LEGEND:**
- H₀/H₁: Null and Alternative Hypotheses
- CI: Confidence Interval
- N: Sample Size
- Statistical significance threshold: α = 0.05 (unless otherwise specified)
- Effect size measures: Cohen's d, OR, RR, HR as appropriate
- Quality assessment: GRADE, Cochrane RoB, Newcastle-Ottawa as applicable

SCIENTIFIC ANALYSIS STANDARDS:
🔬 Apply evidence-based medicine principles and systematic review methodologies
📊 Report exact statistical values (means±SD, CI, p-values, effect sizes)
🧠 Use critical appraisal tools (GRADE, Cochrane Risk of Bias, CONSORT)
📚 Reference established methodological frameworks (PICO, PRISMA, STROBE)
🎯 Maintain scientific objectivity with transparent bias assessment
⚡ Identify breakthrough findings with clinical/practical significance thresholds
🔍 Apply systematic gap analysis and highlight reproducibility concerns
📈 Evaluate statistical assumptions, power calculations, and multiple testing corrections
🏥 Assess clinical relevance using established effect size benchmarks
🌍 Consider population heterogeneity and external validity across settings

CRITICAL ANALYSIS REQUIREMENTS:
✅ Extract exact numerical data with appropriate precision
✅ Evaluate methodological quality using standardized tools
✅ Assess statistical significance AND clinical meaningfulness
✅ Identify potential confounders and bias sources
✅ Compare findings with existing systematic reviews/meta-analyses
✅ Apply evidence hierarchy classification (RCT, cohort, case-control, etc.)
✅ Include research synthesis map ONLY at the very end
❌ Do NOT include any diagrams or visual elements except final synthesis map
❌ Do NOT make claims beyond what the data supports

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
    const { paperContent } = req.body;
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
        const prompt = createResearchPaperPrompt(paperContent);
        
        console.log(`Processing scientific research analysis - Content length: ${paperContent.length} chars`);
        
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
                            content: 'You are a senior research scientist and methodologist with expertise in evidence-based medicine, biostatistics, and systematic review methodology. Conduct rigorous scientific analysis following peer-review standards. Apply critical appraisal tools, evaluate statistical significance and clinical relevance, assess methodological quality, and identify bias sources. Maintain scientific objectivity and precision in all analyses.'
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

        console.log('Scientific research analysis completed successfully');
        res.json({ 
            summary: summary,
            metadata: {
                model: usedModel,
                inputLength: paperContent.length,
                outputLength: summary.length,
                analysisType: 'Scientific Research Analysis'
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