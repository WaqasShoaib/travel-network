import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import {
  Edit,
  Delete,
  Save,
  Cancel,
  LocationOn,
  Title,
  Description,
  Tag,
  Warning
} from '@mui/icons-material';
import axios from '../utils/axios';
import { useNavigate, useParams } from 'react-router-dom';
import './EditLog.css';

function EditLog() {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    tags: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  // Fetch the log data when the component mounts
  useEffect(() => {
    const fetchLog = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Session expired, please log in again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`/travellogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Convert tags array to comma-separated string
        const logData = res.data;
        setFormData({
          title: logData.title || '',
          description: logData.description || '',
          location: logData.location || '',
          tags: Array.isArray(logData.tags) ? logData.tags.join(', ') : logData.tags || '',
        });
        setError('');
      } catch (err) {
        console.error('Error fetching log:', err);
        setError('Failed to fetch travel log data');
        if (err.response?.status === 401) {
          setTimeout(() => navigate('/login'), 2000);
        } else if (err.response?.status === 404) {
          setError('Travel log not found');
          setTimeout(() => navigate('/dashboard'), 3000);
        } else if (err.response?.status === 403) {
          setError('You are not authorized to edit this travel log');
          setTimeout(() => navigate('/dashboard'), 3000);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLog();
  }, [id, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

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

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expired, please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    setSaving(true);
    setError('');

    try {
      // Prepare data for submission
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        tags: formData.tags.trim(),
      };

      await axios.put(`/travellogs/${id}`, submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      setSuccess('Travel log updated successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Error updating log:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired, please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('You are not authorized to edit this travel log.');
      } else if (err.response?.status === 404) {
        setError('Travel log not found.');
      } else {
        setError(`Failed to update log: ${err.response?.data?.msg || err.message}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Session expired, please log in again.');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }
    
    setDeleting(true);
    try {
      await axios.delete(`/travellogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuccess('Travel log deleted successfully! Redirecting...');
      setDeleteDialogOpen(false);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      console.error('Error deleting log:', err);
      if (err.response?.status === 401) {
        setError('Session expired, please log in again.');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 403) {
        setError('You are not authorized to delete this travel log.');
      } else {
        setError(`Failed to delete log: ${err.response?.data?.msg || err.message}`);
      }
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
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

  if (loading) {
    return (
      <Container maxWidth="md" className="loading-container">
        <Paper className="loading-paper" elevation={2}>
          <CircularProgress size={60} className="loading-spinner" />
          <Typography variant="h5" className="loading-text">
            Loading travel log...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fetching your adventure details
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="edit-log-container">
      <Paper className="edit-log-paper" elevation={3}>
        <Box className="form-header">
          <Typography variant="h3" component="h1" className="page-title">
            <Edit sx={{ mr: 2, fontSize: 'inherit' }} />
            Edit Travel Log
          </Typography>
          <Typography variant="body1" color="text.secondary" className="page-subtitle">
            Update your travel experience details
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

        <Box component="form" onSubmit={handleSubmit} className="edit-log-form">
          <Grid container spacing={3}>
            {/* Title Field */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Update your adventure title..."
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
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="center" className="form-actions">
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={saving ? <CircularProgress size={20} /> : <Save />}
              disabled={saving || deleting}
              className="save-button"
            >
              {saving ? 'Updating Log...' : 'Update Log'}
            </Button>
            
            <Button
              variant="outlined"
              color="error"
              size="large"
              startIcon={<Delete />}
              onClick={() => setDeleteDialogOpen(true)}
              disabled={saving || deleting}
              className="delete-button"
            >
              Delete Log
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              startIcon={<Cancel />}
              onClick={() => navigate('/dashboard')}
              disabled={saving || deleting}
              className="cancel-button"
            >
              Cancel
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleting && setDeleteDialogOpen(false)}
        className="delete-dialog"
      >
        <DialogTitle className="dialog-title">
          <Warning sx={{ mr: 1, color: 'error.main' }} />
          Delete Travel Log
        </DialogTitle>
        <DialogContent>
          <DialogContentText className="dialog-content">
            Are you sure you want to delete this travel log? This action cannot be undone and will also delete all comments on this post.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            disabled={deleting}
            className="dialog-cancel-button"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} /> : <Delete />}
            className="dialog-delete-button"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default EditLog;