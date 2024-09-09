const jwt = require("jsonwebtoken");
require("dotenv").config();

const secretKey = process.env.JWT_SECRET_KEY;

exports.authenticate = (req, res, next) => {
  // Log the entire request headers to see what is being received

  // Extract token from Authorization header
  const authHeader = req.headers["authorization"];
  console.log(authHeader)

  const token = authHeader;

  // Check if token is present
  if (!token) {
    console.log("No token provided.");
    return res.status(401).json({ message: "No token provided." });
  }

  // Verify the token
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    // Attach user data to the request object
    req.user = decoded;

    // Continue to the next middleware or route handler
    next();
  });
};
