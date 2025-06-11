import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Box,
  Grid,
  Paper,
  Divider,
  Badge,
  CircularProgress,
  Collapse,
  Stack,
  Alert,
  Fade
} from '@mui/material';
import {
  FilterList,
  ExpandLess,
  ExpandMore,
  Clear,
  LocationOn,
  Schedule,
  Person,
  Favorite,
  FavoriteBorder,
  Comment,
  Explore,
  BookmarkRemove,
  Collections,
  Tag
} from '@mui/icons-material';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import Comments from '../components/Comments';
import './SavedLogs.css';

function SavedLogs() {
  const [allSavedLogs, setAllSavedLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [unsavingLogs, setUnsavingLogs] = useState({});
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    location: '',
    selectedTags: [],
    sortBy: 'newest'
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

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

    const fetchSavedLogs = async () => {
      try {
        const res = await axios.get('/user/saved-logs', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllSavedLogs(res.data);
        setFilteredLogs(res.data);

        // Extract all unique tags from saved logs
        const tags = new Set();
        res.data.forEach(log => {
          if (log.tags) {
            log.tags.forEach(tag => tags.add(tag.toLowerCase()));
          }
        });
        setAvailableTags(Array.from(tags).sort());
      } catch (err) {
        console.error('Error fetching saved logs:', err);
        if (err.response?.status === 401) {
          navigate('/login');
        } else {
          setError('Failed to load your saved logs. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSavedLogs();
  }, [navigate]);

  // Apply filters whenever filters change
  useEffect(() => {
    let filtered = [...allSavedLogs];

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(log => 
        log.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Tag filter
    if (filters.selectedTags.length > 0) {
      filtered = filtered.filter(log => {
        if (!log.tags) return false;
        return filters.selectedTags.some(selectedTag =>
          log.tags.some(logTag => logTag.toLowerCase() === selectedTag)
        );
      });
    }

    // Sort
    switch (filters.sortBy) {
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
    }

    setFilteredLogs(filtered);
  }, [filters, allSavedLogs]);

  const handleLocationChange = (e) => {
    setFilters(prev => ({ ...prev, location: e.target.value }));
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : [...prev.selectedTags, tag]
    }));
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({
      location: '',
      selectedTags: [],
      sortBy: 'newest'
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.selectedTags.length > 0) count++;
    return count;
  };

  const toggleComments = (logId) => {
    setExpandedComments(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  const handleUnsaveLog = async (logId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in to manage saved posts');
      return;
    }

    setUnsavingLogs(prev => ({ ...prev, [logId]: true }));

    try {
      await axios.post('/user/unsave-log', 
        { logId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove from both original and filtered arrays
      setAllSavedLogs(prev => prev.filter(log => log._id !== logId));
      setFilteredLogs(prev => prev.filter(log => log._id !== logId));

      // Update available tags
      const remainingLogs = allSavedLogs.filter(log => log._id !== logId);
      const tags = new Set();
      remainingLogs.forEach(log => {
        if (log.tags) {
          log.tags.forEach(tag => tags.add(tag.toLowerCase()));
        }
      });
      setAvailableTags(Array.from(tags).sort());
    } catch (err) {
      console.error('Error unsaving log:', err);
      setError('Failed to unsave post. Please try again.');
    } finally {
      setUnsavingLogs(prev => ({ ...prev, [logId]: false }));
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" className="loading-container">
        <Paper className="loading-paper" elevation={2}>
          <CircularProgress size={60} className="loading-spinner" />
          <Typography variant="h5" className="loading-text">
            Loading your saved travel logs...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preparing your collection
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" className="error-container">
        <Alert severity="error" className="error-alert" onClose={() => setError('')}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="saved-logs-container">
      {/* Header Section */}
      <Paper className="header-paper" elevation={2}>
        <Box className="header-content">
          <Box className="header-title-section">
            <Stack direction="row" alignItems="center" spacing={2}>
              <Collections className="header-icon" />
              <Box>
                <Typography variant="h3" component="h1" className="page-title">
                  Your Saved Travel Logs ({filteredLogs.length})
                </Typography>
                <Typography variant="body1" color="text.secondary" className="page-subtitle">
                  Your personal collection of inspiring adventures
                </Typography>
              </Box>
            </Stack>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            startIcon={<Explore />}
            onClick={() => navigate('/all-logs')}
            className="browse-button"
          >
            Browse More Logs
          </Button>
        </Box>
      </Paper>

      {allSavedLogs.length === 0 ? (
        <Fade in timeout={500}>
          <Paper className="empty-state" elevation={3}>
            <Box className="empty-state-content">
              <Collections className="empty-state-icon" />
              <Typography variant="h4" className="empty-state-title">
                Start Building Your Collection!
              </Typography>
              <Typography variant="body1" color="text.secondary" className="empty-state-subtitle">
                Save interesting travel logs from other adventurers to read later and build your inspiration collection.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={<Explore />}
                onClick={() => navigate('/all-logs')}
                className="empty-state-button"
              >
                Discover Travel Logs
              </Button>
            </Box>
          </Paper>
        </Fade>
      ) : (
        <Box>
          {/* Filter Panel */}
          <Paper className="filter-panel" elevation={2}>
            {/* Filter Toggle Button */}
            <Box className="filter-header">
              <Badge badgeContent={getActiveFilterCount()} color="error">
                <Button
                  variant="contained"
                  startIcon={<FilterList />}
                  endIcon={showFilters ? <ExpandLess /> : <ExpandMore />}
                  onClick={() => setShowFilters(!showFilters)}
                  className="filter-toggle-btn"
                >
                  Filter Your Collection
                </Button>
              </Badge>

              {getActiveFilterCount() > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  onClick={clearFilters}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </Button>
              )}
            </Box>

            {/* Filter Controls */}
            <Collapse in={showFilters}>
              <Box className="filter-controls">
                <Grid container spacing={3}>
                  {/* Location Filter */}
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Location"
                      placeholder="Search by location..."
                      value={filters.location}
                      onChange={handleLocationChange}
                      InputProps={{
                        startAdornment: <LocationOn sx={{ mr: 1, color: 'action.active' }} />
                      }}
                    />
                  </Grid>

                  {/* Sort Filter */}
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Sort By</InputLabel>
                      <Select
                        value={filters.sortBy}
                        label="Sort By"
                        onChange={handleSortChange}
                      >
                        <MenuItem value="newest">Recently Saved</MenuItem>
                        <MenuItem value="oldest">Oldest Saved</MenuItem>
                        <MenuItem value="alphabetical">A-Z</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Collection Info */}
                  <Grid item xs={12} md={4}>
                    <Paper className="collection-info">
                      <Typography variant="body2" color="text.secondary">
                        Collection
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {filteredLogs.length} of {allSavedLogs.length} saved
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Tag Filter */}
                {availableTags.length > 0 && (
                  <Box className="tag-filter-section">
                    <Typography variant="body2" className="tag-filter-label">
                      <Tag sx={{ mr: 1 }} />
                      Tags in Your Collection ({filters.selectedTags.length} selected)
                    </Typography>
                    <Box className="tag-container">
                      {availableTags.map(tag => (
                        <Chip
                          key={tag}
                          label={tag}
                          clickable
                          variant={filters.selectedTags.includes(tag) ? "filled" : "outlined"}
                          color={filters.selectedTags.includes(tag) ? "primary" : "default"}
                          onClick={() => handleTagToggle(tag)}
                          className="tag-chip"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>

          {/* Collection Summary */}
          {!showFilters && (
            <Paper className="collection-summary" elevation={1}>
              <Typography variant="body2" className="summary-text">
                💡 <strong>{filteredLogs.length}</strong> travel log{filteredLogs.length !== 1 ? 's' : ''} in your collection. 
                Click <Favorite sx={{ fontSize: 16, mx: 0.5, color: '#ff6b6b' }} /> to remove from saved.
                {getActiveFilterCount() > 0 && (
                  <Typography component="span" color="primary" sx={{ fontWeight: 600, ml: 1 }}>
                    ({getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active)
                  </Typography>
                )}
              </Typography>
            </Paper>
          )}

          {/* Results */}
          {filteredLogs.length === 0 ? (
            <Paper className="no-results">
              <Box>
                <Typography variant="h5" gutterBottom>
                  🔍 No saved logs match your filters
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Try adjusting your search criteria or clear filters to see all your saved posts.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Clear />}
                  onClick={clearFilters}
                >
                  Clear All Filters
                </Button>
              </Box>
            </Paper>
          ) : (
            <Box className="logs-container">
              {filteredLogs.map((log, index) => (
                <Fade in timeout={500 + index * 100} key={log._id}>
                  <Card className="saved-log-card" elevation={3}>
                    {/* Travel Log Image */}
                    {log.imageUrl && (
                      <CardMedia
                        component="img"
                        height="400"
                        image={log.imageUrl}
                        alt={log.title}
                        className="log-image"
                      />
                    )}
                    
                    <CardContent className="log-content">
                      {/* Header with Unsave Button */}
                      <Box className="log-header">
                        <Box className="log-title-section">
                          <Typography variant="h4" component="h2" className="log-title">
                            {log.title}
                          </Typography>
                          
                          <Stack direction="row" spacing={2} alignItems="center" className="log-meta">
                            <Box className="author-info">
                              <Person sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="body2">
                                <strong>{log.user?.username || 'Anonymous'}</strong>
                              </Typography>
                            </Box>
                            <Box className="date-info">
                              <Schedule sx={{ fontSize: 16, mr: 0.5 }} />
                              <Typography variant="body2">
                                {new Date(log.createdAt).toLocaleDateString()}
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                        
                        {/* Unsave Button */}
                        <Button
                          variant="contained"
                          color="error"
                          startIcon={
                            unsavingLogs[log._id] ? (
                              <CircularProgress size={16} />
                            ) : (
                              <BookmarkRemove />
                            )
                          }
                          onClick={() => handleUnsaveLog(log._id)}
                          disabled={unsavingLogs[log._id]}
                          className="unsave-button"
                        >
                          {unsavingLogs[log._id] ? 'Removing...' : 'Unsave'}
                        </Button>
                      </Box>
                      
                      {/* Location */}
                      <Box className="location-section">
                        <LocationOn color="primary" sx={{ mr: 1 }} />
                        <Typography variant="h6" color="primary" className="location-text">
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
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Tags:
                          </Typography>
                          <Box className="tags-container">
                            {log.tags.map((tag, index) => (
                              <Chip
                                key={index}
                                label={tag}
                                size="small"
                                clickable
                                variant={filters.selectedTags.includes(tag.toLowerCase()) ? "filled" : "outlined"}
                                color={filters.selectedTags.includes(tag.toLowerCase()) ? "primary" : "default"}
                                onClick={() => handleTagToggle(tag.toLowerCase())}
                                className="log-tag"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      <Divider sx={{ my: 2 }} />
                      
                      {/* Comments Toggle Button */}
                      <Button
                        variant="outlined"
                        startIcon={<Comment />}
                        endIcon={expandedComments[log._id] ? <ExpandLess /> : <ExpandMore />}
                        onClick={() => toggleComments(log._id)}
                        className="comments-toggle-btn"
                      >
                        {expandedComments[log._id] ? 'Hide Comments' : 'Show Comments'}
                      </Button>
                      
                      {/* Comments Section */}
                      <Collapse in={expandedComments[log._id]}>
                        <Box className="comments-section">
                          <Comments 
                            logId={log._id}
                            logOwnerId={log.user?._id}
                            currentUserId={currentUserId}
                            allowModeration={false}
                          />
                        </Box>
                      </Collapse>
                    </CardContent>
                  </Card>
                </Fade>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
}

export default SavedLogs;