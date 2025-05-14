// server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import Post from './models/Post.js';
import User from './models/User.js';
import postRoutes from './routes/postRoutes.js';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept'],
  credentials: true,
  exposedHeaders: ['Content-Length', 'X-Content-Type-Options']
}));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir, { recursive: true });
    // Set proper permissions for the uploads directory
    fs.chmodSync(uploadsDir, 0o755);
    console.log('Created uploads directory:', uploadsDir);
}

// Ensure uploads directory is accessible and writable
try {
    fs.accessSync(uploadsDir, fs.constants.W_OK);
    console.log('Uploads directory is writable:', uploadsDir);
} catch (error) {
    console.error('Error with uploads directory:', error);
    // Try to fix permissions
    fs.chmodSync(uploadsDir, 0o755);
}

// Serve static files from the uploads directory with proper headers
app.use('/uploads', (req, res, next) => {
    res.set('Cache-Control', 'no-cache');
    next();
}, express.static(uploadsDir));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// JWT middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, 'your-secret-key');
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Auth Routes
const authRouter = express.Router();

authRouter.post('/register', async (req, res) => {
  try {
    console.log('Register attempt:', req.body);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = new User({ email, password });
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, 'your-secret-key');
    console.log('User registered successfully:', email);
    res.status(201).json({ token });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error creating user', error: error.message });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, 'your-secret-key');
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Import upload routes
import uploadRoutes from './routes/uploadRoutes.js';

// Mount routers
app.use('/api/auth', authRouter);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);

// Start the server
const PORT = process.env.PORT || 4001;

// Start server and connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/christian_blog')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    }).on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please stop any other servers using this port.`);
      } else {
        console.error('Server error:', error);
      }
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });