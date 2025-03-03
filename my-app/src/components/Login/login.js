import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with", email, password);
    // Add authentication logic here
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Login to TipSmart</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
          <button type="submit" className="login-button">Login</button>
        </form>
        <p className="register-link">Don't have an account? <Link to="/signup">Sign up</Link></p>
        <button className="back-button" onClick={() => navigate("/")}>Back to Home</button>
      </div>
    </div>
  );
};

export default LoginPage;