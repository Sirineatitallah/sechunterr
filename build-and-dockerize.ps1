# PowerShell script to build Angular app and dockerize it from the root directory

# Set error action preference
$ErrorActionPreference = "Stop"

# Change to the sechunter directory
Set-Location -Path ".\sechunter"

# Step 1: Build the Angular application
Write-Host "Building Angular application..." -ForegroundColor Cyan
npm run build

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Angular build failed. Exiting." -ForegroundColor Red
    exit 1
}

# Step 2: Create a temporary Dockerfile for serving the built application
$dockerfileContent = @"
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
"@

# Write the Dockerfile
$dockerfileContent | Out-File -FilePath "Dockerfile.temp" -Encoding utf8

# Step 3: Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t sechunter-voc-frontend -f Dockerfile.temp .

# Check if Docker build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed. Exiting." -ForegroundColor Red
    exit 1
}

# Step 4: Clean up temporary Dockerfile
Remove-Item -Path "Dockerfile.temp"

# Step 5: Update docker-compose.yml
Write-Host "Docker image built successfully. You can now run:" -ForegroundColor Green
Write-Host "docker-compose -f sechunter/docker-compose.yml up -d" -ForegroundColor Yellow

Write-Host "Application will be available at http://localhost:8080" -ForegroundColor Green

# Return to the original directory
Set-Location -Path ".."
