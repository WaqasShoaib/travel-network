import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import Comments from '../components/Comments';

function AllLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedComments, setExpandedComments] = useState({});
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/travellogs');
        setLogs(res.data);
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };

    // Get current user ID from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id);
      } catch (err) {
        console.error('Error parsing token:', err);
      }
    }

    fetchLogs();
  }, []);

  const toggleComments = (logId) => {
    setExpandedComments(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h3>Loading travel logs...</h3>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>All Travel Logs</h2>
      
      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>No travel logs found.</h3>
          <p>Be the first to share your adventure!</p>
        </div>
      ) : (
        <div>
          {logs.map((log) => (
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
                {/* Travel Log Header */}
                <h3 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{log.title}</h3>
                
                <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
                  By <strong>{log.user?.username || 'Anonymous'}</strong> • {new Date(log.createdAt).toLocaleDateString()}
                </p>
                
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
                        style={{
                          display: 'inline-block',
                          padding: '4px 12px',
                          margin: '2px 5px 2px 0',
                          backgroundColor: '#e3f2fd',
                          border: '1px solid #1976d2',
                          borderRadius: '20px',
                          fontSize: '12px',
                          color: '#1976d2'
                        }}
                      >
                        {tag}
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
                    allowModeration={false} // Users can't moderate others' posts in public view
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllLogs;