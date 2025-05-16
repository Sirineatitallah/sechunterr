# PowerShell script to manage Docker operations for the VOC Security Project

param (
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "build", "logs", "status")]
    [string]$Action
)

$ErrorActionPreference = "Stop"

# Define the docker-compose file path
$DockerComposePath = "docker-compose.yml"

# Function to check if Docker is running
function Test-DockerRunning {
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
            exit 1
        }
    }
    catch {
        Write-Host "Docker is not installed or not running. Please install Docker Desktop and try again." -ForegroundColor Red
        exit 1
    }
}

# Check if Docker is running
Test-DockerRunning

# Perform the requested action
switch ($Action) {
    "start" {
        Write-Host "Starting VOC Security Project containers..." -ForegroundColor Cyan
        docker-compose -f $DockerComposePath up -d
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Containers started successfully. Access the application at http://localhost:8080" -ForegroundColor Green
        }
    }
    "stop" {
        Write-Host "Stopping VOC Security Project containers..." -ForegroundColor Cyan
        docker-compose -f $DockerComposePath down
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Containers stopped successfully." -ForegroundColor Green
        }
    }
    "restart" {
        Write-Host "Restarting VOC Security Project containers..." -ForegroundColor Cyan
        docker-compose -f $DockerComposePath down
        docker-compose -f $DockerComposePath up -d
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Containers restarted successfully. Access the application at http://localhost:8080" -ForegroundColor Green
        }
    }
    "build" {
        Write-Host "Building VOC Security Project containers..." -ForegroundColor Cyan
        docker-compose -f $DockerComposePath build
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Containers built successfully." -ForegroundColor Green
        }
    }
    "logs" {
        Write-Host "Showing logs for VOC Security Project containers..." -ForegroundColor Cyan
        docker-compose -f $DockerComposePath logs -f
    }
    "status" {
        Write-Host "Checking status of VOC Security Project containers..." -ForegroundColor Cyan
        docker-compose -f $DockerComposePath ps
    }
}
