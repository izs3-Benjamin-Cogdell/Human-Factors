import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation hook
import "./Signup.css"; // Import the CSS file

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMessage(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error before request

    try {
      const response = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An unexpected error occurred.");
      }

      alert("✅ " + data.message);
      navigate("/login"); // Redirect to login after signup success
    } catch (error) {
      console.error("❌ Signup Error:", error);
      setErrorMessage(error.message); // Display error in UI
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Sign Up Now</h2>
        <p className="signup-subtext">Please fill in the details to create an account</p>

        {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display errors */}

        <form onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} required />

          <button type="submit" className="signup-button">Sign Up</button>
        </form>

        <button className="secondary-button" onClick={() => navigate("/")}>🏠 Back to Home</button>
        <button className="secondary-button" onClick={() => navigate("/login")}>🔑 Go to Login</button>
      </div>
    </div>
  );
};

export default Signup;
