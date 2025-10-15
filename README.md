# SumX

**AI-Powered Research Paper Analysis Platform**

A professional scientific research analysis platform that provides comprehensive evaluation of academic papers using advanced AI models. Features enterprise-grade architecture, evidence-based methodology assessment, and peer-review quality analysis.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/docker-supported-blue)](./docs/DOCKER.md)
[![API Docs](https://img.shields.io/badge/API-Documentation-blue)](./docs/API.md)

## Features

### Scientific Analysis Framework
- **Evidence-Based Evaluation**: GRADE methodology and CONSORT/STROBE guidelines
- **Peer Review Quality**: Comprehensive methodological assessment
- **Multi-Model AI**: Fallback system with Llama 3.2, Mistral 7B, and Phi-3
- **Statistical Synthesis**: Effect estimates, heterogeneity analysis, bias assessment

### File Processing Capabilities
- **PDF Text Extraction**: Advanced OCR cleanup and formatting normalization
- **Multiple Formats**: Support for PDF, TXT files with drag-and-drop interface
- **Content Validation**: Input quality verification and length requirements
- **Error Recovery**: Intelligent handling of corrupted or image-based documents

### Enterprise Architecture
- **Production Ready**: Docker containerization with health monitoring
- **Scalable Design**: Modular service architecture with load balancing support  
- **Security Hardened**: Non-root execution, input validation, CORS protection
- **Comprehensive Testing**: Unit and integration test suites with CI/CD integration

## Quick Start

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **Docker**: v20.0.0 or higher (for containerized deployment)
- **OpenRouter API Key**: [Get your key here](https://openrouter.ai/keys)

### Installation

#### Option 1: Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/saky-semicolon/SumX.git
cd SumX

# Configure environment
cp .env.example .env
# Edit .env and add your OPENROUTER_API_KEY

# Deploy with Docker
./scripts/deploy.sh
```

#### Option 2: Local Development

```bash
# Clone and install
git clone https://github.com/saky-semicolon/SumX.git
cd SumX
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API key

# Start development server
npm run dev
```

#### Access Application

- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health
- **API Documentation**: [docs/API.md](./docs/API.md)


### Web Interface Workflow

1. **Upload Document**: Drag-and-drop PDF/TXT files or paste content directly
2. **Process Analysis**: Automated text extraction and scientific evaluation 
3. **Review Results**: Comprehensive analysis following evidence-based standards
4. **Export Data**: Copy to clipboard or download as structured markdown

### Input Requirements

- **File Types**: PDF (text-based), TXT files
- **Content Length**: Minimum 100 characters for meaningful analysis
- **File Size**: Maximum 10MB per upload
- **Format**: Academic papers with clear methodology and results sections

## Architecture

### System Overview

SumX follows a modular, service-oriented architecture designed for scalability and maintainability.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Layer  │    │  API Gateway    │    │  Service Layer  │
│                 │    │                 │    │                 │
│ • Web Interface │    │ • Express.js    │    │ • AI Service    │
│ • File Upload   │◄──►│ • Rate Limiting │◄──►│ • File Service  │
│ • Drag & Drop   │    │ • CORS/Security │    │ • Config Mgmt   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Core Components

#### Backend Services
- **Express.js Server**: RESTful API with comprehensive middleware
- **AI Service**: Multi-model integration with automatic fallback
- **File Service**: PDF processing with OCR cleanup and validation
- **Configuration**: Environment-based settings with security validation

#### Frontend Application  
- **Responsive Interface**: Modern CSS Grid/Flexbox layout
- **File Processing**: Drag-and-drop with real-time validation
- **State Management**: Clean separation of UI and application logic
- **Progressive Enhancement**: Functional without JavaScript

#### Infrastructure
- **Docker Containerization**: Production-ready with security hardening
- **Health Monitoring**: Automated health checks and logging
- **Load Balancing**: Nginx reverse proxy configuration
- **Caching**: Redis integration for performance optimization

## Project Structure

```
SumX/
├── src/
│   ├── client/                    # Frontend application
│   │   ├── index.html            # Main interface
│   │   └── assets/               # Static resources
│   │       ├── css/style.css     # Application styles
│   │       └── js/script.js      # Client logic
│   └── server/                   # Backend services
│       ├── app.js               # Express application
│       ├── config/              # Configuration management
│       ├── services/            # Business logic
│       │   ├── aiService.js     # AI integration
│       │   └── fileService.js   # File processing
│       ├── routes/              # API endpoints
│       └── middleware/          # Express middleware
├── tests/                       # Test suites
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
├── docs/                       # Documentation
│   ├── API.md                 # API reference
├── scripts/                    # Automation scripts
│   ├── deploy.sh             # Production deployment
│   └── health-check.js       # Health monitoring
├── Dockerfile                  # Container configuration
├── docker-compose.yml         # Orchestration config
├── package.json               # Project metadata
└── .env.example              # Environment template
```

## Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `OPENROUTER_API_KEY` | OpenRouter API authentication key | - | Yes |
| `NODE_ENV` | Application environment | `development` | No |
| `PORT` | Server port number | `3000` | No |
| `CORS_ORIGIN` | Allowed CORS origins | `*` | No |

### API Response Format

All API endpoints return consistent JSON responses:

```json
{
  "success": boolean,
  "data": object | null,
  "error": string | null,
  "timestamp": "ISO 8601 string"
}
```

### Supported AI Models

| Model | Provider | Purpose | Fallback Order |
|-------|----------|---------|----------------|
| `meta-llama/llama-3.2-3b-instruct` | Meta | Primary analysis | 1st |
| `mistralai/mistral-7b-instruct` | Mistral AI | Backup analysis | 2nd |
| `microsoft/phi-3-mini-128k-instruct` | Microsoft | Final fallback | 3rd |

## Development

### Setup Development Environment

```bash
# Clone repository
git clone https://github.com/saky-semicolon/SumX.git
cd SumX

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your OPENROUTER_API_KEY to .env

# Start development server
npm run dev
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot-reload |
| `npm test` | Run complete test suite |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests only |
| `npm run lint` | Run ESLint code analysis |
| `npm run lint:fix` | Fix automatically correctable lint issues |

### Docker Development

```bash
# Development environment with hot-reload
docker-compose -f docker-compose.dev.yml up

# Production environment
docker-compose up -d

# View logs
docker-compose logs -f

# Health check
curl http://localhost:3000/api/health
```

### Testing

The project includes comprehensive test coverage:

- **Unit Tests**: Service layer and utility functions
- **Integration Tests**: API endpoints and workflows  
- **Health Checks**: Automated system monitoring

```bash
# Run all tests with coverage
npm test

# Run specific test file
npm test -- tests/unit/aiService.test.js

# Watch mode for development
npm test -- --watch
```

## Contributing

### Development Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Make changes with tests
4. Commit: `git commit -m 'Add feature'`
5. Push: `git push origin feature-name`
6. Submit pull request

### Code Standards

- **JavaScript**: ES6+ with ESLint configuration
- **Testing**: Jest for unit and integration tests
- **Documentation**: JSDoc for functions and APIs
- **Commits**: Conventional commit format preferred

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: [docs/](./docs/) directory
- **Issues**: [GitHub Issues](https://github.com/saky-semicolon/SumX/issues)
- **API Reference**: [docs/API.md](./docs/API.md)

---

**SumX** - Professional research paper analysis for the academic community.

For detailed information, see the [documentation](./docs/) directory.

__Built with ❤️ by Saky__
