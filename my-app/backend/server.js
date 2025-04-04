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


// ✅ Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
