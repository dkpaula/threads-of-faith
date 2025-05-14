import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, (req, res) => {
  res.json({
    message: `Welcome to the dashboard, user ID: ${req.user.id}`
  });
});

export default router;