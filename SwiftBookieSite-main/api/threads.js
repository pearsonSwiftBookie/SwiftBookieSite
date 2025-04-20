// Vercel Serverless Function to handle GET requests to OpenAI
const axios = require('axios');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET method for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract the path parameters
    const { threadId, runId, messageId } = req.query;
    let apiPath = '';
    
    // Get API key from environment variables
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Construct the appropriate API path based on the provided parameters
    if (threadId && runId) {
      apiPath = `threads/${threadId}/runs/${runId}`;
    } else if (threadId && !runId && !messageId) {
      apiPath = `threads/${threadId}/messages`;
    } else {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    // Forward the request to OpenAI
    const response = await axios.get(`https://api.openai.com/v1/${apiPath}`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2'
      }
    });

    // Return the OpenAI response
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('API proxy error:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({
      error: error.response?.data || 'An error occurred while processing your request'
    });
  }
}; 