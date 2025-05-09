# VI Connector Service

This service acts as a connector between the frontend application and the vulnerability data API provided by your colleague.

## Features

- Proxies requests to the colleague's API
- Transforms data to match frontend expectations
- Implements caching to improve performance
- Provides rate limiting to prevent abuse
- Includes error handling and logging

## Setup

1. Create a virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python -m venv venv
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Run the service:

```bash
python vi_api.py
```

By default, the service runs on port 5002. You can change this by setting the `PORT` environment variable.

## API Endpoints

### GET /api/vi/vulnerabilities

Returns a list of vulnerabilities fetched from the colleague's API and transformed to match frontend expectations.

### GET /api/vi/health

Health check endpoint that returns the current status of the service.

## Configuration

The following configuration options are available:

- `COLLEAGUE_API_URL`: URL of the colleague's API (default: "http://192.168.252.128:5000/api/cvefeed")
- `CACHE_DURATION`: Duration in seconds for which data is cached (default: 300 seconds)
- `RATE_LIMIT`: Maximum number of requests per minute per IP (default: 10)

## Integration with Angular Frontend

To integrate this service with the Angular frontend, update the `proxy.conf.json` file to route requests to this service:

```json
{
  "/api/vi": {
    "target": "http://localhost:5002",
    "secure": false,
    "changeOrigin": true
  }
}
```
