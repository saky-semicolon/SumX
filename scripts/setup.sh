#!/bin/bash

# Development setup script for SumX

echo "🔬 Setting up SumX Development Environment"
echo "=========================================="

# Check Node.js version
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ and npm 6+"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'.' -f1 | sed 's/v//')
if [ "$NODE_VERSION" -lt 14 ]; then
    echo "❌ Node.js version 14+ is required. Current version: $(node --version)"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies
echo ""
echo "Installing dependencies..."
npm install

# Setup environment file
echo ""
echo "Setting up environment configuration..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Created .env file from template"
    echo "⚠️  Please edit .env file and add your OPENROUTER_API_KEY"
else
    echo "✅ .env file already exists"
fi

# Check if API key is configured
if grep -q "your_openrouter_api_key_here" .env 2>/dev/null; then
    echo "⚠️  Please configure your OpenRouter API key in .env file"
fi

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
    mkdir logs
    echo "✅ Created logs directory"
fi

# Run health check
echo ""
echo "Testing application..."
npm start &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Check if server is running
if kill -0 $SERVER_PID 2>/dev/null; then
    # Test health endpoint
    HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "000")
    
    if [ "$HEALTH_RESPONSE" = "200" ]; then
        echo "✅ Server is running and healthy!"
        echo "🌐 Access your application at: http://localhost:3000"
    else
        echo "⚠️  Server started but health check failed (HTTP $HEALTH_RESPONSE)"
    fi
    
    # Stop test server
    kill $SERVER_PID
else
    echo "❌ Failed to start server"
fi

echo ""
echo "Setup complete! 🚀"
echo ""
echo "Next steps:"
echo "1. Configure your OpenRouter API key in .env file"
echo "2. Run 'npm start' to start the server"
echo "3. Open http://localhost:3000 in your browser"
echo "4. Run 'npm test' to run the test suite"
echo ""
echo "For development with auto-reload:"
echo "npm run dev"
