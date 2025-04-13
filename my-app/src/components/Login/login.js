import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  // Refs for focus management
  const emailInputRef = useRef(null);
  const errorRef = useRef(null);

  // Set focus to email input when component mounts
  useEffect(() => {
    // Set initial focus to email input for keyboard users
    emailInputRef.current?.focus();
  }, []);

  // Move focus to error message when it appears
  useEffect(() => {
    if (error) {
      errorRef.current?.focus();
    }
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", email, password);
      
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      console.log("Login successful:", data);
      
      // Store user data in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.name);
      localStorage.setItem('userId', data.userId);
      
      // Announce successful login to screen readers
      announceToScreenReader("Login successful. Redirecting to home page.");
      
      // Redirect to homepage
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function for screen reader announcements
  const announceToScreenReader = (message) => {
    // Create and use an ARIA live region for dynamic announcements
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'assertive');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.classList.add('sr-only'); // visually hidden but available to screen readers
    announcement.textContent = message;
    document.body.appendChild(announcement);

    // Remove after announcement is made
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 3000);
  };

  return (
    <div className="login-container" role="main">
      <div className="login-box">
        <h1 id="login-heading">Login to TipSmart</h1>
        
        {error && (
          <div 
            ref={errorRef}
            className="error-message" 
            role="alert"
            tabIndex="-1"
            aria-live="assertive"
          >
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} aria-labelledby="login-heading">
          <div className="input-group">
            <label htmlFor="email-input">Email</label>
            <input 
              ref={emailInputRef}
              id="email-input"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              aria-required="true"
              aria-describedby="email-hint"
            />
            <div id="email-hint" className="sr-only">Enter the email address you used to register</div>
          </div>
          
          <div className="input-group">
            <label htmlFor="password-input">Password</label>
            <input 
              id="password-input"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              aria-required="true"
              aria-describedby="password-hint"
            />
            <div id="password-hint" className="sr-only">Enter your password</div>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <p className="register-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
        
        <button 
          className="back-button" 
          onClick={() => navigate("/")}
          aria-label="Return to home page"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default LoginPage;