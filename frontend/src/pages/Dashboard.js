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
  Divider
} from '@mui/material';
import { 
  Edit, 
  Delete, 
  Comment as CommentIcon, 
  ExpandMore, 
  ExpandLess,
  Add as AddIcon
} from '@mui/icons-material';

function Dashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

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
      try {
        await axios.delete(`/travellogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLogs(logs.filter(log => log._id !== id));
      } catch (err) {
        console.error('Error deleting log:', err);
        alert('Failed to delete log. Please try again.');
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
      <Container>
        <Typography variant="h6" sx={{ mt: 4, textAlign: 'center' }}>
          Loading your travel logs...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Your Travel Logs
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/create-log')}
        >
          Create New Log
        </Button>
      </Box>

      {logs.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 6 }}>
          <CardContent>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              You haven't created any travel logs yet!
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Start documenting your adventures and share them with the world.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/create-log')}
            >
              Create Your First Log
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {logs.map((log) => (
            <Grid item xs={12} key={log._id}>
              <Card elevation={3}>
                {/* Travel Log Image */}
                {log.imageUrl && (
                  <CardMedia
                    component="img"
                    height="300"
                    image={log.imageUrl}
                    alt={log.title}
                    sx={{ objectFit: 'cover' }}
                  />
                )}
                
                <CardContent>
                  {/* Travel Log Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h5" gutterBottom>
                        {log.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Created on {new Date(log.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => handleEdit(log._id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<Delete />}
                        onClick={() => handleDelete(log._id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </Box>
                  
                  {/* Location */}
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    📍 {log.location}
                  </Typography>
                  
                  {/* Description */}
                  <Typography variant="body1" paragraph>
                    {log.description}
                  </Typography>
                  
                  {/* Tags */}
                  {log.tags && log.tags.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      {log.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  )}
                  
                  <Divider sx={{ my: 2 }} />
                  
                  {/* Comments Management Section */}
                  <Box>
                    <Button
                      onClick={() => toggleComments(log._id)}
                      startIcon={<CommentIcon />}
                      endIcon={expandedComments[log._id] ? <ExpandLess /> : <ExpandMore />}
                      variant="outlined"
                      size="small"
                    >
                      {expandedComments[log._id] ? 'Hide Comments' : 'Manage Comments'}
                    </Button>
                    
                    {expandedComments[log._id] && (
                      <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                        💡 As the post owner, you can delete any inappropriate comments on your travel log
                      </Typography>
                    )}
                  </Box>
                  
                  {/* Comments Section with Moderation */}
                  <Collapse in={expandedComments[log._id]}>
                    <Comments 
                      logId={log._id}
                      logOwnerId={currentUserId}
                      currentUserId={currentUserId}
                      allowModeration={true} // Enable comment moderation for own posts
                    />
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default Dashboard;