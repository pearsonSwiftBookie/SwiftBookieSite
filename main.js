document.addEventListener('DOMContentLoaded', () => {
    // Animate stats on scroll
    const stats = document.querySelectorAll('.stat-number');
    const statsSection = document.querySelector('.hero-stats');
    
    function animateStats() {
        stats.forEach(stat => {
            const target = parseInt(stat.textContent);
            let current = 0;
            const increment = target / 50; // Adjust speed of counting
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    clearInterval(timer);
                    current = target;
                }
                stat.textContent = Math.round(current) + (stat.textContent.includes('+') ? '+' : '%');
            }, 30);
        });
    }

    // Trigger stats animation when in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStats();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    if (statsSection) {
        observer.observe(statsSection);
    }

    // Animate service cards on scroll
    const serviceCards = document.querySelectorAll('.service-card');
    const featureItems = document.querySelectorAll('.feature-item');

    const fadeInOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const fadeInOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                fadeInOnScroll.unobserve(entry.target);
            }
        });
    }, fadeInOptions);

    serviceCards.forEach(card => {
        card.style.opacity = '0';
        fadeInOnScroll.observe(card);
    });

    featureItems.forEach(item => {
        item.style.opacity = '0';
        fadeInOnScroll.observe(item);
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

    // Service card hover effect
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const icon = card.querySelector('.service-icon');
            icon.style.transform = 'scale(1.1) rotate(5deg)';
        });

        card.addEventListener('mouseleave', () => {
            const icon = card.querySelector('.service-icon');
            icon.style.transform = 'scale(1) rotate(0deg)';
        });
    });

    // Feature items hover effect
    featureItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const icon = item.querySelector('.feature-icon');
            icon.style.transform = 'translateY(-5px)';
        });

        item.addEventListener('mouseleave', () => {
            const icon = item.querySelector('.feature-icon');
            icon.style.transform = 'translateY(0)';
        });
    });

    // Add parallax effect to hero section
    const hero = document.querySelector('.hero');
    window.addEventListener('scroll', () => {
        const scroll = window.pageYOffset;
        if (hero) {
            hero.style.backgroundPosition = `center ${scroll * 0.5}px`;
        }
    });

    // Typing animation for hero text
    class TypeWriter {
        constructor(element, phrases, options = {}) {
            this.element = element;
            this.phrases = phrases;
            this.currentPhrase = 0;
            this.currentChar = 0;
            this.isDeleting = false;
            this.typeSpeed = options.typeSpeed || 100;
            this.deleteSpeed = options.deleteSpeed || 50;
            this.pauseBeforeDelete = options.pauseBeforeDelete || 2000;
            this.pauseBeforeType = options.pauseBeforeType || 500;
            this.loop = options.loop !== undefined ? options.loop : true;
        }

        type() {
            const currentText = this.phrases[this.currentPhrase];
            
            if (this.isDeleting) {
                // Deleting text
                this.currentChar--;
                this.element.innerHTML = currentText.substring(0, this.currentChar) + '<span class="cursor">|</span>';
                
                if (this.currentChar === 0) {
                    this.isDeleting = false;
                    this.currentPhrase = (this.currentPhrase + 1) % this.phrases.length;
                    setTimeout(() => this.type(), this.pauseBeforeType);
                    return;
                }
                
                setTimeout(() => this.type(), this.deleteSpeed);
            } else {
                // Typing text
                this.currentChar++;
                this.element.innerHTML = currentText.substring(0, this.currentChar) + '<span class="cursor">|</span>';
                
                if (this.currentChar === currentText.length) {
                    if (this.loop) {
                        this.isDeleting = true;
                        setTimeout(() => this.type(), this.pauseBeforeDelete);
                    }
                    return;
                }
                
                setTimeout(() => this.type(), this.typeSpeed);
            }
        }

        start() {
            this.type();
        }
    }

    // Initialize typing animation when DOM is loaded
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const phrases = [
            "Streamline Your Bookings with Smart Solutions",
            "Schedule Smarter, Not Harder",
            "Effortless Booking at Your Fingertips",
            "Transform Your Reservation Experience",
            "Book Anything, Anytime, Anywhere"
        ];

        const typeWriter = new TypeWriter(heroTitle, phrases, {
            typeSpeed: 80,
            deleteSpeed: 40,
            pauseBeforeDelete: 2000,
            pauseBeforeType: 500
        });
        
        typeWriter.start();
    }

    // Service details modal functionality
    function initServiceDetailsModal() {
        const modal = document.getElementById('service-details-modal');
        const detailsButtons = document.querySelectorAll('.details-btn');
        const closeButton = modal.querySelector('.close-modal');
        const modalOverlay = modal.querySelector('.modal-overlay');
        const modalContent = modal.querySelector('.modal-content');

        function openModal(serviceId) {
            const template = document.getElementById(`${serviceId}-details`);
            if (template) {
                modalContent.innerHTML = template.innerHTML;
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
    }

    // Initialize when DOM is loaded
    initServiceDetailsModal();
}); 