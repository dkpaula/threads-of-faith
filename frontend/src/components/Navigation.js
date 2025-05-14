import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';

const Navigation = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const email = localStorage.getItem('userEmail');
    setIsLoggedIn(!!token);
    setUserEmail(email || '');
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsLoggedIn(false);
    setUserEmail('');
    navigate('/login');
  };

  return (
    <Navbar expand="lg" className="navbar-custom" variant="dark" fixed="top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand">
          <i className="bi bi-book-half me-2"></i>
          Threads of Faith HomePage
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/blogposts"
              className={location.pathname === '/blogposts' ? 'active' : ''}
            >
              <i className="bi bi-house-door me-1"></i>
              Home
            </Nav.Link>
            {isLoggedIn && (
              <Nav.Link 
                as={Link} 
                to="/create"
                className={location.pathname === '/create' ? 'active' : ''}
              >
                <i className="bi bi-plus-circle me-1"></i>
                New Post
              </Nav.Link>
            )}
          </Nav>

          <Nav>
            {!isLoggedIn ? (
              <>
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-light"
                  className="me-2"
                >
                  <i className="bi bi-box-arrow-in-right me-1"></i>
                  Login
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="light"
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Register
                </Button>
              </>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle variant="outline-light" id="user-dropdown">
                  <i className="bi bi-person-circle me-1"></i>
                  {userEmail}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/profile">
                    <i className="bi bi-person me-2"></i>
                    Profile
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/my-posts">
                    <i className="bi bi-file-text me-2"></i>
                    My Posts
                  </Dropdown.Item>
                  <Dropdown.Item as={Link} to="/settings">
                    <i className="bi bi-gear me-2"></i>
                    Settings
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>

      <style jsx>{`
        .navbar-custom {
          background: linear-gradient(135deg, #0d6efd 0%, #0dcaf0 100%);
          padding: 1rem 0;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .brand {
          font-size: 1.4rem;
          font-weight: 600;
          color: white !important;
        }

        .nav-link {
          color: rgba(255, 255, 255, 0.9) !important;
          font-weight: 500;
          padding: 0.5rem 1rem !important;
          border-radius: 0.375rem;
          transition: all 0.2s;
        }

        .nav-link:hover, .nav-link.active {
          color: white !important;
          background: rgba(255, 255, 255, 0.1);
        }

        .navbar-toggler {
          border-color: rgba(255, 255, 255, 0.5);
        }

        .navbar-toggler-icon {
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.9%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e");
        }

        .btn-outline-light {
          border-width: 2px;
        }

        .btn-outline-light:hover {
          transform: translateY(-1px);
        }

        .dropdown-toggle::after {
          margin-left: 0.5rem;
        }

        .dropdown-menu {
          border: none;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          border-radius: 0.5rem;
          margin-top: 0.5rem;
        }

        .dropdown-item {
          padding: 0.5rem 1rem;
          color: #495057;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
          color: #0d6efd;
        }

        .dropdown-divider {
          margin: 0.5rem 0;
        }

        @media (max-width: 991.98px) {
          .navbar-collapse {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 0.5rem;
            margin-top: 1rem;
          }

          .nav-link {
            padding: 0.75rem 1rem !important;
          }

          .btn-outline-light, .btn-light {
            width: 100%;
            margin: 0.5rem 0;
          }
        }
      `}</style>
    </Navbar>
  );
};

export default Navigation; 