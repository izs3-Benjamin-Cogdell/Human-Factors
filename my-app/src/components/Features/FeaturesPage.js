import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./features.css";

const FeaturesPage = () => {
  const navigate = useNavigate();
  const mainHeadingRef = useRef(null);

  // Set focus to the heading when component mounts for better screen reader navigation
  useEffect(() => {
    mainHeadingRef.current?.focus();
  }, []);

  return (
    <main className="features-container" role="main">
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <div className="features-box" id="main-content">
        <h1 
          ref={mainHeadingRef}
          id="features-heading" 
          tabIndex="-1"
          className="features-heading"
        >
          TipSmart Features
        </h1>

        <ul className="features-list" aria-labelledby="features-heading">
          <li>
            <span aria-hidden="true">💡</span> 
            <strong>Accurate Calculations:</strong> Automatically calculate
            the perfect tip based on your bill and service quality.
          </li>
          <li>
            <span aria-hidden="true">⚙️</span> 
            <strong>Customizable Settings:</strong> Adjust your default tip
            percentage, rounding rules, and currency.
          </li>
          <li>
            <span aria-hidden="true">📊</span> 
            <strong>Spending Insights:</strong> Keep track of your tipping
            habits over time and get helpful insights.
          </li>
          <li>
            <span aria-hidden="true">🔒</span> 
            <strong>Secure Login:</strong> Your data is safe with
            token-based authentication and encrypted storage.
          </li>
        </ul>

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

export default FeaturesPage;