#!/bin/bash
# Script to start the Docker container

# Exit on error
set -e

# Start the container
echo "Starting the Docker container..."
docker-compose -f sechunter/docker-compose.yml up -d

# Show success message
echo "Docker container started successfully."
echo "Application is available at http://localhost:8080"
