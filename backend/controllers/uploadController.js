export const uploadImage = async (req, res) => {
  try {
    console.log('Upload request received:', {
      headers: req.headers,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        filename: req.file.filename
      } : null,
      body: req.body,
      user: req.user
    });

    if (!req.file) {
      console.log('No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.file.filename) {
      console.log('No filename in uploaded file');
      return res.status(400).json({ error: 'File upload failed - no filename' });
    }

    // Validate mimetype
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      console.log('Invalid mimetype:', req.file.mimetype);
      return res.status(400).json({ error: 'Invalid file type. Only JPEG, PNG and GIF images are allowed.' });
    }

    // Create the URL for the uploaded file
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    console.log('File uploaded successfully:', {
      url: fileUrl,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Return the URL of the uploaded file
    res.json({
      url: fileUrl,
      message: 'File uploaded successfully',
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error details:', {
      error: error.message,
      stack: error.stack,
      headers: req.headers,
      body: req.body,
      file: req.file ? {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      } : null
    });
    res.status(500).json({ 
      error: 'Error uploading file',
      details: error.message 
    });
  }
}; 