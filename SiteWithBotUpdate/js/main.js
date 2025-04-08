    <script>
        // OpenAI Assistant Configuration
        const OPENAI_API_KEY = '';
        let ASSISTANT_ID = 'asst_LphpbIJDzb0QSljhU6KEeaoB'; // Using your specific assistant
        let currentThreadId = null;

        // Initialize OpenAI Assistant
        async function initializeOpenAIAssistant() {
            try {
                // Use the existing assistant instead of creating a new one
                console.log('Using existing Swiftbookie Assistant ID:', ASSISTANT_ID);
                
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
                const response = await axios.post('https://api.openai.com/v1/threads', {}, {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
                // Add the user message to the thread
                await axios.post(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
                    role: "user",
                    content: message
                }, {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
                        'Content-Type': 'application/json',
                        'OpenAI-Beta': 'assistants=v2'
                    }
                });
                
                // Run the assistant to generate a response using the specific assistant ID
                const runResponse = await axios.post(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
                    assistant_id: ASSISTANT_ID,
                    instructions: "Please help the user with scheduling and booking appointments. If the user has selected a date/time, acknowledge it in your response."
                }, {
                    headers: {
                        'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
                            'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
                                'Authorization': `Bearer ${OPENAI_API_KEY}`,
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
        // NOTE: These functions are already defined in ai.js
        // Using them from there instead of redefining here to avoid conflicts

        // Google Calendar API Configuration
        // Replace these values with your credentials from Google Cloud Console
        const API_KEY = 'AIzaSyB6cklwmxnHcLYyMWO0Fg2JXOItvABXQNs'; // Get this from Google Cloud Console > Credentials > API Key
        const CLIENT_ID = '108313275383-do8in9qln3vfrc6dhakhi4cnaj85ircu.apps.googleusercontent.com'; // Get this from Google Cloud Console > Credentials > OAuth 2.0 Client ID
        const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';
        const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar';

        let tokenClient;
        let gapiInited = false;
        let gisInited = false;

        // Initialize Google Calendar
        function gapiLoaded() {
            gapi.load('client', initializeGapiClient);
        }

        async function initializeGapiClient() {
            try {
                await gapi.client.init({
                    apiKey: API_KEY,
                    discoveryDocs: [DISCOVERY_DOC],
                });
                gapiInited = true;
                maybeEnableButtons();
                console.log('GAPI client initialized successfully');
            } catch (error) {
                console.error('Error initializing GAPI client:', error);
                document.getElementById('google-calendar').innerHTML = 
                    'Error initializing Google Calendar. Please check the console for details.';
            }
        }

        function gisLoaded() {
            try {
                tokenClient = google.accounts.oauth2.initTokenClient({
                    client_id: CLIENT_ID,
                    scope: SCOPES,
                    callback: '', // defined later
                });
                gisInited = true;
                maybeEnableButtons();
                console.log('GIS client initialized successfully');
            } catch (error) {
                console.error('Error initializing GIS client:', error);
                document.getElementById('google-calendar').innerHTML = 
                    'Error initializing Google Sign-In. Please check the console for details.';
            }
        }

        function maybeEnableButtons() {
            if (gapiInited && gisInited) {
                document.getElementById('authorize_button').style.display = 'flex';
            }
        }

        // Keep track if calendar has been clicked before
        let calendarClickedBefore = false;
        // Flag to prevent spam clicking
        let isProcessingCalendarAction = false;

        function handleAuthClick() {
            // Prevent spam clicking
            if (isProcessingCalendarAction) {
                return;
            }

            isProcessingCalendarAction = true;
            
            try {
                tokenClient.callback = async (resp) => {
                    if (resp.error !== undefined) {
                        console.error('Auth error:', resp.error);
                        document.getElementById('google-calendar').innerHTML = 
                            'Authentication error. Please check the console for details.';
                        isProcessingCalendarAction = false;
                        throw resp;
                    }
                    
                    // After successful auth, hide the button
                    document.querySelector('.authorize-button').textContent = 'Calendar Connected';
                    document.querySelector('.authorize-button').style.opacity = '0.8';
                    document.querySelector('.authorize-button').style.cursor = 'default';
                    document.querySelector('.authorize-button').onclick = null;
                    
                    await listUpcomingEvents();
                    isProcessingCalendarAction = false;
                };

                if (gapi.client.getToken() === null) {
                    tokenClient.requestAccessToken({prompt: ''})
                    .then((resp) => {
                        if (resp.error !== undefined) {
                            console.error('Token request error:', resp.error);
                            document.getElementById('google-calendar').innerHTML = 
                                'Error requesting access token. Please check the console for details.';
                            isProcessingCalendarAction = false;
                            throw resp;
                        }
                        
                        document.querySelector('.authorize-button').textContent = 'Calendar Connected';
                        document.querySelector('.authorize-button').style.opacity = '0.8';
                        document.querySelector('.authorize-button').style.cursor = 'default';
                        document.querySelector('.authorize-button').onclick = null;
                        
                        listUpcomingEvents();
                        isProcessingCalendarAction = false;
                    })
                    .catch(error => {
                        console.error('Error in token request:', error);
                        document.getElementById('google-calendar').innerHTML = 
                            'Error during authentication. Please check the console for details.';
                        isProcessingCalendarAction = false;
                    });
                } else {
                    tokenClient.requestAccessToken({prompt: ''});
                }
            } catch (error) {
                console.error('Error in handleAuthClick:', error);
                document.getElementById('google-calendar').innerHTML = 
                    'Error during authentication. Please check the console for details.';
                isProcessingCalendarAction = false;
            }
        }

        function handleSignoutClick() {
            const token = gapi.client.getToken();
            if (token !== null) {
                google.accounts.oauth2.revoke(token.access_token);
                gapi.client.setToken('');
                document.getElementById('google-calendar').innerHTML = '';
                
                // Reset the button
                document.querySelector('.authorize-button').textContent = 'Authorize Google Calendar';
                document.querySelector('.authorize-button').style.opacity = '1';
                document.querySelector('.authorize-button').style.cursor = 'pointer';
                document.querySelector('.authorize-button').onclick = handleAuthClick;
            }
        }

        async function listUpcomingEvents() {
            let response;
            try {
                const timeMin = new Date();
                timeMin.setDate(timeMin.getDate() + 1);
                const timeMax = new Date();
                timeMax.setDate(timeMax.getDate() + 7);

                console.log('Requesting calendar events...');
                response = await gapi.client.calendar.events.list({
                    'calendarId': 'primary',
                    'timeMin': timeMin.toISOString(),
                    'timeMax': timeMax.toISOString(),
                    'showDeleted': false,
                    'singleEvents': true,
                    'orderBy': 'startTime',
                });

                console.log('Calendar response:', response);

                const events = response.result.items;
                if (!events || events.length == 0) {
                    document.getElementById('google-calendar').innerHTML = 'No upcoming events found.';
                    return;
                }

                // Create calendar display
                const calendarHtml = events.map(event => {
                    const start = event.start.dateTime || event.start.date;
                    const end = event.end.dateTime || event.end.date;
                    const eventDate = new Date(start);
                    const formattedDate = eventDate.toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                    });
                    return `
                        <div class="calendar-event">
                            <h4>${event.summary}</h4>
                            <p>${formattedDate} - ${new Date(start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                    `;
                }).join('');

                document.getElementById('google-calendar').innerHTML = calendarHtml;
            } catch (err) {
                console.error('Error listing events:', err);
                document.getElementById('google-calendar').innerHTML = 
                    'Error loading calendar events. Please check the console for details.';
            }
        }

        // Calendar functionality
        let currentDate = new Date();
        let selectedDate = null;
        let selectedTimeSlot = null;
        let savedDate = null;
        let savedTimeSlot = null;

        function generateCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            const startingDay = firstDay.getDay();
            const totalDays = lastDay.getDate();
            const today = new Date();

            // Update month and year display
            document.querySelector('.month-nav h3').textContent = 
                `${firstDay.toLocaleString('default', { month: 'long' })} ${year}`;

            const calendarBody = document.getElementById('calendarBody');
            calendarBody.innerHTML = '';

            let date = 1;
            for (let i = 0; i < 6; i++) {
                // Create a table row
                const row = document.createElement('tr');
                
                // Creating individual cells
                for (let j = 0; j < 7; j++) {
                    const cell = document.createElement('td');
                    
                    if (i === 0 && j < startingDay) {
                        // Empty cells before the first day
                        cell.textContent = '';
                    } else if (date > totalDays) {
                        // Empty cells after the last day
                        cell.textContent = '';
                    } else if (j < 7 && date <= totalDays) {
                        // Valid date cells
                        const dateDiv = document.createElement('div');
                        dateDiv.className = 'date-number';
                        dateDiv.textContent = date;
                        cell.appendChild(dateDiv);

                        // Create a date object for this cell
                        const cellDate = new Date(year, month, date);

                        // Mark today's date
                        if (cellDate.toDateString() === today.toDateString()) {
                            cell.classList.add('today');
                        }

                        // Mark selected date
                        if (selectedDate && 
                            cellDate.getDate() === selectedDate.getDate() &&
                            cellDate.getMonth() === selectedDate.getMonth() &&
                            cellDate.getFullYear() === selectedDate.getFullYear()) {
                            cell.classList.add('selected');
                        }

                        // Disable past dates
                        if (cellDate < new Date(today.setHours(0, 0, 0, 0))) {
                            cell.style.opacity = '0.5';
                            cell.style.cursor = 'not-allowed';
                        } else {
                            cell.onclick = () => selectDate(cellDate);
                        }

                        date++;
                    }
                    
                    row.appendChild(cell);
                }
                calendarBody.appendChild(row);
                
                // Stop creating rows if we've used all the days
                if (date > totalDays) {
                    break;
                }
            }
        }

        async function selectDate(date) {
            // Prevent spam-clicking and multiple responses
            if (isProcessingCalendarAction) {
                return;
            }
            
            isProcessingCalendarAction = true;
            
            if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
                isProcessingCalendarAction = false;
                return; // Don't allow selection of past dates
            }

            selectedDate = date;
            const cells = document.querySelectorAll('.calendar td');
            cells.forEach(cell => cell.classList.remove('selected'));
            event.currentTarget.classList.add('selected');
            
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            });

            // Only show the AI message the first time a date is selected
            if (!calendarClickedBefore) {
                // Show loading message while fetching availability
                addMessage(`Checking availability for ${formattedDate}...`, 'assistant');
                calendarClickedBefore = true;
            }
            
            // Generate time slots with actual calendar availability
            await generateTimeSlots(date);
            
            // Only show the AI response message the first time
            if (!userInfo.name && !calendarClickedBefore) {
                addMessage(`I see you'd like to book an appointment for ${formattedDate}. Before we proceed, I need some information from you. Could you please tell me your name?`, 'assistant');
                currentStep = 0;
            } else if (!calendarClickedBefore) {
                addMessage(`Here are the available time slots for ${formattedDate}. The grayed-out slots are already booked:`, 'assistant');
            }
            
            isProcessingCalendarAction = false;
        }

        async function generateTimeSlots(selectedDate) {
            const timeSlots = document.getElementById('timeSlots');
            timeSlots.innerHTML = '';

            // Check if we're authorized with Google Calendar
            if (!gapi.client.getToken()) {
                addMessage("Please authorize Google Calendar first by clicking the 'Authorize Google Calendar' button.", 'assistant');
                return;
            }

            try {
                // Get events for the selected date
                const startOfDay = new Date(selectedDate);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(selectedDate);
                endOfDay.setHours(23, 59, 59, 999);

                const response = await gapi.client.calendar.events.list({
                    'calendarId': 'primary',
                    'timeMin': startOfDay.toISOString(),
                    'timeMax': endOfDay.toISOString(),
                    'singleEvents': true,
                    'orderBy': 'startTime'
                });

                const events = response.result.items;
                const bookedSlots = new Set();

                // Mark booked time slots
                events.forEach(event => {
                    const start = new Date(event.start.dateTime || event.start.date);
                    const end = new Date(event.end.dateTime || event.end.date);
                    
                    // Mark all hours between start and end as booked
                    let current = new Date(start);
                    while (current < end) {
                        bookedSlots.add(current.getHours());
                        current.setHours(current.getHours() + 1);
                    }
                });

                // Generate time slots from 9 AM to 5 PM
                for (let hour = 9; hour <= 17; hour++) {
                    const isPM = hour >= 12;
                    const displayHour = hour > 12 ? hour - 12 : hour;
                    const time = `${displayHour}:00 ${isPM ? 'PM' : 'AM'}`;
                    
                    const slot = document.createElement('div');
                    slot.className = 'time-slot';
                    slot.textContent = time;
                    
                    // Check if the slot is in the past
                    const slotDateTime = new Date(selectedDate);
                    slotDateTime.setHours(hour, 0, 0, 0);
                    const now = new Date();
                    
                    if (slotDateTime < now) {
                        slot.classList.add('booked');
                        slot.title = 'This time slot is in the past';
                    } else if (bookedSlots.has(hour)) {
                        slot.classList.add('booked');
                        slot.title = 'This time slot is already booked';
                    } else {
                        slot.onclick = () => selectTimeSlot(time, selectedDate);
                    }
                    
                    timeSlots.appendChild(slot);
                }

                // Show the time slots
                timeSlots.style.display = 'grid';

            } catch (error) {
                console.error('Error fetching calendar events:', error);
                addMessage('Sorry, there was an error checking calendar availability. Please try again.', 'assistant');
            }
        }

        function selectTimeSlot(time, date) {
            // Prevent spam-clicking and multiple responses
            if (isProcessingCalendarAction) {
                return;
            }
            
            isProcessingCalendarAction = true;
            
            const slots = document.querySelectorAll('.time-slot');
            slots.forEach(slot => slot.classList.remove('selected'));
            event.target.classList.add('selected');
            
            // Save the selected date and time
            savedDate = date;
            savedTimeSlot = time;
            
            const formattedDate = date.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });

            if (!userInfo.name) {
                addMessage(`I see you'd like to book an appointment for ${formattedDate} at ${time}. Before we confirm, I need some information from you. Could you please tell me your name?`, 'assistant');
                currentStep = 0;
                isProcessingCalendarAction = false;
                return;
            }
            
            // Only show this message if it's not being spammed
            addMessage(`You've selected ${formattedDate} at ${time}. Would you like to proceed with booking?`, 'assistant');
            isProcessingCalendarAction = false;
        }

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

        function cancelBooking() {
            addMessage("Booking cancelled. Would you like to select a different date and time?", 'assistant');
            savedDate = null;
            savedTimeSlot = null;
            selectedDate = null;
            selectedTimeSlot = null;
            document.getElementById('timeSlots').style.display = 'none';
            generateCalendar();
        }

        function previousMonth() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            generateCalendar();
            // Hide time slots when changing months
            document.getElementById('timeSlots').style.display = 'none';
        }

        function nextMonth() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            generateCalendar();
            // Hide time slots when changing months
            document.getElementById('timeSlots').style.display = 'none';
        }

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
