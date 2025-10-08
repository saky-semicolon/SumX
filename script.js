// DOM Elements
const summarizeBtn = document.getElementById('summarize-btn');
const paperContent = document.getElementById('paper-content');
const fileInput = document.getElementById('file-input');
const fileUpload = document.getElementById('file-upload');
const fileInfo = document.getElementById('file-info');
const languageSelect = document.getElementById('language-select');
const summaryOutput = document.getElementById('summary-output');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const extractedContent = document.getElementById('extracted-content');
const contentPreview = document.getElementById('content-preview');
const wordCount = document.getElementById('word-count');

let currentSummary = '';

// File upload handling
fileUpload.addEventListener('click', () => fileInput.click());
fileUpload.addEventListener('dragover', handleDragOver);
fileUpload.addEventListener('drop', handleFileDrop);
fileInput.addEventListener('change', handleFileSelect);

function handleDragOver(e) {
    e.preventDefault();
    fileUpload.classList.add('drag-over');
}

function handleFileDrop(e) {
    e.preventDefault();
    fileUpload.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

function processFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB limit for PDF files
    
    if (file.size > maxSize) {
        showError('File size must be less than 10MB');
        return;
    }
    
    const isPDF = file.type === 'application/pdf';
    const isTXT = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
    
    if (!isPDF && !isTXT) {
        showError('Please upload a PDF or TXT file. Other formats are not supported yet.');
        return;
    }
    
    displayFileInfo(file);
    
    if (isPDF) {
        uploadAndProcessFile(file);
    } else {
        readTextFile(file);
    }
}

function readTextFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        let content = e.target.result;
        
        // Clean up common issues from PDF-to-text conversion
        content = preprocessPaperContent(content);
        
        displayExtractedContent(content);
        showSuccess(`📄 Text file loaded successfully! ${content.split(/\s+/).length} words ready for analysis.`);
    };
    reader.onerror = () => showError('❌ Error reading file. Please try again or paste the content manually.');
    reader.readAsText(file, 'UTF-8');
}

// New function to handle PDF file uploads
async function uploadAndProcessFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
        // Show loading state
        showNotification('🔄 Extracting text from PDF...', 'info');
        
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to process PDF file');
        }
        
        // Display the extracted content
        displayExtractedContent(data.extractedText);
        
        // Show success with metadata
        const { metadata } = data;
        showSuccess(`📄 PDF processed successfully! Extracted ${metadata.wordCount} words from "${metadata.filename}"`);
        
        // Clear the info notification
        clearNotificationByType('info');
        
    } catch (error) {
        console.error('PDF processing error:', error);
        let errorMsg = error.message;
        
        if (errorMsg.includes('scanned') || errorMsg.includes('password')) {
            errorMsg += ' Try using a different PDF or copy-paste the text manually.';
        }
        
        showError(`❌ PDF processing failed: ${errorMsg}`);
        clearNotificationByType('info');
    }
}

function displayFileInfo(file) {
    const fileIcon = file.type === 'application/pdf' ? '📄' : '📝';
    const fileType = file.type === 'application/pdf' ? 'PDF' : 'Text';
    
    fileInfo.innerHTML = `
        <div class="file-details">
            <div class="file-header">
                <span class="file-name">${fileIcon} ${file.name}</span>
                <button class="remove-file" onclick="clearFileInput()">✕</button>
            </div>
            <div class="file-meta">
                <span class="file-type">${fileType}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            </div>
        </div>
    `;
    fileInfo.classList.remove('hidden');
}

function clearFileInput() {
    fileInput.value = '';
    fileInfo.classList.add('hidden');
    extractedContent.classList.add('hidden');
    paperContent.value = '';
    contentPreview.textContent = '';
    wordCount.textContent = '0 words';
    updateSummarizeButton();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Content input handling
paperContent.addEventListener('input', updateSummarizeButton);

function updateSummarizeButton() {
    const content = paperContent.value.trim();
    const hasContent = content.length >= 100; // Minimum content length for meaningful analysis
    const wordCount = content.split(/\s+/).length;
    
    summarizeBtn.disabled = !hasContent;
    
    // Update button text based on content
    const btnText = document.querySelector('.btn-text');
    if (content.length === 0) {
        btnText.textContent = 'Deep Analysis & Mind Map';
    } else if (content.length < 100) {
        btnText.textContent = `Need ${100 - content.length} more characters`;
    } else if (wordCount < 50) {
        btnText.textContent = `Need ${50 - wordCount} more words`;
    } else {
        btnText.textContent = `Analyze & Map (${wordCount} words)`;
    }
}

// Text preprocessing for better PDF handling
function preprocessPaperContent(content) {
    if (!content) return '';
    
    // Clean up common PDF extraction issues
    return content
        // Fix broken words at line endings
        .replace(/(\w)-\s*\n\s*(\w)/g, '$1$2')
        // Fix spacing issues
        .replace(/\s+/g, ' ')
        // Fix sentence breaks
        .replace(/([.!?])\s*([A-Z])/g, '$1 $2')
        .trim();
}

// Summarization
summarizeBtn.addEventListener('click', async () => {
    const rawContent = paperContent.value.trim();
    const content = preprocessPaperContent(rawContent);
    const language = languageSelect.value;
    const wordCount = content.split(/\s+/).length;
    
    if (!content) {
        showError('Please provide research paper content to analyze.');
        return;
    }
    
    if (content.length < 100) {
        showError('Please provide more substantial content (at least 100 characters) for meaningful analysis.');
        return;
    }
    
    if (wordCount < 50) {
        showError(`Please provide more content. Current: ${wordCount} words, minimum: 50 words.`);
        return;
    }
    
    setLoadingState(true);
    clearError();
    
    try {
        console.log(`Starting analysis with DeepSeek AI - ${wordCount} words, ${language} output`);
        
        const response = await fetch('/summarize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paperContent: content,
                language: language
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to analyze the research paper');
        }
        
        currentSummary = data.summary;
        displaySummary(currentSummary);
        
        // Show success with metadata
        if (data.metadata) {
            showSuccess(`✅ Deep analysis complete! Generated comprehensive summary and mind map using ${data.metadata.model}`);
        } else {
            showSuccess('✅ Comprehensive research analysis and mind map generation completed!');
        }
        
    } catch (error) {
        console.error('Error:', error);
        let errorMsg = error.message;
        
        // Handle specific error types
        if (error.message.includes('rate limit')) {
            errorMsg = '⏱️ API rate limit reached. Please wait 1 minute and try again.';
        } else if (error.message.includes('authentication')) {
            errorMsg = '🔐 API authentication failed. Please check the configuration.';
        } else if (error.message.includes('too short')) {
            errorMsg = '📝 The generated summary was too short. Please try with more detailed content.';
        }
        
        showError(`Analysis failed: ${errorMsg}`);
    } finally {
        setLoadingState(false);
    }
});

function setLoadingState(loading) {
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    
    if (loading) {
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        summarizeBtn.disabled = true;
        summaryOutput.innerHTML = '<div class="loading">🔄 Performing deep analysis and generating mind map...</div>';
    } else {
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        updateSummarizeButton();
    }
}

function displaySummary(summary) {
    // Convert markdown to HTML
    const htmlContent = marked.parse(summary);
    summaryOutput.innerHTML = htmlContent;
    
    // Enable action buttons
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
    
    // Scroll to summary
    summaryOutput.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Summary actions
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(currentSummary);
        showSuccess('Summary copied to clipboard!');
    } catch (error) {
        showError('Failed to copy to clipboard');
    }
});

downloadBtn.addEventListener('click', () => {
    const blob = new Blob([currentSummary], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'research-paper-summary.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccess('Summary downloaded successfully!');
});

// Notification functions
function showError(message) {
    showNotification(message, 'error');
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showNotification(message, type) {
    // Remove existing notifications of the same type
    const existing = document.querySelector(`.notification.${type}`);
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✕</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after appropriate time based on type
    const autoRemoveTime = type === 'info' ? 10000 : 5000;
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, autoRemoveTime);
}

function clearError() {
    const notification = document.querySelector('.notification.error');
    if (notification) notification.remove();
}

function clearNotificationByType(type) {
    const notification = document.querySelector(`.notification.${type}`);
    if (notification) notification.remove();
}

// Display extracted content in the new UI
function displayExtractedContent(content) {
    paperContent.value = content;
    
    // Show extracted content area
    extractedContent.classList.remove('hidden');
    
    // Update word count
    const words = content.split(/\s+/).length;
    wordCount.textContent = `${words} words`;
    
    // Show content preview (first 500 characters)
    const preview = content.length > 500 ? content.substring(0, 500) + '...' : content;
    contentPreview.textContent = preview;
    
    updateSummarizeButton();
}

// Initialize
updateSummarizeButton();