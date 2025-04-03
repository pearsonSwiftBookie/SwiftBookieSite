require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Configure security headers
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control which features can be used in the browser
  res.setHeader('Feature-Policy', "camera 'none'; microphone 'none'; geolocation 'none'");
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://link.msgsndr.com 'unsafe-inline'; connect-src 'self' https://api.openai.com https://api.leadconnectorhq.com; style-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline'; img-src 'self' data:; frame-src https://api.leadconnectorhq.com;"
  );
  
  // Strict Transport Security
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  
  next();
});

// API endpoint to provide environment variables securely to the client
app.get('/api/config', (req, res) => {
  // Only provide what the client needs, never the entire environment
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

// All other routes serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

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