# PowerShell script to build and run Docker container

# Set error action preference
$ErrorActionPreference = "Stop"

# Step 1: Build the Angular application
Write-Host "Building Angular application..." -ForegroundColor Cyan
npm run build

# Check if build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Angular build failed. Exiting." -ForegroundColor Red
    exit 1
}

# Step 2: Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t sechunter-voc-frontend -f Dockerfile.simple .

# Check if Docker build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed. Exiting." -ForegroundColor Red
    exit 1
}

# Step 3: Stop any running container
Write-Host "Stopping any running container..." -ForegroundColor Cyan
docker stop voc-frontend 2>$null
docker rm voc-frontend 2>$null

# Step 4: Run the container
Write-Host "Starting the container..." -ForegroundColor Cyan
docker run -d --name voc-frontend -p 8080:80 sechunter-voc-frontend

# Check if container started successfully
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start the container. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "Container started successfully." -ForegroundColor Green
Write-Host "Application is available at http://localhost:8080" -ForegroundColor Green
