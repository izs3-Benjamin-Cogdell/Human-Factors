import React, { useState, useEffect } from "react";
import "./homepage.css";
import { Link, useNavigate } from "react-router-dom";

const HomePage = () => {
  const [userName, setUserName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check localStorage for user info when component mounts
    const storedName = localStorage.getItem('userName');
    const storedToken = localStorage.getItem('token');
    
    if (storedName && storedToken) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    
    // Update state
    setUserName(null);
    
    // Optional: redirect to homepage (already there, but refreshes state)
    window.location.reload();
  };

  return (
    <div className="homepage">
      {/* Header */}
      <header className="header">
        <h1 className="logo">TipSmart</h1>
        <nav>
          <ul className="nav-links">
          <li><Link to="/features">Features</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>

            
            {userName ? (
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
        <Link to="/get-started">
  <button className="cta-button">Calculate Tip </button>
</Link>

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
      
      {/* Call to Action
      <section className="cta">
        <h3>Start Tipping Smarter Today!</h3>
        <button className="cta-button">Download Now</button>
      </section> */}
      
      {/* Footer */}
      <footer className="footer">
        <p>&copy; 2025 TipSmart. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;