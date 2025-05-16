#!/bin/bash
# Script to stop the Docker container

# Exit on error
set -e

# Stop the container
echo "Stopping the Docker container..."
docker-compose -f sechunter/docker-compose.yml down

# Show success message
echo "Docker container stopped successfully."
