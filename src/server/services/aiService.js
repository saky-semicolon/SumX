/**
 * AI Service for research paper analysis
 * Handles OpenRouter API communication and response processing
 */

const axios = require('axios');
const aiConfig = require('../config/ai');

class AIService {
    constructor() {
        this.config = aiConfig;
        this.currentModelIndex = 0;
        this.currentModelIndex = 0;
    }

    /**
     * Create scientific analysis prompt for research papers
     */
    createResearchPaperPrompt(content) {
        return `You are SumX — an AI-powered scientific research analyst with expertise in evidence-based medicine, systematic reviews, and biostatistics. Analyze this research paper with the rigor of a peer reviewer.

RESEARCH PAPER CONTENT:
${content}

ANALYSIS REQUIREMENTS:
Provide a comprehensive scientific evaluation following evidence-based medicine standards. Use GRADE methodology for evidence assessment and CONSORT/STROBE guidelines for study appraisal.

OUTPUT FORMAT (use this exact structure):

# RESEARCH SYNTHESIS ANALYSIS

## 🎯 RESEARCH OVERVIEW
**Objective**: [Primary research question/hypothesis]
**Study Design**: [Methodology type with quality rating]
**Population**: [Sample characteristics and representativeness]

## 📊 METHODOLOGICAL ASSESSMENT
**Design Quality**: [Rate A-D with justification]
**Sample Size**: [Adequacy analysis with power calculation notes]
**Bias Assessment**: [Selection, performance, detection, reporting bias evaluation]
**Statistical Methods**: [Appropriateness and robustness of analytical approach]

## 🔬 EVIDENCE EVALUATION
**Primary Outcomes**: [Main findings with effect sizes and confidence intervals]
**Statistical Significance**: [p-values, clinical significance assessment]
**Data Quality**: [Missing data handling, assumptions verification]
**Reproducibility**: [Methodological transparency and replication potential]

## ⚖️ CRITICAL APPRAISAL
**Strengths**: [Key methodological and analytical strengths]
**Limitations**: [Critical weaknesses affecting validity]
**Generalizability**: [External validity and population applicability]
**Clinical Relevance**: [Practical implications and actionability]

## 📈 STATISTICAL SYNTHESIS
**Effect Estimates**: [Key results with precision measures]
**Heterogeneity**: [Consistency across subgroups if applicable]
**Sensitivity Analysis**: [Robustness of findings]
**Publication Bias**: [Potential selective reporting assessment]

## 🧬 RESEARCH CONTEXT
**Literature Integration**: [How findings fit within existing evidence base]
**Mechanistic Insights**: [Biological/theoretical plausibility]
**Future Directions**: [Research gaps and next steps identified]

## 🎖️ EVIDENCE GRADE
**Overall Quality**: [High/Moderate/Low/Very Low with GRADE criteria]
**Recommendation Strength**: [Strong/Conditional with rationale]
**Confidence Level**: [Certainty in effect estimates]

## 🔄 RESEARCH SYNTHESIS MAP
\`\`\`
Study Design → Sample → Intervention/Exposure → Outcomes → Statistical Analysis → Results → Interpretation
[Create a flow showing the logical progression of the research]
\`\`\`

**PEER REVIEW SUMMARY**: [Final assessment as if for journal publication - accept/revise/reject with specific recommendations]

Maintain scientific objectivity and highlight both strengths and limitations with equal rigor.`;
    }

    /**
     * Get the current model configuration
     */
    getCurrentModel() {
        return this.config.models[this.currentModelIndex];
    }

    /**
     * Switch to next available model
     */
    switchToNextModel() {
        this.currentModelIndex = (this.currentModelIndex + 1) % this.config.models.length;
        return this.getCurrentModel();
    }

    /**
     * Validate input content
     */
    validateInput(content) {
        if (!content || typeof content !== 'string') {
            throw new Error('Invalid content provided');
        }

        const trimmedContent = content.trim();
        
        if (trimmedContent.length < this.config.minInputLength) {
            throw new Error(`Content too short. Minimum ${this.config.minInputLength} characters required.`);
        }

        if (trimmedContent.length > this.config.maxInputLength) {
            throw new Error(`Content too long. Maximum ${this.config.maxInputLength} characters allowed.`);
        }

        return trimmedContent;
    }

    /**
     * Make API request to OpenRouter
     */
    async makeApiRequest(messages, model) {
        const payload = {
            model: model.name,
            messages: messages,
            max_tokens: model.maxTokens,
            temperature: model.temperature,
            stream: false
        };

        const headers = {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://github.com/saky-semicolon/SumX',
            'X-Title': 'SumX Research Paper Analyzer'
        };

        try {
            const response = await axios.post(this.config.apiUrl, payload, {
                headers,
                timeout: this.config.timeout
            });

            if (!response.data?.choices?.[0]?.message?.content) {
                throw new Error('Invalid response format from AI service');
            }

            return response.data.choices[0].message.content.trim();
        } catch (error) {
            if (error.response) {
                const status = error.response.status;
                const message = error.response.data?.error?.message || 'API request failed';
                throw new Error(`AI service error (${status}): ${message}`);
            } else if (error.request) {
                throw new Error('Network error: Unable to reach AI service');
            } else {
                throw new Error(`Request setup error: ${error.message}`);
            }
        }
    }

    /**
     * Analyze research paper with fallback models
     */
    async analyzeResearchPaper(content) {
        // Validate input
        const validatedContent = this.validateInput(content);

        // Create analysis prompt
        const prompt = this.createResearchPaperPrompt(validatedContent);
        const messages = [
            {
                role: 'user',
                content: prompt
            }
        ];

        let lastError = null;
        const originalModelIndex = this.currentModelIndex;

        // Try each model in the fallback chain
        for (let attempt = 0; attempt < this.config.models.length; attempt++) {
            const currentModel = this.getCurrentModel();
            
            try {
                console.log(`Attempting analysis with model: ${currentModel.name}`);
                const result = await this.makeApiRequest(messages, currentModel);
                
                // Reset to original model on success
                this.currentModelIndex = originalModelIndex;
                
                return {
                    analysis: result,
                    model: currentModel.name,
                    attempt: attempt + 1
                };
            } catch (error) {
                console.error(`Model ${currentModel.name} failed:`, error.message);
                lastError = error;
                
                // Switch to next model for retry
                this.switchToNextModel();
            }
        }

        // All models failed
        throw new Error(`Analysis failed with all models. Last error: ${lastError?.message || 'Unknown error'}`);
    }

    /**
     * Clean and process PDF/OCR text
     */
    cleanPaperText(text) {
        if (!text) return '';
        
        return text
            // Fix common OCR issues
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/(\d)([A-Za-z])/g, '$1 $2')
            .replace(/([A-Za-z])(\d)/g, '$1 $2')
            
            // Fix line breaks and spacing
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .replace(/\r\n/g, '\n')
            .replace(/\t/g, ' ')
            .replace(/ {3,}/g, '  ')
            
            // Fix common PDF extraction issues
            .replace(/([.!?])\s*([a-z])/g, '$1 $2')
            .replace(/([a-z])([.!?][A-Z])/g, '$1$2')
            
            // Clean up headers and footers
            .replace(/^\d+\s*$/gm, '')
            .replace(/^Page \d+.*$/gm, '')
            .replace(/^Figure \d+:?.*$/gm, 'Figure: ')
            .replace(/^Table \d+:?.*$/gm, 'Table: ')
            
            // Remove extra whitespace
            .replace(/^\s+|\s+$/gm, '')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
    }
}

module.exports = AIService;
