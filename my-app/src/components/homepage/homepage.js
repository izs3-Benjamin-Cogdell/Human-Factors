import React, { useState, useEffect } from "react";
import "./homepage.css";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [userName, setUserName] = useState(null);

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
    <div className="homepage-container">
      {/* Header */}
      <header className="homepage-header">
        <div className="brand-name">TIPSMART | CALCULATOR</div>
        <button className="home-button">HOME</button>
      </header>

      <main className="main-content">
        {/* Main Content */}
        <div className="welcome-section">
          <div className="emoji-container">
            <div className="money-emoji">💰</div>
          </div>
          
          <h1 className="welcome-title">Hi, Welcome to TipSmart.</h1>
          <p className="welcome-subtitle">
            Fast. Accurate. Convenient tipping.
          </p>

          <div className="button-container">
            <Link to="/get-started" className="nav-link">
              <button className="nav-button">
                CALCULATE TIP
              </button>
            </Link>
            
            <Link to="/features" className="nav-link">
              <button className="nav-button">
                FEATURES
              </button>
            </Link>
            
            <Link to="/about" className="nav-link">
              <button className="nav-button">
                ABOUT
              </button>
            </Link>
            
            <Link to="/contact" className="nav-link">
              <button className="nav-button">
                CONTACT US
              </button>
            </Link>
            
            {userName ? (
              <div className="user-welcome">
                <span className="user-name">WELCOME, {userName.toUpperCase()}</span>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-link">
                <button className="nav-button">
                  LOGIN
                </button>
              </Link>
            )}
          </div>
        </div>
      </main>

      {/* Features section */}
      <section className="features-section">
        <h3 className="features-title">Why Use TipSmart?</h3>
        
        <div className="features-list">
          <div className="feature-item">
            <h4 className="feature-heading">💡 Accurate Calculations</h4>
            <p className="feature-description">Instantly calculate the perfect tip based on your bill.</p>
          </div>
          
          <div className="feature-item">
            <h4 className="feature-heading">⚙️ Customizable Percentages</h4>
            <p className="feature-description">Set your own tipping preferences and round-up options.</p>
          </div>
          
          <div className="feature-item">
            <h4 className="feature-heading">🎯 Easy to Use</h4>
            <p className="feature-description">A simple and intuitive interface designed for convenience.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <p className="copyright">&copy; 2025 TipSmart. Developed and secured by You.</p>
      </footer>
    </div>
  );
};

export default HomePage;