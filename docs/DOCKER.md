# 🐳 SumX Docker Deployment Guide

## Quick Start

### 1. Clone and Setup
```bash
git clone https://github.com/saky-semicolon/SumX.git
cd SumX
cp .env.example .env
# Edit .env with your OpenRouter API key
```

### 2. Production Deployment
```bash
# Using deployment script (Recommended)
./scripts/deploy.sh

# Or manually
docker-compose up -d
```

### 3. Access Application
- **Application**: http://localhost:3000
- **Health Check**: http://localhost:3000/api/health

## 🛠️ Management Commands

### Deployment Script
```bash
./scripts/deploy.sh [command]

Commands:
  deploy   - Deploy SumX (default)
  stop     - Stop services
  restart  - Restart services  
  logs     - View logs
  status   - Show status
  cleanup  - Clean Docker resources
```

### Manual Docker Commands
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f sumx

# Stop services
docker-compose down

# Restart specific service
docker-compose restart sumx

# Scale application (if needed)
docker-compose up -d --scale sumx=3
```

## 🔧 Configuration

### Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `OPENROUTER_API_KEY` | OpenRouter API key | Required |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Application port | `3000` |

### Docker Compose Profiles
```bash
# Run with Nginx reverse proxy
docker-compose --profile nginx up -d

# Run with Redis caching
docker-compose --profile redis up -d

# Run with all services
docker-compose --profile nginx --profile redis up -d
```

## 📊 Monitoring

### Health Checks
```bash
# Application health
curl http://localhost:3000/api/health

# Container health
docker-compose ps

# Manual health check
node scripts/health-check.js
```

### Logs and Debugging
```bash
# View application logs
docker-compose logs -f sumx

# View all service logs
docker-compose logs -f

# Debug inside container
docker-compose exec sumx sh
```

## 🔒 Security Features

### Container Security
- ✅ Non-root user execution
- ✅ Read-only filesystem
- ✅ No new privileges
- ✅ Temporary filesystem mounting
- ✅ Resource limits
- ✅ Health checks

### Network Security
- ✅ Isolated Docker network
- ✅ Nginx reverse proxy
- ✅ Security headers
- ✅ CORS configuration

## 🚀 Performance Optimization

### Resource Limits
```yaml
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### Caching
- Nginx static file caching
- Docker layer caching
- Optional Redis integration

## 🔄 CI/CD Integration

### GitHub Actions Example
```yaml
- name: Deploy to Production
  run: |
    docker-compose pull
    docker-compose up -d
    docker-compose exec -T sumx node scripts/health-check.js
```

### Automated Updates
```bash
# Update and redeploy
git pull
./scripts/deploy.sh
```

## 🐛 Troubleshooting

### Common Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs sumx

# Check configuration
docker-compose config

# Verify environment
docker-compose exec sumx env
```

**Health check failing:**
```bash
# Manual health check
node scripts/health-check.js

# Check application logs
docker-compose logs sumx

# Test API directly
curl -v http://localhost:3000/api/health
```

**Performance issues:**
```bash
# Check resource usage
docker stats

# Check container health
docker-compose ps

# Monitor logs
docker-compose logs -f --tail=100 sumx
```

### Debug Mode
```bash
# Run in development mode
docker-compose -f docker-compose.dev.yml up

# Access debug port
# Connect debugger to localhost:9229
```

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale to multiple instances
docker-compose up -d --scale sumx=3

# Use load balancer
docker-compose --profile nginx up -d
```

### Vertical Scaling
```yaml
# Increase resources in docker-compose.yml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2G
```

## 🔄 Backup and Recovery

### Data Persistence
```bash
# Backup volumes
docker run --rm -v sumx_app-logs:/data -v $(pwd):/backup alpine tar czf /backup/logs-backup.tar.gz /data

# Restore volumes
docker run --rm -v sumx_app-logs:/data -v $(pwd):/backup alpine tar xzf /backup/logs-backup.tar.gz -C /data --strip 1
```

### Configuration Backup
```bash
# Backup environment and compose files
tar czf sumx-config-backup.tar.gz .env docker-compose.yml nginx.conf
```
