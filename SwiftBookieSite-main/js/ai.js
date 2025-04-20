// OpenAI Assistant Configuration
// The API key is now stored securely as an environment variable on the server
const ASSISTANT_ID = 'asst_LphpbIJDzb0QSljhU6KEeaoB'; // Assistant ID is ok to be public
let currentThreadId = null;

// Initialize OpenAI Assistant
async function initializeOpenAIAssistant() {
    try {
        // Clear any existing typing indicators first
        const existingIndicators = document.querySelectorAll('.typing-indicator');
        existingIndicators.forEach(indicator => {
            if (indicator) indicator.style.display = 'none';
        });

        // Use the existing assistant instead of creating a new one
        console.log('Using existing Swiftbookie Assistant ID:', ASSISTANT_ID);
        
        // Create a new thread for this conversation
        await createNewThread();
        
        return true;
    } catch (error) {
        console.error('Error initializing OpenAI assistant:', error);
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        addPhoneMessage('Sorry, there was an error connecting to the AI assistant. Please try again later.', 'assistant', time);
        return false;
    }
}

// Create a new conversation thread
async function createNewThread() {
    try {
        console.log('Creating new thread...');
        // Call our serverless API instead of OpenAI directly
        const response = await axios.post('/api/chat', {
            endpoint: 'threads',
            data: {}
        }).catch(err => {
            console.error('API error:', err);
            throw new Error('Failed to create thread. API may not be available.');
        });
        
        if (!response || !response.data || !response.data.id) {
            throw new Error('Invalid response from API');
        }
        
        currentThreadId = response.data.id;
        console.log('New thread created:', currentThreadId);
        
        // Store the thread ID in local storage to maintain conversation across page refreshes
        localStorage.setItem('swiftbookieThreadId', currentThreadId);
        
        // Send initial welcome message for the phone chat
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const welcomeMessage = "Hello! I'm your Swiftbookie AI assistant. How can I help you today with scheduling or appointment questions?";
        
        // Clear any existing messages in the phone chat
        const phoneMessages = document.querySelector('.phone-messages');
        if (phoneMessages) {
            // Keep only the typing indicator
            const typingIndicator = phoneMessages.querySelector('.typing-indicator');
            phoneMessages.innerHTML = '';
            if (typingIndicator) {
                phoneMessages.appendChild(typingIndicator);
            }
        }
        
        addPhoneMessage(welcomeMessage, 'assistant', time);
        return currentThreadId;
    } catch (error) {
        console.error('Error creating thread:', error);
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        addPhoneMessage('Sorry, there was an error starting our conversation. Please refresh the page or try again later.', 'assistant', time);
        throw error;
    }
}

// Phone Chatbot functionality
function togglePhoneChat() {
    const phoneChat = document.querySelector('.phone-chatbot');
    if (!phoneChat) {
        console.error("Phone chat element not found");
        return;
    }
    
    const currentDisplay = phoneChat.style.display;
    phoneChat.style.display = currentDisplay === 'none' ? 'flex' : 'none';
    
    // Initialize the assistant when the chat is opened
    if (phoneChat.style.display === 'flex') {
        // Show typing indicator while initializing
        const typingIndicator = phoneChat.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
        }
        
        try {
            // Initialize the assistant
            initializeOpenAIAssistant().catch(err => {
                const now = new Date();
                const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                addPhoneMessage("Sorry, I'm having trouble connecting to my brain. Please check your console for details and make sure the API key is set up correctly.", 'assistant', time);
            });
        } catch (error) {
            console.error("Error initializing assistant:", error);
            const now = new Date();
            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            addPhoneMessage("Sorry, I couldn't initialize properly. Please try refreshing the page.", 'assistant', time);
        }
    }
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
        if (typingIndicator) {
            typingIndicator.style.display = 'flex';
        }
        
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
                const success = await initializeOpenAIAssistant();
                
                if (success) {
                    // Add the message after thread is created
                    setTimeout(async () => {
                        if (currentThreadId) {
                            await addPhoneMessageToThread(message);
                        }
                    }, 1000);
                }
                return;
            }
        }
        
        await addPhoneMessageToThread(message);
    } catch (error) {
        console.error('Error sending phone message to assistant:', error.response?.data || error.message);
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        addPhoneMessage('Sorry, there was an error communicating with the AI assistant. Please try again.', 'assistant', time);
    }
}

// Add a message to the thread from the phone interface and run the assistant
async function addPhoneMessageToThread(message) {
    try {
        console.log('Adding message to thread:', currentThreadId);
        // Add the user message to the thread via our API
        await axios.post('/api/chat', {
            endpoint: `threads/${currentThreadId}/messages`,
            data: {
                role: "user",
                content: message
            }
        });
        
        // Run the assistant to generate a response using the specific assistant ID
        console.log('Running assistant with ID:', ASSISTANT_ID);
        const runResponse = await axios.post('/api/chat', {
            endpoint: `threads/${currentThreadId}/runs`,
            data: {
                assistant_id: ASSISTANT_ID,
                instructions: "You are a helpful Swiftbookie AI assistant helping with scheduling. Be friendly and concise in your responses."
            }
        });
        
        // Poll for the response
        await pollForPhoneResponse(runResponse.data.id);
    } catch (error) {
        console.error('Error in thread communication:', error.response?.data || error.message);
        throw error; // Let the parent function handle this
    }
}

// Poll for the assistant's response to a phone message
async function pollForPhoneResponse(runId) {
    try {
        let response;
        let attempts = 0;
        let status = 'queued';
        let delay = 1000; // Start with 1 second delay
        
        console.log('Polling for response, run ID:', runId);
        
        // Poll until the run is completed or fails
        while (['queued', 'in_progress', 'requires_action'].includes(status)) {
            // Maximum number of attempts to prevent infinite loops
            if (attempts >= 30) {
                console.error('Polling timeout after 30 attempts');
                const typingIndicator = document.querySelector('.typing-indicator');
                if (typingIndicator) {
                    typingIndicator.style.display = 'none';
                }
                const now = new Date();
                const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                addPhoneMessage('Sorry, it\'s taking longer than expected to get a response. Please try again.', 'assistant', time);
                return;
            }
            
            // Wait with exponential backoff before polling again
            await new Promise(resolve => setTimeout(resolve, delay));
            delay = Math.min(delay * 1.5, 5000); // Increase delay with each attempt, max 5 seconds
            
            // Get the run status using our API endpoint
            console.log('Checking run status, attempt:', attempts + 1);
            response = await axios.get(`/api/threads?threadId=${currentThreadId}&runId=${runId}`);
            
            status = response.data.status;
            console.log('Run status:', status);
            attempts++;
            
            if (status === 'completed') {
                // Get the messages from the thread using our API
                console.log('Run completed, fetching messages');
                const messagesResponse = await axios.get(`/api/threads?threadId=${currentThreadId}`);
                
                // Get the latest assistant message
                const assistantMessages = messagesResponse.data.data.filter(msg => msg.role === 'assistant');
                if (assistantMessages.length > 0) {
                    const latestMessage = assistantMessages[0];
                    const typingIndicator = document.querySelector('.typing-indicator');
                    if (typingIndicator) {
                        typingIndicator.style.display = 'none';
                    }
                    
                    // Handle different content types in the response
                    if (latestMessage.content && latestMessage.content.length > 0) {
                        const textContent = latestMessage.content
                            .filter(item => item.type === 'text')
                            .map(item => item.text.value)
                            .join('\n\n');
                        
                        if (textContent) {
                            const now = new Date();
                            const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            addPhoneMessage(textContent, 'assistant', time);
                        }
                    }
                }
            } else if (status === 'failed' || status === 'cancelled' || status === 'expired') {
                console.error('Run failed with status:', status, response.data);
                const typingIndicator = document.querySelector('.typing-indicator');
                if (typingIndicator) {
                    typingIndicator.style.display = 'none';
                }
                const now = new Date();
                const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                addPhoneMessage('Sorry, there was an error processing your request. Please try again.', 'assistant', time);
            }
        }
    } catch (error) {
        console.error('Error polling for response:', error.response?.data || error.message);
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.style.display = 'none';
        }
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        addPhoneMessage('Sorry, there was an error communicating with the AI assistant. Please try again.', 'assistant', time);
    }
}

// Add message to the phone chat UI
function addPhoneMessage(message, role, time) {
    const messagesContainer = document.querySelector('.phone-messages');
    if (!messagesContainer) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = `phone-message ${role}`;
    messageEl.setAttribute('data-time', time);
    
    // Process message text (handle markdown, links, etc.)
    let processedMessage = message;
    // Convert URLs to clickable links
    processedMessage = processedMessage.replace(
        /(https?:\/\/[^\s]+)/g,
        '<a href="$1" target="_blank">$1</a>'
    );
    // Convert simple markdown-style links [text](url)
    processedMessage = processedMessage.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank">$1</a>'
    );
    // Convert **bold** text
    processedMessage = processedMessage.replace(
        /\*\*([^*]+)\*\*/g,
        '<strong>$1</strong>'
    );
    
    messageEl.innerHTML = processedMessage;
    
    // Insert before typing indicator if it exists, otherwise append
    const typingIndicator = messagesContainer.querySelector('.typing-indicator');
    if (typingIndicator) {
        messagesContainer.insertBefore(messageEl, typingIndicator);
    } else {
        messagesContainer.appendChild(messageEl);
    }
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle Enter key in the phone input field
document.addEventListener('DOMContentLoaded', function() {
    try {
        const phoneInput = document.getElementById('phoneInput');
        if (phoneInput) {
            phoneInput.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    sendPhoneMessage();
                }
            });
        } else {
            console.warn('phoneInput element not found');
        }
        
        // Clear any existing thread ID from local storage to start fresh
        localStorage.removeItem('swiftbookieThreadId');
        currentThreadId = null;
        
        // Initialize chat functionality if the chatbot is visible on page load
        const phoneChat = document.querySelector('.phone-chatbot');
        if (phoneChat && phoneChat.style.display === 'flex') {
            initializeOpenAIAssistant();
        }
    } catch (error) {
        console.error('Error in DOMContentLoaded event:', error);
    }
});

