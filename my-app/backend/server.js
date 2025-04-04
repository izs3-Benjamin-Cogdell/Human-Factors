require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/Users");

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ MongoDB Connection
if (!process.env.MONGO_URI) {
  console.error("❌ MONGO_URI is missing! Check your .env file.");
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  dbName: "Userdata", // Ensure it's the right database
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("✅ Connected to MongoDB Userdata"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

// ✅ Simple Route
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// ✅ Signup Route
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please fill in all fields." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists. Try logging in." });
    }

    // Save the new user
    const newUser = new User({ name, email, password });
    await newUser.save();

    res.status(201).json({ message: "Account created successfully! 🎉" });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});

// ✅ Login Route
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password." });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if password matches
    // Note: In a real app, you should hash passwords and use bcrypt.compare
    if (user.password !== password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate token (in a real app, use JWT)
    // For simplicity, we're just sending a basic token here
    const token = user._id.toString();

    res.status(200).json({ 
      token,
      userId: user._id,
      name: user.name,
      message: "Login successful!" 
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});

// ✅ Test Route for Debugging
app.get("/api/test", (req, res) => {
  res.json({ message: "API is working correctly!" });
});

// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});