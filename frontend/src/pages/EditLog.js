import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@mui/material';

function EditLog() {
  const { id } = useParams();  // Get the log ID from URL parameters
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    tags: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch the log data when the component mounts
  useEffect(() => {
    const fetchLog = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Session expired, please log in again.');
        navigate('/login');
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
          alert('Session expired, please log in again.');
          navigate('/login');
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired, please log in again.');
      navigate('/login');
      return;
    }

    try {
      setError('');
      
      // Prepare data for submission
      const submitData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        tags: formData.tags.trim(), // Send as string, backend will handle conversion
      };

      console.log('Submitting data:', submitData); // Debug log

      await axios.put(`/travellogs/${id}`, submitData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      alert('Travel log updated successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error updating log:', err);
      console.error('Error response:', err.response?.data); // Debug log
      
      if (err.response?.status === 401) {
        alert('Session expired, please log in again.');
        navigate('/login');
      } else if (err.response?.status === 403) {
        alert('You are not authorized to edit this travel log.');
      } else if (err.response?.status === 404) {
        alert('Travel log not found.');
      } else {
        setError(`Failed to update log: ${err.response?.data?.msg || err.message}`);
      }
    }
  };

  const handleDelete = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Session expired, please log in again.');
      navigate('/login');
      return;
    }
    
    const confirmDelete = window.confirm('Are you sure you want to delete this log?');
    if (confirmDelete) {
      try {
        await axios.delete(`/travellogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Travel log deleted successfully!');
        navigate('/dashboard');
      } catch (err) {
        console.error('Error deleting log:', err);
        if (err.response?.status === 401) {
          alert('Session expired, please log in again.');
          navigate('/login');
        } else if (err.response?.status === 403) {
          alert('You are not authorized to delete this travel log.');
        } else {
          alert(`Failed to delete log: ${err.response?.data?.msg || err.message}`);
        }
      }
    }
  };

  if (loading) {
    return <div>Loading travel log...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Edit Travel Log</h2>
      
      {error && (
        <div style={{ color: 'red', marginBottom: '10px', padding: '10px', border: '1px solid red', borderRadius: '4px' }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="5"
            style={{ width: '100%', padding: '8px', fontSize: '16px', resize: 'vertical' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated)"
            value={formData.tags}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', fontSize: '16px' }}
          />
          <small style={{ color: '#666' }}>Example: travel, europe, food, adventure</small>
        </div>
        
        <Button type="submit" variant="contained" color="primary" style={{ marginRight: '10px' }}>
          Update Log
        </Button>
        
        <Button onClick={handleDelete} variant="outlined" color="error">
          Delete Log
        </Button>
      </form>
    </div>
  );
}

export default EditLog;