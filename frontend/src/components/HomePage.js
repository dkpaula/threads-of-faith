import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../styles/BlogPosts.css';
import '../styles/HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleJoinCommunity = () => {
    navigate('/register');
  };

  return (
    <div>
      <div className="hero-section">
        <Container>
          <Row className="align-items-center">
            <Col md={8} className="mx-auto text-center">
              <h1 className="header-title mb-3">Welcome to Threads of Faith</h1>
              <p className="lead mb-4">
                Share your faith journey, read inspiring stories, and connect with fellow believers.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Button 
                  variant="primary" 
                  className="btn-primary read-more-btn"
                  onClick={handleGetStarted}
                >
                  Get Started <i className="bi bi-arrow-right ms-2"></i>
                </Button>
                <Button 
                  variant="light" 
                  className="btn-sign-in"
                  onClick={handleSignIn}
                >
                  Sign In <i className="bi bi-person-circle ms-2"></i>
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-4">
        <div className="page-header text-center mb-4">
          <h2 className="section-title">What We Offer</h2>
          <p className="lead">Explore the features of our Christian community</p>
        </div>
        <Row className="g-4">
          <Col md={4}>
            <Card className="h-100 text-center post-card" data-aos="fade-up">
              <Card.Body>
                <div className="mb-3">
                  <span className="feature-icon">
                    <i className="bi bi-book fs-3" style={{ color: '#8B2635' }}></i>
                  </span>
                </div>
                <Card.Title className="post-title">Daily Devotionals</Card.Title>
                <Card.Text className="post-excerpt">
                  Start your day with inspiring devotionals and biblical insights that strengthen your faith journey.
                </Card.Text>
                <div className="mt-3">
                  <Badge 
                    bg="light" 
                    text="dark" 
                    className="interactive-badge"
                  >
                    Scripture
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 text-center post-card" data-aos="fade-up" data-aos-delay="100">
              <Card.Body>
                <div className="mb-3">
                  <span className="feature-icon">
                    <i className="bi bi-people fs-3" style={{ color: '#8B2635' }}></i>
                  </span>
                </div>
                <Card.Title className="post-title">Community</Card.Title>
                <Card.Text className="post-excerpt">
                  Connect with other believers, share your faith journey, and grow together in a supportive environment.
                </Card.Text>
                <div className="mt-3">
                  <Badge 
                    bg="light" 
                    text="dark" 
                    className="interactive-badge"
                  >
                    Fellowship
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 text-center post-card" data-aos="fade-up" data-aos-delay="200">
              <Card.Body>
                <div className="mb-3">
                  <span className="feature-icon">
                    <i className="bi bi-heart fs-3" style={{ color: '#8B2635' }}></i>
                  </span>
                </div>
                <Card.Title className="post-title">Prayer Requests</Card.Title>
                <Card.Text className="post-excerpt">
                  Share your prayer requests and pray for others in need, supporting each other through life's challenges.
                </Card.Text>
                <div className="mt-3">
                  <Badge 
                    bg="light" 
                    text="dark" 
                    className="interactive-badge"
                  >
                    Prayer
                  </Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <Container className="py-4">
        <div className="sidebar-card">
          <Row className="align-items-center">
            <Col lg={6}>
              <h2 className="post-title mb-3">About Our Community</h2>
              <p className="post-excerpt mb-3">
                Our platform exists for sharing faith, hope, and love through written words.
                We believe in the power of testimonies and spiritual insights to encourage and uplift others.
              </p>
              <p className="post-excerpt mb-3">
                Whether you're a seasoned writer or just starting your journey of faith,
                we welcome you to contribute your stories and experiences.
              </p>
              <Button 
                variant="primary" 
                className="read-more-btn"
                onClick={handleJoinCommunity}
              >
                Join Our Community <i className="bi bi-people ms-2"></i>
              </Button>
            </Col>
            <Col lg={6} className="text-center mt-4 mt-lg-0">
              <div className="bible-verse-signature">
                <blockquote className="verse-text">
                  "Let the redeemed of the Lord tell their story— those he redeemed from the hand of the foe."
                </blockquote>
                <div className="verse-reference">
                  — Psalm 107:2 (NIV)
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default HomePage;