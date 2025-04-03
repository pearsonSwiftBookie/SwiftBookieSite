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
        const apiKey = window.appConfig.getOpenAIApiKey();
        
        const response = await axios.post('https://api.openai.com/v1/threads', {}, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
            }
        });
        
        currentThreadId = response.data.id;
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
    
    // Initialize the assistant when the chat is opened if not already initialized
    if (phoneChat.style.display === 'flex' && !currentThreadId) {
        initializeOpenAIAssistant();
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
            assistant_id: window.appConfig.getOpenAIAssistantId()
        }, {
            headers: {
                'Authorization': `Bearer ${window.appConfig.getOpenAIApiKey()}`,
                'Content-Type': 'application/json',
                'OpenAI-Beta': 'assistants=v2'
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
        
        // Poll until the run is completed or fails
        while (['queued', 'in_progress', 'requires_action'].includes(status)) {
            // Maximum number of attempts to prevent infinite loops
            if (attempts >= 30) {
                console.error('Polling timeout after 30 attempts');
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
                typingIndicator.style.display = 'none';
                const now = new Date();
                const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                addPhoneMessage('Sorry, there was an error processing your request. Please try again.', 'assistant', time);
            }
        }
    } catch (error) {
        console.error('Error polling for response:', error.response?.data || error.message);
        const typingIndicator = document.querySelector('.typing-indicator');
        typingIndicator.style.display = 'none';
        const now = new Date();
        const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        addPhoneMessage('Sorry, there was an error communicating with the AI assistant. Please try again.', 'assistant', time);
    }
}

// Add message to the phone chat UI
function addPhoneMessage(message, role, time) {
    const messagesContainer = document.querySelector('.phone-messages');
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
    messagesContainer.insertBefore(messageEl, document.querySelector('.typing-indicator'));
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle Enter key in the phone input field
document.addEventListener('DOMContentLoaded', function() {
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendPhoneMessage();
            }
        });
    }
    
    // Initialize chat functionality when page loads
    const phoneChat = document.querySelector('.phone-chatbot');
    if (phoneChat && phoneChat.style.display === 'flex') {
        initializeOpenAIAssistant();
    }
});

// Add message to the AI assistant UI
function addMessage(message, role) {
    const messagesContainer = document.querySelector('.ai-messages');
    if (!messagesContainer) return; // Safety check
    
    const messageEl = document.createElement('div');
    messageEl.className = `ai-message ${role}`;
    
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
    messagesContainer.appendChild(messageEl);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
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

