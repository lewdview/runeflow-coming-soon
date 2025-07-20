#!/bin/bash

# RuneFlow Coming Soon - Startup Script
# This script initializes and starts the complete RuneFlow deployment system

set -e

echo "🔥 RuneFlow Coming Soon - Starting Deployment System"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please upgrade to Node.js 18+."
    exit 1
fi

print_status "Node.js version $NODE_VERSION detected"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
    print_status "Dependencies installed"
else
    print_info "Dependencies already installed"
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your API keys and configuration"
        print_info "Required variables: SMTP_*, TWITTER_*, FACEBOOK_*, LINKEDIN_*"
    else
        print_error ".env.example file not found. Please create .env file manually."
        exit 1
    fi
else
    print_status ".env file found"
fi

# Create necessary directories
mkdir -p data logs

# Function to start services
start_services() {
    print_info "Starting RuneFlow services..."
    
    # Start the main server
    print_info "Starting main server on port 3000..."
    node automation/server.js &
    SERVER_PID=$!
    echo $SERVER_PID > data/server.pid
    
    # Wait for server to start
    sleep 3
    
    # Check if server started successfully
    if curl -s http://localhost:3000/health > /dev/null; then
        print_status "Main server started successfully (PID: $SERVER_PID)"
    else
        print_error "Failed to start main server"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
    
    # Start social media scheduler
    print_info "Starting social media scheduler..."
    node social-media-campaigns/scheduler.js &
    SCHEDULER_PID=$!
    echo $SCHEDULER_PID > data/scheduler.pid
    
    sleep 2
    
    if kill -0 $SCHEDULER_PID 2>/dev/null; then
        print_status "Social media scheduler started successfully (PID: $SCHEDULER_PID)"
    else
        print_error "Failed to start social media scheduler"
        kill $SERVER_PID 2>/dev/null || true
        exit 1
    fi
}

# Function to stop services
stop_services() {
    print_info "Stopping RuneFlow services..."
    
    # Stop scheduler
    if [ -f "data/scheduler.pid" ]; then
        SCHEDULER_PID=$(cat data/scheduler.pid)
        if kill -0 $SCHEDULER_PID 2>/dev/null; then
            kill $SCHEDULER_PID
            print_status "Social media scheduler stopped"
        fi
        rm -f data/scheduler.pid
    fi
    
    # Stop server
    if [ -f "data/server.pid" ]; then
        SERVER_PID=$(cat data/server.pid)
        if kill -0 $SERVER_PID 2>/dev/null; then
            kill $SERVER_PID
            print_status "Main server stopped"
        fi
        rm -f data/server.pid
    fi
}

# Function to check service status
check_status() {
    print_info "Checking RuneFlow service status..."
    
    # Check server
    if [ -f "data/server.pid" ]; then
        SERVER_PID=$(cat data/server.pid)
        if kill -0 $SERVER_PID 2>/dev/null; then
            print_status "Main server is running (PID: $SERVER_PID)"
            
            # Check server health
            if curl -s http://localhost:3000/health > /dev/null; then
                print_status "Server health check passed"
            else
                print_warning "Server health check failed"
            fi
        else
            print_error "Main server is not running"
        fi
    else
        print_error "Main server is not running (no PID file)"
    fi
    
    # Check scheduler
    if [ -f "data/scheduler.pid" ]; then
        SCHEDULER_PID=$(cat data/scheduler.pid)
        if kill -0 $SCHEDULER_PID 2>/dev/null; then
            print_status "Social media scheduler is running (PID: $SCHEDULER_PID)"
        else
            print_error "Social media scheduler is not running"
        fi
    else
        print_error "Social media scheduler is not running (no PID file)"
    fi
}

# Function to show logs
show_logs() {
    print_info "Recent server logs:"
    if [ -f "logs/server.log" ]; then
        tail -20 logs/server.log
    else
        print_warning "No server logs found"
    fi
    
    print_info "Recent social media logs:"
    if [ -f "data/social-media-log.json" ]; then
        tail -5 data/social-media-log.json | head -20
    else
        print_warning "No social media logs found"
    fi
}

# Function to run deployment
deploy_site() {
    PLATFORM=${1:-netlify}
    print_info "Deploying to $PLATFORM..."
    
    # Check if required environment variables are set
    case $PLATFORM in
        netlify)
            if [ -z "$NETLIFY_ACCESS_TOKEN" ] || [ -z "$NETLIFY_SITE_ID" ]; then
                print_error "Netlify deployment requires NETLIFY_ACCESS_TOKEN and NETLIFY_SITE_ID"
                exit 1
            fi
            ;;
        vercel)
            if [ -z "$VERCEL_ACCESS_TOKEN" ]; then
                print_error "Vercel deployment requires VERCEL_ACCESS_TOKEN"
                exit 1
            fi
            ;;
    esac
    
    node automation/deploy.js $PLATFORM
    
    if [ $? -eq 0 ]; then
        print_status "Deployment to $PLATFORM completed successfully"
        
        # Trigger social media announcement
        print_info "Triggering social media announcement..."
        node social-media-campaigns/social-blast.js launch_announcement
        
        print_status "🚀 RuneFlow is now live!"
    else
        print_error "Deployment to $PLATFORM failed"
        exit 1
    fi
}

# Function to show help
show_help() {
    echo "RuneFlow Coming Soon - Deployment System"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start              Start all services (server + scheduler)"
    echo "  stop               Stop all services"
    echo "  restart            Restart all services"
    echo "  status             Check service status"
    echo "  logs               Show recent logs"
    echo "  deploy [platform]  Deploy to platform (netlify, vercel, github-pages)"
    echo "  social [campaign]  Run social media campaign"
    echo "  dev                Start development server"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start           # Start all services"
    echo "  $0 deploy netlify  # Deploy to Netlify"
    echo "  $0 social launch_announcement  # Run social media blast"
    echo ""
}

# Trap to handle cleanup on exit
cleanup() {
    print_info "Cleaning up..."
    stop_services
    exit 0
}

trap cleanup INT TERM

# Parse command line arguments
case ${1:-start} in
    start)
        start_services
        print_status "🚀 RuneFlow is running!"
        print_info "Main server: http://localhost:3000 (local) | https://runeflow.xyz (production)"
        print_info "Analytics: http://localhost:3000/analytics (local) | https://runeflow.xyz/analytics (production)"
        print_info "Email export: http://localhost:3000/export-emails (local) | https://runeflow.xyz/export-emails (production)"
        print_info ""
        print_info "Press Ctrl+C to stop all services"
        
        # Keep script running
        while true; do
            sleep 10
            
            # Check if services are still running
            if [ -f "data/server.pid" ]; then
                SERVER_PID=$(cat data/server.pid)
                if ! kill -0 $SERVER_PID 2>/dev/null; then
                    print_error "Main server crashed. Restarting..."
                    start_services
                fi
            fi
        done
        ;;
    stop)
        stop_services
        print_status "All services stopped"
        ;;
    restart)
        stop_services
        sleep 2
        start_services
        print_status "All services restarted"
        ;;
    status)
        check_status
        ;;
    logs)
        show_logs
        ;;
    deploy)
        deploy_site ${2:-netlify}
        ;;
    social)
        CAMPAIGN=${2:-launch_announcement}
        print_info "Running social media campaign: $CAMPAIGN"
        node social-media-campaigns/social-blast.js $CAMPAIGN
        ;;
    dev)
        print_info "Starting development server..."
        npm run dev
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
