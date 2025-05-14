import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Spinner, Modal } from 'react-bootstrap';
import { getPost, addComment, likePost, unlikePost, deleteComment, updateComment } from '../services/api';
import DOMPurify from 'dompurify';
import { jwtDecode } from 'jwt-decode';

const SinglePost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  
  // States for edit/delete comment functionality
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [isUpdatingComment, setIsUpdatingComment] = useState(false);

  useEffect(() => {
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

  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPost(id);
      setPost(response.data);
      // Check if the current user has liked the post
      if (currentUserId) {
        setLiked(response.data.likes.includes(currentUserId));
      }
    } catch (err) {
      setError('Failed to load post. Please try again later.');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  }, [id, currentUserId]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      const response = await addComment(id, { content: comment });
      
      // Use the response data to update the local state directly
      if (response && response.data) {
        setPost(response.data);
      }
      
      setComment('');
    } catch (err) {
      setError('Failed to add comment. Please try again.');
      console.error('Error adding comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeToggle = async () => {
    try {
      if (liked) {
        await unlikePost(id);
        // Update local state directly
        setLiked(false);
        setPost(prev => ({
          ...prev,
          likes: prev.likes.filter(likeId => likeId !== currentUserId)
        }));
      } else {
        await likePost(id);
        // Update local state directly
        setLiked(true);
        setPost(prev => ({
          ...prev,
          likes: [...prev.likes, currentUserId]
        }));
      }
    } catch (err) {
      // Don't show error messages for already liked/unliked posts
      if (err.response?.data?.message === 'Post already liked' || 
          err.response?.data?.message === 'Post not liked yet') {
        console.log('Like state already matches desired state');
        
        // Force a refresh to ensure UI is in sync with server state
        await fetchPost();
      } else {
        setError('Failed to update like status. Please try again.');
        console.error('Error updating like status:', err);
      }
    }
  };
  
  // Start editing a comment
  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditCommentContent(comment.content);
  };
  
  // Cancel editing a comment
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditCommentContent('');
  };
  
  // Submit the edited comment
  const handleUpdateComment = async (commentId) => {
    if (!editCommentContent.trim()) return;
    
    try {
      setIsUpdatingComment(true);
      const response = await updateComment(id, commentId, { content: editCommentContent });
      
      // Update the post state directly with the response
      if (response && response.data) {
        setPost(response.data);
      }
      
      setEditingComment(null);
      setEditCommentContent('');
    } catch (err) {
      setError('Failed to update comment. Please try again.');
      console.error('Error updating comment:', err);
    } finally {
      setIsUpdatingComment(false);
    }
  };
  
  // Confirm delete modal for comment
  const handleShowDeleteModal = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteModal(true);
  };
  
  // Delete a comment
  const handleDeleteComment = async () => {
    try {
      const response = await deleteComment(id, commentToDelete);
      setShowDeleteModal(false);
      
      // Update the post state directly with the response
      if (response && response.data) {
        setPost(response.data);
      }
    } catch (err) {
      setError('Failed to delete comment. Please try again.');
      console.error('Error deleting comment:', err);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading post...</p>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Post not found.</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Button
              as={Link}
              to="/blogposts"
              variant="outline-primary"
              className="back-btn"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Posts
            </Button>
            {currentUserId === post.user?._id && (
              <div className="d-flex gap-2">
                <Button
                  as={Link}
                  to={`/edit/${post._id}`}
                  variant="outline-primary"
                >
                  <i className="bi bi-pencil-fill me-2"></i>
                  Edit Post
                </Button>
              </div>
            )}
          </div>

          {error && (
            <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </Alert>
          )}

          <Card className="shadow-sm border-0 post-card">
            {post.images && post.images[0] && (
              <Card.Img
                variant="top"
                src={post.images[0].url}
                alt={post.title}
                className="post-image"
              />
            )}
            <Card.Body className="p-4">
              <div className="mb-3">
                {post.category && (
                  <Badge bg="primary" className="me-2">
                    {post.category}
                  </Badge>
                )}
                {post.tags && post.tags.map(tag => (
                  <Badge key={tag} bg="secondary" className="me-1">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="mb-4">{post.title}</h1>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="text-muted">
                  <i className="bi bi-calendar me-2"></i>
                  {formatDate(post.createdAt)}
                </div>
                <div>
                  <Button
                    variant={liked ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={handleLikeToggle}
                    className="me-2"
                  >
                    <i className={`bi bi-heart${liked ? '-fill' : ''} me-1`}></i>
                    {post.likes?.length || 0}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                  >
                    <i className="bi bi-chat-text me-1"></i>
                    {post.comments?.length || 0}
                  </Button>
                </div>
              </div>

              <div
                className="post-content mb-5"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
              />

              <hr className="my-5" />

              <h3 className="h4 mb-4">
                <i className="bi bi-chat-quote me-2"></i>
                Comments
              </h3>

              {localStorage.getItem('token') ? (
                <Form onSubmit={handleCommentSubmit} className="mb-5">
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your thoughts..."
                      required
                    />
                  </Form.Group>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Posting...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        Post Comment
                      </>
                    )}
                  </Button>
                </Form>
              ) : (
                <Alert variant="info" className="mb-4">
                  <Link to="/login" className="alert-link">Login</Link> to leave a comment.
                </Alert>
              )}

              {post.comments && post.comments.length > 0 ? (
                post.comments.map((comment) => (
                  <Card key={comment._id} className="mb-3 border-0 bg-light">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">
                          <i className="bi bi-person-circle me-2"></i>
                          {comment.user.email}
                        </h6>
                        <small className="text-muted">
                          {formatDate(comment.createdAt)}
                        </small>
                      </div>
                      
                      {editingComment === comment._id ? (
                        <Form className="mt-2">
                          <Form.Group className="mb-2">
                            <Form.Control
                              as="textarea"
                              rows={2}
                              value={editCommentContent}
                              onChange={(e) => setEditCommentContent(e.target.value)}
                              required
                            />
                          </Form.Group>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="primary" 
                              size="sm" 
                              onClick={() => handleUpdateComment(comment._id)}
                              disabled={isUpdatingComment}
                            >
                              {isUpdatingComment ? 'Updating...' : 'Save'}
                            </Button>
                            <Button variant="outline-secondary" size="sm" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </Form>
                      ) : (
                        <>
                          <p className="mb-0">{comment.content}</p>
                          {currentUserId === comment.user._id && (
                            <div className="d-flex gap-2 mt-2 justify-content-end">
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={() => handleEditComment(comment)}
                              >
                                <i className="bi bi-pencil-fill"></i>
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => handleShowDeleteModal(comment._id)}
                              >
                                <i className="bi bi-trash-fill"></i>
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <p className="text-muted text-center">No comments yet. Be the first to comment!</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Delete Comment Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this comment? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteComment}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .post-card {
          border-radius: 1rem;
        }

        .post-image {
          border-radius: 1rem 1rem 0 0;
          max-height: 400px;
          object-fit: cover;
        }

        .post-content {
          font-size: 1.1rem;
          line-height: 1.8;
        }

        .post-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem 0;
        }

        .btn:hover {
          transform: translateY(-1px);
          transition: transform 0.2s;
        }
      `}</style>
    </Container>
  );
};

export default SinglePost;