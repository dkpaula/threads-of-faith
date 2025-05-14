import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Form, Button, Alert, Spinner, Row, Col, Card } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { getPost, updatePost, uploadImage } from '../services/api';
import '../styles/CreatePost.css';

const EditPost = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    status: 'published'
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const quillRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await getPost(id);
      const post = response.data;
      setFormData({
        title: post.title,
        content: post.content,
        category: post.category || '',
        tags: post.tags ? post.tags.join(', ') : '',
        status: post.status || 'published'
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load the post. Please try again later.');
      setLoading(false);
    }
  };

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

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category.trim(),
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        status: formData.status
      };

      console.log('Updating post with data:', postData);
      const response = await updatePost(id, postData);
      console.log('Update response:', response);

      setSuccess(true);
      setSaving(false);
      
      // Wait a bit before redirecting
      setTimeout(() => {
        navigate(`/post/${id}`);
      }, 1500);
    } catch (error) {
      console.error('Error updating post:', error);
      setSaving(false);
      
      if (error.response?.status === 401) {
        setError('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(
          error.response?.data?.message || 
          error.response?.data?.error ||
          'Failed to update post. Please try again.'
        );
      }
    }
  };

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4 create-post-container">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h1 className="mb-4 fw-bold">Edit Post</h1>
          
          {error && (
            <Alert variant="danger" className="mb-4">
              <i className="bi bi-exclamation-circle me-2"></i>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-4">
              <i className="bi bi-check-circle me-2"></i>
              Post updated successfully! Redirecting...
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
                        placeholder="Enter post title"
                        required
                        className="form-control-lg shadow-none"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label className="fw-bold">Content</Form.Label>
                      <div className="editor-wrapper">
                        <ReactQuill
                          value={formData.content}
                          onChange={handleContentChange}
                          modules={modules}
                          className="editor"
                          theme="snow"
                          ref={quillRef}
                        />
                      </div>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="mb-4 sidebar-card">
                  <Card.Body>
                    <h5 className="sidebar-title mb-3">Post Settings</h5>
                    
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Category</Form.Label>
                      <Form.Control
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        placeholder="Enter post category"
                        className="shadow-none"
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Tags</Form.Label>
                      <Form.Control
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleTagsChange}
                        placeholder="Enter tags, separated by commas"
                        className="shadow-none"
                      />
                      <Form.Text className="text-muted">
                        <i className="bi bi-info-circle me-1"></i>
                        Separate tags with commas (e.g., faith, prayer, worship)
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Status</Form.Label>
                      <Form.Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="shadow-none"
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
                    disabled={saving || success}
                    className="create-btn"
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
                        Saving Changes...
                      </>
                    ) : success ? (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Changes Saved!
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate(`/post/${id}`)}
                    disabled={saving || success}
                    className="cancel-btn"
                  >
                    <i className="bi bi-x-circle me-2"></i>
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

export default EditPost;