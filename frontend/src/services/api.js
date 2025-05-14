import axios from 'axios';

// Determine the appropriate base URL based on the environment
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  
  // If we're on a mobile device or different machine than the server
  if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
    // Use the actual IP address of the server
    return `http://${hostname}:5001/api`;
  }
  
  // On localhost/same device as server
  return 'http://localhost:5001/api';
};

// Create axios instance with base configuration
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000, // Increase timeout for mobile connections
  withCredentials: false // Ensure CORS works for cross-origin requests
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making request to:', config.url);
    console.log('Request data:', config.data);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Token found and added to headers');
    } else {
      console.warn('No token found in localStorage');
    }
    
    console.log('Final request config:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    
    // Don't modify Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('Response error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: error.config
    });
    
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout');
      alert('Connection timed out. Please try again.');
    } else if (!error.response) {
      console.error('Network error - server might be down');
      alert('Network error. Please check your connection.');
    } else if (error.response.status === 401) {
      console.error('Authentication error - token might be invalid or expired');
      localStorage.removeItem('token'); // Clear invalid token
      alert('Authentication error. Please login again.');
    } else {
      console.error('Server error:', error.response.data);
      alert('Server error: ' + (error.response?.data?.message || 'Unknown error'));
    }
    return Promise.reject(error);
  }
);

// Auth API
export const register = (userData) => 
  api.post('/auth/register', userData);

export const login = (credentials) => 
  api.post('/auth/login', credentials);

// Posts API
export const getPosts = (params = {}) => 
  api.get('/posts', { params });

export const getPost = (id) => 
  api.get(`/posts/${id}`);

export const createPost = (postData) =>
  api.post('/posts', postData);

export const updatePost = async (id, postData) => {
  try {
    console.log('Making update request for post:', id);
    console.log('Update data:', postData);
    
    const response = await api.put(`/posts/${id}`, postData);
    console.log('Update response:', response);
    
    return response;
  } catch (error) {
    console.error('Error in updatePost:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;
  }
};

export const deletePost = async (id) => {
  try {
    const response = await api.delete(`/posts/${id}`);
    console.log('Delete response:', response);
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
};

// Comments API
export const addComment = (postId, commentData) => 
  api.post(`/posts/${postId}/comments`, commentData);

export const deleteComment = (postId, commentId) => 
  api.delete(`/posts/${postId}/comments/${commentId}`);

export const updateComment = (postId, commentId, commentData) => 
  api.put(`/posts/${postId}/comments/${commentId}`, commentData);

// Likes API
export const likePost = (postId) => 
  api.post(`/posts/${postId}/like`);

export const unlikePost = (postId) => 
  api.delete(`/posts/${postId}/like`);

// User API
export const updateProfile = (userData) =>
  api.put('/users/profile', userData);

export const uploadAvatar = (formData) =>
  api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

// Search API
export const searchPosts = (query) =>
  api.get('/posts/search', { params: { q: query } });

// Image Upload API
export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response;
};

export default api; 