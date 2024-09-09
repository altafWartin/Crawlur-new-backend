const jwt = require('jsonwebtoken');
require("dotenv").config();

const secretKey = process.env.JWT_SECRET_KEY;
console.log('JWT Secret Key:', process.env.JWT_SECRET_KEY);
exports.generateToken = (user) => {
    return jwt.sign(
        { id: user._id, role: user.role },
        secretKey,
        { expiresIn: '1d' }
    );
};
