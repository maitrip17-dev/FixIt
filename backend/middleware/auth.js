const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user from decoded payload (exclude password)
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          message: 'Not authorized, user account not found',
        });
      }

      req.user = user;
      return next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({
        message: 'Not authorized, token expired or invalid',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      message: 'Not authorized, no token provided',
    });
  }
};

module.exports = { protect };
