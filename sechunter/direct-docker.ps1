# PowerShell script to build and run Docker container directly

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

# Step 2: Create a temporary directory for Docker build
$currentDir = Get-Location
$tempDir = Join-Path $currentDir "temp-docker"
if (Test-Path $tempDir) {
    Remove-Item -Path $tempDir -Recurse -Force
}
New-Item -Path $tempDir -ItemType Directory | Out-Null

# Step 3: Copy the Angular files to the temporary directory
$sourceDir = Join-Path $currentDir "dist\sechunter\browser\browser"
$htmlDir = Join-Path $tempDir "html"
New-Item -Path $htmlDir -ItemType Directory | Out-Null
Copy-Item -Path "$sourceDir\*" -Destination $htmlDir -Recurse

# Step 4: Copy the nginx configuration to the temporary directory
Copy-Item -Path (Join-Path $currentDir "nginx.conf") -Destination $tempDir

# Step 5: Create a Dockerfile in the temporary directory
$dockerfileContent = @"
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
"@

# Write the Dockerfile
$dockerfileContent | Out-File -FilePath (Join-Path $tempDir "Dockerfile") -Encoding utf8

# Step 6: Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t sechunter-voc-frontend -f (Join-Path $tempDir "Dockerfile") $tempDir

# Check if Docker build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed. Exiting." -ForegroundColor Red
    exit 1
}

# Step 7: Clean up temporary directory
Remove-Item -Path $tempDir -Recurse -Force

# Step 8: Stop any running container
Write-Host "Stopping any running container..." -ForegroundColor Cyan
docker stop voc-frontend 2>$null
docker rm voc-frontend 2>$null

# Step 9: Run the container
Write-Host "Starting the container..." -ForegroundColor Cyan
docker run -d --name voc-frontend -p 8080:80 sechunter-voc-frontend

# Check if container started successfully
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start the container. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "Container started successfully." -ForegroundColor Green
Write-Host "Application is available at http://localhost:8080" -ForegroundColor Green
