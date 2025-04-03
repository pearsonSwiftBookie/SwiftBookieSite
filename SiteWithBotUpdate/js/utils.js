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

        // Initialize OpenAI Assistant when the page loads
        window.addEventListener('DOMContentLoaded', () => {
            // Always use the specific assistant ID
            console.log('Using Swiftbookie Assistant ID:', ASSISTANT_ID);
            
            // Store the assistant ID for future use
            localStorage.setItem('swiftbookieAssistantId', ASSISTANT_ID);
            localStorage.setItem('swiftbookieApiVersion', 'v2');
            
            // Check if we have an existing thread
            const savedThreadId = localStorage.getItem('swiftbookieThreadId');
            if (savedThreadId) {
                currentThreadId = savedThreadId;
                console.log('Using existing thread ID:', currentThreadId);
            }
            
            // Initialize the OpenAI assistant if we have the API key
            if (OPENAI_API_KEY) {
                initializeOpenAIAssistant();
            } else {
                console.error('No OpenAI API key provided');
                addMessage('Error: API key is missing. Please provide a valid OpenAI API key.', 'assistant');
            }
        });
