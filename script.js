// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Navbar scroll effect
const navbar = document.querySelector('.navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Intersection Observer for fade-in animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-text');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all elements with the animate-text class
document.querySelectorAll('.animate-text').forEach(element => {
    observer.observe(element);
});

// Service cards hover effect
const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Form submission handling
const contactForm = document.querySelector('.contact-form form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Here you would typically send the data to your backend
        console.log('Form submitted:', data);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Thank you for your message! We\'ll get back to you soon.';
        contactForm.appendChild(successMessage);
        
        // Reset form
        contactForm.reset();
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    });
}

// Add smooth scroll behavior for the entire page
document.documentElement.style.scrollBehavior = 'smooth';

// Add loading animation
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Modal functionality
const modalOverlay = document.querySelector('.modal-overlay');
const modal = document.querySelector('.holographic-modal');
const openModalBtn = document.querySelector('.navbar .cta-button');
const closeModalBtn = document.querySelector('.close-modal');
const holographicLine = document.querySelector('.holographic-line');

function createLinePath() {
    const line = document.querySelector('.holographic-line');
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Create a horizontal line in the middle of the viewport
    const path = `M0,${viewportHeight/2} L${viewportWidth},${viewportHeight/2}`;
    line.setAttribute('d', path);
    return path;
}

function animateLine() {
    const line = document.querySelector('.holographic-line');
    const modal = document.querySelector('.holographic-modal');
    
    // Create horizontal line path
    createLinePath();
    
    // Reset line animation
    line.style.strokeDashoffset = '1000';
    void line.offsetWidth; // Trigger reflow
    
    // Animate the line drawing
    line.style.strokeDashoffset = '0';
    
    // After line is drawn, expand into form
    setTimeout(() => {
        modal.classList.add('active');
    }, 2000); // Wait for line animation to complete
}

function openModal() {
    const overlay = document.querySelector('.modal-overlay');
    overlay.style.display = 'flex';
    
    // Start the animation sequence
    setTimeout(() => {
        animateLine();
    }, 100);
}

function closeModal() {
    const overlay = document.querySelector('.modal-overlay');
    const modal = document.querySelector('.holographic-modal');
    const line = document.querySelector('.holographic-line');
    
    // Reverse the animation sequence
    modal.classList.remove('active');
    line.style.strokeDashoffset = '1000';
    
    setTimeout(() => {
        overlay.style.display = 'none';
    }, 1500);
}

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);

// Close modal when clicking outside
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Handle form submission
const appointmentForm = document.querySelector('.appointment-form');
if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(appointmentForm);
        const data = Object.fromEntries(formData);
        
        // Here you would typically send the data to your backend
        console.log('Appointment scheduled:', data);
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = 'Appointment scheduled successfully!';
        appointmentForm.appendChild(successMessage);
        
        // Reset form
        appointmentForm.reset();
        
        // Close modal after 2 seconds
        setTimeout(() => {
            closeModal();
            successMessage.remove();
        }, 2000);
    });
}

// Typing animation
function typeWriter(element) {
    const text = element.getAttribute('data-text');
    let i = 0;
    element.textContent = ''; // Clear the text initially
    
    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, 100); // Adjust typing speed here (lower number = faster)
        }
    }
    
    type();
}

// Initialize typing animation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        typeWriter(typingText);
    }
});

// Service Categories and Card Flipping
document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const serviceCards = document.querySelectorAll('.service-card');

    // Category filtering
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            
            // Update active button
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter cards
            serviceCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'block';
                    // Add fade-in animation
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.style.opacity = '1';
                    }, 50);
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // Card flipping
    serviceCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('is-flipped');
        });

        // Add hover effect
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'scale(1)';
            // Keep the flipped state if card is flipped
            if (card.classList.contains('is-flipped')) {
                card.style.transform = 'rotateY(180deg)';
            }
        });
    });

    // Initialize with 'All' category active
    document.querySelector('[data-category="all"]').classList.add('active');
});

// Add smooth scroll for service links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
}); 