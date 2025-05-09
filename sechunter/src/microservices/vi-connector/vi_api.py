from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import logging
import json
from datetime import datetime, timedelta
import os
from functools import wraps
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('vi-connector')

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
COLLEAGUE_API_URL = "http://192.168.252.128:5000/api/cvefeed"
CACHE_DURATION = 300  # Cache duration in seconds (5 minutes)

# Simple in-memory cache
cache = {
    "data": None,
    "timestamp": None
}

# Rate limiting configuration
RATE_LIMIT = 10  # requests per minute
rate_limit_data = {}

# Middleware for rate limiting
def rate_limit(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Get client IP
        client_ip = request.remote_addr
        current_time = time.time()
        
        # Initialize rate limit data for this IP if not exists
        if client_ip not in rate_limit_data:
            rate_limit_data[client_ip] = []
        
        # Clean up old requests (older than 1 minute)
        rate_limit_data[client_ip] = [t for t in rate_limit_data[client_ip] 
                                     if current_time - t < 60]
        
        # Check if rate limit exceeded
        if len(rate_limit_data[client_ip]) >= RATE_LIMIT:
            logger.warning(f"Rate limit exceeded for IP: {client_ip}")
            return jsonify({"error": "Rate limit exceeded. Please try again later."}), 429
        
        # Add current request timestamp
        rate_limit_data[client_ip].append(current_time)
        
        return f(*args, **kwargs)
    return decorated_function

# Helper function to fetch data from colleague's API
def fetch_vulnerability_data():
    try:
        logger.info(f"Fetching vulnerability data from {COLLEAGUE_API_URL}")
        response = requests.get(COLLEAGUE_API_URL, timeout=10)
        response.raise_for_status()  # Raise exception for HTTP errors
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching vulnerability data: {str(e)}")
        return None

# Helper function to transform data to match frontend expectations
def transform_vulnerability_data(data):
    if not data:
        return []
    
    transformed_data = []
    
    for item in data:
        try:
            # Map fields from the colleague's API to our expected format
            transformed_item = {
                "id": item.get("id", ""),
                "cve": item.get("cve_id", ""),
                "title": item.get("title", "Unknown Vulnerability"),
                "description": item.get("description", ""),
                "severity": map_severity(item.get("severity", ""), item.get("cvss", 0)),
                "cvss": float(item.get("cvss", 0)),
                "status": item.get("status", "open"),
                "affectedSystems": item.get("affected_systems", []),
                "discoveryDate": item.get("published_date", datetime.now().isoformat())
            }
            transformed_data.append(transformed_item)
        except Exception as e:
            logger.error(f"Error transforming vulnerability item: {str(e)}")
            continue
    
    return transformed_data

# Helper function to map severity based on CVSS score
def map_severity(severity_str, cvss_score):
    if severity_str and severity_str.lower() in ["critical", "high", "medium", "low"]:
        return severity_str.lower()
    
    # Map based on CVSS score if severity string is not available
    try:
        cvss = float(cvss_score)
        if cvss >= 9.0:
            return "critical"
        elif cvss >= 7.0:
            return "high"
        elif cvss >= 4.0:
            return "medium"
        else:
            return "low"
    except (ValueError, TypeError):
        return "medium"  # Default to medium if mapping fails

# API endpoint to get all vulnerabilities
@app.route('/api/vi/vulnerabilities', methods=['GET'])
@rate_limit
def get_vulnerabilities():
    global cache
    current_time = datetime.now()
    
    # Check if we have cached data that's still valid
    if cache["data"] and cache["timestamp"]:
        cache_age = (current_time - cache["timestamp"]).total_seconds()
        if cache_age < CACHE_DURATION:
            logger.info(f"Returning cached vulnerability data (age: {cache_age:.2f}s)")
            return jsonify(cache["data"])
    
    # Fetch fresh data
    raw_data = fetch_vulnerability_data()
    if raw_data is None:
        # If fetch failed but we have stale cache, return that with a warning
        if cache["data"]:
            logger.warning("Fetch failed, returning stale cached data")
            return jsonify(cache["data"])
        return jsonify({"error": "Failed to fetch vulnerability data"}), 500
    
    # Transform the data
    transformed_data = transform_vulnerability_data(raw_data)
    
    # Update cache
    cache["data"] = transformed_data
    cache["timestamp"] = current_time
    
    return jsonify(transformed_data)

# Health check endpoint
@app.route('/api/vi/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "vi-connector"
    })

# Main entry point
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5002))  # Default to port 5002
    app.run(host='0.0.0.0', port=port, debug=False)
