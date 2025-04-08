// Vercel Serverless Function to proxy OpenAI API requests
// This keeps your API key secure on the server side

// Import required modules (will be automatically installed by Vercel)
const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers to allow requests from your domain
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST method for API calls
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { endpoint, data } = req.body;
    
    // Make sure we have all required data
    if (!endpoint) {
      return res.status(400).json({ error: 'Missing endpoint parameter' });
    }

    // Get API key from environment variables
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Construct the full OpenAI API URL
    const apiUrl = `https://api.openai.com/v1/${endpoint}`;

    // Forward the request to OpenAI with your secure API key
    const response = await axios({
      method: 'post',
      url: apiUrl,
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      },
      data: data
    });

    // Return the OpenAI response to the client
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('API proxy error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || 'An error occurred while processing your request'
    });
  }
}; 