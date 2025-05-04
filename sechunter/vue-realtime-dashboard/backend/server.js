const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const SECRET_KEY = 'your_secret_key'; // Use env variable in production

app.use(cors());
app.use(bodyParser.json());

// Simple user store for demo
const users = [
  { id: 1, username: 'admin', password: 'adminpass', role: 'admin' },
  { id: 2, username: 'user', password: 'userpass', role: 'user' },
  { id: 3, username: 'adminadmin', password: 'Admin1!/', role: 'admin' }
];

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

function generateRandomVulnerabilityData() {
  return {
    vulnerabilityScore: Math.floor(Math.random() * 100),
    timestamp: new Date().toISOString()
  };
}

function generateRandomTopVulnerabilities() {
  const severities = ['Low', 'Medium', 'High', 'Critical'];
  const topVulns = [];
  for (let i = 1; i <= 5; i++) {
    topVulns.push({
      id: i,
      name: `Vulnerability ${i}`,
      severity: severities[Math.floor(Math.random() * severities.length)]
    });
  }
  return { topVulnerabilities: topVulns };
}

// Verify JWT token from query param for WebSocket connection
function verifyClient(info, callback) {
  const url = new URL(info.req.url, `http://${info.req.headers.host}`);
  const token = url.searchParams.get('token');
  if (!token) {
    return callback(false, 401, 'Unauthorized');
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return callback(false, 401, 'Unauthorized');
    }
    info.req.user = decoded;
    callback(true);
  });
}

wss.on('connection', function connection(ws, req) {
  console.log('Client connected:', req.user.username);

  const url = req.url.split('?')[0];

  let sendDataInterval;

  if (url === '/ws/vulnerabilities') {
    sendDataInterval = setInterval(() => {
      const data = generateRandomVulnerabilityData();
      ws.send(JSON.stringify(data));
    }, 2000);
  } else if (url === '/ws/top-vulnerabilities') {
    sendDataInterval = setInterval(() => {
      const data = generateRandomTopVulnerabilities();
      ws.send(JSON.stringify(data));
    }, 3000);
  } else {
    sendDataInterval = setInterval(() => {
      const data = generateRandomVulnerabilityData();
      ws.send(JSON.stringify(data));
    }, 2000);
  }

  ws.on('close', () => {
    console.log('Client disconnected:', req.user.username);
    clearInterval(sendDataInterval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

wss.options.verifyClient = verifyClient;

server.listen(8080, () => {
  console.log('Server started on http://localhost:8080');
});
