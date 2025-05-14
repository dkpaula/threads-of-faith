// src/components/CreatePost.js
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { createPost, uploadImage } from '../services/api';
import '../styles/CreatePost.css';

const CreatePost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    status: 'published'
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const quillRef = useRef(null);
  const navigate = useNavigate();

  const imageHandler = useCallback(() => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      try {
        const file = input.files[0];
        if (!file) return;

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          setError('Image size must be less than 5MB');
          return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Only image files are allowed');
          return;
        }

        setUploading(true);
        setError(null);

        // Get the Quill instance
        const quill = quillRef.current.getEditor();
        const range = quill.getSelection(true);

        // Insert temporary placeholder
        quill.insertText(range.index, 'Uploading image...', {
          color: '#666',
          italic: true
        });

        try {
          // Upload the image
          const response = await uploadImage(file);
          const imageUrl = response.data.url;

          // Remove the placeholder text
          quill.deleteText(range.index, 'Uploading image...'.length);

          // Insert the image
          quill.insertEmbed(range.index, 'image', imageUrl);
          
          // Move cursor to next position
          quill.setSelection(range.index + 1);
        } catch (error) {
          // Remove the placeholder text in case of error
          quill.deleteText(range.index, 'Uploading image...'.length);
          throw error;
        } finally {
          setUploading(false);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setError(error.response?.data?.error || error.response?.data?.message || 'Failed to upload image. Please try again.');
      }
    };
  }, []);

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: '1' }, { header: '2' }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (content) => {
    setFormData(prev => ({
      ...prev,
      content
    }));
  };

  const handleTagsChange = (e) => {
    setFormData(prev => ({
      ...prev,
      tags: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);
      
      if (!localStorage.getItem('token')) {
        setError('No authentication token found. Please log in again.');
        setSaving(false);
        return;
      }

      if (!formData.title.trim() || !formData.content.trim()) {
        setError('Title and content are required.');
        setSaving(false);
        return;
      }

      // Process tags properly
      const tags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
      
      const postData = {
        ...formData,
        tags,
        category: formData.category.trim()
      };

      console.log('Submitting post data:', postData);
      const response = await createPost(postData);
      console.log('Post created successfully:', response.data);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/blogposts');
      }, 1500);
    } catch (error) {
      console.error('Error creating post:', error);
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(
          error.response?.data?.message || 
          error.response?.data?.error ||
          'Failed to create post. Please try again.'
        );
      }
      setSaving(false);
    }
  };

  return (
    <Container className="py-5 create-post-container">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="mb-4 fw-bold">Create New Post</h1>
          
          {error && (
            <Alert variant="danger" className="mb-4 fade show" onClose={() => setError(null)} dismissible>
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-4 fade show">
              <i className="bi bi-check-circle me-2"></i>
              Post created successfully! Redirecting to blog posts...
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}>
                <Card className="mb-4 content-card">
                  <Card.Body>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Title</Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter an inspiring title"
                        required
                        className="form-control-lg shadow-none"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Content</Form.Label>
                      <div className={`editor-wrapper ${uploading ? 'uploading' : ''}`}>
                        <ReactQuill
                          ref={quillRef}
                          value={formData.content}
                          onChange={handleContentChange}
                          modules={modules}
                          className="editor"
                          theme="snow"
                          readOnly={uploading}
                          placeholder="Share your thoughts..."
                        />
                        {uploading && (
                          <div className="upload-overlay">
                            <Spinner animation="border" role="status" style={{ color: 'var(--primary-color)' }} />
                            <p className="mt-2">Uploading image...</p>
                          </div>
                        )}
                      </div>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="mb-4 sidebar-card">
                  <Card.Body>
                    <h5 className="mb-3 sidebar-title">Post Details</h5>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Category</Form.Label>
                      <Form.Control
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="e.g., Faith, Inspiration"
                        className="form-control-sm shadow-none"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Tags</Form.Label>
                      <Form.Control
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleTagsChange}
                        placeholder="faith, prayer, worship"
                        className="form-control-sm shadow-none"
                      />
                      <Form.Text className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Separate tags with commas
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="form-control-sm shadow-none"
                      >
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                      </Form.Select>
                    </Form.Group>
                  </Card.Body>
                </Card>

                <div className="d-grid gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={saving || success || uploading}
                    className="mb-2 create-btn"
                  >
                    {saving ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Create Post
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/blogposts')}
                    disabled={saving || success || uploading}
                    className="cancel-btn"
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Cancel
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreatePost;