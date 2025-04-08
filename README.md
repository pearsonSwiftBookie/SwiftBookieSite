# Swiftbookie AI

Swiftbookie is an AI-powered scheduling platform that makes booking appointments effortless. The integrated AI assistant helps users find the perfect time slots and answers scheduling questions.

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

## Deployment Instructions for Vercel

### Prerequisites

- A Vercel account (create one at https://vercel.com if you don't have one)
- An OpenAI API key

### Steps to Deploy

1. Push this repository to GitHub

2. Connect Vercel to your GitHub repository:
   - Go to Vercel dashboard
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

3. Configure the project:
   - Project Name: `swiftbookie` (or your preferred name)
   - Framework Preset: leave as "Other"
   - Root Directory: leave as `.`
   - Build and Output Settings: leave as default

4. Add Environment Variables:
   - Click "Environment Variables" section
   - Add the following:
     - Name: `OPENAI_API_KEY`
     - Value: Your OpenAI API key (begins with 'sk-')
   - Click "Add"

5. Click "Deploy"

### After Deployment

- Your site will be available at https://your-project-name.vercel.app
- The OpenAI API key is securely stored as an environment variable
- All API calls to OpenAI will be proxied through secure serverless functions

## Local Development

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your-api-key-here
   ```

3. Start the local server:
   ```
   npm start
   ```

4. Open http://localhost:8000 in your browser

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