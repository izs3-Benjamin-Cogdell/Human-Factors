import React from "react";
import { useNavigate } from "react-router-dom";
import "./features.css";

const FeaturesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="features-container">
      <div className="features-box">
        <h2>TipSmart Features</h2>

        <ul className="features-list">
          <li>
            <strong>💡 Accurate Calculations:</strong> Automatically calculate
            the perfect tip based on your bill and service quality.
          </li>
          <li>
            <strong>⚙️ Customizable Settings:</strong> Adjust your default tip
            percentage, rounding rules, and currency.
          </li>
          <li>
            <strong>📊 Spending Insights:</strong> Keep track of your tipping
            habits over time and get helpful insights.
          </li>
          <li>
            <strong>🔒 Secure Login:</strong> Your data is safe with
            token-based authentication and encrypted storage.
          </li>
        </ul>

        <button className="back-button" onClick={() => navigate("/")}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default FeaturesPage;