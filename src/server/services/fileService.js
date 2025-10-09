/**
 * File Processing Service
 * Handles PDF parsing and text extraction
 */

const pdfParse = require('pdf-parse');
const appConfig = require('../config/app');

class FileService {
    constructor() {
        this.config = appConfig.upload;
    }

    /**
     * Validate uploaded file
     */
    validateFile(file) {
        if (!file) {
            throw new Error('No file provided');
        }

        // Check file size
        if (file.size > this.config.maxFileSize) {
            throw new Error(`File too large. Maximum size is ${this.config.maxFileSize / (1024 * 1024)}MB`);
        }

        // Check MIME type
        if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
            throw new Error(`Unsupported file type. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`);
        }

        // Check file extension
        const extension = '.' + file.originalname.split('.').pop().toLowerCase();
        if (!this.config.allowedExtensions.includes(extension)) {
            throw new Error(`Unsupported file extension. Allowed extensions: ${this.config.allowedExtensions.join(', ')}`);
        }

        return true;
    }

    /**
     * Extract text from PDF buffer
     */
    async extractPdfText(buffer) {
        try {
            const options = {
                // PDF parsing options for better text extraction
                max: 0, // Parse all pages
                version: 'v1.10.100' // Use specific pdf-parse version
            };

            const data = await pdfParse(buffer, options);
            
            if (!data.text || data.text.trim().length === 0) {
                throw new Error('No readable text found in PDF. The document might be image-based or corrupted.');
            }

            return {
                text: data.text,
                pages: data.numpages,
                info: data.info,
                metadata: data.metadata
            };
        } catch (error) {
            if (error.message.includes('PDF parsing')) {
                throw new Error('Failed to parse PDF. The file might be corrupted or password-protected.');
            }
            throw error;
        }
    }

    /**
     * Process text file
     */
    async extractTextFromBuffer(buffer) {
        try {
            const text = buffer.toString('utf-8');
            
            if (!text || text.trim().length === 0) {
                throw new Error('No readable text found in file.');
            }

            return {
                text: text,
                pages: 1,
                info: { Title: 'Text Document' },
                metadata: {}
            };
        } catch (error) {
            throw new Error('Failed to read text file. Please check the file encoding.');
        }
    }

    /**
     * Process uploaded file and extract text
     */
    async processFile(file) {
        // Validate file first
        this.validateFile(file);

        let extractedData;

        try {
            switch (file.mimetype) {
                case 'application/pdf':
                    extractedData = await this.extractPdfText(file.buffer);
                    break;
                
                case 'text/plain':
                    extractedData = await this.extractTextFromBuffer(file.buffer);
                    break;
                
                default:
                    // Double-check based on file extension for edge cases
                    const extension = '.' + file.originalname.split('.').pop().toLowerCase();
                    if (extension === '.txt') {
                        extractedData = await this.extractTextFromBuffer(file.buffer);
                    } else {
                        throw new Error(`Unsupported file type: ${file.mimetype}`);
                    }
            }

            return {
                success: true,
                data: {
                    filename: file.originalname,
                    size: file.size,
                    type: file.mimetype,
                    text: extractedData.text,
                    pages: extractedData.pages,
                    wordCount: this.countWords(extractedData.text),
                    characterCount: extractedData.text.length,
                    info: extractedData.info,
                    metadata: extractedData.metadata
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: {
                    filename: file.originalname,
                    size: file.size,
                    type: file.mimetype
                }
            };
        }
    }

    /**
     * Count words in text
     */
    countWords(text) {
        if (!text || typeof text !== 'string') return 0;
        
        // Split by whitespace and filter out empty strings
        return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Get file information without processing
     */
    getFileInfo(file) {
        return {
            filename: file.originalname,
            size: file.size,
            type: file.mimetype,
            sizeFormatted: this.formatFileSize(file.size)
        };
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

module.exports = FileService;
