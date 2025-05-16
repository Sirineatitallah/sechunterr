#!/bin/bash
# Script to build Angular app and dockerize it

# Exit on error
set -e

# Step 1: Build the Angular application
echo "Building Angular application..."
npm run build

# Get the current directory path
CURRENT_DIR=$(pwd)

# Create a directory for the Docker build
DOCKER_BUILD_DIR="${CURRENT_DIR}/docker-build"
if [ -d "$DOCKER_BUILD_DIR" ]; then
    rm -rf "$DOCKER_BUILD_DIR"
fi
mkdir -p "$DOCKER_BUILD_DIR"

# Copy the built Angular application to the Docker build directory
DIST_DIR="${CURRENT_DIR}/dist/sechunter/browser"
HTML_DIR="${DOCKER_BUILD_DIR}/html"
mkdir -p "$HTML_DIR"

# Check if the browser subdirectory exists
BROWSER_DIR="${DIST_DIR}/browser"
if [ -d "$BROWSER_DIR" ]; then
    # If browser subdirectory exists, copy from there
    cp -r "${BROWSER_DIR}/"* "$HTML_DIR/"
else
    # Otherwise, copy from the dist directory
    cp -r "${DIST_DIR}/"* "$HTML_DIR/"
fi

# Copy the nginx configuration to the Docker build directory
cp "${CURRENT_DIR}/nginx.conf" "$DOCKER_BUILD_DIR/"

# Step 2: Create a Dockerfile in the Docker build directory
cat > "${DOCKER_BUILD_DIR}/Dockerfile" << 'EOF'
# Use Nginx image
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular application
COPY html/ /usr/share/nginx/html/

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port the app runs on
EXPOSE 80

# Command to run the application
CMD ["nginx", "-g", "daemon off;"]
EOF

# Step 3: Build the Docker image
echo "Building Docker image..."
docker build -t sechunter-voc-frontend -f "${DOCKER_BUILD_DIR}/Dockerfile" "$DOCKER_BUILD_DIR"

# Step 4: Clean up Docker build directory
rm -rf "$DOCKER_BUILD_DIR"

# Step 5: Show success message
echo "Docker image built successfully. You can now run:"
echo "docker-compose up -d"
echo "Application will be available at http://localhost:8080"
