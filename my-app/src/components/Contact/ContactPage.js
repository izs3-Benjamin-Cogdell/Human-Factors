import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./contact.css";

const ContactPage = () => {
  const navigate = useNavigate();
  const mainHeadingRef = useRef(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Set focus to main heading when component mounts
  useEffect(() => {
    mainHeadingRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic form validation
    if (name && email && message) {
      // Here you would normally send the form data to your backend
      console.log("Form submitted:", { name, email, message });
      
      // Show success message
      setFormSubmitted(true);
      setFormError(false);
      
      // Announce success to screen readers
      announceToScreenReader("Message sent successfully! We'll get back to you soon.");
    } else {
      setFormError(true);
      announceToScreenReader("Please fill out all required fields");
    }
  };

  // Helper function for screen reader announcements
  const announceToScreenReader = (message) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('sr-only');
    announcement.textContent = message;
    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 3000);
  };

  return (
    <main className="contact-container" role="main">
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <div className="contact-box" id="main-content">
        <h1 
          ref={mainHeadingRef}
          id="contact-heading" 
          tabIndex="-1"
          className="contact-heading"
        >
          Contact Us
        </h1>
        
        <p>Have questions, feedback, or just want to say hi? We'd love to hear from you!</p>

        {formSubmitted ? (
          <div className="success-message" role="alert">
            <p>Thank you for your message!</p>
            <p>We'll get back to you as soon as possible.</p>
          </div>
        ) : (
          <form 
            className="contact-form" 
            onSubmit={handleSubmit}
            aria-labelledby="contact-heading"
            noValidate
          >
            {formError && (
              <div className="error-message" role="alert">
                Please fill out all required fields.
              </div>
            )}
            
            <div className="input-group">
              <label htmlFor="name-input">Name</label>
              <input 
                id="name-input"
                type="text" 
                placeholder="Your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required 
                aria-required="true"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="email-input">Email</label>
              <input 
                id="email-input"
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                aria-required="true"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="message-input">Message</label>
              <textarea 
                id="message-input"
                placeholder="Write your message here..." 
                rows="4" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required 
                aria-required="true"
              />
            </div>
            
            <button 
              type="submit" 
              className="send-button"
              aria-label="Send your message"
            >
              Send Message
            </button>
          </form>
        )}

        <button 
          className="back-button" 
          onClick={() => navigate("/")}
          aria-label="Return to home page"
        >
          Back to Home
        </button>
      </div>
    </main>
  );
};

export default ContactPage;