from flask import Flask, jsonify
from flask_cors import CORS
import datetime
import random

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Generate mock vulnerability data
def generate_mock_vulnerabilities(count=50):
    vulnerabilities = []
    
    # CVE IDs for realism
    cve_ids = [
        "CVE-2023-1234", "CVE-2023-5678", "CVE-2022-9876", "CVE-2022-5432",
        "CVE-2023-8765", "CVE-2021-4321", "CVE-2022-1111", "CVE-2023-2222",
        "CVE-2021-3333", "CVE-2022-4444", "CVE-2023-5555", "CVE-2021-6666",
        "CVE-2022-7777", "CVE-2023-8888", "CVE-2021-9999", "CVE-2023-0000"
    ]
    
    # Vulnerability names
    vuln_names = [
        "Remote Code Execution in Apache Log4j", 
        "SQL Injection in WordPress Plugin",
        "Cross-Site Scripting in jQuery",
        "Buffer Overflow in OpenSSL",
        "Authentication Bypass in Spring Boot",
        "Command Injection in PHP Application",
        "Privilege Escalation in Linux Kernel",
        "Information Disclosure in Microsoft Exchange",
        "Denial of Service in Nginx",
        "Path Traversal in Node.js",
        "Insecure Deserialization in Java Application",
        "Memory Corruption in Chrome Browser",
        "Server-Side Request Forgery in AWS SDK",
        "XML External Entity in Python XML Parser",
        "Broken Authentication in OAuth Implementation",
        "Insecure Direct Object References in API"
    ]
    
    # Host IPs
    host_ips = [
        "192.168.1.10", "192.168.1.20", "192.168.1.30", "192.168.1.40",
        "192.168.1.50", "192.168.1.60", "192.168.1.70", "192.168.1.80",
        "10.0.0.1", "10.0.0.2", "10.0.0.3", "10.0.0.4",
        "172.16.0.1", "172.16.0.2", "172.16.0.3", "172.16.0.4"
    ]
    
    # Severity levels with weights
    severity_levels = {
        "Critical": 0.2,
        "High": 0.3,
        "Medium": 0.35,
        "Low": 0.15
    }
    
    # Generate vulnerabilities
    for i in range(count):
        # Determine severity
        severity = random.choices(
            list(severity_levels.keys()),
            weights=list(severity_levels.values()),
            k=1
        )[0]
        
        # Determine CVSS score based on severity
        cvss_ranges = {
            "Critical": (9.0, 10.0),
            "High": (7.0, 8.9),
            "Medium": (4.0, 6.9),
            "Low": (0.1, 3.9)
        }
        cvss_range = cvss_ranges[severity]
        cvss_score = round(random.uniform(cvss_range[0], cvss_range[1]), 1)
        
        # Generate random date within the last 90 days
        days_ago = random.randint(0, 90)
        discovered_date = (datetime.datetime.now() - datetime.timedelta(days=days_ago)).isoformat()
        
        # Randomly select CVE IDs (1-3)
        num_cves = random.randint(1, 3)
        selected_cves = random.sample(cve_ids, num_cves)
        
        # Randomly determine if exploit is available (more likely for critical/high)
        exploit_available = random.random() < (0.8 if severity in ["Critical", "High"] else 0.3)
        
        # Randomly determine if patch is available
        patch_available = random.random() < 0.7
        
        # Create vulnerability object
        vulnerability = {
            "id": f"vuln-{i+1}",
            "vulnerabilityName": random.choice(vuln_names),
            "cvssScore": cvss_score,
            "severity": severity,
            "discoveredDate": discovered_date,
            "cve_ids": selected_cves,
            "remediation": f"Apply patch {selected_cves[0]}-fix" if patch_available else None,
            "host_ip": random.choice(host_ips),
            "description": f"This vulnerability allows attackers to {random.choice(['execute arbitrary code', 'gain unauthorized access', 'steal sensitive data', 'cause denial of service', 'escalate privileges'])} on affected systems.",
            "status": random.choice(["open", "in-progress", "resolved", "open", "open"]),  # Bias towards open
            "exploitAvailable": exploit_available,
            "patchAvailable": patch_available,
            "affectedAsset": random.choice(["Web Server", "Database", "Application Server", "Load Balancer", "Firewall", "API Gateway", "Storage Server"]),
            "epss": round(random.random(), 2)  # Exploit Probability Scoring System (0-1)
        }
        
        vulnerabilities.append(vulnerability)
    
    return vulnerabilities

# Route to provide vulnerability data
@app.route('/vulnerabilities/vuljson/', methods=['GET'])
def get_vulnerabilities():
    vulnerabilities = generate_mock_vulnerabilities(50)
    return jsonify({"vulnerabilities": vulnerabilities})

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
