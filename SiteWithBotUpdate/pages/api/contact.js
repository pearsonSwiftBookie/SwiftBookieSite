export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, message } = req.body;

    // Validate the request
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // In a real application, you would:
    // 1. Send an email
    // 2. Store in database
    // 3. Integrate with CRM, etc.
    
    // For now, just return success
    return res.status(200).json({ 
      message: 'Message received successfully',
      data: { name, email, message }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 