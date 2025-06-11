import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import Comments from '../components/Comments';
import { 
  Button, 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  Container,
  Grid,
  Collapse,
  Divider,
  Paper,
  Stack,
  Badge,
  CircularProgress,
  Fade,
  Alert
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Comment as CommentIcon, 
  ExpandMore, 
  ExpandLess,
  Add as AddIcon,
  LocationOn,
  Schedule,
  Photo,
  Dashboard as DashboardIcon,
  Article
} from '@mui/icons-material';
import './Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Get current user ID from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.id);
    } catch (err) {
      console.error('Error parsing token:', err);
      setError('Invalid session. Please log in again.');
    }

    const fetchPersonalLogs = async () => {
      try {
        const res = await axios.get('/travellogs/personal', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching personal logs:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to load your travel logs. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPersonalLogs();
  }, [navigate]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to log in first!');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this travel log? This will also delete all comments on this post.');
    if (confirmDelete) {
      setDeleteLoading(prev => ({ ...prev, [id]: true }));
      try {
        await axios.delete(`/travellogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(logs.filter(log => log._id !== id));
      } catch (err) {
        console.error('Error deleting log:', err);
        alert('Failed to delete log. Please try again.');
      } finally {
        setDeleteLoading(prev => ({ ...prev, [id]: false }));
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-log/${id}`);
  };

  const toggleComments = (logId) => {
    setExpandedComments(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  if (loading) {
    return (
      <Container maxWidth="lg" className="loading-container">
        <Paper className="loading-paper" elevation={2}>
          <CircularProgress size={60} className="loading-spinner" />
          <Typography variant="h5" className="loading-text">
            Loading your travel logs...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preparing your adventure dashboard
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" className="error-container">
        <Alert severity="error" className="error-alert">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="dashboard-container">
      {/* Header Section */}
      <Paper className="dashboard-header" elevation={2}>
        <Box className="header-content">
          <Box className="header-title-section">
            <Stack direction="row" alignItems="center" spacing={2}>
              <DashboardIcon className="dashboard-icon" />
              <Box>
                <Typography variant="h3" component="h1" className="page-title">
                  Your Travel Logs
                </Typography>
                <Typography variant="body1" color="text.secondary" className="page-subtitle">
                  Manage and share your travel adventures
                </Typography>
              </Box>
            </Stack>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => navigate('/create-log')}
            className="create-button"
          >
            Create New Log
          </Button>
        </Box>

        {/* Stats Section */}
        {logs.length > 0 && (
          <Box className="stats-section">
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Paper className="stat-card">
                  <Article className="stat-icon" />
                  <Typography variant="h4" className="stat-number">
                    {logs.length}
                  </Typography>
                  <Typography variant="body2" className="stat-label">
                    Travel Logs
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper className="stat-card">
                  <LocationOn className="stat-icon" />
                  <Typography variant="h4" className="stat-number">
                    {new Set(logs.map(log => log.location)).size}
                  </Typography>
                  <Typography variant="body2" className="stat-label">
                    Destinations
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper className="stat-card">
                  <Photo className="stat-icon" />
                  <Typography variant="h4" className="stat-number">
                    {logs.filter(log => log.imageUrl).length}
                  </Typography>
                  <Typography variant="body2" className="stat-label">
                    Photos Shared
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Main Content */}
      {logs.length === 0 ? (
        <Fade in timeout={500}>
          <Paper className="empty-state" elevation={3}>
            <Box className="empty-state-content">
              <DashboardIcon className="empty-state-icon" />
              <Typography variant="h4" className="empty-state-title">
                Ready for Your First Adventure?
              </Typography>
              <Typography variant="body1" color="text.secondary" className="empty-state-subtitle">
                Start documenting your travels and share your amazing experiences with fellow adventurers around the world.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => navigate('/create-log')}
                className="empty-state-button"
              >
                Create Your First Log
              </Button>
            </Box>
          </Paper>
        </Fade>
      ) : (
        <Box className="logs-container">
          {logs.map((log, index) => (
            <Fade in timeout={500 + index * 100} key={log._id}>
              <Card className="travel-log-card" elevation={3}>
                {/* Travel Log Image */}
                {log.imageUrl && (
                  <CardMedia
                    component="img"
                    height="350"
                    image={log.imageUrl}
                    alt={log.title}
                    className="log-image"
                  />
                )}
                
                <CardContent className="log-content">
                  {/* Travel Log Header */}
                  <Box className="log-header">
                    <Box className="log-title-section">
                      <Typography variant="h4" component="h2" className="log-title">
                        {log.title}
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center" className="log-meta">
                        <Box className="meta-item">
                          <Schedule className="meta-icon" />
                          <Typography variant="body2">
                            {new Date(log.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                    
                    {/* Action Buttons */}
                    <Stack direction="row" spacing={1} className="action-buttons">
                      <Button
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(log._id)}
                        className="edit-button"
                        size="small"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={deleteLoading[log._id] ? <CircularProgress size={16} /> : <Delete />}
                        onClick={() => handleDelete(log._id)}
                        disabled={deleteLoading[log._id]}
                        className="delete-button"
                        size="small"
                      >
                        {deleteLoading[log._id] ? 'Deleting...' : 'Delete'}
                      </Button>
                    </Stack>
                  </Box>
                  
                  {/* Location */}
                  <Box className="location-section">
                    <LocationOn className="location-icon" />
                    <Typography variant="h6" className="location-text">
                      {log.location}
                    </Typography>
                  </Box>
                  
                  {/* Description */}
                  <Typography variant="body1" className="log-description">
                    {log.description}
                  </Typography>
                  
                  {/* Tags */}
                  {log.tags && log.tags.length > 0 && (
                    <Box className="tags-section">
                      <Typography variant="body2" className="tags-label">
                        Tags:
                      </Typography>
                      <Box className="tags-container">
                        {log.tags.map((tag, index) => (
                          <Chip
                            key={index}
                            label={tag}
                            size="small"
                            variant="outlined"
                            color="primary"
                            className="tag-chip"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  <Divider className="content-divider" />
                  
                  {/* Comments Management Section */}
                  <Box className="comments-management">
                    <Button
                      onClick={() => toggleComments(log._id)}
                      startIcon={<CommentIcon />}
                      endIcon={expandedComments[log._id] ? <ExpandLess /> : <ExpandMore />}
                      variant="outlined"
                      className="comments-toggle-button"
                    >
                      {expandedComments[log._id] ? 'Hide Comments' : 'Manage Comments'}
                    </Button>
                    
                    {expandedComments[log._id] && (
                      <Box className="moderation-tip">
                        <Typography variant="caption" className="tip-text">
                          💡 As the post owner, you can delete any inappropriate comments on your travel log
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  {/* Comments Section with Moderation */}
                  <Collapse in={expandedComments[log._id]} className="comments-collapse">
                    <Box className="comments-wrapper">
                      <Comments 
                        logId={log._id}
                        logOwnerId={currentUserId}
                        currentUserId={currentUserId}
                        allowModeration={true}
                      />
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Fade>
          ))}
        </Box>
      )}
    </Container>
  );
}

export default Dashboard;