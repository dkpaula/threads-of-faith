// src/components/BlogPosts.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, deletePost } from '../services/api';
import { Card, Button, Container, Row, Col, Spinner, Alert, Pagination, InputGroup, Form, Badge, ButtonGroup, Modal } from 'react-bootstrap';
import { jwtDecode } from 'jwt-decode';
import DOMPurify from 'dompurify';
import DailyVerse from './DailyVerse';
import '../styles/BlogPosts.css';

const BlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [visiblePosts, setVisiblePosts] = useState([]);
  const postsRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Effect to handle debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery === '' || searchQuery.length >= 3) {
        setDebouncedSearchTerm(searchQuery);
      }
    }, 600);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Effect to fetch posts when necessary
  useEffect(() => {
    if (debouncedSearchTerm === '' || debouncedSearchTerm.length >= 3) {
      fetchPosts();
    }
  }, [debouncedSearchTerm, currentPage, selectedCategory]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsSearching(true);
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Keep focus during loading
      if (isSearching && searchInputRef.current) {
        searchInputRef.current.focus();
      }

      const response = await getPosts({
        page: currentPage,
        search: debouncedSearchTerm,
        category: selectedCategory
      });

      const postsData = response.data.posts || [];
      
      // Keep focus before updating state
      if (isSearching && searchInputRef.current) {
        searchInputRef.current.focus();
      }
      
      setPosts(postsData);
      setTotalPages(response.data.totalPages || 1);
      
      const uniqueCategories = [...new Set(postsData
        .map(post => post.category)
        .filter(category => category)
      )];
      setCategories(uniqueCategories);

    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to fetch posts. Please try again later.');
    } finally {
      setLoading(false);
      // Maintain focus after loading completes
      if (isSearching && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }
  };

  // Animate posts appearance as they load
  useEffect(() => {
    if (posts.length > 0 && !loading) {
      setVisiblePosts([]);
      const timer = setTimeout(() => {
        setVisiblePosts(posts);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [posts, loading]);

  // Scroll to top when changing page
  useEffect(() => {
    if (postsRef.current) {
      postsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    const strippedContent = content.replace(/<[^>]+>/g, '');
    if (strippedContent.length <= maxLength) return strippedContent;
    return strippedContent.substring(0, maxLength) + '...';
  };

  const createMarkup = (html) => {
    return { __html: DOMPurify.sanitize(html) };
  };

  const renderPostContent = (content) => {
    // Strip HTML tags for preview and limit to 200 characters
    const strippedContent = content.replace(/<[^>]+>/g, ' ').trim();
    return strippedContent.length > 200 
      ? `${strippedContent.substring(0, 200)}...` 
      : strippedContent;
  };

  const confirmDelete = (postId) => {
    setPostToDelete(postId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!postToDelete) {
      setError('No post selected for deletion');
      return;
    }

    try {
      setError(null);
      await deletePost(postToDelete);
      setShowDeleteModal(false);
      setPostToDelete(null);
      // Refresh posts after deletion
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      setError(
        error.response?.data?.message || 
        error.response?.data?.error ||
        'Failed to delete post. Please try again.'
      );
    }
  };

  const renderPagination = () => {
    let items = [];
    
    // Show limited pagination items for better UX
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    // Add ellipsis if needed
    const showStartEllipsis = startPage > 1;
    const showEndEllipsis = endPage < totalPages;
    
    // Create pagination items
    if (showStartEllipsis) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>1</Pagination.Item>,
        <Pagination.Ellipsis key="start-ellipsis" disabled />
      );
    }
    
    for (let number = startPage; number <= endPage; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
          className="pagination-item"
        >
          {number}
        </Pagination.Item>
      );
    }
    
    if (showEndEllipsis) {
      items.push(
        <Pagination.Ellipsis key="end-ellipsis" disabled />,
        <Pagination.Item key={totalPages} onClick={() => handlePageChange(totalPages)}>
          {totalPages}
        </Pagination.Item>
      );
    }
    
    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination className="custom-pagination">
          <Pagination.First
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="pagination-nav"
          />
          <Pagination.Prev
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-nav"
          />
          {items}
          <Pagination.Next
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-nav"
          />
          <Pagination.Last
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="pagination-nav"
          />
        </Pagination>
      </div>
    );
  };

  // Add effect to maintain focus during renders
  useEffect(() => {
    if (isSearching && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearching, loading]);

  // Update the filteredPosts logic to handle local filtering
  const filteredPosts = posts.filter(post => {
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Update the empty state message
  const getEmptyStateMessage = () => {
    if (searchQuery && searchQuery.length < 3) {
      return 'Please enter at least 3 characters to search';
    }
    if (searchQuery) {
      return `No posts match your search "${searchQuery}"`;
    }
    if (selectedCategory !== 'all') {
      return `No posts in category "${selectedCategory}"`;
    }
    return 'No posts available yet';
  };

  if (loading) {
    return (
      <Container className="py-5 text-center loading-container">
        <div className="pulse-loader">
          <Spinner animation="border" style={{ color: '#8B2635' }} />
        </div>
        <p className="mt-3 loading-text">Loading inspiring posts...</p>
      </Container>
    );
  }

  return (
    <Container className="py-5" ref={postsRef}>
      {error && (
        <Alert variant="danger" className="mb-4 fade-in error-alert">
          <i className="bi bi-exclamation-circle me-2"></i>
          {error}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <div className="page-header">
            <div className="header-content">
              <h1 className="header-title">
                Threads of Faith
              </h1>
              <p className="lead">Sharing God's Word and Life's Journey</p>
            </div>
            <div className="search-section">
              <Row className="g-3">
                <Col md={6}>
                  <InputGroup className="search-input">
                    <InputGroup.Text className="bg-white border-end-0">
                      <i className="bi bi-search text-accent"></i>
                    </InputGroup.Text>
                    <Form.Control
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={handleSearchChange}
                      className="border-start-0 shadow-none"
                      autoComplete="off"
                      onFocus={() => setIsSearching(true)}
                      onBlur={() => setIsSearching(false)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select shadow-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </Col>
                {localStorage.getItem('token') && (
                  <Col md={2}>
                    <Button
                      as={Link}
                      to="/createpost"
                      variant="primary"
                      className="w-100 create-post-btn"
                    >
                      <i className="bi bi-plus-circle me-2"></i>
                      New Post
                    </Button>
                  </Col>
                )}
              </Row>
            </div>
          </div>

          {posts.length === 0 && !loading && (
            <div className="text-center py-5 empty-state">
              <div className="empty-icon-container">
                <i className="bi bi-journal-x"></i>
              </div>
              <h3 className="mt-3 empty-title">No posts found</h3>
              <p className="empty-subtitle">
                {getEmptyStateMessage()}
              </p>
              {(searchQuery || selectedCategory !== 'all') && (
                <Button 
                  variant="outline-accent" 
                  onClick={() => {
                    setSearchQuery('');
                    setDebouncedSearchTerm('');
                    setSelectedCategory('all');
                    setCurrentPage(1);
                  }}
                  className="mt-3 reset-filters-btn"
                >
                  <i className="bi bi-arrow-repeat me-2"></i>
                  Reset Filters
                </Button>
              )}
            </div>
          )}

          <div className="posts-container">
            {visiblePosts.map((post, index) => (
              <Card 
                key={post._id} 
                className="post-card mb-4 hover-shadow" 
                style={{
                  animationDelay: `${index * 0.1}s`,
                  transform: 'translateY(0)',
                  transition: 'all 0.3s ease-in-out'
                }}
              >
                <Card.Body className="p-4">
                  <div className="post-meta d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex align-items-center">
                      <div className="author-avatar me-3">
                        {post.user?.profileImage ? (
                          <img 
                            src={post.user.profileImage} 
                            alt={post.user?.email} 
                            className="rounded-circle"
                            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="default-avatar">
                            <i className="bi bi-person-circle fs-1"></i>
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="author-name fw-bold">{post.user?.email}</div>
                        <div className="post-date text-muted small">
                          <i className="bi bi-calendar3 me-1"></i>
                          {formatDate(post.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="tags-container">
                      {post.category && (
                        <Badge bg="primary" className="me-2 category-badge">
                          <i className="bi bi-bookmark-fill me-1"></i>
                          {post.category}
                        </Badge>
                      )}
                      {post.tags && post.tags.map(tag => (
                        <Badge key={tag} bg="light" text="dark" className="me-1 tag-badge">
                          <i className="bi bi-tag-fill me-1"></i>
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Card.Title className="post-title h4 mb-3">{post.title}</Card.Title>
                  <Card.Text className="post-excerpt mb-4">
                    {truncateContent(post.content)}
                  </Card.Text>
                  <div className="post-footer d-flex justify-content-between align-items-center">
                    <Button
                      as={Link}
                      to={`/post/${post._id}`}
                      variant="primary"
                      className="read-more-btn"
                    >
                      Read More
                      <i className="bi bi-arrow-right ms-2"></i>
                    </Button>
                    {currentUserId === post.user?._id && (
                      <div className="post-actions d-flex gap-2">
                        <Button
                          as={Link}
                          to={`/edit/${post._id}`}
                          variant="outline-primary"
                          className="edit-btn"
                          size="sm"
                        >
                          <i className="bi bi-pencil-fill me-1"></i>
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          className="delete-btn"
                          size="sm"
                          onClick={() => {
                            setPostToDelete(post._id);
                            setShowDeleteModal(true);
                          }}
                        >
                          <i className="bi bi-trash-fill me-1"></i>
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>

          {totalPages > 1 && renderPagination()}
        </Col>

        <Col lg={4}>
          <div className="sidebar">
            <DailyVerse />
            
            <Card className="sidebar-card categories-card mb-4 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="sidebar-title mb-4">
                  <i className="bi bi-tags me-2 text-primary"></i>
                  Categories
                </h5>
                <div className="d-flex flex-wrap gap-2 categories-container">
                  <Badge
                    bg={selectedCategory === 'all' ? 'primary' : 'light'}
                    text={selectedCategory === 'all' ? 'light' : 'dark'}
                    className="category-badge px-3 py-2"
                    style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                    onClick={() => setSelectedCategory('all')}
                  >
                    All Posts
                  </Badge>
                  {categories.map(category => (
                    <Badge
                      key={category}
                      bg={selectedCategory === category ? 'primary' : 'light'}
                      text={selectedCategory === category ? 'light' : 'dark'}
                      className="category-badge px-3 py-2"
                      style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>

            <Card className="sidebar-card about-card shadow-sm">
              <Card.Body className="p-4">
                <h5 className="sidebar-title mb-3">
                  <i className="bi bi-info-circle me-2 text-primary"></i>
                  About Our Blog
                </h5>
                <p className="about-text mb-4">
                  Welcome to our Christian blog community! This is a place to share your faith journey,
                  inspire others, and grow together in Christ. Feel free to contribute your thoughts,
                  testimonies, and reflections.
                </p>
                {!localStorage.getItem('token') && (
                  <div className="d-grid">
                    <Button 
                      as={Link} 
                      to="/register" 
                      variant="primary" 
                      className="join-btn"
                      size="lg"
                    >
                      <i className="bi bi-person-plus me-2"></i>
                      Join Our Community
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)}
        centered
        className="delete-modal"
      >
        <Modal.Header closeButton className="border-bottom-0">
          <Modal.Title className="text-danger">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            Confirm Deletion
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center py-4">
          <div className="mb-4">
            <i className="bi bi-trash-fill text-danger fs-1"></i>
          </div>
          <p className="mb-0">Are you sure you want to delete this post? This action cannot be undone.</p>
          {error && (
            <Alert variant="danger" className="mt-3">
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="border-top-0">
          <Button variant="outline-secondary" onClick={() => setShowDeleteModal(false)}>
            <i className="bi bi-x-circle me-2"></i>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            <i className="bi bi-trash-fill me-2"></i>
            Delete Post
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BlogPosts;