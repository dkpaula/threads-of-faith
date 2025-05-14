import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Form, Button, Alert, Card, Spinner } from 'react-bootstrap';
import { register } from '../services/api';
import { UserContext } from '../UserContext';
import '../styles/Auth.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login: loginContext } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call the register API with the form data
      const response = await register({
        email,
        password
      });

      // Store the token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userEmail', email);
        loginContext(response.data.token);
      }
      
      // Navigate to blog posts
      navigate('/blogposts');
      
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', error);
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
              <i className="bi bi-person-plus auth-icon"></i>
              <h2 className="auth-title">Create Account</h2>
              <p className="auth-subtitle">Join our faith community</p>
            </div>

            {error && (
              <Alert variant="danger" className="auth-alert auth-alert-danger">
                <i className="bi bi-exclamation-circle me-2"></i>
                {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
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
                  />
                </div>
              </Form.Group>

              <Form.Group className="auth-input-group">
                <Form.Label className="auth-form-label">Confirm Password</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <i className="bi bi-shield-lock"></i>
                  </span>
                  <Form.Control
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
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
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </Button>
            </Form>

            <div className="auth-alt-action">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign In
                </Link>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Register;