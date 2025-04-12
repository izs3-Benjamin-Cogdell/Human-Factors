import React from "react";
import { useNavigate } from "react-router-dom";
import "./contact.css";

const ContactPage = () => {
  const navigate = useNavigate();

  return (
    <div className="contact-container">
      <div className="contact-box">
        <h2>Contact Us</h2>
        <p>Have questions, feedback, or just want to say hi? We'd love to hear from you!</p>

        <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
          <div className="input-group">
            <label>Name</label>
            <input type="text" placeholder="Your name" required />
          </div>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="you@example.com" required />
          </div>
          <div className="input-group">
            <label>Message</label>
            <textarea placeholder="Write your message here..." rows="4" required />
          </div>
          <button type="submit" className="send-button">Send Message</button>
        </form>

        <button className="back-button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default ContactPage;
