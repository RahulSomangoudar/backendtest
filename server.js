const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS

// const corsOptions = {
//   origin: "https://frontendtest-cy64.onrender.com/", // Replace with your frontend URL
//   credentials: true,
// };

// app.use(cors(corsOptions));



// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI, {
})
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch(err => console.error("Failed to connect to MongoDB Atlas", err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});




// User Model
const User = mongoose.model("User", userSchema);

// Registration Route
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error, please try again" });
  }
});


// Login Route
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // Find user
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid username or password" });
  }

  res.status(200).json({ message: "Login successful" });
});


app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; font-src 'self' https://fonts.gstatic.com;"
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});



// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
