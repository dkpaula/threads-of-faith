import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists with proper permissions
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.chmodSync(uploadsDir, 0o755);
}

// Ensure directory is writable
try {
  fs.accessSync(uploadsDir, fs.constants.W_OK);
} catch (error) {
  console.error('Upload directory is not writable:', error);
  fs.chmodSync(uploadsDir, 0o755);
}

// Configure storage with error handling
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Double-check directory exists and is writable
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      fs.chmodSync(uploadsDir, 0o755);
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and random number
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = uniqueSuffix + ext;
    
    // Log filename creation
    console.log('Creating file:', filename);
    cb(null, filename);
  }
});

// Enhanced file filter with detailed validation
const fileFilter = (req, file, cb) => {
  console.log('Processing file:', file.originalname);

  // Check file exists
  if (!file) {
    console.error('No file provided');
    return cb(new Error('No file provided'), false);
  }

  // Check MIME type
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    console.error('Invalid mime type:', file.mimetype);
    return cb(new Error(`Invalid file type. Only JPEG, PNG and GIF images are allowed. Got: ${file.mimetype}`), false);
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
  if (!allowedExtensions.includes(ext)) {
    console.error('Invalid file extension:', ext);
    return cb(new Error(`Invalid file extension. Only ${allowedExtensions.join(', ')} files are allowed. Got: ${ext}`), false);
  }

  // Log successful validation
  console.log('File validated successfully:', file.originalname);
  cb(null, true);
};

// Create multer upload instance with error handling
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
    files: 1 // Only allow 1 file at a time
  }
}).single('image'); // Configure for single file upload

// Export a wrapped version with error handling
export default function uploadMiddleware(req, res, next) {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      console.error('Multer error:', err);
      return res.status(400).json({
        error: 'Upload error',
        message: err.message,
        code: err.code
      });
    } else if (err) {
      // An unknown error occurred
      console.error('Unknown upload error:', err);
      return res.status(500).json({
        error: 'Upload failed',
        message: err.message
      });
    }
    // Everything went fine
    next();
  });
} 