import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://192.168.1.22:4001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000, // Add timeout
});

// Rest of the file remains unchanged
// ... existing code ... 