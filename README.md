# 🔬 SumX - AI-Powered Research Paper Analysis Platform

> **Professional scientific research analysis with evidence-based evaluation**

SumX is a comprehensive research paper analysis platform that provides rigorous scientific evaluation using AI-powered assessment tools. Built with enterprise-grade architecture and following evidence-based medicine standards, it delivers peer-review quality analysis of scientific literature.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![API Documentation](https://img.shields.io/badge/API-Documentation-blue)](./docs/API.md)

## ✨ Features

### 📋 Structured Academic Summaries
- **Title & Authors**: Extracts paper title and author affiliations
- **Abstract Summary**: Concise overview of research purpose and scope
- **Methodology**: Detailed breakdown of research methods and approaches
- **Key Findings**: Comprehensive results and conclusions

### 🌍 Multi-language Support
- Output summaries in 8+ languages
- Supports English, Spanish, French, German, Chinese, Japanese, Portuguese, and Russian
- Maintains academic accuracy across languages

### 📄 Flexible Input Methods
- **Text Input**: Paste extracted paper content directly
- **PDF Upload**: Direct PDF text extraction and processing
- **File Upload**: Support for .pdf and .txt files
- **Smart Content Processing**: Handles OCR text and messy formatting

### 💡 User-Friendly Interface
- Clean, modern design optimized for researchers
- Real-time content validation
- Progress indicators and error handling
- Copy-to-clipboard and markdown download functionality

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- OpenRouter API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/saky-semicolon/SumX.git
   cd SumX
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Quick setup (recommended)**
   ```bash
   chmod +x scripts/setup.sh
   ./scripts/setup.sh
   ```

   Or manually:
   ```bash
   cp .env.example .env
   # Edit .env file and add your OPENROUTER_API_KEY
   ```

4. **Start the application**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔧 Usage

### Basic Workflow

1. **Input Your Research Paper**
   - Upload a PDF file directly, or
   - Copy and paste the paper content into the text area, or
   - Upload a .txt file containing the paper content

2. **Select Output Language** (Optional)
   - Choose from 8 supported languages
   - Default is English

3. **Generate Summary**
   - Click "Analyze Research Paper"
   - Wait for AI processing (typically 30-60 seconds)

4. **Review and Export**
   - Review the structured summary
   - Copy to clipboard or download as Markdown

### Input Guidelines

For best results, provide:
- **Complete paper text** including abstract, methodology, results, and conclusions
- **Well-formatted content** (though SumX can handle OCR text)
- **Minimum 100 characters** for meaningful analysis
- **Academic papers** rather than blog posts or articles

### Expected Output Format

```markdown
# Paper Title

## Authors & Affiliations
- Author names and institutional affiliations

## Abstract Summary  
Concise overview of the research purpose and scope

## Methodology
- Research design and approaches
- Data collection methods
- Analytical techniques

## Key Findings / Results
- Main discoveries and results
- Statistical findings
- Research conclusions
```

## 🏗️ Architecture

### Backend (Node.js/Express)
- **API Integration**: OpenRouter AI service integration
- **Content Processing**: Research paper content analysis
- **Multi-language**: Translation and localization support
- **Error Handling**: Comprehensive error management

### Frontend (Vanilla JS)
- **Modern UI**: Responsive design with CSS Grid/Flexbox
- **File Handling**: Drag-and-drop file upload interface
- **Markdown Rendering**: Real-time preview with marked.js
- **State Management**: Client-side content and UI state

### AI Integration
- **Primary Model**: Llama 3.2-3B Instruct (free tier) - Reliable and accurate
- **Fallback Models**: Mistral 7B, Phi-3 Mini for maximum reliability
- **Smart Model Selection**: Automatically tries different models if one fails
- **PDF Text Processing**: Advanced cleaning for OCR and copy-paste text
- **Content Validation**: Input quality and length validation
- **Error Handling**: Comprehensive validation and user feedback

## 📁 Project Structure

```
SumX/
├── src/
│   ├── client/                    # Frontend application
│   │   ├── index.html            # Main application interface
│   │   └── assets/
│   │       ├── css/
│   │       │   └── style.css     # Application styling
│   │       └── js/
│   │           └── script.js     # Client-side logic
│   └── server/                   # Backend application
│       ├── app.js               # Main application server
│       ├── config/              # Configuration files
│       │   ├── app.js          # Application settings
│       │   ├── ai.js           # AI service configuration
│       │   └── database.js     # Database configuration
│       ├── services/           # Business logic services
│       │   ├── aiService.js    # AI analysis service
│       │   └── fileService.js  # File processing service
│       ├── routes/             # API route handlers
│       │   ├── analysis.js     # Analysis endpoints
│       │   └── health.js       # Health check endpoints
│       └── middleware/         # Express middleware
│           ├── errorHandler.js # Error handling
│           └── upload.js       # File upload handling
├── tests/                      # Test suites
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   └── setup.js              # Test configuration
├── docs/                      # Documentation
│   ├── API.md                # API documentation
│   └── DEPLOYMENT.md         # Deployment guide
├── config/                    # External configurations
├── scripts/                   # Utility scripts
│   └── setup.sh             # Development setup
├── package.json              # Dependencies and scripts
├── .env.example             # Environment template
├── jest.config.js           # Test configuration
├── .eslintrc.js            # Code style configuration
└── README.md               # This file
```

## 🔬 Technical Details

### API Endpoints

#### POST /summarize
Analyzes research paper content and returns structured summary.

**Request Body:**
```json
{
  "paperContent": "string (required)",
  "language": "string (optional, default: English)"
}
```

**Response:**
```json
{
  "summary": "string (markdown formatted)"
}
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API key for AI model access | Yes |

### Content Processing Features

- **OCR Text Cleaning**: Handles poorly extracted text from PDFs
- **Format Normalization**: Standardizes various input formats
- **Content Validation**: Ensures sufficient content for analysis
- **Language Detection**: Automatic source language identification

## 🛠️ Development

### Local Development
```bash
# Quick setup
./scripts/setup.sh

# Manual setup
npm install
cp .env.example .env
# Configure your .env file

# Development server (with auto-reload)
npm run dev

# Production server
npm start

# Run tests
npm test

# Linting
npm run lint
```

### Architecture Overview

#### Backend (Node.js/Express)
- **Modular Design**: Service-oriented architecture with clear separation of concerns
- **Configuration Management**: Environment-based configuration with validation
- **Error Handling**: Comprehensive error middleware with proper HTTP status codes
- **API Design**: RESTful endpoints with consistent response format
- **File Processing**: Advanced PDF text extraction with OCR cleanup
- **AI Integration**: Multi-model fallback system for reliability

#### Frontend (Vanilla JavaScript)
- **Modern UI**: Responsive design with CSS Grid/Flexbox
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **File Handling**: Drag-and-drop with real-time validation
- **State Management**: Clean separation of UI and data logic

#### Services Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   File Service  │    │   AI Service    │    │  Config Service │
│                 │    │                 │    │                 │
│ • PDF Extract   │    │ • Multi-model   │    │ • Environment   │
│ • Text Clean    │    │ • Fallback      │    │ • Validation    │
│ • Validation    │    │ • Analysis      │    │ • Security      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Express App    │
                    │                 │
                    │ • Routes        │
                    │ • Middleware    │
                    │ • Error Handle  │
                    └─────────────────┘
```

### Testing Strategy

#### Unit Tests
- Service layer testing
- Utility function validation
- Configuration verification

#### Integration Tests
- API endpoint testing
- File upload workflows
- Error handling scenarios

#### Test Commands
```bash
# Run all tests
npm test

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Watch mode (development)
npm test -- --watch
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ES6+ JavaScript standards
- Use semantic HTML and accessible design
- Maintain consistent code formatting
- Add comments for complex logic
- Test with various paper formats

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenRouter**: AI model API provider
- **Meta AI & Mistral**: Advanced language model technology
- **Research Community**: For inspiring better academic tools

## � API Reference

### Quick API Overview

```bash
# Health check
curl http://localhost:3000/api/health

# Analyze text
curl -X POST http://localhost:3000/api/analyze/text \
  -H "Content-Type: application/json" \
  -d '{"paperContent": "Your research paper content here..."}'

# Upload and analyze file
curl -X POST http://localhost:3000/api/analyze/file \
  -F "file=@research-paper.pdf"

# Extract text only
curl -X POST http://localhost:3000/api/extract \
  -F "file=@research-paper.pdf"
```

**Full API Documentation**: [docs/API.md](./docs/API.md)

## 🌐 Deployment

### Quick Deploy Options

#### Heroku
```bash
heroku create your-sumx-app
heroku config:set OPENROUTER_API_KEY=your_key_here
git push heroku main
```

#### Docker
```bash
docker build -t sumx .
docker run -p 3000:3000 --env-file .env sumx
```

#### PM2 (Production)
```bash
npm install -g pm2
pm2 start src/server/app.js --name "sumx"
pm2 startup && pm2 save
```

**Full Deployment Guide**: [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)

## 📊 Performance & Scaling

### Production Optimizations
- **Clustering**: Multi-process support with PM2
- **Caching**: Static asset caching with proper headers
- **Compression**: Gzip compression for responses
- **Memory Management**: Automatic restart on memory limits
- **Load Balancing**: Nginx upstream configuration

### Monitoring
- Health check endpoint (`/api/health`)
- PM2 process monitoring
- Memory and CPU usage tracking
- API response time monitoring

## 🔒 Security Features

- **Input Validation**: Comprehensive request validation
- **File Security**: MIME type and extension verification
- **Error Handling**: Secure error responses without information leakage
- **CORS Configuration**: Configurable cross-origin policies
- **Rate Limiting**: Configurable request rate limits (production)

## 🔮 Roadmap & Future Enhancements

### Completed ✅
- [x] Professional architecture with modular design
- [x] Comprehensive test suite with CI/CD ready structure
- [x] Advanced PDF text extraction with OCR cleanup
- [x] Multi-model AI fallback system for reliability
- [x] Production-ready deployment configurations
- [x] Extensive documentation and API reference

### Planned Features 🔄
- [ ] **Database Integration**: PostgreSQL/MongoDB support for document history
- [ ] **User Authentication**: JWT-based user accounts and API keys  
- [ ] **Batch Processing**: Multiple document analysis in parallel
- [ ] **Citation Extraction**: Automatic reference and citation parsing
- [ ] **Advanced Analytics**: Usage statistics and analysis insights
- [ ] **Microsoft Word Support**: .docx file processing capability
- [ ] **Academic Database Integration**: Direct PubMed, ArXiv connections
- [ ] **Custom Templates**: Configurable analysis output formats
- [ ] **Collaborative Features**: Team workspaces and shared analyses
- [ ] **Mobile App**: React Native mobile application
- [ ] **Browser Extension**: Chrome/Firefox extension for direct web analysis

### Technical Improvements 🛠️
- [ ] **Microservices**: Service mesh architecture for horizontal scaling
- [ ] **Redis Caching**: In-memory caching for improved performance
- [ ] **Queue System**: Background job processing with Bull/Agenda
- [ ] **GraphQL API**: More efficient data fetching capabilities
- [ ] **WebSocket Support**: Real-time analysis progress updates
- [ ] **CDN Integration**: Global content delivery network support

---

**Built with ❤️ for researchers and students worldwide**

For support or questions, please open an issue on GitHub or contact the development team.
