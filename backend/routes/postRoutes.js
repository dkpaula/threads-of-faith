import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Post from '../models/Post.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

// Get all posts with pagination and filters
router.get('/', async (req, res) => {
  try {
    console.log('Getting posts with query:', req.query);
    const { page = 1, search = '', category = 'all', tag = '' } = req.query;
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (tag) {
      query.tags = tag;
    }

    console.log('MongoDB query:', query);

    const posts = await Post.find(query)
      .populate('user', 'email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    console.log('Found posts:', posts.length);

    // Format dates and add view count
    const formattedPosts = posts.map(post => ({
      ...post.toObject(),
      formattedDate: new Date(post.createdAt).toLocaleDateString()
    }));

    res.json({
      posts: formattedPosts,
      totalPages,
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error in GET /posts:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'email')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'email'
        }
      });
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment view count
    post.views = (post.views || 0) + 1;
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Error in GET /posts/:id:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
});

// Create post
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Creating new post...');
    console.log('User from request:', req.user);
    console.log('Request body:', req.body);
    
    const { title, content, category, tags, status = 'published' } = req.body;
    
    if (!title || !content) {
      console.log('Validation failed: Missing title or content');
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const images = req.files ? req.files.map(file => ({
      url: `http://localhost:4001/uploads/${file.filename}`,
      caption: ''
    })) : [];

    // Handle tags properly
    let processedTags = [];
    if (typeof tags === 'string' && tags.trim()) {
      processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    } else if (Array.isArray(tags)) {
      processedTags = tags.filter(tag => tag && typeof tag === 'string');
    }

    console.log('Creating post with data:', {
      title,
      content: content.substring(0, 50) + '...',
      user: req.user.id,
      category,
      processedTags,
      status
    });

    const post = new Post({
      title,
      content,
      user: req.user.id,
      images,
      category: category || '',
      tags: processedTags,
      status
    });

    console.log('Attempting to save post...');
    const savedPost = await post.save();
    console.log('Post saved successfully:', savedPost._id);
    
    // Populate user information before sending response
    const populatedPost = await Post.findById(savedPost._id)
      .populate('user', 'email');
    
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error in POST /posts:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error creating post',
      error: error.message,
      details: error.stack
    });
  }
});

// Update post
router.put('/:id', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    console.log('Updating post:', req.params.id);
    console.log('Update data:', req.body);

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    const { title, content, category, tags, status } = req.body;
    
    // Handle new images if any
    const newImages = req.files ? req.files.map(file => ({
      url: `http://localhost:4001/uploads/${file.filename}`,
      caption: ''
    })) : [];

    // Process tags properly
    let processedTags = post.tags; // Keep existing tags as default
    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        processedTags = tags.filter(tag => tag && typeof tag === 'string');
      } else if (typeof tags === 'string') {
        processedTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    // Update post fields
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = processedTags;
    post.status = status || post.status;
    
    if (newImages.length > 0) {
      post.images = [...post.images, ...newImages];
    }

    console.log('Saving updated post with data:', {
      title: post.title,
      category: post.category,
      tags: post.tags,
      status: post.status
    });

    const updatedPost = await post.save();
    console.log('Post updated successfully');
    
    // Populate user information before sending response
    const populatedPost = await Post.findById(updatedPost._id)
      .populate('user', 'email');

    res.json(populatedPost);
  } catch (error) {
    console.error('Error in PUT /posts/:id:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      message: 'Error updating post',
      error: error.message,
      details: error.stack
    });
  }
});

// Delete post
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    // Delete associated images
    post.images.forEach(image => {
      const filename = image.url.split('/').pop();
      const filepath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    });

    // Use deleteOne instead of remove
    await Post.deleteOne({ _id: req.params.id });
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /posts/:id:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
});

// Add comment
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      content: req.body.content,
      user: req.user.id,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'email')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'email'
        }
      });

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error('Error in POST /posts/:id/comments:', error);
    res.status(500).json({ message: 'Error adding comment' });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Use pull() instead of remove() which is deprecated
    post.comments.pull({ _id: req.params.commentId });
    await post.save();
    
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'email')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'email'
        }
      });
      
    res.json(populatedPost);
  } catch (error) {
    console.error('Error in DELETE /posts/:postId/comments/:commentId:', error);
    res.status(500).json({ message: 'Error deleting comment' });
  }
});

// Update comment
router.put('/:postId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this comment' });
    }

    // Update the comment content
    comment.content = req.body.content;
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate('user', 'email')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'email'
        }
      });

    res.json(populatedPost);
  } catch (error) {
    console.error('Error in PUT /posts/:postId/comments/:commentId:', error);
    res.status(500).json({ message: 'Error updating comment' });
  }
});

// Like post
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if already liked, but don't error out - just return the post
    if (post.likes.includes(req.user.id)) {
      console.log('Post already liked by user:', req.user.id);
      return res.status(200).json(post); // Return 200 with the post rather than 400
    }

    post.likes.push(req.user.id);
    await post.save();
    
    // Return the populated post
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'email')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'email'
        }
      });
      
    res.json(populatedPost);
  } catch (error) {
    console.error('Error in POST /posts/:id/like:', error);
    res.status(500).json({ message: 'Error liking post' });
  }
});

// Unlike post
router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const index = post.likes.indexOf(req.user.id);
    
    // Check if not liked, but don't error out - just return the post
    if (index === -1) {
      console.log('Post not liked yet by user:', req.user.id);
      return res.status(200).json(post); // Return 200 with the post rather than 400
    }

    post.likes.splice(index, 1);
    await post.save();
    
    // Return the populated post
    const populatedPost = await Post.findById(post._id)
      .populate('user', 'email')
      .populate({
        path: 'comments',
        populate: {
          path: 'user',
          select: 'email'
        }
      });
      
    res.json(populatedPost);
  } catch (error) {
    console.error('Error in DELETE /posts/:id/like:', error);
    res.status(500).json({ message: 'Error unliking post' });
  }
});

export default router;