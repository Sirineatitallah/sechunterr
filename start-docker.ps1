# PowerShell script to start the Docker container

# Set error action preference
$ErrorActionPreference = "Stop"

# Start the container
Write-Host "Starting the Docker container..." -ForegroundColor Cyan
docker-compose -f sechunter/docker-compose.yml up -d

# Check if the container started successfully
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start the Docker container. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "Docker container started successfully." -ForegroundColor Green
Write-Host "Application is available at http://localhost:8080" -ForegroundColor Green
