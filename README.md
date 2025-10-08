# 🔬 SumX - AI-Powered Research Paper Summarizer

SumX is an intelligent web application designed to analyze and summarize research papers with academic precision. Built with modern web technologies and powered by OpenRouter AI models, it provides structured, comprehensive summaries of scientific literature.

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

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. **Start the server**
   ```bash
   npm start
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
├── server.js          # Express server and API endpoints
├── index.html         # Main web interface
├── script.js          # Frontend JavaScript logic
├── style.css          # Modern CSS styling
├── package.json       # Node.js dependencies
├── .env              # Environment configuration
└── README.md         # Documentation
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
# Install dependencies
npm install

# Start development server
npm start

# The application will be available at http://localhost:3000
```

### Code Structure

- **Modular Architecture**: Separated concerns between frontend and backend
- **Error Handling**: Comprehensive error catching and user feedback
- **Responsive Design**: Mobile-first CSS approach
- **Performance**: Optimized for large document processing

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

## 🔮 Future Enhancements

- [x] Direct PDF text extraction ✅ **Now Available!**
- [ ] Microsoft Word document support
- [ ] Citation format extraction
- [ ] Batch processing for multiple papers
- [ ] Advanced search and filtering
- [ ] Integration with academic databases
- [ ] Custom summary templates
- [ ] Collaborative features

---

**Built with ❤️ for researchers and students worldwide**

For support or questions, please open an issue on GitHub or contact the development team.
