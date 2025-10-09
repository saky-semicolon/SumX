# API Documentation

## Overview

SumX provides a RESTful API for analyzing research papers using AI models. All endpoints return JSON responses with a consistent structure.

## Base URL

```
http://localhost:3000/api
```

## Response Format

All API responses follow this structure:

```json
{
  "success": boolean,
  "data": object,
  "error": string (only if success is false)
}
```

## Endpoints

### Health Check

#### GET /health
Returns server health status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-09T12:00:00.000Z",
    "environment": "development",
    "version": "1.0.0",
    "uptime": 123.45
  }
}
```

### Application Info

#### GET /info
Returns application information and features.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "SumX Research Paper Analyzer",
    "version": "1.0.0",
    "description": "AI-powered scientific research paper analysis platform",
    "features": [...],
    "limits": {
      "maxFileSize": "10MB",
      "allowedTypes": [...],
      "jsonLimit": "50mb"
    }
  }
}
```

### Configuration

#### GET /config
Returns public configuration settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "upload": {
      "maxFileSize": 10485760,
      "allowedMimeTypes": ["application/pdf", "text/plain"],
      "allowedExtensions": [".pdf", ".txt"]
    },
    "features": {
      "pdfExtraction": true,
      "textAnalysis": true,
      "multiModel": true,
      "fileUpload": true
    }
  }
}
```

## Analysis Endpoints

### Text Analysis

#### POST /analyze/text
Analyze research paper from text content.

**Request Body:**
```json
{
  "paperContent": "string (required, min 100 chars)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "string (markdown formatted analysis)",
    "model": "string (AI model used)",
    "attempt": 1,
    "wordCount": 1234,
    "characterCount": 5678
  }
}
```

### File Analysis

#### POST /analyze/file
Analyze research paper from uploaded file.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (PDF or TXT file, max 10MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "string (markdown formatted analysis)",
    "model": "string (AI model used)",
    "attempt": 1,
    "fileInfo": {
      "filename": "paper.pdf",
      "size": 1234567,
      "type": "application/pdf",
      "pages": 10,
      "wordCount": 5000,
      "characterCount": 25000
    },
    "extractedText": "string (preview of extracted text)"
  }
}
```

### Text Extraction

#### POST /extract
Extract text from uploaded file without analysis.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (PDF or TXT file, max 10MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "paper.pdf",
    "text": "string (full extracted text)",
    "fileInfo": {
      "size": 1234567,
      "type": "application/pdf",
      "pages": 10,
      "wordCount": 5000,
      "characterCount": 25000,
      "info": {
        "Title": "Research Paper Title"
      }
    }
  }
}
```

### Model Information

#### GET /models
Get information about available AI models.

**Response:**
```json
{
  "success": true,
  "data": {
    "models": [
      {
        "name": "meta-llama/llama-3.2-3b-instruct:free",
        "description": "Primary model - Fast and reliable for research analysis",
        "maxTokens": 2048,
        "temperature": 0.1
      }
    ],
    "currentModel": {
      "name": "meta-llama/llama-3.2-3b-instruct:free",
      "maxTokens": 2048,
      "temperature": 0.1
    }
  }
}
```

## Error Responses

### Client Errors (4xx)

#### 400 Bad Request
Invalid request data or missing required fields.

```json
{
  "success": false,
  "error": "Missing required field",
  "details": "paperContent is required"
}
```

#### 404 Not Found
Endpoint not found.

```json
{
  "success": false,
  "error": "Not Found",
  "details": "Route GET /api/nonexistent not found"
}
```

### Server Errors (5xx)

#### 500 Internal Server Error
Server-side processing error.

```json
{
  "success": false,
  "error": "Internal server error"
}
```

## File Upload Specifications

### Supported File Types
- **PDF**: `application/pdf`, `.pdf` extension
- **Text**: `text/plain`, `.txt` extension

### Limits
- Maximum file size: 10MB
- Maximum text input: 50,000 characters
- Minimum text input: 100 characters

### PDF Processing
- Automatic text extraction using pdf-parse
- OCR text cleaning and normalization
- Support for multi-page documents
- Metadata extraction (title, pages, etc.)

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing:
- Request rate limits per IP
- API key authentication
- Usage quotas

## Authentication

Currently no authentication is required. For production deployment, consider:
- API key authentication
- User registration and limits
- OAuth integration

## CORS

Cross-Origin Resource Sharing is enabled for all origins (`*`) in development. Configure appropriately for production.

## Legacy Compatibility

### POST /summarize
Deprecated endpoint that redirects to `/api/analyze/text` for backward compatibility.

**Note:** This endpoint will be removed in future versions. Use `/api/analyze/text` instead.
