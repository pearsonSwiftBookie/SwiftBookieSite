import { useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  useEffect(() => {
    // Initialize any scripts that need to run after page load
    if (typeof window !== 'undefined') {
      // Load your custom scripts
      const scripts = [
        '/js/main.js',
        '/js/ai.js',
        '/js/utils.js',
        '/js/config.js'
      ];
      
      scripts.forEach(src => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
      });
    }
  }, []);

  return (
    <>
      <Head>
        <title>Swiftbookie - AI-Powered Scheduling</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta charSet="UTF-8" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
        <link rel="stylesheet" href="/css/styles.css" />
      </Head>

      <div className="animated-bg">
        <div className="sunset-glow"></div>
        {/* Stars and particles would be here */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`star-${i}`} className="star" style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite alternate-reverse`
          }}></div>
        ))}
        
        {/* Clouds */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`cloud-${i}`} className="cloud"></div>
        ))}
        
        {/* Nebulas */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`nebula-${i}`} className="nebula"></div>
        ))}
        
        {/* Particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`particle-${i}`} className="particle"></div>
        ))}
      </div>

      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">
            <img src="/images/logo.png" alt="Swiftbookie Logo" />
            <span>Swiftbookie</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#pricing">Pricing</a>
            <a href="#contact">Contact</a>
            <button className="login-btn">Login</button>
            <button className="get-started-btn">Get Started</button>
          </div>
        </div>
      </nav>

      <header className="hero">
        <div className="hero-content">
          <h1>Your <span className="accent">AI</span> Powered Scheduling <span className="accent">Assistant</span></h1>
          <p>Effortlessly schedule meetings, manage your calendar, and optimize your time with AI-powered automation.</p>
          <div className="cta-buttons">
            <button className="primary-btn">Get Started for Free</button>
            <button className="secondary-btn">
              <i className="fas fa-play-circle"></i>
              See How It Works
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="phone-mockup">
            <div className="phone-screen">
              <div className="chat-container">
                <div className="chat-message assistant">
                  <p>Hello! I'm your AI scheduling assistant. How can I help you today?</p>
                </div>
                <div className="chat-message user">
                  <p>I need to schedule a meeting with my team next week</p>
                </div>
                <div className="chat-message assistant">
                  <p>Sure thing! Let me find the best time when everyone is available. What day works best for you?</p>
                </div>
                <div className="chat-message user">
                  <p>Preferably Tuesday or Wednesday afternoon</p>
                </div>
                <div className="chat-message assistant typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section id="features" className="features">
        <h2>Smart Features for Busy Professionals</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-robot"></i>
            </div>
            <h3>AI Scheduling</h3>
            <p>Let our AI automatically find the perfect time slots that work for everyone's schedule.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h3>Calendar Management</h3>
            <p>Sync with your existing calendars for a unified view of all your commitments.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-globe"></i>
            </div>
            <h3>Time Zone Intelligence</h3>
            <p>Schedule across time zones without confusion. We handle all the conversions for you.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-link"></i>
            </div>
            <h3>Meeting Links</h3>
            <p>Automatically generate and include video conferencing links in your invitations.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-bell"></i>
            </div>
            <h3>Smart Reminders</h3>
            <p>Get intelligent reminders that adapt to your response patterns and preferences.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <h3>Productivity Analytics</h3>
            <p>Gain insights into your meeting habits and find opportunities to optimize your time.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="how-it-works">
        <h2>How Swiftbookie Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Connect Your Calendar</h3>
              <p>Link your Google Calendar, Outlook, or other calendar services to Swiftbookie.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Tell Our AI Your Needs</h3>
              <p>Chat naturally with our AI about the meeting you want to schedule.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Review Suggestions</h3>
              <p>Our AI finds optimal time slots based on everyone's availability.</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Confirm & Send Invites</h3>
              <p>With one click, confirm your choice and we'll send all the invitations.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="demo" className="demo-section">
        <h2>See Swiftbookie in Action</h2>
        <div className="calendar-widget">
          <iframe 
            src="https://calendar.google.com/calendar/embed?height=600&wkst=1&bgcolor=%23ffffff&ctz=America%2FNew_York&showTitle=0&showNav=1&showPrint=0&showTabs=1&showCalendars=0" 
            style={{border: "solid 1px #777", width: "100%", height: "500px"}} 
            frameBorder="0" 
            scrolling="no"
          ></iframe>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <h2>Simple, Transparent Pricing</h2>
        <div className="pricing-cards">
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Free</h3>
              <div className="price">$0</div>
              <p>Perfect for individuals</p>
            </div>
            <ul className="pricing-features">
              <li><i className="fas fa-check"></i> Up to 5 meetings per month</li>
              <li><i className="fas fa-check"></i> Basic AI scheduling</li>
              <li><i className="fas fa-check"></i> Single calendar integration</li>
              <li><i className="fas fa-check"></i> Email support</li>
            </ul>
            <button className="pricing-btn">Get Started</button>
          </div>
          <div className="pricing-card featured">
            <div className="popular-tag">Most Popular</div>
            <div className="pricing-header">
              <h3>Pro</h3>
              <div className="price">$12<span>/month</span></div>
              <p>For busy professionals</p>
            </div>
            <ul className="pricing-features">
              <li><i className="fas fa-check"></i> Unlimited meetings</li>
              <li><i className="fas fa-check"></i> Advanced AI scheduling</li>
              <li><i className="fas fa-check"></i> Multiple calendar integration</li>
              <li><i className="fas fa-check"></i> Priority support</li>
              <li><i className="fas fa-check"></i> Team scheduling</li>
              <li><i className="fas fa-check"></i> Custom meeting links</li>
            </ul>
            <button className="pricing-btn">Start Free Trial</button>
          </div>
          <div className="pricing-card">
            <div className="pricing-header">
              <h3>Team</h3>
              <div className="price">$8<span>/user/month</span></div>
              <p>For teams of 5+</p>
            </div>
            <ul className="pricing-features">
              <li><i className="fas fa-check"></i> All Pro features</li>
              <li><i className="fas fa-check"></i> Team analytics</li>
              <li><i className="fas fa-check"></i> Admin controls</li>
              <li><i className="fas fa-check"></i> SSO & SAML</li>
              <li><i className="fas fa-check"></i> API access</li>
              <li><i className="fas fa-check"></i> Dedicated account manager</li>
            </ul>
            <button className="pricing-btn">Contact Sales</button>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials">
        <h2>Trusted by Thousands of Professionals</h2>
        <div className="testimonial-slider">
          <div className="testimonial">
            <div className="quote">
              <i className="fas fa-quote-left"></i>
            </div>
            <p>"Swiftbookie has saved me hours every week. The AI understands exactly what I need and handles all the back-and-forth of scheduling."</p>
            <div className="testimonial-author">
              <img src="https://randomuser.me/api/portraits/women/42.jpg" alt="Sarah Johnson" />
              <div>
                <h4>Sarah Johnson</h4>
                <p>Marketing Director</p>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="quote">
              <i className="fas fa-quote-left"></i>
            </div>
            <p>"As a consultant juggling multiple clients, Swiftbookie has been a game-changer. The time zone feature alone is worth every penny."</p>
            <div className="testimonial-author">
              <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="Michael Chen" />
              <div>
                <h4>Michael Chen</h4>
                <p>Management Consultant</p>
              </div>
            </div>
          </div>
          <div className="testimonial">
            <div className="quote">
              <i className="fas fa-quote-left"></i>
            </div>
            <p>"Our entire sales team uses Swiftbookie. It's increased our meeting scheduling efficiency by 40% and eliminated double-bookings."</p>
            <div className="testimonial-author">
              <img src="https://randomuser.me/api/portraits/women/65.jpg" alt="Lisa Rodriguez" />
              <div>
                <h4>Lisa Rodriguez</h4>
                <p>VP of Sales</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="contact" className="contact">
        <h2>Ready to Transform Your Scheduling?</h2>
        <p>Get in touch with our team for a personalized demo or any questions you might have.</p>
        <div className="contact-container">
          <div className="contact-form">
            <form id="contactForm">
              <div className="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" required />
              </div>
              <div className="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required />
              </div>
              <div className="form-group">
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="4" required></textarea>
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
          </div>
          <div className="contact-info">
            <div className="info-item">
              <i className="fas fa-envelope"></i>
              <p>support@swiftbookie.com</p>
            </div>
            <div className="info-item">
              <i className="fas fa-phone"></i>
              <p>+1 (555) 123-4567</p>
            </div>
            <div className="info-item">
              <i className="fas fa-map-marker-alt"></i>
              <p>123 AI Avenue, San Francisco, CA 94105</p>
            </div>
            <div className="social-links">
              <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
              <a href="#" className="social-link"><i className="fab fa-linkedin-in"></i></a>
              <a href="#" className="social-link"><i className="fab fa-facebook-f"></i></a>
              <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <img src="/images/logo.png" alt="Swiftbookie Logo" />
            <span>Swiftbookie</span>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Integrations</a>
              <a href="#">Updates</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
              <a href="#">Press</a>
            </div>
            <div className="footer-column">
              <h4>Resources</h4>
              <a href="#">Documentation</a>
              <a href="#">Help Center</a>
              <a href="#">Tutorials</a>
              <a href="#">API</a>
            </div>
            <div className="footer-column">
              <h4>Legal</h4>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Security</a>
              <a href="#">GDPR</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2023 Swiftbookie. All rights reserved.</p>
          <div className="language-selector">
            <span>English (US)</span>
            <i className="fas fa-chevron-down"></i>
          </div>
        </div>
      </footer>
    </>
  );
}