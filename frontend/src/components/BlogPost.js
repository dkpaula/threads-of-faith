import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { getPost, addComment, likePost, unlikePost } from '../services/api';
import DOMPurify from 'dompurify';

const BlogPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await getPost(id);
      setPost(response.data);
      // Check if user has liked the post
      const userId = localStorage.getItem('userId');
      setLiked(response.data.likes.includes(userId));
    } catch (err) {
      setError('Failed to load post. Please try again later.');
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  const createMarkup = (html) => {
    // Configure DOMPurify to allow images and style attributes
    const config = {
      ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'em', 'u', 'img', 'a', 'ul', 'ol', 'li', 'blockquote'],
      ALLOWED_ATTR: ['href', 'src', 'style', 'class', 'target', 'rel', 'alt'],
      ALLOW_DATA_ATTR: false
    };
    
    return { __html: DOMPurify.sanitize(html, config) };
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      await addComment(id, { content: comment });
      await fetchPost(); // Refresh post to show new comment
      setComment('');
    } catch (err) {
      setError('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async () => {
    try {
      if (liked) {
        await unlikePost(id);
      } else {
        await likePost(id);
      }
      await fetchPost(); // Refresh post to update likes
    } catch (err) {
      setError('Failed to update like status. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
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
      <Container className="py-5 text-center">
        <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '3rem' }}></i>
        <h3 className="mt-3">Post not found</h3>
        <p className="text-muted">The post you're looking for doesn't exist or has been removed.</p>
        <Button as={Link} to="/blogposts" variant="primary" className="mt-3">
          <i className="bi bi-arrow-left me-2"></i>
          Back to Posts
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row>
        <Col lg={8} className="mx-auto">
          {error && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </Alert>
          )}

          <Card className="border-0 shadow-sm">
            {post.images && post.images[0] && (
              <Card.Img
                variant="top"
                src={post.images[0].url}
                alt={post.title}
                className="post-header-image"
              />
            )}
            
            <Card.Body className="p-4 p-md-5">
              <div className="mb-4">
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

              <h1 className="mb-4 fw-bold">{post.title}</h1>

              <div className="d-flex align-items-center mb-4">
                <img
                  src={`https://ui-avatars.com/api/?name=${post.user?.email}&background=random`}
                  alt="Author"
                  className="rounded-circle me-3"
                  width="40"
                  height="40"
                />
                <div>
                  <h6 className="mb-0">{post.user?.email}</h6>
                  <small className="text-muted">
                    {formatDate(post.createdAt)}
                  </small>
                </div>
              </div>

              <div 
                className="post-content mb-4"
                dangerouslySetInnerHTML={createMarkup(post.content)}
              />

              <div className="d-flex justify-content-between align-items-center mt-5 pt-4 border-top">
                <div className="d-flex align-items-center">
                  <Button
                    variant={liked ? 'primary' : 'outline-primary'}
                    onClick={handleLike}
                    className="me-3"
                  >
                    <i className={`bi bi-heart${liked ? '-fill' : ''} me-2`}></i>
                    {post.likes?.length || 0} Likes
                  </Button>
                  <div className="text-muted">
                    <i className="bi bi-chat-dots me-2"></i>
                    {post.comments?.length || 0} Comments
                  </div>
                </div>

                <div className="d-flex">
                  <Button
                    variant="outline-primary"
                    onClick={() => {
                      navigator.share({
                        title: post.title,
                        text: post.content.substring(0, 100),
                        url: window.location.href
                      }).catch(() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert('Link copied to clipboard!');
                      });
                    }}
                  >
                    <i className="bi bi-share me-2"></i>
                    Share
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Comments Section */}
          <Card className="border-0 shadow-sm mt-4">
            <Card.Body className="p-4">
              <h4 className="mb-4">Comments</h4>

              {localStorage.getItem('token') ? (
                <Form onSubmit={handleComment} className="mb-4">
                  <Form.Group>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Write a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button
                    type="submit"
                    variant="primary"
                    className="mt-3"
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
                  <Link to="/login" className="alert-link">Login</Link> to post a comment.
                </Alert>
              )}

              {post.comments && post.comments.map((comment, index) => (
                <div
                  key={comment._id}
                  className={`d-flex mb-4 ${
                    index !== post.comments.length - 1 ? 'border-bottom pb-4' : ''
                  }`}
                >
                  <img
                    src={`https://ui-avatars.com/api/?name=${comment.user?.email}&background=random`}
                    alt="Commenter"
                    className="rounded-circle me-3"
                    width="40"
                    height="40"
                  />
                  <div>
                    <h6 className="mb-1">{comment.user?.email}</h6>
                    <p className="mb-1">{comment.content}</p>
                    <small className="text-muted">
                      {formatDate(comment.createdAt)}
                    </small>
                  </div>
                </div>
              ))}

              {(!post.comments || post.comments.length === 0) && (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-chat-dots" style={{ fontSize: '2rem' }}></i>
                  <p className="mt-2 mb-0">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style jsx>{`
        .post-header-image {
          height: 400px;
          object-fit: cover;
          border-radius: 0.5rem 0.5rem 0 0;
        }

        .post-content {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #2c3e50;
        }

        .post-content img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 2rem auto;
          border-radius: 0.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .post-content p {
          margin-bottom: 1.5rem;
        }

        .post-content h2,
        .post-content h3 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .badge {
          font-weight: 500;
          padding: 0.5em 0.8em;
        }

        .form-control:focus {
          border-color: #86b7fe;
          box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
        }

        .btn-outline-primary:hover,
        .btn-primary:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .post-header-image {
            height: 250px;
          }

          .post-content img {
            margin: 1.5rem auto;
          }
        }
      `}</style>
    </Container>
  );
};

export default BlogPost; 