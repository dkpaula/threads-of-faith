import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserContext } from '../UserContext';
import { Container, Nav, Navbar as BootstrapNavbar } from 'react-bootstrap';

const Navbar = () => {
  const { user } = useContext(UserContext);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <BootstrapNavbar expand="lg" className={`custom-navbar ${scrolled ? 'scrolled' : ''}`}>
        <Container>
          <BootstrapNavbar.Brand as={Link} to="/" className="brand-logo">
            Threads of Faith
          </BootstrapNavbar.Brand>
          <BootstrapNavbar.Toggle aria-controls="navbar-nav">
            <span className="navbar-toggler-icon"></span>
          </BootstrapNavbar.Toggle>
          <BootstrapNavbar.Collapse id="navbar-nav">
            <Nav className="ms-auto">
              {user ? (
                <>
                  <Nav.Link
                    as={Link}
                    to="/"
                    className={`nav-link-custom home-link ${location.pathname === '/' ? 'active' : ''}`}
                  >
                    <i className="bi bi-house-door-fill me-1"></i>
                    Home
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/blogposts"
                    className={`nav-link-custom ${location.pathname === '/blogposts' ? 'active' : ''}`}
                  >
                    <i className="bi bi-journal-richtext me-1"></i>
                    Blog Posts
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/createpost"
                    className={`nav-link-custom ${location.pathname === '/createpost' ? 'active' : ''}`}
                  >
                    <i className="bi bi-plus-circle me-1"></i>
                    New Post
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/logout"
                    className="nav-link-custom logout-link"
                  >
                    <i className="bi bi-box-arrow-right me-1"></i>
                    Logout
                  </Nav.Link>
                </>
              ) : (
                <>
                  <Nav.Link
                    as={Link}
                    to="/"
                    className={`nav-link-custom home-link ${location.pathname === '/' ? 'active' : ''}`}
                  >
                    <i className="bi bi-house-door-fill me-1"></i>
                    Home
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/login"
                    className={`nav-link-custom ${location.pathname === '/login' ? 'active' : ''}`}
                  >
                    <i className="bi bi-person me-1"></i>
                    Login
                  </Nav.Link>
                  <Nav.Link
                    as={Link}
                    to="/register"
                    className={`nav-link-custom register-link ${location.pathname === '/register' ? 'active' : ''}`}
                  >
                    <i className="bi bi-person-plus me-1"></i>
                    Register
                  </Nav.Link>
                </>
              )}
            </Nav>
          </BootstrapNavbar.Collapse>
        </Container>
      </BootstrapNavbar>

      <style jsx>{`
        .custom-navbar {
          background: linear-gradient(to right, rgba(139, 38, 53, 0.97), rgba(169, 53, 69, 0.97));
          backdrop-filter: blur(10px);
          padding: 1rem 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-bottom: 1px solid rgba(212, 175, 55, 0.2);
        }

        .custom-navbar.scrolled {
          box-shadow: 0 4px 20px rgba(139, 38, 53, 0.2);
          padding: 0.75rem 0;
          background: linear-gradient(to right, rgba(139, 38, 53, 0.98), rgba(169, 53, 69, 0.98));
        }

        .brand-logo {
          color: #ffffff !important;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: 0.5px;
          position: relative;
          padding: 0.5rem 0;
          transition: all 0.3s ease;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .brand-logo:hover {
          transform: translateY(-1px);
          color: #d4af37 !important;
        }

        .brand-logo i {
          color: #d4af37;
          transition: transform 0.3s ease;
        }

        .brand-logo:hover i {
          transform: rotate(-5deg) scale(1.1);
        }

        .navbar-toggler {
          border: none;
          padding: 0.5rem;
          transition: all 0.3s ease;
        }

        .navbar-toggler:focus {
          box-shadow: none;
          transform: rotate(90deg);
        }

        .navbar-toggler-icon {
          background-image: none;
          position: relative;
          width: 24px;
          height: 24px;
        }

        .navbar-toggler-icon::before,
        .navbar-toggler-icon::after {
          content: '';
          position: absolute;
          width: 24px;
          height: 2px;
          background: #ffffff;
          left: 0;
          transition: all 0.3s ease;
        }

        .navbar-toggler-icon::before {
          top: 8px;
        }

        .navbar-toggler-icon::after {
          bottom: 8px;
        }

        .nav-link-custom {
          color: rgba(255, 255, 255, 0.9) !important;
          font-weight: 500;
          padding: 0.5rem 1rem !important;
          margin: 0 0.25rem;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
          position: relative;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
        }

        .nav-link-custom::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 1rem;
          right: 1rem;
          height: 2px;
          background: linear-gradient(90deg, #d4af37, rgba(212, 175, 55, 0.5));
          transform: scaleX(0);
          transform-origin: right;
          transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link-custom:hover {
          color: #d4af37 !important;
          transform: translateY(-1px);
        }

        .nav-link-custom:hover::after {
          transform: scaleX(1);
          transform-origin: left;
        }

        .nav-link-custom.active {
          color: #d4af37 !important;
          background: rgba(212, 175, 55, 0.1);
        }

        .nav-link-custom.active::after {
          transform: scaleX(1);
        }

        .nav-link-custom i {
          transition: transform 0.3s ease;
        }

        .nav-link-custom:hover i {
          transform: translateY(-1px) scale(1.1);
        }

        .register-link {
          background: linear-gradient(45deg, #d4af37, #e5c158);
          color: #8B2635 !important;
          padding: 0.5rem 1.25rem !important;
          border-radius: 0.75rem;
          margin-left: 0.5rem;
          font-weight: 600;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
        }

        .register-link::after {
          display: none;
        }

        .register-link:hover {
          color: #8B2635 !important;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
          background: linear-gradient(45deg, #e5c158, #f6d364);
        }

        .logout-link {
          color: #ffffff !important;
          border: 2px solid rgba(255, 255, 255, 0.8);
          margin-left: 0.5rem;
        }

        .logout-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #d4af37 !important;
          border-color: #d4af37;
        }

        @media (max-width: 991px) {
          .nav-link-custom {
            margin: 0.5rem 0;
            text-align: center;
          }

          .register-link {
            margin: 0.5rem 0;
            text-align: center;
          }

          .navbar-toggler-icon::before,
          .navbar-toggler-icon::after {
            background: #d4af37;
          }
        }

        .home-link {
          background-color: rgba(212, 175, 55, 0.2);
          border: 1px solid rgba(212, 175, 55, 0.3);
          font-weight: 600;
          position: relative;
          overflow: hidden;
          margin-right: 0.75rem;
        }

        .home-link:hover {
          background-color: rgba(212, 175, 55, 0.3);
        }

        .home-link::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(212, 175, 55, 0.3), transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
          top: 0;
          left: 0;
        }

        .home-link:hover::before {
          opacity: 1;
        }
      `}</style>
    </>
  );
};

export default Navbar;