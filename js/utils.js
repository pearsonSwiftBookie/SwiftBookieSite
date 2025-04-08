
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
            { field: 'email', question: 'Thank you! What\'s your email address for the calendar invitation?' },
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

        // Initialize calendar
        async function createCalendarEvent(date, timeSlot) {
            // Prevent spam-clicking and multiple responses
            if (isProcessingCalendarAction) {
                return;
            }
            
            isProcessingCalendarAction = true;
            
            try {
                // Parse the time slot
                const [hour, period] = timeSlot.split(' ');
                let [hours, minutes] = hour.split(':');
                hours = parseInt(hours);
                if (period === 'PM' && hours !== 12) hours += 12;
                if (period === 'AM' && hours === 12) hours = 0;

                // Create start and end times
                const startTime = new Date(date);
                startTime.setHours(hours);
                startTime.setMinutes(parseInt(minutes) || 0);
                
                const endTime = new Date(startTime);
                endTime.setHours(startTime.getHours() + 1);

                // Create the event with detailed description
                const event = {
                    'summary': `Appointment: ${userInfo.purpose}`,
                    'description': `Booking Details:
Name: ${userInfo.name}
Email: ${userInfo.email}
Phone: ${userInfo.phone}
Business: ${userInfo.businessName}
Purpose: ${userInfo.purpose}`,
                    'start': {
                        'dateTime': startTime.toISOString(),
                        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                    },
                    'end': {
                        'dateTime': endTime.toISOString(),
                        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
                    }
                };

                // Check if we're authorized
                if (!gapi.client.getToken()) {
                    addMessage("Please authorize Google Calendar first by clicking the 'Authorize Google Calendar' button.", 'assistant');
                    isProcessingCalendarAction = false;
                    return;
                }

                // Insert the event
                const request = await gapi.client.calendar.events.insert({
                    'calendarId': 'primary',
                    'resource': event
                });

                console.log('Event created:', request.result);
                addMessage(`Perfect! I've scheduled your appointment for ${startTime.toLocaleString()}. Here's a summary of your booking:

Name: ${userInfo.name}
Email: ${userInfo.email}
Phone: ${userInfo.phone}
Business: ${userInfo.businessName}
Purpose: ${userInfo.purpose}

You should receive a calendar invitation shortly. Is there anything else you need help with?`, 'assistant');
                
                // Refresh the calendar display
                listUpcomingEvents();
                
                // Reset selection and saved values
                selectedDate = null;
                selectedTimeSlot = null;
                savedDate = null;
                savedTimeSlot = null;
                
                // Hide time slots
                document.getElementById('timeSlots').style.display = 'none';
                isProcessingCalendarAction = false;
                
            } catch (error) {
                console.error('Error creating calendar event:', error);
                addMessage('Sorry, there was an error creating your calendar event. Please try again or check your Google Calendar authorization.', 'assistant');
                isProcessingCalendarAction = false;
            }
        }

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
            
            // Initialize calendar
            generateCalendar();
        });


        document.addEventListener('DOMContentLoaded', function() {
            generateCalendar();
        });
