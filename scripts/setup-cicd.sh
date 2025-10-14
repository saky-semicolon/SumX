#!/bin/bash

# ============================================================================
# SumX CI/CD Setup Script
# Automated configuration for GitHub repository secrets and CI/CD pipeline
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_header() {
    echo -e "\n${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Main setup function
main() {
    print_header "SumX CI/CD Pipeline Setup"
    
    echo "This script will help you configure the CI/CD pipeline for your SumX repository."
    echo "Please ensure you have the GitHub CLI (gh) installed and authenticated."
    echo
    
    # Check prerequisites
    check_prerequisites
    
    # Get repository information
    get_repository_info
    
    # Setup Docker Hub integration
    setup_dockerhub
    
    # Setup OpenRouter API keys
    setup_openrouter
    
    # Setup optional integrations
    setup_optional_secrets
    
    # Verify setup
    verify_setup
    
    # Final instructions
    show_final_instructions
}

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if gh CLI is installed
    if ! command -v gh &> /dev/null; then
        print_error "GitHub CLI (gh) is not installed."
        echo "Please install it from: https://cli.github.com/"
        exit 1
    fi
    
    print_success "GitHub CLI is installed"
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        print_error "GitHub CLI is not authenticated."
        echo "Please run: gh auth login"
        exit 1
    fi
    
    print_success "GitHub CLI is authenticated"
}

get_repository_info() {
    print_header "Repository Information"
    
    # Get current repository
    REPO_OWNER=$(gh repo view --json owner --jq .owner.login 2>/dev/null || echo "")
    REPO_NAME=$(gh repo view --json name --jq .name 2>/dev/null || echo "")
    
    if [[ -z "$REPO_OWNER" || -z "$REPO_NAME" ]]; then
        print_error "Unable to detect repository information."
        echo "Please run this script from within your SumX repository directory."
        exit 1
    fi
    
    print_success "Repository: $REPO_OWNER/$REPO_NAME"
}

setup_dockerhub() {
    print_header "Docker Hub Configuration"
    
    echo "To publish Docker images, we need your Docker Hub credentials."
    echo
    
    read -p "Enter your Docker Hub username: " DOCKERHUB_USERNAME
    
    if [[ -z "$DOCKERHUB_USERNAME" ]]; then
        print_warning "Skipping Docker Hub setup"
        return
    fi
    
    echo "Please create a Docker Hub Personal Access Token:"
    echo "1. Go to https://hub.docker.com/settings/security"
    echo "2. Click 'New Access Token'"
    echo "3. Name: 'GitHub Actions CI/CD'"
    echo "4. Permissions: Read, Write, Delete"
    echo
    
    read -s -p "Enter your Docker Hub Personal Access Token: " DOCKERHUB_TOKEN
    echo
    
    if [[ -z "$DOCKERHUB_TOKEN" ]]; then
        print_warning "Skipping Docker Hub token setup"
        return
    fi
    
    # Set GitHub secrets
    echo "$DOCKERHUB_USERNAME" | gh secret set DOCKERHUB_USERNAME --repo="$REPO_OWNER/$REPO_NAME"
    echo "$DOCKERHUB_TOKEN" | gh secret set DOCKERHUB_TOKEN --repo="$REPO_OWNER/$REPO_NAME"
    
    print_success "Docker Hub credentials configured"
}

setup_openrouter() {
    print_header "OpenRouter API Configuration"
    
    echo "SumX requires OpenRouter API keys for AI functionality."
    echo "Get your API key from: https://openrouter.ai/keys"
    echo
    
    read -s -p "Enter your OpenRouter API key for production: " OPENROUTER_API_KEY
    echo
    
    if [[ -z "$OPENROUTER_API_KEY" ]]; then
        print_warning "Production API key not provided"
    else
        echo "$OPENROUTER_API_KEY" | gh secret set OPENROUTER_API_KEY --repo="$REPO_OWNER/$REPO_NAME"
        print_success "Production API key configured"
    fi
    
    read -s -p "Enter your OpenRouter API key for testing (can be same as production): " OPENROUTER_API_KEY_TEST
    echo
    
    if [[ -z "$OPENROUTER_API_KEY_TEST" ]]; then
        if [[ -n "$OPENROUTER_API_KEY" ]]; then
            echo "$OPENROUTER_API_KEY" | gh secret set OPENROUTER_API_KEY_TEST --repo="$REPO_OWNER/$REPO_NAME"
            print_success "Test API key configured (using production key)"
        else
            print_warning "Test API key not provided"
        fi
    else
        echo "$OPENROUTER_API_KEY_TEST" | gh secret set OPENROUTER_API_KEY_TEST --repo="$REPO_OWNER/$REPO_NAME"
        print_success "Test API key configured"
    fi
}

setup_optional_secrets() {
    print_header "Optional Integrations"
    
    echo "The following integrations are optional but recommended:"
    echo
    
    # Slack notifications
    read -p "Do you want to configure Slack notifications? (y/N): " setup_slack
    if [[ "$setup_slack" =~ ^[Yy]$ ]]; then
        echo "Create a Slack incoming webhook:"
        echo "1. Go to https://api.slack.com/apps"
        echo "2. Create a new app or select existing"
        echo "3. Add 'Incoming Webhooks' feature"
        echo "4. Create a webhook for your deployment channel"
        echo
        read -p "Enter Slack webhook URL: " SLACK_WEBHOOK_URL
        
        if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
            echo "$SLACK_WEBHOOK_URL" | gh secret set SLACK_WEBHOOK_URL --repo="$REPO_OWNER/$REPO_NAME"
            print_success "Slack webhook configured"
        fi
    fi
    
    # Discord notifications
    read -p "Do you want to configure Discord notifications? (y/N): " setup_discord
    if [[ "$setup_discord" =~ ^[Yy]$ ]]; then
        echo "Create a Discord webhook:"
        echo "1. Go to your Discord server settings"
        echo "2. Navigate to Integrations > Webhooks"
        echo "3. Create a new webhook"
        echo "4. Copy the webhook URL"
        echo
        read -p "Enter Discord webhook URL: " DISCORD_WEBHOOK_URL
        
        if [[ -n "$DISCORD_WEBHOOK_URL" ]]; then
            echo "$DISCORD_WEBHOOK_URL" | gh secret set DISCORD_WEBHOOK_URL --repo="$REPO_OWNER/$REPO_NAME"
            print_success "Discord webhook configured"
        fi
    fi
}

verify_setup() {
    print_header "Verifying Setup"
    
    echo "Checking configured secrets..."
    
    # List secrets (names only, not values)
    SECRETS=$(gh secret list --repo="$REPO_OWNER/$REPO_NAME" --json name --jq '.[].name')
    
    # Check required secrets
    check_secret "DOCKERHUB_USERNAME" "$SECRETS"
    check_secret "DOCKERHUB_TOKEN" "$SECRETS"
    check_secret "OPENROUTER_API_KEY" "$SECRETS"
    check_secret "OPENROUTER_API_KEY_TEST" "$SECRETS"
    
    # Check optional secrets
    if echo "$SECRETS" | grep -q "SLACK_WEBHOOK_URL"; then
        print_success "Slack webhook configured"
    fi
    
    if echo "$SECRETS" | grep -q "DISCORD_WEBHOOK_URL"; then
        print_success "Discord webhook configured"
    fi
    
    print_success "Setup verification completed"
}

check_secret() {
    local secret_name=$1
    local secrets_list=$2
    
    if echo "$secrets_list" | grep -q "$secret_name"; then
        print_success "$secret_name configured"
    else
        print_warning "$secret_name not configured"
    fi
}

show_final_instructions() {
    print_header "Setup Complete!"
    
    echo "Your SumX CI/CD pipeline is now configured. Here's what happens next:"
    echo
    echo "🚀 Automated Workflows:"
    echo "   • Push to main branch → Full CI/CD pipeline"
    echo "   • Create pull request → Testing and security scans"
    echo "   • Push git tag (v*.*.*) → Automated release"
    echo
    echo "🐳 Docker Images:"
    echo "   • docker.io/$REPO_OWNER/sumx:latest"
    echo "   • ghcr.io/$REPO_OWNER/sumx:latest"
    echo
    echo "📚 Documentation:"
    echo "   • Pipeline docs: .github/CI-CD-DOCS.md"
    echo "   • Workflow files: .github/workflows/"
    echo
    echo "🔄 Next Steps:"
    echo "   1. Commit and push your changes"
    echo "   2. Create a pull request to test the pipeline"
    echo "   3. Merge to main branch for production build"
    echo "   4. Create a release tag (e.g., v1.0.0) for official release"
    echo
    echo "🎉 Happy coding! Your automated CI/CD pipeline is ready to work."
    
    print_success "CI/CD setup completed successfully!"
}

# Run main function
main "$@"
