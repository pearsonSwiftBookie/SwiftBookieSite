# Swiftbookie - AI-Powered Scheduling Platform

A modern scheduling platform built with Next.js featuring an AI assistant to help manage your calendar and appointments.

## Features

- Next.js framework for optimal performance
- AI-powered scheduling assistant
- Calendar integration
- Responsive design
- API endpoints for calendar and contact management

## Getting Started

### Prerequisites

- Node.js 14.6.0 or newer
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/swiftbookie.git
   cd swiftbookie
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables:
   ```
   # API Keys and environment variables
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

### Development

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Building for Production

Build the application for production:

```bash
npm run build
# or
yarn build
```

Start the production server:

```bash
npm run start
# or
yarn start
```

## Deployment on Vercel

The easiest way to deploy this Next.js app is using [Vercel](https://vercel.com/).

1. Push your code to a Git repository (GitHub, GitLab, BitBucket)
2. Import your project to Vercel
3. Vercel will detect it's a Next.js app and use the optimal build settings
4. Your app will be deployed to a production URL

## Project Structure

```
swiftbookie/
├── pages/            # Next.js pages
│   ├── api/          # API routes
│   ├── _app.js       # Custom App component
│   └── index.js      # Homepage
├── public/           # Static assets
│   ├── css/          # CSS files
│   ├── js/           # JavaScript files
│   └── images/       # Image files
├── styles/           # Global styles
│   └── globals.css   # Global CSS
├── .env.local        # Environment variables (create this)
├── next.config.js    # Next.js configuration
└── package.json      # Project dependencies
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Security Updates

This codebase has been secured for production deployment by:

1. Removing hardcoded API keys and sensitive information
2. Creating a .env file for environment variables 
3. Setting up a secure Express server with security headers
4. Implementing a server-side proxy for API calls to OpenAI
5. Adding proper Content Security Policy headers
6. Removing unused Google Calendar integration

## Deployment Instructions

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- An OpenAI API key with access to the Assistants API

### Local Development

1. Clone the repository
2. Create a `.env` file in the root directory with the following variables:

```
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key
OPENAI_ASSISTANT_ID=your_assistant_id

# Server Configuration
PORT=3000
NODE_ENV=development
```

3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

5. Visit http://localhost:3000 in your browser

### Production Deployment

For production deployment, make sure to:

1. Set proper environment variables in your production environment
2. Never commit .env files to git repositories
3. Enable HTTPS for all traffic
4. Consider using a service like Heroku, Netlify, or Vercel for easy deployment

#### Deployment to Heroku

```bash
# Login to Heroku
heroku login

# Create a new Heroku app
heroku create swiftbookie

# Set environment variables
heroku config:set OPENAI_API_KEY=your_openai_api_key
heroku config:set OPENAI_ASSISTANT_ID=your_assistant_id
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

## Security Considerations

1. The `.env` file contains sensitive information and should never be committed to git repositories
2. The OpenAI API key is only used server-side and never exposed to the client
3. All API requests to OpenAI are proxied through the server
4. Security headers are set up to prevent common web vulnerabilities
5. Content Security Policy (CSP) is configured to restrict resource loading

## License

MIT

## OpenAI Assistant Integration

This application integrates with the OpenAI Assistants API v2 to provide intelligent, conversational responses to users. The implementation includes:

1. **Assistant Creation & Management**: 
   - Creates a custom OpenAI Assistant using GPT-4o on first load
   - Stores the assistant ID in localStorage for persistence
   - Uses existing assistant if already created
   - Compatible with the latest Assistants API v2

2. **Thread Management**: 
   - Creates and manages conversation threads using OpenAI's Thread API
   - Maintains context across messages for coherent conversations
   - Preserves thread history across page refreshes

3. **Message Handling**:
   - Sends user messages to the OpenAI API with proper metadata
   - Retrieves and displays assistant responses with typing indicators
   - Supports different message content types

4. **Error Handling & Performance**:
   - Implements exponential backoff for API polling
   - Provides graceful error handling with user-friendly messages
   - Optimizes API usage to minimize latency
   - Handles API version compatibility

## Key Features

- **AI-Powered Chat**: Natural language scheduling assistant using OpenAI's GPT-4o model
- **Calendar Integration**: Google Calendar support for viewing and booking appointments
- **Mobile-Friendly Interface**: Responsive design that works on all devices
- **Conversation History**: Persistent conversation threads that maintain context

## Security Notes

- The OpenAI API key is included directly in the JavaScript code for demonstration purposes only
- In a production environment, API requests should be routed through a secure backend service
- User data and conversation history should be handled according to privacy best practices

## Getting Started

To run the application locally:

1. Open `index.html` in your browser
2. The app will automatically create an OpenAI Assistant on first load
3. Start chatting with the AI to schedule appointments

## Technology Stack

- HTML/CSS/JavaScript (Frontend)
- OpenAI Assistants API v2 (AI conversations)
- Google Calendar API (Calendar integration)
- Local Storage API (Thread persistence) 