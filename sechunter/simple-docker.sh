#!/bin/bash
# Script to build and run Docker container

# Exit on error
set -e

# Step 1: Build the Angular application
echo "Building Angular application..."
npm run build

# Step 2: Build the Docker image
echo "Building Docker image..."
docker build -t sechunter-voc-frontend -f Dockerfile.simple .

# Step 3: Stop any running container
echo "Stopping any running container..."
docker stop voc-frontend 2>/dev/null || true
docker rm voc-frontend 2>/dev/null || true

# Step 4: Run the container
echo "Starting the container..."
docker run -d --name voc-frontend -p 8080:80 sechunter-voc-frontend

echo "Container started successfully."
echo "Application is available at http://localhost:8080"
