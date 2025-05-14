import React, { useState, useContext } from 'react';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { UserContext } from '../UserContext';
import '../styles/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: loginContext } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Call the login API with the form data
      console.log('Attempting login with:', { email });
      const response = await login({ email, password });
      console.log('Login successful, response:', response);
      
      if (response.data && response.data.token) {
        // Store the token and user email
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userEmail', email);
        
        // Update user context
        loginContext(response.data.token);
        
        // Navigate to blog posts page
        navigate('/blogposts');
      } else {
        throw new Error('Invalid response format - no token received');
      }
      
    } catch (err) {
      console.error('Login error:', err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to login. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="auth-container">
      <div className="w-100" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <Card className="auth-card">
          <Card.Body className="p-4">
            <div className="auth-header">
              <i className="bi bi-person-circle auth-icon"></i>
              <h2 className="auth-title">Sign In</h2>
              <p className="auth-subtitle">Welcome back</p>
            </div>

            {error && (
              <Alert variant="danger" className="auth-alert auth-alert-danger">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit} autoComplete="on">
              <Form.Group className="auth-input-group">
                <Form.Label className="auth-form-label">Email</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    inputMode="email"
                  />
                </div>
              </Form.Group>

              <Form.Group className="auth-input-group">
                <Form.Label className="auth-form-label">Password</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-lock"></i>
                  </span>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                  />
                </div>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="auth-button w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="auth-spinner"
                    />
                    Logging in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </Form>

            <div className="auth-alt-action">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Register
                </Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Login;