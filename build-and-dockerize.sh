#!/bin/bash
# Script to build Angular app and dockerize it from the root directory

# Exit on error
set -e

# Change to the sechunter directory
cd ./sechunter

# Step 1: Build the Angular application
echo "Building Angular application..."
npm run build

# Step 2: Create a temporary Dockerfile for serving the built application
cat > Dockerfile.temp << 'EOF'
# Use Nginx image
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular application
COPY dist/sechunter/browser/ /usr/share/nginx/html/

# Copy nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose the port the app runs on
EXPOSE 80

# Command to run the application
CMD ["nginx", "-g", "daemon off;"]
EOF

# Step 3: Build the Docker image
echo "Building Docker image..."
docker build -t sechunter-voc-frontend -f Dockerfile.temp .

# Step 4: Clean up temporary Dockerfile
rm Dockerfile.temp

# Step 5: Show success message
echo "Docker image built successfully. You can now run:"
echo "docker-compose -f sechunter/docker-compose.yml up -d"
echo "Application will be available at http://localhost:8080"

# Return to the original directory
cd ..
