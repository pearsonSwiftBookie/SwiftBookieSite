// Debug logging
console.log('Services.js loaded');

// Service filtering functionality
const filterButtons = document.querySelectorAll('.filter-btn');
const serviceItems = document.querySelectorAll('.service-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        console.log('Filter button clicked:', button.getAttribute('data-filter'));
        
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');
        
        serviceItems.forEach(item => {
            const category = item.getAttribute('data-category');
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';

            setTimeout(() => {
                if (filter === 'all' || filter === category) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    item.style.display = 'none';
                }
            }, 300);
        });
    });
});

// View toggle functionality
const viewButtons = document.querySelectorAll('.view-btn');
const servicesWrapper = document.querySelector('.services-wrapper');

viewButtons.forEach(button => {
    button.addEventListener('click', () => {
        console.log('View button clicked:', button.getAttribute('data-view'));
        
        viewButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        const view = button.getAttribute('data-view');
        servicesWrapper.className = `services-wrapper ${view}-view`;

        // Animate items in new view
        serviceItems.forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';

            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'translateY(0)';
            }, index * 100);
        });
    });
});

// Service details toggle
function toggleDetails(serviceItem) {
    const details = serviceItem.querySelector('.service-details');
    const detailsContent = serviceItem.querySelector('.details-content');
    const isExpanded = serviceItem.classList.contains('show-details');
    const button = serviceItem.querySelector('.details-btn');

    // Close all other open details
    document.querySelectorAll('.service-item.show-details').forEach(item => {
        if (item !== serviceItem) {
            const otherDetails = item.querySelector('.service-details');
            const otherContent = item.querySelector('.details-content');
            const otherButton = item.querySelector('.details-btn');
            
            item.classList.remove('show-details');
            otherDetails.style.maxHeight = '0';
            otherContent.style.opacity = '0';
            otherContent.style.transform = 'translateY(-10px)';
            otherButton.innerHTML = '<i class="ri-information-line"></i> View Details';
        }
    });

    // Toggle current details
    if (!isExpanded) {
        serviceItem.classList.add('show-details');
        details.style.maxHeight = `${details.scrollHeight}px`;
        detailsContent.style.opacity = '1';
        detailsContent.style.transform = 'translateY(0)';
        button.innerHTML = '<i class="ri-close-line"></i> Close Details';
    } else {
        serviceItem.classList.remove('show-details');
        details.style.maxHeight = '0';
        detailsContent.style.opacity = '0';
        detailsContent.style.transform = 'translateY(-10px)';
        button.innerHTML = '<i class="ri-information-line"></i> View Details';
    }
}

// Book Now buttons - Redirect to contact.html instead of showing modal
const bookButtons = document.querySelectorAll('.book-btn');
const modal = document.querySelector('.booking-modal');
const closeModal = document.querySelector('.close-modal');
const bookingForm = document.getElementById('booking-form');

bookButtons.forEach(button => {
    button.addEventListener('click', () => {
        const serviceItem = button.closest('.service-item');
        const serviceName = serviceItem.querySelector('h3').textContent;
        console.log('Book button clicked for:', serviceName);
        
        // Redirect to contact page instead of showing modal
        window.location.href = './contact.html';
    });
});

// We'll keep this in case we need the modal functionality for other buttons
closeModal.addEventListener('click', closeBookingModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeBookingModal();
    }
});

function closeBookingModal() {
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

// Form submission
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Form submitted');

    // Get form data
    const formData = new FormData(bookingForm);
    const bookingData = Object.fromEntries(formData.entries());

    // Here you would typically send the data to your backend
    console.log('Booking request:', bookingData);

    // Show success message
    const submitBtn = bookingForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Request Sent!';
    submitBtn.style.backgroundColor = '#059669';
    submitBtn.disabled = true;

    // Reset form and close modal after delay
    setTimeout(() => {
        bookingForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.style.backgroundColor = '';
        submitBtn.disabled = false;
        closeBookingModal();
    }, 2000);
});

// Smooth scroll for anchor links
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

// Animation on scroll
const animateOnScroll = () => {
    const items = document.querySelectorAll('.service-item');
    
    items.forEach(item => {
        const itemTop = item.getBoundingClientRect().top;
        const itemBottom = item.getBoundingClientRect().bottom;
        
        if (itemTop < window.innerHeight && itemBottom > 0) {
            item.classList.add('fade-in');
            item.classList.remove('fade-out');
        }
    });
};

window.addEventListener('scroll', animateOnScroll);
window.addEventListener('load', animateOnScroll);

// Intersection Observer for scroll animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all service items for scroll animations
serviceItems.forEach(item => {
    observer.observe(item);
});

// Handle window resize for responsive adjustments
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        // Update any height calculations
        document.querySelectorAll('.service-item.show-details').forEach(item => {
            const details = item.querySelector('.service-details');
            details.style.maxHeight = details.scrollHeight + 'px';
        });
    }, 250);
});

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // Initialize DOM elements
    const modal = document.getElementById('service-details-modal');
    const detailsButtons = document.querySelectorAll('.details-btn');
    const closeButton = modal.querySelector('.close-modal');
    const modalOverlay = modal.querySelector('.modal-overlay');
    const modalContent = modal.querySelector('.modal-content');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const viewButtons = document.querySelectorAll('.view-btn');
    const servicesWrapper = document.querySelector('.services-wrapper');
    const serviceItems = document.querySelectorAll('.service-item');

    console.log('Elements found:', {
        servicesWrapper: servicesWrapper !== null,
        filterButtons: filterButtons.length,
        viewButtons: viewButtons.length,
        serviceItems: serviceItems.length,
        detailsButtons: detailsButtons.length,
        bookButtons: bookButtons.length,
        modal: modal !== null,
        closeModal: closeModal !== null,
        bookingForm: bookingForm !== null
    });

    // Initialize animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    serviceItems.forEach(item => {
        observer.observe(item);
    });

    // Service details modal functionality
    function openModal(serviceId) {
        const template = document.getElementById(`${serviceId}-details`);
        if (template) {
            modalContent.innerHTML = template.innerHTML;
            
            // Add event listener to any "Schedule a Free Consultation" buttons in the modal
            setTimeout(() => {
                const scheduleButtons = document.querySelectorAll('.schedule-btn');
                scheduleButtons.forEach(btn => {
                    btn.addEventListener('click', () => {
                        window.location.href = './contact.html';
                    });
                });
            }, 50);
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            modalContent.innerHTML = '';
        }, 300);
    }

    detailsButtons.forEach(button => {
        button.addEventListener('click', () => {
            const serviceId = button.dataset.service;
            openModal(serviceId);
        });
    });

    closeButton.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);

    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Services filter functionality
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            serviceItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.style.display = '';
                    setTimeout(() => item.classList.add('fade-in'), 10);
                } else {
                    item.style.display = 'none';
                    item.classList.remove('fade-in');
                }
            });
        });
    });

    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            
            viewButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            servicesWrapper.className = `services-wrapper ${view}-view`;
            
            // Re-trigger fade-in animation
            serviceItems.forEach(item => {
                item.classList.remove('fade-in');
                setTimeout(() => item.classList.add('fade-in'), 10);
            });
        });
    });
}); 