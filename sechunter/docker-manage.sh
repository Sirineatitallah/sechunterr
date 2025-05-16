#!/bin/bash
# Bash script to manage Docker operations for the VOC Security Project

# Check if an action parameter was provided
if [ $# -eq 0 ]; then
    echo "Error: No action specified."
    echo "Usage: $0 [start|stop|restart|build|logs|status]"
    exit 1
fi

# Define the docker-compose file path
DOCKER_COMPOSE_PATH="docker-compose.yml"

# Function to check if Docker is running
check_docker_running() {
    if ! docker info > /dev/null 2>&1; then
        echo "Error: Docker is not running. Please start Docker and try again."
        exit 1
    fi
}

# Check if Docker is running
check_docker_running

# Perform the requested action
case "$1" in
    start)
        echo "Starting VOC Security Project containers..."
        docker-compose -f $DOCKER_COMPOSE_PATH up -d
        if [ $? -eq 0 ]; then
            echo "Containers started successfully. Access the application at http://localhost:8080"
        fi
        ;;
    stop)
        echo "Stopping VOC Security Project containers..."
        docker-compose -f $DOCKER_COMPOSE_PATH down
        if [ $? -eq 0 ]; then
            echo "Containers stopped successfully."
        fi
        ;;
    restart)
        echo "Restarting VOC Security Project containers..."
        docker-compose -f $DOCKER_COMPOSE_PATH down
        docker-compose -f $DOCKER_COMPOSE_PATH up -d
        if [ $? -eq 0 ]; then
            echo "Containers restarted successfully. Access the application at http://localhost:8080"
        fi
        ;;
    build)
        echo "Building VOC Security Project containers..."
        docker-compose -f $DOCKER_COMPOSE_PATH build
        if [ $? -eq 0 ]; then
            echo "Containers built successfully."
        fi
        ;;
    logs)
        echo "Showing logs for VOC Security Project containers..."
        docker-compose -f $DOCKER_COMPOSE_PATH logs -f
        ;;
    status)
        echo "Checking status of VOC Security Project containers..."
        docker-compose -f $DOCKER_COMPOSE_PATH ps
        ;;
    *)
        echo "Error: Invalid action '$1'."
        echo "Usage: $0 [start|stop|restart|build|logs|status]"
        exit 1
        ;;
esac
