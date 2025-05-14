import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    console.log('Auth Headers:', req.headers.authorization);
    let token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
      console.log('Attempting to verify token...');
      const decoded = jwt.verify(token, 'your-secret-key');
      console.log('Token decoded:', decoded);
      
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        console.log('No user found with ID:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }
      
      console.log('User authenticated:', user.email);
      req.user = user;
      next();
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } catch (err) {
    console.error('Auth middleware error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};