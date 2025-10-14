# CI/CD Pipeline Documentation

This document describes the comprehensive CI/CD pipeline setup for the SumX project, providing automated testing, security scanning, building, and deployment capabilities.

## 🚀 Pipeline Overview

### Workflows

1. **`docker-publish.yml`** - Main CI/CD pipeline for Docker Registry publishing
2. **`security.yml`** - Security analysis and vulnerability scanning
3. **`release.yml`** - Automated release management and deployment
4. **`dependabot.yml`** - Automated dependency updates

## 📋 Prerequisites

### Required GitHub Secrets

Before running the pipelines, configure these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

#### Docker Hub Integration
```bash
DOCKERHUB_USERNAME    # Your Docker Hub username
DOCKERHUB_TOKEN       # Docker Hub Personal Access Token
```

#### Application Secrets
```bash
OPENROUTER_API_KEY_TEST    # Test API key for integration tests
OPENROUTER_API_KEY         # Production API key (for releases)
```

### Optional Secrets (for enhanced features)
```bash
SLACK_WEBHOOK_URL     # For deployment notifications
DISCORD_WEBHOOK_URL   # For community notifications
```

## 🔄 Main CI/CD Pipeline (`docker-publish.yml`)

### Triggers
- **Push to main branch** - Full pipeline execution
- **Pull requests to main** - Testing and validation only
- **Manual dispatch** - On-demand pipeline execution
- **Tag creation** (`v*`) - Release pipeline

### Pipeline Stages

#### 1. **Code Quality & Testing**
```yaml
Strategy: Multi-Node.js versions (18.x, 20.x)
```
- Dependency installation with npm cache
- ESLint code quality checks
- Security audit (`npm audit`)
- Unit and integration tests
- Test coverage reporting to Codecov

#### 2. **Security Analysis**
- **Trivy filesystem scan** - Source code vulnerability detection
- **Docker image security scan** - Container vulnerability analysis
- **SARIF report upload** - GitHub Security tab integration

#### 3. **Docker Build & Push**
```yaml
Platforms: linux/amd64, linux/arm64
Registries: Docker Hub + GitHub Container Registry
```
- Multi-platform Docker image building
- Automated tagging strategy:
  - `latest` (main branch)
  - `v1.2.3` (semantic versioning)
  - `v1.2`, `v1` (major/minor versions)
  - `main-abc123` (branch with commit SHA)
- Build cache optimization
- SBOM (Software Bill of Materials) generation

#### 4. **Docker Image Testing**
- Container startup validation
- Health endpoint verification  
- API endpoint testing
- Docker Compose integration testing

#### 5. **Deployment Notification**
- GitHub deployment summary
- Status notifications
- Quick deployment commands

## 🔒 Security Pipeline (`security.yml`)

### Automated Security Scanning

#### CodeQL Analysis
- **Language**: JavaScript/Node.js
- **Schedule**: Weekly (Monday 2 AM UTC)
- **Triggers**: Push, PR, scheduled
- **Output**: Security findings in GitHub Security tab

#### Dependency Review
- **Scope**: Pull requests only
- **Severity threshold**: Moderate and above
- **License validation**: MIT, Apache-2.0, BSD-3-Clause, ISC
- **Action**: Blocks PRs with security vulnerabilities

## 🚀 Release Pipeline (`release.yml`)

### Automated Release Management

#### Triggers
- **Git tags** (`v*.*.*`) - Automatic release creation
- **Manual dispatch** - On-demand versioning

#### Release Process

1. **Changelog Generation**
   - Automatic commit history compilation
   - Formatted release notes
   - Comparison links generation

2. **GitHub Release Creation**
   - Semantic versioning support
   - Pre-release detection (alpha, beta, rc)
   - Asset upload capabilities

3. **Production Docker Images**
   - Multi-registry publishing
   - Stable tag assignment
   - Release metadata integration

4. **Production Deployment**
   - Environment-specific deployment
   - Health check validation
   - Deployment summary generation

## 🤖 Dependency Management (`dependabot.yml`)

### Automated Updates

#### Package Dependencies (npm)
- **Schedule**: Daily at 4 AM UTC
- **Scope**: Direct and indirect dependencies
- **Grouping**: Production, development, and security updates
- **Limits**: 10 concurrent PRs

#### Docker Dependencies
- **Schedule**: Weekly (Monday 4 AM UTC)
- **Scope**: Dockerfile base images
- **Limits**: 5 concurrent PRs

#### GitHub Actions
- **Schedule**: Weekly (Monday 5 AM UTC)
- **Scope**: Workflow action versions
- **Limits**: 5 concurrent PRs

## 🏃‍♂️ Usage Guide

### Running the Pipeline

#### 1. Development Workflow
```bash
# Create feature branch
git checkout -b feature/new-functionality

# Make changes and commit
git add .
git commit -m "feat: add new functionality"

# Push and create PR
git push origin feature/new-functionality
# Creates PR → triggers testing pipeline
```

#### 2. Release Workflow
```bash
# Create and push release tag
git tag v1.2.3
git push origin v1.2.3
# Triggers full release pipeline
```

#### 3. Manual Pipeline Execution
- Go to `Actions` tab in GitHub repository
- Select desired workflow
- Click "Run workflow"
- Choose branch/parameters

### Docker Image Usage

#### Development
```bash
# Latest development build
docker pull ghcr.io/username/sumx:latest
docker run -p 3000:3000 -e OPENROUTER_API_KEY=your_key ghcr.io/username/sumx:latest
```

#### Production
```bash
# Stable release
docker pull docker.io/username/sumx:stable
docker run -p 3000:3000 -e OPENROUTER_API_KEY=your_key docker.io/username/sumx:stable

# Specific version
docker pull docker.io/username/sumx:v1.2.3
docker run -p 3000:3000 -e OPENROUTER_API_KEY=your_key docker.io/username/sumx:v1.2.3
```

## 📊 Monitoring & Observability

### Pipeline Monitoring

#### GitHub Actions Dashboard
- Workflow success/failure rates
- Build duration tracking
- Resource usage analytics

#### Security Monitoring
- Vulnerability detection alerts
- Dependency security status  
- Code quality metrics

#### Docker Registry Analytics
- Image pull statistics
- Version distribution
- Security scan results

### Notifications

#### Success Notifications
- ✅ Successful deployments
- 📦 New releases published
- 🔄 Dependency updates merged

#### Failure Alerts
- ❌ Pipeline failures
- 🚨 Security vulnerabilities
- ⚠️ Test failures

## 🛠️ Troubleshooting

### Common Issues

#### 1. **Docker Push Failures**
```bash
# Check Docker Hub credentials
# Verify DOCKERHUB_USERNAME and DOCKERHUB_TOKEN secrets
```

#### 2. **Test Failures**
```bash
# Verify OPENROUTER_API_KEY_TEST secret
# Check test environment configuration
```

#### 3. **Security Scan Failures**
```bash
# Review Trivy scan results
# Update vulnerable dependencies
# Check SARIF upload permissions
```

### Pipeline Optimization

#### Build Performance
- Utilize build cache effectively
- Optimize Docker image layers
- Parallel test execution

#### Resource Management  
- Monitor Action minutes usage
- Optimize workflow concurrency
- Clean up old artifacts

## 🔧 Configuration

### Environment Variables

#### Required
- `OPENROUTER_API_KEY` - Production API key
- `NODE_ENV` - Application environment

#### Optional
- `PORT` - Application port (default: 3000)
- `LOG_LEVEL` - Logging verbosity
- `REDIS_URL` - Redis cache connection

### Docker Configuration

#### Build Arguments
- `BUILD_DATE` - Build timestamp
- `VCS_REF` - Git commit SHA
- `VERSION` - Application version

#### Runtime Configuration
- Multi-stage optimized builds
- Security hardening
- Health check endpoints
- Graceful shutdown handling

## 📚 Additional Resources

### Documentation
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)

### Best Practices
- [CI/CD Security Best Practices](https://docs.github.com/en/actions/security-guides)
- [Docker Security Guidelines](https://docs.docker.com/engine/security/)
- [Semantic Versioning](https://semver.org/)

---

This CI/CD pipeline provides enterprise-grade automation for the SumX project, ensuring reliable, secure, and efficient software delivery.
