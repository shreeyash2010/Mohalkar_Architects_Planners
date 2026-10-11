const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enquiry API endpoint
const enquiryHandler = require('./api/send-enquiry');
app.post('/api/send-enquiry', (req, res) => {
  return enquiryHandler(req, res);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Serve static assets with automatic .html extension resolution
app.use(express.static(__dirname, { extensions: ['html'] }));

// Fallback for html requests or unmatched routes
app.use((req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.status(404).send('Not Found');
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
