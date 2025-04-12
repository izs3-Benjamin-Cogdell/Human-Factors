import React from "react";
import "./about.css";

const AboutPage = () => {
  return (
    <div className="about-container">
      <h1>About TipSmart</h1>

      <div className="about-section">
        <h2>It’s a Cashless Society</h2>
        <p>
          Many of us have been in a situation where we want to leave a tip but unfortunately, we don’t have cash. In today's digital world, we value convenience, self-time, and practicality — we are a cashless society.
        </p>
        <p>
          Non-cash transactions are growing by over 13% annually — even more in some regions. Cards, especially contactless ones, offer the ease and speed we crave. But this evolution has complicated how we tip.
        </p>
        <p>
          That’s where TipSmart comes in — a simple, fast, and smart solution for showing gratitude in a cashless world.
        </p>
      </div>

      <div className="about-section">
        <h2>Digital Evolution at Your Fingertips</h2>
        <p>
          We're living in an age of digital transformation. Innovation drives us, and TipSmart is a part of that wave — making tipping seamless, meaningful, and secure.
        </p>
        <p>
          As a FinTech tool, TipSmart transforms how we express appreciation, helping users tip digitally, easily, and intentionally.
        </p>
      </div>

      <div className="about-section">
        <h2>Social Responsibility</h2>
        <p>
          Physical currency requires vast energy and resources to produce. TipSmart helps reduce the environmental impact by encouraging digital tipping instead of coins and bills.
        </p>
        <p>
          With TipSmart, you contribute to a more sustainable future while spreading kindness.
        </p>
      </div>

      <div className="about-section contact-info">
        <h2>Get in Touch</h2>
        <p>Email: info@tipsmart.app</p>
        <p>Phone: +321 456 7890</p>
        <p>Address: 123 TipSmart Street, San Marcos, TX 78666</p>
      </div>
    </div>
  );
};

export default AboutPage;
