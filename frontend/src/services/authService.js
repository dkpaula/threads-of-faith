import axios from 'axios';

export const registerUser = async (email, password) => {
  try {
    const response = await axios.post('/api/auth/register', { email, password });

    alert('Registration successful!');
  } catch (error) {
    console.error('Registration error:', error);
    alert('Registration failed');
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post('/api/auth/login', { email, password });

    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw new Error('There was an error during login');
  }
};