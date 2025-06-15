import React, { useState, useRef } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  CloudUpload,
  PhotoCamera,
  LocationOn,
  Title,
  Description,
  Tag,
  Send,
  Close
} from '@mui/icons-material';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import './CreateLog.css';

function CreateLog() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    tags: '',
    images: [],
  });
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5);
    const validImages = [];
    // const previews = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('One or more files are not valid images');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        return;
      }

      validImages.push(file);
    }

    if (validImages.length === 0) {
      setError('Please select at least one valid image');
      return;
    }

    // Generate image previews
    validImages.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    setFormData((prev) => ({
      ...prev,
      images: validImages,
    }));

    setError('');
  };

  // const removeImage = () => {
  //   setFormData({
  //     ...formData,
  //     image: null,
  //   });
  //   setImagePreview(null);
  //   // Reset file input using ref
  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = '';
  //   }
  // };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to create a travel log');
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title.trim());
    formDataToSend.append('description', formData.description.trim());
    formDataToSend.append('location', formData.location.trim());
    formDataToSend.append('tags', formData.tags.trim());

    // 👇 Add the log here
    console.log('🧾 Images selected for upload:', formData.images.length);

    if (formData.images && formData.images.length > 0) {
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });
    }

    console.log('🔼 Submitting travel log with images:', formData.images);
    for (let pair of formDataToSend.entries()) {
      console.log('🧾 FormData:', pair[0], pair[1]);
    }

    try {
      await axios.post('/travellogs', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('Travel log created successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error creating travel log:', err);
      setError(
        err.response?.data?.message ||
        'Failed to create travel log. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Helper to render tag chips preview
  const renderTagsPreview = () => {
    if (!formData.tags.trim()) return null;

    const tags = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    if (tags.length === 0) return null;

    return (
      <Box className="tags-preview">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Tags Preview:
        </Typography>
        <Box className="tags-container">
          {tags.map((tag, index) => (
            <Chip
              key={index}
              label={tag}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </Box>
    );
  };

  const removeImageAtIndex = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== indexToRemove),
    }));
    setImagePreview((prev) => prev.filter((_, i) => i !== indexToRemove));

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Container maxWidth="md" className="create-log-container">
      <Paper className="create-log-paper" elevation={3}>
        <Box className="form-header">
          <Typography variant="h3" component="h1" className="page-title">
            Create a New Travel Log
          </Typography>
          <Typography variant="body1" color="text.secondary" className="page-subtitle">
            Share your amazing travel experience with the community
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {error && (
          <Alert severity="error" className="alert-message" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className="alert-message">
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} className="create-log-form">
          <Grid container spacing={3}>
            {/* Title Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter an amazing title for your adventure..."
                required
                InputProps={{
                  startAdornment: <Title sx={{ mr: 1, color: 'action.active' }} />
                }}
                className="form-field"
              />
            </Grid>

            {/* Location Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Where did you go? (e.g., Paris, France)"
                required
                InputProps={{
                  startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                }}
                className="form-field"
              />
            </Grid>

            {/* Description Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your amazing journey... What did you see? What did you experience? Any tips for other travelers?"
                required
                InputProps={{
                  startAdornment: <Description sx={{ mr: 1, color: 'action.active', alignSelf: 'flex-start', mt: 1 }} />
                }}
                className="form-field description-field"
              />
            </Grid>

            {/* Tags Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="adventure, beach, culture, food, hiking (comma separated)"
                InputProps={{
                  startAdornment: <Tag sx={{ mr: 1, color: 'action.active' }} />
                }}
                helperText="Add relevant tags separated by commas to help others discover your log"
                className="form-field"
              />
              {renderTagsPreview()}
            </Grid>

            {/* Image Upload Section */}
            <Grid item xs={12}>
              <Box className="image-upload-section">
                <Typography variant="h6" className="section-title">
                  <PhotoCamera sx={{ mr: 1 }} />
                  Add Photos
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Upload up to 5 beautiful images from your journey (each max 5MB)
                </Typography>

                <Box className="upload-area">
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleImageChange}
                  />
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    className="upload-button"
                    size="large"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={formData.images.length >= 5}
                  >
                    {formData.images.length >= 5 ? 'Limit Reached' : 'Choose Images'}
                  </Button>
                </Box>

                {imagePreview.length > 0 && (
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {imagePreview.map((preview, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card className="image-preview-card">
                          <CardMedia
                            component="img"
                            height="200"
                            image={preview}
                            alt={`Preview ${index + 1}`}
                          />
                          <Box className="image-actions" display="flex" justifyContent="center" mt={1}>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => removeImageAtIndex(index)}
                              startIcon={<Close />}
                            >
                              Remove
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Submit Button */}
          <Stack direction="row" spacing={2} justifyContent="center" className="form-actions">
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={loading ? <CircularProgress size={20} /> : <Send />}
              disabled={loading}
              className="submit-button"
            >
              {loading ? 'Creating Your Log...' : 'Create Travel Log'}
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
              className="cancel-button"
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}

export default CreateLog;