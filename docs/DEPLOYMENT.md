# Deployment Guide

## Prerequisites

- Node.js 14+ and npm 6+
- OpenRouter API key
- 1GB+ available memory
- 100MB+ disk space

## Environment Setup

### 1. Environment Variables

Create a `.env` file from the template:

```bash
cp .env.example .env
```

Required variables:
```env
OPENROUTER_API_KEY=your_api_key_here
NODE_ENV=production
PORT=3000
```

### 2. Install Dependencies

```bash
npm install --production
```

## Production Deployment

### Option 1: Direct Node.js

```bash
# Install PM2 for process management
npm install -g pm2

# Start the application
pm2 start src/server/app.js --name "sumx"

# Setup startup script
pm2 startup
pm2 save
```

### Option 2: Docker

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["node", "src/server/app.js"]
```

Build and run:
```bash
docker build -t sumx .
docker run -p 3000:3000 --env-file .env sumx
```

### Option 3: Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  sumx:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    restart: unless-stopped
```

Run:
```bash
docker-compose up -d
```

## Cloud Deployment

### Heroku

1. Create Heroku app:
```bash
heroku create your-sumx-app
```

2. Set environment variables:
```bash
heroku config:set OPENROUTER_API_KEY=your_key_here
heroku config:set NODE_ENV=production
```

3. Deploy:
```bash
git push heroku main
```

### Railway

1. Connect GitHub repository
2. Set environment variables in dashboard
3. Deploy automatically on push

### Vercel (Serverless)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server/app.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/server/app.js"
    }
  ]
}
```

3. Deploy:
```bash
vercel --prod
```

## Nginx Reverse Proxy

For production with multiple applications:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## SSL/HTTPS

### Using Let's Encrypt with Certbot

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Logging

### PM2 Monitoring

```bash
# Monitor processes
pm2 monit

# View logs
pm2 logs sumx

# Restart on file changes (development)
pm2 start src/server/app.js --name "sumx" --watch
```

### Health Checks

Setup monitoring for:
- GET /api/health (application health)
- Server uptime
- Memory usage
- Response times

## Performance Optimization

### 1. Enable Compression

Add to your app configuration:
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Static File Caching

Configure Nginx for static assets:
```nginx
location /assets/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. Memory Management

Monitor memory usage:
```bash
# Check memory usage
pm2 show sumx

# Set memory limit
pm2 start src/server/app.js --name "sumx" --max-memory-restart 500M
```

## Security Considerations

### 1. Environment Variables

Never commit `.env` files. Use:
- Heroku Config Vars
- Railway Environment Variables
- Docker secrets
- Cloud provider secret managers

### 2. Rate Limiting

Add rate limiting for production:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. CORS Configuration

Restrict CORS in production:
```env
CORS_ORIGIN=https://your-domain.com
```

### 4. Helmet for Security Headers

```javascript
const helmet = require('helmet');
app.use(helmet());
```

## Backup and Recovery

### Database (if added in future)

```bash
# MongoDB backup
mongodump --host localhost:27017 --db sumx --out backup/

# Restore
mongorestore --host localhost:27017 --db sumx backup/sumx/
```

### Application Files

```bash
# Backup configuration and logs
tar -czf sumx-backup-$(date +%Y%m%d).tar.gz .env logs/
```

## Scaling

### Horizontal Scaling

Use PM2 cluster mode:
```bash
pm2 start src/server/app.js --name "sumx" -i max
```

### Load Balancing

Use Nginx upstream:
```nginx
upstream sumx_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    location / {
        proxy_pass http://sumx_backend;
    }
}
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Out of memory**
   - Increase server memory
   - Use PM2 memory restart
   - Optimize application code

3. **API key issues**
   - Verify environment variables
   - Check API key validity
   - Monitor API quota

### Logs

Check logs in order:
1. Application logs: `pm2 logs sumx`
2. System logs: `journalctl -u sumx`
3. Nginx logs: `/var/log/nginx/error.log`

### Health Check Script

Create `scripts/health-check.sh`:
```bash
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
if [ $response -eq 200 ]; then
    echo "Application is healthy"
    exit 0
else
    echo "Application is unhealthy (HTTP $response)"
    exit 1
fi
```
