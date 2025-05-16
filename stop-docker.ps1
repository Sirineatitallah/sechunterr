# PowerShell script to stop the Docker container

# Set error action preference
$ErrorActionPreference = "Stop"

# Stop the container
Write-Host "Stopping the Docker container..." -ForegroundColor Cyan
docker-compose -f sechunter/docker-compose.yml down

# Check if the container stopped successfully
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to stop the Docker container. Exiting." -ForegroundColor Red
    exit 1
}

Write-Host "Docker container stopped successfully." -ForegroundColor Green
