# PowerShell script to build Angular app and dockerize it

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

# Get the current directory path
$currentDir = Get-Location

# Create a directory for the Docker build
$dockerBuildDir = Join-Path $currentDir "docker-build"
if (Test-Path $dockerBuildDir) {
    Remove-Item -Path $dockerBuildDir -Recurse -Force
}
New-Item -Path $dockerBuildDir -ItemType Directory | Out-Null

# Copy the built Angular application to the Docker build directory
$distDir = Join-Path $currentDir "dist\sechunter\browser"
$htmlDir = Join-Path $dockerBuildDir "html"
New-Item -Path $htmlDir -ItemType Directory | Out-Null

# Check if the browser subdirectory exists
$browserDir = Join-Path $distDir "browser"
if (Test-Path $browserDir) {
    # If browser subdirectory exists, copy from there
    Copy-Item -Path "$browserDir\*" -Destination $htmlDir -Recurse
} else {
    # Otherwise, copy from the dist directory
    Copy-Item -Path "$distDir\*" -Destination $htmlDir -Recurse
}

# Copy the nginx configuration to the Docker build directory
Copy-Item -Path (Join-Path $currentDir "nginx.conf") -Destination $dockerBuildDir

# Step 2: Create a Dockerfile in the Docker build directory
$dockerfileContent = @"
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
"@

# Write the Dockerfile
$dockerfileContent | Out-File -FilePath (Join-Path $dockerBuildDir "Dockerfile") -Encoding utf8

# Step 3: Build the Docker image
Write-Host "Building Docker image..." -ForegroundColor Cyan
docker build -t sechunter-voc-frontend -f (Join-Path $dockerBuildDir "Dockerfile") $dockerBuildDir

# Check if Docker build was successful
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker build failed. Exiting." -ForegroundColor Red
    exit 1
}

# Step 4: Clean up Docker build directory
Remove-Item -Path $dockerBuildDir -Recurse -Force

# Step 5: Update docker-compose.yml
Write-Host "Docker image built successfully. You can now run:" -ForegroundColor Green
Write-Host "docker-compose up -d" -ForegroundColor Yellow

Write-Host "Application will be available at http://localhost:8080" -ForegroundColor Green
