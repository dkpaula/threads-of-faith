import Post from '../models/Post.js';

export const createPost = async (req, res) => {
  try {
    console.log('Creating post with data:', req.body);
    console.log('User from request:', req.user);
    
    const { title, content, category, tags, status, images } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Create new post with all fields
    const newPost = new Post({ 
      title, 
      content,
      contentType: 'html',
      category,
      tags,
      status,
      images,
      user: req.user._id 
    });

    const savedPost = await newPost.save();
    console.log('Post created successfully:', savedPost);
    
    // Populate user information before sending response
    const populatedPost = await Post.findById(savedPost._id)
      .populate('user', 'email')
      .populate('likes', 'email')
      .populate('comments.user', 'email');

    res.status(201).json(populatedPost);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ message: 'Failed to create post', error: err.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    console.log('Getting posts with query:', req.query);
    console.log('User:', req.user);
    
    const { page = 1, limit = 10, category, tag, search } = req.query;
    
    // Build query
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (tag) {
      query.tags = tag;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    console.log('MongoDB query:', query);

    // Execute query with pagination
    const posts = await Post.find(query)
      .populate('user', 'email')
      .populate('likes', 'email')
      .populate('comments.user', 'email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    console.log('Found posts:', posts.length);

    // Get total count for pagination
    const total = await Post.countDocuments(query);

    const response = {
      posts,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    };

    console.log('Sending response:', response);
    res.json(response);
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
};

export const getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'email')
      .populate('likes', 'email')
      .populate('comments.user', 'email');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ message: 'Failed to fetch post' });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
};

export const updatePost = async (req, res) => {
  try {
    const { title, content, category, tags, status, images } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Update post with new data
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { 
        title, 
        content,
        category,
        tags,
        status,
        images,
        contentType: 'html'
      },
      { new: true }
    )
    .populate('user', 'email')
    .populate('likes', 'email')
    .populate('comments.user', 'email');

    res.json(updatedPost);
  } catch (err) {
    console.error('Error updating post:', err);
    res.status(500).json({ message: 'Failed to update post' });
  }
};

// Comments
export const addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = {
      content: req.body.content,
      user: req.user._id
    };

    post.comments.push(comment);
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'email')
      .populate('likes', 'email')
      .populate('comments.user', 'email');

    res.status(201).json(updatedPost);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ message: 'Failed to add comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    comment.remove();
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'email')
      .populate('likes', 'email')
      .populate('comments.user', 'email');

    res.json(updatedPost);
  } catch (err) {
    console.error('Error deleting comment:', err);
    res.status(500).json({ message: 'Failed to delete comment' });
  }
};

// Likes
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user already liked the post
    if (post.likes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.push(req.user._id);
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'email')
      .populate('likes', 'email')
      .populate('comments.user', 'email');

    res.json(updatedPost);
  } catch (err) {
    console.error('Error liking post:', err);
    res.status(500).json({ message: 'Failed to like post' });
  }
};

export const unlikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Remove user from likes array
    post.likes = post.likes.filter(
      userId => userId.toString() !== req.user._id.toString()
    );
    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate('user', 'email')
      .populate('likes', 'email')
      .populate('comments.user', 'email');

    res.json(updatedPost);
  } catch (err) {
    console.error('Error unliking post:', err);
    res.status(500).json({ message: 'Failed to unlike post' });
  }
};