const User = require("../models/userModel");


exports.createUser = async (req, res) => {
  try {
    // Destructure the fields from the request body
    const { name, email, password, role } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Create new user object with optional fields
    const newUser = new User({
      name: name || undefined, // Optional field
      email,
      password: password || undefined, // Optional field
      role: role || "User", // Default role if not provided
    });

    // Save the user
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// List all users (Admin only)
exports.listUsers = async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ message: "Only Admins can list users" });
    }
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
