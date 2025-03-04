import { useState } from "react";
import "./Signup.css"; // Import the CSS file

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("❌ Signup Error:", error);
      alert("Signup failed. Check the console for details.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">

        <h2>Sign Up Now</h2>
        <p className="signup-subtext">Please fill in the details to create an account</p>
        
        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

          <div className="forgot-password">Forgot Password?</div>

          <button type="submit" className="signup-button">Sign Up</button>
        </form>

        <p className="login-link">Already have an account? <span>Log in</span></p>

      </div>
    </div>
  );
};

export default Signup;
