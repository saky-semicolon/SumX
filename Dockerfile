# ============================================================================
# SumX Research Paper Analyzer - Production Docker Image
# Multi-stage build for optimized production deployment
# ============================================================================

# ============================================================================
# STAGE 1: Build Dependencies and Security Scanner
# ============================================================================
FROM node:18-alpine AS dependencies

# Install security tools and build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    dumb-init

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies with production optimizations
RUN npm ci --only=production && \
    npm cache clean --force && \
    rm -rf ~/.npm /tmp/*

# ============================================================================
# STAGE 2: Production Image
# ============================================================================
FROM node:18-alpine AS production

# Add metadata labels following OCI spec
LABEL org.opencontainers.image.title="SumX Research Paper Analyzer"
LABEL org.opencontainers.image.description="AI-powered scientific research paper analysis platform"
LABEL org.opencontainers.image.version="2.0.0"
LABEL org.opencontainers.image.authors="Saky <saky@example.com>"
LABEL org.opencontainers.image.url="https://github.com/saky-semicolon/SumX"
LABEL org.opencontainers.image.source="https://github.com/saky-semicolon/SumX"
LABEL org.opencontainers.image.licenses="MIT"

# Install runtime dependencies and security tools
RUN apk add --no-cache \
    dumb-init \
    tini \
    curl \
    ca-certificates \
    && addgroup -g 1001 -S nodejs \
    && adduser -S sumx -u 1001 -G nodejs \
    && mkdir -p /app/logs /app/uploads /tmp/sumx \
    && chown -R sumx:nodejs /app /tmp/sumx

# Set working directory
WORKDIR /app

# Copy dependencies from build stage
COPY --from=dependencies --chown=sumx:nodejs /app/node_modules ./node_modules

# Copy application source code
COPY --chown=sumx:nodejs . .

# Create necessary directories and set permissions
RUN mkdir -p logs uploads temp && \
    chmod 755 logs uploads temp && \
    chown -R sumx:nodejs logs uploads temp

# Switch to non-root user for security
USER sumx

# Environment configuration
ENV NODE_ENV=production \
    PORT=3000 \
    NODE_OPTIONS="--max-old-space-size=512" \
    UV_THREADPOOL_SIZE=4 \
    MALLOC_ARENA_MAX=2

# Health check configuration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Expose application port
EXPOSE 3000

# Use tini for proper signal handling and zombie reaping
ENTRYPOINT ["/sbin/tini", "--"]

# Start application with dumb-init for security
CMD ["dumb-init", "node", "src/server/app.js"]
