import React, { useState, useEffect } from "react";
import "./homepage.css";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [userName, setUserName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in when component mounts
    const storedUserName = localStorage.getItem('userName');
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    
    console.log('localStorage values:', {
      userName: storedUserName,
      isLoggedIn: loggedInStatus
    });
    
    setUserName(storedUserName || '');
    setIsLoggedIn(loggedInStatus);
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('isLoggedIn');
    
    // Update state
    setIsLoggedIn(false);
    setUserName('');
  };

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <h1 className="logo">TipSmart</h1>
        <nav>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#contact">Contact</a></li>
            {isLoggedIn ? (
              <li className="user-section">
                <span className="user-greeting">Welcome, {userName}!</span>
                <button className="logout-button" onClick={handleLogout}>Logout</button>
              </li>
            ) : (
              <li><Link to="/login">Login</Link></li>
            )}
          </ul>
        </nav>
      </header>
      
      {/* Hero Section */}
      <section className="hero">
        <h2>Smarter Tipping, Made Easy</h2>
        <p>Calculate tips effortlessly and make smarter financial decisions.</p>
        <button className="cta-button">Get Started</button>
      </section>
      
      {/* Features Section */}
      <section id="features" className="features">
        <h3>Why Use TipSmart?</h3>
        <div className="feature-list">
          <div className="feature-card">
            <h4>💡 Accurate Calculations</h4>
            <p>Instantly calculate the perfect tip based on your bill.</p>
          </div>
          <div className="feature-card">
            <h4>⚙️ Customizable Percentages</h4>
            <p>Set your own tipping preferences and round-up options.</p>
          </div>
          <div className="feature-card">
            <h4>🎯 Easy to Use</h4>
            <p>A simple and intuitive interface designed for convenience.</p>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="cta">
        <h3>Start Tipping Smarter Today!</h3>
        <button className="cta-button">Download Now</button>
      </section>
      
      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 TipSmart. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;