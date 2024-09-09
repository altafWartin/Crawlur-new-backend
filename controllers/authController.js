const User = require("../models/userModel");
const { generateToken } = require("../utils/jwtUtils");

// Signup
exports.signup = async (req, res) => {
  const { name, email, password, role } = req.body;

  console.log("Received data:", { name, email, password, role });

  if (!["Admin", "Analyst", "User"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const newUser = new User({ name, email, password, role });
    await newUser.save();
    const token = generateToken(newUser);
    res.status(201).json({ message: `${role} created successfully.`, newUser, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "User") {
      return res.status(403).json({ message: "User role cannot log in" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change Password
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid old password" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Forget Password
exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  // In a real app, send an email to reset the password
  res.status(200).json({ message: "Password reset email sent." });
};
