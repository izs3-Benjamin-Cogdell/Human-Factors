import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./about.css";

const AboutPage = () => {
  const navigate = useNavigate();
  const mainHeadingRef = useRef(null);

  // Set focus to main heading when component mounts for better screen reader navigation
  useEffect(() => {
    mainHeadingRef.current?.focus();
  }, []);

  return (
    <main className="about-container" role="main">
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <div id="main-content">
        <h1 
          ref={mainHeadingRef}
          id="about-heading" 
          tabIndex="-1"
          className="about-heading"
        >
          About TipSmart
        </h1>

        <div className="nav-buttons">
          <button 
            className="home-button" 
            onClick={() => navigate("/")}
            aria-label="Return to home page"
          >
            Home
          </button>
        </div>

        <section className="about-section" aria-labelledby="section-cashless">
          <h2 id="section-cashless">It's a Cashless Society</h2>
          <p>
            Many of us have been in a situation where we want to leave a tip but unfortunately, we don't have cash. In today's digital world, we value convenience, self-time, and practicality — we are a cashless society.
          </p>
          <p>
            Non-cash transactions are growing by over 13% annually — even more in some regions. Cards, especially contactless ones, offer the ease and speed we crave. But this evolution has complicated how we tip.
          </p>
          <p>
            That's where TipSmart comes in — a simple, fast, and smart solution for showing gratitude in a cashless world.
          </p>
        </section>

        <section className="about-section" aria-labelledby="section-digital">
          <h2 id="section-digital">Digital Evolution at Your Fingertips</h2>
          <p>
            We're living in an age of digital transformation. Innovation drives us, and TipSmart is a part of that wave — making tipping seamless, meaningful, and secure.
          </p>
          <p>
            As a FinTech tool, TipSmart transforms how we express appreciation, helping users tip digitally, easily, and intentionally.
          </p>
        </section>

        <section className="about-section" aria-labelledby="section-responsibility">
          <h2 id="section-responsibility">Social Responsibility</h2>
          <p>
            Physical currency requires vast energy and resources to produce. TipSmart helps reduce the environmental impact by encouraging digital tipping instead of coins and bills.
          </p>
          <p>
            With TipSmart, you contribute to a more sustainable future while spreading kindness.
          </p>
        </section>

        <section className="about-section contact-info" aria-labelledby="section-contact">
          <h2 id="section-contact">Get in Touch</h2>
          <address>
            <p>Email: <a href="mailto:info@tipsmart.app" aria-label="Send email to info at tipsmart dot app">info@tipsmart.app</a></p>
            <p>Phone: <a href="tel:+3214567890" aria-label="Call 3 2 1, 4 5 6, 7 8 9 0">+321 456 7890</a></p>
            <p>Address: 123 TipSmart Street, San Marcos, TX 78666</p>
          </address>
        </section>
      </div>
    </main>
  );
};

export default AboutPage;