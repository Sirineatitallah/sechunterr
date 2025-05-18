import express from 'express';
import axios from 'axios';

const app = express();
const port = 5001; // Port for NVD connector microservice

// Set JSON response header
app.use((req, res, next) => {
  res.header('Content-Type', 'application/json');
  next();
});

// Endpoint to fetch NVD data
app.get('/nvd/data', async (req: express.Request, res: express.Response) => {
  try {
    // Example: Fetch recent vulnerabilities from NVD API
    const response = await axios.get('https://services.nvd.nist.gov/rest/json/cves/1.0/');
    const normalizedData = normalizeNvdData(response.data);
    res.json(normalizedData);
  } catch (error: any) {
    console.error('Error fetching NVD data:', error);
    res.status(500).json({ error: 'Failed to fetch NVD data' });
  }
});

// Function to normalize NVD data
function normalizeNvdData(data: any) {
  // Implement data normalization logic here
  // For example, you can remove unnecessary fields or transform data formats
  return data;
}

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`NVD Connector microservice running on port ${port}`);
});
