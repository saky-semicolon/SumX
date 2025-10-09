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
     * Detect actual file type from buffer content
     */
    detectFileType(buffer, filename) {
        if (!buffer || buffer.length === 0) {
            return { type: 'unknown', confidence: 'low' };
        }

        const header = buffer.toString('ascii', 0, Math.min(20, buffer.length));
        const extension = filename ? '.' + filename.split('.').pop().toLowerCase() : '';

        // PDF detection
        if (header.startsWith('%PDF')) {
            return { type: 'pdf', confidence: 'high' };
        }

        // HTML detection
        if (header.toLowerCase().includes('<html') || header.toLowerCase().includes('<!doctype')) {
            return { type: 'html', confidence: 'high' };
        }

        // Text file detection
        if (extension === '.txt' || this.isPrintableAscii(header)) {
            return { type: 'text', confidence: extension === '.txt' ? 'high' : 'medium' };
        }

        return { type: 'unknown', confidence: 'low', header: header };
    }

    /**
     * Check if content is printable ASCII (likely text)
     */
    isPrintableAscii(str) {
        return /^[\x20-\x7E\s]*$/.test(str);
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

        // Detect actual file type from content
        const detectedType = this.detectFileType(file.buffer, file.originalname);
        
        // Enhanced validation based on content detection
        if (file.mimetype === 'application/pdf' && detectedType.type !== 'pdf') {
            if (detectedType.type === 'html') {
                throw new Error('File appears to be HTML, not a PDF. Please upload a valid PDF file.');
            } else {
                throw new Error(`File extension suggests PDF but content appears to be ${detectedType.type}. Please upload a valid PDF file.`);
            }
        }

        // Check MIME type
        if (!this.config.allowedMimeTypes.includes(file.mimetype)) {
            throw new Error(`Unsupported file type: ${file.mimetype}. Allowed types: ${this.config.allowedMimeTypes.join(', ')}`);
        }

        // Check file extension
        const extension = '.' + file.originalname.split('.').pop().toLowerCase();
        if (!this.config.allowedExtensions.includes(extension)) {
            throw new Error(`Unsupported file extension: ${extension}. Allowed extensions: ${this.config.allowedExtensions.join(', ')}`);
        }

        return true;
    }

    /**
     * Extract text from PDF buffer
     */
    async extractPdfText(buffer) {
        try {
            // Validate buffer is actually PDF content
            if (!buffer || buffer.length === 0) {
                throw new Error('Empty or invalid PDF buffer received');
            }

            // Check if buffer starts with PDF header
            const pdfHeader = buffer.toString('ascii', 0, 4);
            if (pdfHeader !== '%PDF') {
                // Check if it's HTML (common error case)
                const htmlCheck = buffer.toString('utf8', 0, Math.min(100, buffer.length));
                if (htmlCheck.trim().startsWith('<')) {
                    throw new Error('Received HTML content instead of PDF. Please ensure you are uploading a valid PDF file.');
                }
                throw new Error(`Invalid PDF format. File header: "${pdfHeader}". Expected PDF file starting with "%PDF".`);
            }

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
            // Provide more specific error messages
            if (error.message.includes('Unexpected token')) {
                throw new Error('PDF parsing failed: Received invalid content (possibly HTML). Please ensure you are uploading a valid PDF file.');
            }
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
            // Log processing info (only in development)
            if (process.env.NODE_ENV === 'development') {
                console.log(`Processing file: ${file.originalname}, MIME: ${file.mimetype}, Size: ${file.size} bytes`);
            }
            
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
                        throw new Error(`Unsupported file type: ${file.mimetype} with extension ${extension}`);
                    }
            }

            if (process.env.NODE_ENV === 'development') {
                console.log(`Successfully extracted ${extractedData.text.length} characters from ${file.originalname}`);
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
            console.error(`File processing error for ${file.originalname}:`, error.message);
            console.error('Error details:', {
                filename: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                bufferLength: file.buffer ? file.buffer.length : 'no buffer',
                errorStack: error.stack
            });

            return {
                success: false,
                error: error.message,
                data: {
                    filename: file.originalname,
                    size: file.size,
                    type: file.mimetype,
                    debug: {
                        bufferExists: !!file.buffer,
                        bufferLength: file.buffer ? file.buffer.length : 0,
                        firstBytes: file.buffer ? file.buffer.toString('ascii', 0, Math.min(20, file.buffer.length)) : 'no buffer'
                    }
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
