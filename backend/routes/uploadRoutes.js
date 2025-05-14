import express from 'express';
import uploadMiddleware from '../middleware/uploadMiddleware.js';
import { uploadImage } from '../controllers/uploadController.js';
import { authenticateToken as auth } from '../middleware/auth.js';

const router = express.Router();

// Wrap the route handler with error handling
router.post('/', auth, uploadMiddleware, async (req, res, next) => {
  try {
    await uploadImage(req, res);
  } catch (error) {
    console.error('Error in upload route:', error);
    next(error);
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  console.error('Upload route error:', error);
  res.status(500).json({
    error: 'Upload failed',
    message: error.message
  });
});

export default router; 