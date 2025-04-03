// OpenAI Assistant Configuration
let currentThreadId = null;

// Initialize OpenAI Assistant
async function initializeOpenAIAssistant() {
    try {
        // Use the existing assistant instead of creating a new one
        const assistantId = window.appConfig.getOpenAIAssistantId();
        console.log('Using existing Swiftbookie Assistant ID:', assistantId);
        
        // Create a new thread for this conversation
        createNewThread();
    } catch (error) {
        console.error('Error initializing OpenAI assistant:', error.response?.data || error.message);
        addMessage('Sorry, there was an error connecting to the AI assistant. Please try again later.', 'assistant');
    }
}

// Create a new conversation thread
async function createNewThread() {
    try {
        // In production, use the server proxy
        let threadData;
        
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            // Use server proxy in production
            threadData = await window.appConfig.serverAPI.createThread();
        } else {
            // In development, can use direct API call if configured
            const apiKey = window.appConfig.getOpenAIApiKey ? window.appConfig.getOpenAIApiKey() : null;
            
            if (!apiKey) {
                throw new Error('API key not configured');
            }
            
            const response = await axios.post('https://api.openai.com/v1/threads', {}, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                }
            });
            
            threadData = response.data;
        }
        
        currentThreadId = threadData.id;
        console.log('New thread created:', currentThreadId);
        
        // Store the thread ID in local storage to maintain conversation across page refreshes
        localStorage.setItem('swiftbookieThreadId', currentThreadId);
        
        // Send initial welcome message
        const welcomeMessage = "Hello! I'm your Swiftbookie AI assistant. How can I help you today with scheduling or appointment questions?";
        addMessage(welcomeMessage, 'assistant');
    } catch (error) {
        console.error('Error creating thread:', error.response?.data || error.message);
        addMessage('Sorry, there was an error starting our conversation. Please try refreshing the page.', 'assistant');
    }
}

// Send a message to the OpenAI assistant
async function sendMessageToAssistant(message) {
    try {
        if (!currentThreadId) {
            // Retrieve thread ID from local storage or create a new one
            currentThreadId = localStorage.getItem('swiftbookieThreadId');
            if (!currentThreadId) {
                await createNewThread();
                await addMessageToThread(message);
                return;
            }
        }
        
        await addMessageToThread(message);
        
    } catch (error) {
        console.error('Error sending message to assistant:', error.response?.data || error.message);
        addMessage('Sorry, there was an error communicating with the AI assistant. Please try again.', 'assistant');
    }
}

// Add a message to the thread and run the assistant
async function addMessageToThread(message) {
    try {
        const apiKey = window.appConfig.getOpenAIApiKey();
        const assistantId = window.appConfig.getOpenAIAssistantId();
        
        // Add the user message to the thread
        await axios.post(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
            role: "user",
            content: message
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });
        
        // Run the assistant to generate a response using the specific assistant ID
        const runResponse = await axios.post(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
            assistant_id: assistantId,
            instructions: "Please help the user with scheduling and booking appointments. If the user has selected a date/time, acknowledge it in your response."
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });
        
        // Poll for the response
        await pollForResponse(runResponse.data.id);
    } catch (error) {
        console.error('Error in thread communication:', error.response?.data || error.message);
        throw error; // Let the parent function handle this
    }
}

// Poll for the assistant's response
async function pollForResponse(runId) {
    try {
        const apiKey = window.appConfig.getOpenAIApiKey();
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        document.querySelector('.ai-messages').appendChild(typingIndicator);
        
        let response;
        let attempts = 0;
        let status = 'queued';
        let delay = 1000; // Start with 1 second delay
        
        // Poll until the run is completed or fails
        while (['queued', 'in_progress', 'requires_action'].includes(status)) {
            // Maximum number of attempts to prevent infinite loops
            if (attempts >= 30) {
                console.error('Polling timeout after 30 attempts');
                typingIndicator.remove();
                addMessage('Sorry, it\'s taking longer than expected to get a response. Please try again.', 'assistant');
                return;
            }
            
            // Wait with exponential backoff before polling again
            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(delay * 1.5, 5000); // Increase delay with each attempt, max 5 seconds
            
            // Get the run status
            response = await axios.get(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                }
            });
            
            status = response.data.status;
            attempts++;
            
            if (status === 'completed') {
                // Get the messages from the thread
                const messagesResponse = await axios.get(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'OpenAI-Beta': 'assistants=v2'
                    }
                });
                
                // Get the latest assistant message
                const assistantMessages = messagesResponse.data.data.filter(msg => msg.role === 'assistant');
                if (assistantMessages.length > 0) {
                    const latestMessage = assistantMessages[0];
                    typingIndicator.remove();
                    
                    // Handle different content types in the response
                    if (latestMessage.content && latestMessage.content.length > 0) {
                        const textContent = latestMessage.content
                            .filter(item => item.type === 'text')
                            .map(item => item.text.value)
                            .join('\n\n');
                        
                        if (textContent) {
                            addMessage(textContent, 'assistant');
                        }
                    }
                }
            } else if (status === 'failed' || status === 'cancelled' || status === 'expired') {
                console.error('Run failed with status:', status, response.data);
                typingIndicator.remove();
                addMessage('Sorry, there was an error processing your request. Please try again.', 'assistant');
            }
        }
    } catch (error) {
        console.error('Error polling for response:', error.response?.data || error.message);
        document.querySelector('.typing-indicator')?.remove();
        addMessage('Sorry, there was an error communicating with the AI assistant. Please try again.', 'assistant');
    }
}

// Phone Chatbot functionality
function togglePhoneChat() {
    const phoneChat = document.querySelector('.phone-chatbot');
    phoneChat.style.display = phoneChat.style.display === 'none' ? 'flex' : 'none';
}

function sendPhoneMessage() {
    const input = document.getElementById('phoneInput');
    const message = input.value.trim();
    if (message) {
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        addPhoneMessage(message, 'user', time);
        input.value = '';
        
        // Show typing indicator
        const typingIndicator = document.querySelector('.typing-indicator');
        typingIndicator.style.display = 'flex';
        
        // Send message to OpenAI assistant
        sendPhoneMessageToAssistant(message);
    }
}

// Send message to OpenAI Assistant for the phone chatbot
async function sendPhoneMessageToAssistant(message) {
    try {
        if (!currentThreadId) {
            // Retrieve thread ID from local storage or create a new one
            currentThreadId = localStorage.getItem('swiftbookieThreadId');
            if (!currentThreadId) {
                // Initialize the assistant and create a new thread
                await initializeOpenAIAssistant();
                
                // Add the message after thread is created
                setTimeout(async () => {
                    if (currentThreadId) {
                        await addPhoneMessageToThread(message);
                    }
                }, 1000);
                return;
            }
        }
        
        await addPhoneMessageToThread(message);
    } catch (error) {
        console.error('Error sending phone message to assistant:', error.response?.data || error.message);
        const typingIndicator = document.querySelector('.typing-indicator');
            typingIndicator.style.display = 'none';
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        addPhoneMessage('Sorry, there was an error communicating with the AI assistant. Please try again.', 'assistant', time);
    }
}

// Add a message to the thread from the phone interface and run the assistant
async function addPhoneMessageToThread(message) {
    try {
        // Add the user message to the thread
        await axios.post(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
            role: "user",
            content: message
        }, {
            headers: {
                'Authorization': `Bearer ${window.appConfig.getOpenAIApiKey()}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });
        
        // Run the assistant to generate a response using the specific assistant ID
        const runResponse = await axios.post(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
            assistant_id: window.appConfig.getOpenAIAssistantId(),
            instructions: "You are responding in a phone chat interface. Keep responses concise and friendly."
        }, {
            headers: {
                'Authorization': `Bearer ${window.appConfig.getOpenAIApiKey()}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });
        
        // Poll for the response
        await pollPhoneResponse(runResponse.data.id);
    } catch (error) {
        console.error('Error in phone thread communication:', error.response?.data || error.message);
        throw error; // Let the parent function handle this
    }
}

// Poll for the assistant's response for phone chatbot
async function pollPhoneResponse(runId) {
    try {
        let response;
        let attempts = 0;
        let status = 'queued';
        let delay = 1000; // Start with 1 second delay
        
        // Poll until the run is completed or fails
        while (['queued', 'in_progress', 'requires_action'].includes(status)) {
            // Maximum number of attempts to prevent infinite loops
            if (attempts >= 30) {
                console.error('Phone polling timeout after 30 attempts');
                const typingIndicator = document.querySelector('.typing-indicator');
                typingIndicator.style.display = 'none';
                const now = new Date();
                const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                addPhoneMessage('Sorry, it\'s taking longer than expected to get a response. Please try again.', 'assistant', time);
                return;
            }
            
            // Wait with exponential backoff before polling again
            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(delay * 1.5, 5000); // Increase delay with each attempt, max 5 seconds
            
            // Get the run status
            response = await axios.get(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
                headers: {
                    'Authorization': `Bearer ${window.appConfig.getOpenAIApiKey()}`,
                    'Content-Type': 'application/json',
                    'OpenAI-Beta': 'assistants=v2'
                }
            });
            
            status = response.data.status;
            attempts++;
            
            if (status === 'completed') {
                // Get the messages from the thread
                const messagesResponse = await axios.get(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
                    headers: {
                        'Authorization': `Bearer ${window.appConfig.getOpenAIApiKey()}`,
                        'Content-Type': 'application/json',
                        'OpenAI-Beta': 'assistants=v2'
                    }
                });
                
                // Get the latest assistant message
                const assistantMessages = messagesResponse.data.data.filter(msg => msg.role === 'assistant');
                if (assistantMessages.length > 0) {
                    const latestMessage = assistantMessages[0];
                    const typingIndicator = document.querySelector('.typing-indicator');
                    typingIndicator.style.display = 'none';
                    const now = new Date();
                    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    
                    // Handle different content types in the response
                    if (latestMessage.content && latestMessage.content.length > 0) {
                        const textContent = latestMessage.content
                            .filter(item => item.type === 'text')
                            .map(item => item.text.value)
                            .join('\n\n');
                        
                        if (textContent) {
                            addPhoneMessage(textContent, 'assistant', time);
                        }
                    }
                }
            } else if (status === 'failed' || status === 'cancelled' || status === 'expired') {
                console.error('Phone run failed with status:', status, response.data);
                const typingIndicator = document.querySelector('.typing-indicator');
                typingIndicator.style.display = 'none';
                const now = new Date();
                const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                addPhoneMessage('Sorry, there was an error processing your request. Please try again.', 'assistant', time);
            }
        }
    } catch (error) {
        console.error('Error polling for phone response:', error.response?.data || error.message);
        const typingIndicator = document.querySelector('.typing-indicator');
        typingIndicator.style.display = 'none';
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        addPhoneMessage('Sorry, there was an error communicating with the AI assistant. Please try again.', 'assistant', time);
    }
}

function addPhoneMessage(text, type, time) {
    const messages = document.querySelector('.phone-messages');
    const message = document.createElement('div');
    message.className = `phone-message ${type}`;
    message.textContent = text;
    message.setAttribute('data-time', time);
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
}

// Handle Enter key in phone input
document.getElementById('phoneInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendPhoneMessage();
    }
});

// AI Chatbot functionality
let userInfo = {
    name: '',
    email: '',
    phone: '',
    businessName: '',
    purpose: ''
};

let currentStep = 0;
const steps = [
    { field: 'name', question: 'Could you please provide your name?' },
    { field: 'email', question: 'Thank you! What\'s your email address?' },
    { field: 'phone', question: 'Great! What\'s the best phone number to reach you?' },
    { field: 'businessName', question: 'What business or organization are you representing?' },
    { field: 'purpose', question: 'What are you looking to get out of our AI assistant today?' }
];

function showSummary() {
    const summary = `
        Thank you for providing your information! Here's a summary of what you shared:
        
        Name: ${userInfo.name}
        Email: ${userInfo.email}
        Phone: ${userInfo.phone}
        Business: ${userInfo.businessName}
        Purpose: ${userInfo.purpose}
        
        How can I help you with your scheduling needs today?
    `;
    addMessage(summary, 'assistant');
}

function addMessage(text, type) {
    const messages = document.querySelector('.ai-messages');
    const message = document.createElement('div');
    message.className = `ai-message ${type}`;
    message.textContent = text;
    
    if (type === 'assistant') {
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        messages.appendChild(typingIndicator);
        
        setTimeout(() => {
            typingIndicator.remove();
            messages.appendChild(message);
            messages.scrollTop = messages.scrollHeight;
        }, 1000);
    } else {
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
    }
}

// Handle Enter key in AI input
document.getElementById('aiInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (message) {
        addMessage(message, 'user');
        input.value = '';

        // Send message to OpenAI assistant
        sendMessageToAssistant(message);
    }
}

// Initialize OpenAI Assistant when the page loads
window.addEventListener('DOMContentLoaded', () => {
    // Check if we have an existing thread
    const savedThreadId = localStorage.getItem('swiftbookieThreadId');
    if (savedThreadId) {
        currentThreadId = savedThreadId;
        console.log('Using existing thread ID:', currentThreadId);
    }
    
    // Initialize the OpenAI assistant if we have the API key
    const apiKey = window.appConfig ? window.appConfig.getOpenAIApiKey() : null;
    if (apiKey) {
        initializeOpenAIAssistant();
    } else {
        console.error('No OpenAI API key provided');
        addMessage('Error: API key is missing. Please provide a valid OpenAI API key.', 'assistant');
    }
});
