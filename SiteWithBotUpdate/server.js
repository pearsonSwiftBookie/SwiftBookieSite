require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Configure security headers
app.use((req, res, next) => {
  // Basic security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// API endpoint to provide environment variables securely to the client
app.get('/api/config', (req, res) => {
  res.json({
    openai: {
      assistantId: process.env.OPENAI_ASSISTANT_ID || ''
    }
  });
});

// Handle API requests that need the API key (server side only)
app.post('/api/openai/threads', async (req, res) => {
  try {
    const response = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error creating thread:', error);
    res.status(500).json({ error: 'Failed to create thread' });
  }
});

// Serve index.html for the root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve founders.html
app.get('/founders.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'founders.html'));
});

// Handle all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app;

// Log startup message but don't expose sensitive info
console.log(`
===========================================
Swiftbookie Server Started
===========================================
- Environment: ${process.env.NODE_ENV || 'development'}
- Port: ${PORT}
- OpenAI Assistant ID configured: ${process.env.OPENAI_ASSISTANT_ID ? 'Yes' : 'No'}
- OpenAI API Key configured: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}
===========================================
`); 