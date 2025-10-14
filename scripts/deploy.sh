#!/bin/bash
# ============================================================================
# SumX Docker Production Deployment Script
# Automated production deployment with health checks
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
HEALTH_ENDPOINT="http://localhost:3000/api/health"
MAX_WAIT_TIME=120

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed"
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed"
    fi
    
    if [ ! -f "$ENV_FILE" ]; then
        warning "Environment file $ENV_FILE not found"
        log "Creating example .env file..."
        cat > "$ENV_FILE" << EOF
OPENROUTER_API_KEY=your_api_key_here
NODE_ENV=production
PORT=3000
EOF
        warning "Please edit $ENV_FILE with your actual values"
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Build and deploy
deploy() {
    log "Starting SumX deployment..."
    
    # Stop existing containers
    log "Stopping existing containers..."
    docker-compose -f "$COMPOSE_FILE" down --remove-orphans
    
    # Pull latest images
    log "Pulling latest base images..."
    docker-compose -f "$COMPOSE_FILE" pull
    
    # Build application
    log "Building SumX application..."
    docker-compose -f "$COMPOSE_FILE" build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose -f "$COMPOSE_FILE" up -d
    
    # Wait for health check
    log "Waiting for application to be healthy..."
    wait_for_health
    
    success "Deployment completed successfully!"
    show_status
}

# Health check function
wait_for_health() {
    local wait_time=0
    
    while [ $wait_time -lt $MAX_WAIT_TIME ]; do
        if curl -f "$HEALTH_ENDPOINT" &> /dev/null; then
            success "Application is healthy!"
            return 0
        fi
        
        echo -n "."
        sleep 5
        wait_time=$((wait_time + 5))
    done
    
    error "Application failed to become healthy within ${MAX_WAIT_TIME}s"
}

# Show deployment status
show_status() {
    log "Deployment Status:"
    echo ""
    docker-compose -f "$COMPOSE_FILE" ps
    echo ""
    log "Application URL: http://localhost:3000"
    log "Health Check: $HEALTH_ENDPOINT"
    echo ""
    log "Useful commands:"
    echo "  View logs: docker-compose -f $COMPOSE_FILE logs -f"
    echo "  Stop app:  docker-compose -f $COMPOSE_FILE down"
    echo "  Restart:   docker-compose -f $COMPOSE_FILE restart"
}

# Cleanup function
cleanup() {
    log "Cleaning up Docker resources..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful!)
    # docker volume prune -f
    
    success "Cleanup completed"
}

# Main execution
main() {
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            deploy
            ;;
        "stop")
            log "Stopping SumX..."
            docker-compose -f "$COMPOSE_FILE" down
            success "SumX stopped"
            ;;
        "restart")
            log "Restarting SumX..."
            docker-compose -f "$COMPOSE_FILE" restart
            wait_for_health
            success "SumX restarted"
            ;;
        "logs")
            docker-compose -f "$COMPOSE_FILE" logs -f
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|*)
            echo "Usage: $0 {deploy|stop|restart|logs|status|cleanup|help}"
            echo ""
            echo "Commands:"
            echo "  deploy   - Deploy SumX (default)"
            echo "  stop     - Stop SumX services"
            echo "  restart  - Restart SumX services"
            echo "  logs     - View application logs"
            echo "  status   - Show deployment status"
            echo "  cleanup  - Clean up Docker resources"
            echo "  help     - Show this help message"
            ;;
    esac
}

main "$@"
