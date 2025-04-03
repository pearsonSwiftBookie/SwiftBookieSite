// Environment variables for the application
const config = {
    // OpenAI Configuration
    openai: {
        apiKey: '', // We will not store API keys in the client
        assistantId: ''
    },

    // Method to get Assistant ID securely
    getOpenAIAssistantId: () => {
        return config.openai.assistantId;
    },

    // Server API endpoints - used in production to access the server
    serverAPI: {
        // Fetch configuration from the server
        fetchConfig: async () => {
            try {
                const response = await fetch('/api/config');
                if (!response.ok) {
                    console.error('Failed to load config from server');
                    return false;
                }
                
                const data = await response.json();
                
                // Update config with server values
                if (data.openai && data.openai.assistantId) {
                    config.openai.assistantId = data.openai.assistantId;
                }
                
                return true;
            } catch (error) {
                console.error('Error loading config from server:', error);
                return false;
            }
        },
        
        // Create a thread via the server proxy (keeps API key secure)
        createThread: async () => {
            try {
                const response = await fetch('/api/openai/threads', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to create thread via server');
                }
                
                return await response.json();
            } catch (error) {
                console.error('Error creating thread via server:', error);
                throw error;
            }
        }
    },
    
    // Development mode functions - will be used only in development
    development: {
        // Function to load environment variables from .env in development
        loadEnvFromDotEnv: async () => {
            if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                return false; // Only allow in development
            }

            try {
                const response = await fetch('/.env');
                if (!response.ok) {
                    console.warn('Failed to load .env file, using fallback values');
                    return false;
                }
                
                const text = await response.text();
                const lines = text.split('\n');
                
                lines.forEach(line => {
                    if (line && !line.startsWith('#')) {
                        const [key, value] = line.split('=');
                        if (key && value) {
                            if (key.trim() === 'OPENAI_ASSISTANT_ID') {
                                config.openai.assistantId = value.trim();
                            }
                        }
                    }
                });
                
                return true;
            } catch (error) {
                console.error('Error loading .env file:', error);
                return false;
            }
        }
    },
    
    // Initialize configuration
    init: async () => {
        // In production, fetch config from server
        if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
            const success = await config.serverAPI.fetchConfig();
            if (success) {
                console.log('Configuration loaded from server');
            } else {
                console.error('Failed to load configuration from server');
            }
        } else {
            // In development, try to load from .env
            const success = await config.development.loadEnvFromDotEnv();
            if (success) {
                console.log('Development environment variables loaded from .env');
            } else {
                console.warn('Using fallback development values');
            }
        }
    }
};

// Initialize configuration on page load
window.addEventListener('DOMContentLoaded', () => {
    config.init();
});

// Export the configuration
window.appConfig = config; 