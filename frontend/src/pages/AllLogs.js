import React, { useState, useEffect } from 'react';
import ImageCarousel from '../components/ImageCarousel';
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
  Stack
} from '@mui/material';
import {
  FilterList,
  ExpandLess,
  ExpandMore,
  Clear,
  LocationOn,
  Schedule,
  Person,
  BookmarkBorder,
  Comment,
  Favorite,
  Tag
} from '@mui/icons-material';
import axios from '../utils/axios';
import Comments from '../components/Comments';
import './AllLogs.css';

function AllLogs() {
  const [allLogs, setAllLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [savedLogs, setSavedLogs] = useState([]);
  const [savingLogs, setSavingLogs] = useState({});

  // Filter states
  const [filters, setFilters] = useState({
    location: '',
    selectedTags: [],
    sortBy: 'newest'
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/travellogs');
        setAllLogs(res.data);
        setFilteredLogs(res.data);

        // Extract all unique tags
        const tags = new Set();
        res.data.forEach(log => {
          if (log.tags) {
            log.tags.forEach(tag => tags.add(tag.toLowerCase()));
          }
        });
        setAvailableTags(Array.from(tags).sort());
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchSavedLogs = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('/user/saved-logs', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSavedLogs(res.data.map(log => log._id));
        } catch (err) {
          console.error('Error fetching saved logs:', err);
        }
      }
    };

    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
        fetchSavedLogs();
      } catch (err) {
        console.error('Error parsing token:', err);
      }
    }

    fetchLogs();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    let filtered = [...allLogs];

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
  }, [filters, allLogs]);

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

  const handleSaveLog = async (logId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to save posts');
      return;
    }

    setSavingLogs(prev => ({ ...prev, [logId]: true }));

    try {
      const isSaved = savedLogs.includes(logId);

      if (isSaved) {
        await axios.post('/user/unsave-log',
          { logId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSavedLogs(prev => prev.filter(id => id !== logId));
      } else {
        await axios.post('/user/save-log',
          { logId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSavedLogs(prev => [...prev, logId]);
      }
    } catch (err) {
      console.error('Error saving/unsaving log:', err);
      alert('Failed to save/unsave post. Please try again.');
    } finally {
      setSavingLogs(prev => ({ ...prev, [logId]: false }));
    }
  };

  const isLogSaved = (logId) => savedLogs.includes(logId);
  const isOwnPost = (log) => currentUserId === log.user?._id;

  if (loading) {
    return (
      <Container maxWidth="lg" className="loading-container">
        <Box className="loading-content">
          <CircularProgress size={60} />
          <Typography variant="h5" sx={{ mt: 2 }}>
            Loading travel logs...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" className="all-logs-container">
      {/* Header */}
      <Box className="header-section">
        <Typography variant="h3" component="h1" className="page-title">
          All Travel Logs
        </Typography>
        {currentUserId && (
          <Typography variant="body2" className="header-tip">
            💡 Bookmark posts you want to read later!
          </Typography>
        )}
      </Box>

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
              Filters
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
                    <MenuItem value="newest">Newest First</MenuItem>
                    <MenuItem value="oldest">Oldest First</MenuItem>
                    <MenuItem value="alphabetical">A-Z</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Results Info */}
              <Grid item xs={12} md={4}>
                <Paper className="results-info">
                  <Typography variant="body2" color="text.secondary">
                    Results
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {filteredLogs.length} of {allLogs.length} posts
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Tag Filter */}
            <Box className="tag-filter-section">
              <Typography variant="body2" className="tag-filter-label">
                <Tag sx={{ mr: 1 }} />
                Tags ({filters.selectedTags.length} selected)
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
                {availableTags.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No tags available
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {/* Results */}
      {filteredLogs.length === 0 ? (
        <Paper className="no-results">
          {getActiveFilterCount() > 0 ? (
            <Box>
              <Typography variant="h5" gutterBottom>
                🔍 No travel logs match your filters
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your search criteria or clear filters to see all posts.
              </Typography>
              <Button
                variant="contained"
                startIcon={<Clear />}
                onClick={clearFilters}
              >
                Clear All Filters
              </Button>
            </Box>
          ) : (
            <Box>
              <Typography variant="h5" gutterBottom>
                No travel logs found.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Be the first to share your adventure!
              </Typography>
            </Box>
          )}
        </Paper>
      ) : (
        <Box className="logs-container">
          {filteredLogs.map((log) => (
            <Card key={log._id} className="travel-log-card" elevation={3}>
              {/* Travel Log Image */}
              {log.images && log.images.length > 0 && (
                <ImageCarousel images={log.images} height={400} />
              )}

              <CardContent className="log-content">
                {/* Header with Save Button */}
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

                  {/* Save Button or Own Post Indicator */}
                  {currentUserId && !isOwnPost(log) && (
                    <Button
                      variant={isLogSaved(log._id) ? "contained" : "outlined"}
                      color={isLogSaved(log._id) ? "error" : "primary"}
                      startIcon={
                        savingLogs[log._id] ? (
                          <CircularProgress size={16} />
                        ) : isLogSaved(log._id) ? (
                          <Favorite />
                        ) : (
                          <BookmarkBorder />
                        )
                      }
                      onClick={() => handleSaveLog(log._id)}
                      disabled={savingLogs[log._id]}
                      className="save-button"
                    >
                      {isLogSaved(log._id) ? 'Saved' : 'Save'}
                    </Button>
                  )}

                  {isOwnPost(log) && (
                    <Chip
                      icon={<Person />}
                      label="Your Post"
                      color="primary"
                      variant="outlined"
                      className="own-post-chip"
                    />
                  )}
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
          ))}
        </Box>
      )}
    </Container>
  );
}

export default AllLogs;