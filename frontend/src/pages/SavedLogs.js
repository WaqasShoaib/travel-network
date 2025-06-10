import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import Comments from '../components/Comments';

function SavedLogs() {
  const [allSavedLogs, setAllSavedLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);
  const [unsavingLogs, setUnsavingLogs] = useState({});
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
      alert('Please log in to manage saved posts');
      return;
    }

    if (!window.confirm('Remove this post from your saved collection?')) {
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
      alert('Failed to unsave post. Please try again.');
    } finally {
      setUnsavingLogs(prev => ({ ...prev, [logId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h3>Loading your saved travel logs...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Your Saved Travel Logs ({filteredLogs.length})</h2>
        <button
          onClick={() => navigate('/all-logs')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976d2',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🌍 Browse More Logs
        </button>
      </div>
      
      {allSavedLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>📚 No saved travel logs yet!</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>
            Start building your collection by saving interesting travel logs from other adventurers.
          </p>
          <button
            onClick={() => navigate('/all-logs')}
            style={{
              padding: '12px 24px',
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            🔍 Discover Travel Logs
          </button>
        </div>
      ) : (
        <div>
          {/* Filter Panel */}
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            border: '1px solid #dee2e6', 
            borderRadius: '8px', 
            padding: '20px', 
            marginBottom: '20px' 
          }}>
            {/* Filter Toggle Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showFilters ? '20px' : '0' }}>
              <button
                onClick={() => setShowFilters(!showFilters)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                🔍 Filter Your Collection {showFilters ? '🔼' : '🔽'}
                {getActiveFilterCount() > 0 && (
                  <span style={{
                    backgroundColor: '#ff6b6b',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {getActiveFilterCount()}
                  </span>
                )}
              </button>

              {getActiveFilterCount() > 0 && (
                <button
                  onClick={clearFilters}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  ❌ Clear Filters
                </button>
              )}
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  {/* Location Filter */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                      📍 Location
                    </label>
                    <input
                      type="text"
                      placeholder="Search by location..."
                      value={filters.location}
                      onChange={handleLocationChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    />
                  </div>

                  {/* Sort Filter */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                      📊 Sort By
                    </label>
                    <select
                      value={filters.sortBy}
                      onChange={handleSortChange}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #ced4da',
                        borderRadius: '4px',
                        fontSize: '14px'
                      }}
                    >
                      <option value="newest">Recently Saved</option>
                      <option value="oldest">Oldest Saved</option>
                      <option value="alphabetical">A-Z</option>
                    </select>
                  </div>

                  {/* Collection Info */}
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                      📚 Collection
                    </label>
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: 'white',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px',
                      color: '#495057'
                    }}>
                      {filteredLogs.length} of {allSavedLogs.length} saved
                    </div>
                  </div>
                </div>

                {/* Tag Filter */}
                {availableTags.length > 0 && (
                  <div>
                    <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' }}>
                      🏷️ Tags in Your Collection ({filters.selectedTags.length} selected)
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '120px', overflowY: 'auto', padding: '8px' }}>
                      {availableTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => handleTagToggle(tag)}
                          style={{
                            padding: '6px 12px',
                            border: '1px solid #ced4da',
                            borderRadius: '20px',
                            backgroundColor: filters.selectedTags.includes(tag) ? '#1976d2' : 'white',
                            color: filters.selectedTags.includes(tag) ? 'white' : '#495057',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: filters.selectedTags.includes(tag) ? 'bold' : 'normal',
                            transition: 'all 0.2s'
                          }}
                        >
                          {tag} {filters.selectedTags.includes(tag) ? '✓' : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Collection Summary */}
          {!showFilters && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #dee2e6' }}>
              <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                💡 <strong>{filteredLogs.length}</strong> travel log{filteredLogs.length !== 1 ? 's' : ''} in your collection. 
                Click ❤️ to remove from saved.
                {getActiveFilterCount() > 0 && (
                  <span style={{ color: '#1976d2', fontWeight: 'bold' }}>
                    {' '}({getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active)
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Results */}
          {filteredLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <h3>🔍 No saved logs match your filters</h3>
              <p>Try adjusting your search criteria or clear filters to see all your saved posts.</p>
              <button
                onClick={clearFilters}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ❌ Clear All Filters
              </button>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log._id} style={{ 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                marginBottom: '30px', 
                overflow: 'hidden',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                backgroundColor: 'white'
              }}>
                {/* Travel Log Image */}
                {log.imageUrl && (
                  <img 
                    src={log.imageUrl} 
                    alt={log.title} 
                    style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                  />
                )}
                
                <div style={{ padding: '20px' }}>
                  {/* Travel Log Header with Unsave Button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{log.title}</h3>
                      
                      <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                        By <strong>{log.user?.username || 'Anonymous'}</strong> • {new Date(log.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    {/* Unsave Button */}
                    <button
                      onClick={() => handleUnsaveLog(log._id)}
                      disabled={unsavingLogs[log._id]}
                      style={{
                        padding: '8px 16px',
                        border: '2px solid #ff6b6b',
                        borderRadius: '6px',
                        backgroundColor: '#ff6b6b',
                        color: 'white',
                        cursor: unsavingLogs[log._id] ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        marginLeft: '15px'
                      }}
                      title="Remove from saved"
                    >
                      {unsavingLogs[log._id] ? (
                        '⏳ Removing...'
                      ) : (
                        '❤️ Unsave'
                      )}
                    </button>
                  </div>
                  
                  {/* Location */}
                  <p style={{ color: '#1976d2', fontWeight: 'bold', margin: '0 0 15px 0', fontSize: '16px' }}>
                    📍 {log.location}
                  </p>
                  
                  {/* Description */}
                  <p style={{ marginBottom: '15px', lineHeight: '1.7', fontSize: '16px' }}>{log.description}</p>
                  
                  {/* Tags */}
                  {log.tags && log.tags.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <strong style={{ fontSize: '14px', color: '#666' }}>Tags: </strong>
                      {log.tags.map((tag, index) => (
                        <span
                          key={index}
                          onClick={() => handleTagToggle(tag.toLowerCase())}
                          style={{
                            display: 'inline-block',
                            padding: '4px 12px',
                            margin: '2px 5px 2px 0',
                            backgroundColor: filters.selectedTags.includes(tag.toLowerCase()) ? '#1976d2' : '#e3f2fd',
                            border: '1px solid #1976d2',
                            borderRadius: '20px',
                            fontSize: '12px',
                            color: filters.selectedTags.includes(tag.toLowerCase()) ? 'white' : '#1976d2',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          title={`Click to ${filters.selectedTags.includes(tag.toLowerCase()) ? 'remove' : 'add'} filter`}
                        >
                          {tag} {filters.selectedTags.includes(tag.toLowerCase()) ? '✓' : ''}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />
                  
                  {/* Comments Toggle Button */}
                  <button
                    onClick={() => toggleComments(log._id)}
                    style={{ 
                      padding: '10px 20px', 
                      backgroundColor: '#f5f5f5', 
                      color: '#1976d2', 
                      border: '1px solid #ddd', 
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    💬 {expandedComments[log._id] ? 'Hide Comments' : 'Show Comments'} {expandedComments[log._id] ? '🔼' : '🔽'}
                  </button>
                  
                  {/* Comments Section */}
                  {expandedComments[log._id] && (
                    <Comments 
                      logId={log._id}
                      logOwnerId={log.user?._id}
                      currentUserId={currentUserId}
                      allowModeration={false}
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default SavedLogs;






