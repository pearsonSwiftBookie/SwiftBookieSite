// calendar.js
// This file contains minimal code for the iframe booking integration
// The original calendar implementation has been replaced with an external booking widget

document.addEventListener('DOMContentLoaded', function() {
    console.log('Calendar widget loaded from external iframe');
    
    // Any script for the iframe resizing can go here if needed
    function adjustIframeHeight() {
        try {
            const iframe = document.getElementById('OUGlI25ejRntmwnMLNeo_1743807769814');
            if (iframe) {
                // Listen for messages from the iframe to adjust height if needed
                window.addEventListener('message', function(event) {
                    if (event.data && event.data.type === 'setHeight' && event.data.height) {
                        iframe.style.height = event.data.height + 'px';
                    }
                });
            }
        } catch (error) {
            console.error('Error adjusting iframe:', error);
        }
    }
    
    // Initialize the iframe adjuster
    adjustIframeHeight();
});
