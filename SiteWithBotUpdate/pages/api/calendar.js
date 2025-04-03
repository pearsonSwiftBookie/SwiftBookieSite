export default function handler(req, res) {
  if (req.method === 'GET') {
    // Handle GET request (retrieve calendar data)
    return res.status(200).json({ 
      message: 'Calendar data retrieved successfully',
      data: [
        {
          id: 1,
          title: 'Team Meeting',
          start: '2023-09-15T10:00:00',
          end: '2023-09-15T11:00:00'
        },
        {
          id: 2,
          title: 'Client Call',
          start: '2023-09-16T14:00:00',
          end: '2023-09-16T15:00:00'
        }
      ]
    });
  } else if (req.method === 'POST') {
    // Handle POST request (create calendar event)
    const { title, start, end } = req.body;
    
    // In a real application, you would save this to a database
    return res.status(201).json({ 
      message: 'Event created successfully',
      event: { id: Math.floor(Math.random() * 1000), title, start, end }
    });
  } else {
    // Handle other HTTP methods
    return res.status(405).json({ message: 'Method not allowed' });
  }
} 