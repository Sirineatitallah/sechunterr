# Real-Time Vulnerability Dashboard

## Overview
This project is a real-time vulnerability dashboard built with Vue.js frontend and a Node.js backend WebSocket server. It visualizes vulnerability data using WebSocket streams for live updates.

---

## Running the Backend WebSocket Server

1. Navigate to the backend directory:
```
cd vue-realtime-dashboard/backend
```

2. Install dependencies (if not done):
```
npm install
```

3. Start the backend server:
```
node server.js
```

The backend WebSocket server will start on `ws://localhost:8080` and stream simulated vulnerability data.

---

## Running the Frontend Vue.js Application

1. Open a new terminal and navigate to the frontend directory:
```
cd vue-realtime-dashboard
```

2. Install dependencies (if not done):
```
npm install
```

3. Start the Vue.js development server:
```
npm run serve
```

The frontend app will start, usually accessible at `http://localhost:8081`.

---

## Testing the Application

1. Open the frontend URL (e.g., `http://localhost:8081`) in your web browser.

2. Use the login component to authenticate (use test credentials if provided).

3. After login, the dashboard will display:
   - Real-time vulnerability score chart.
   - Real-time top vulnerabilities list.

4. Verify that the data updates live every few seconds.

5. Check browser console and backend terminal for any errors.

---

## Next Steps

- Extend the dashboard with additional widgets or data sources.
- Enhance security with HTTPS, environment variables, and improved authentication.
- Add unit and integration tests for frontend and backend.
- Prepare deployment scripts and instructions for production.

---

If you encounter any issues or need assistance, please reach out.
