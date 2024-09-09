const User = require('../models/userModel');

// Create Analyst account (Admin only)
exports.createAnalyst = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only Admins can create Analysts' });
        }

        const newAnalyst = new User({ name, email, password, role: 'Analyst' });
        await newAnalyst.save();
        res.status(201).json({ message: 'Analyst created successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// List all users (Admin only)
exports.listUsers = async (req, res) => {
    try {
        if (req.user.role !== 'Admin') {
            return res.status(403).json({ message: 'Only Admins can list users' });
        }
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
