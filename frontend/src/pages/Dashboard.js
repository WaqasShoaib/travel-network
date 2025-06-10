import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';  // Import the axios instance
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

function Dashboard() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token'); // Get the token from localStorage
    if (!token) {
      navigate('/login');  // Redirect to login if no token
    } else {
      // Fetch personal logs using the token
      const fetchPersonalLogs = async () => {
        try {
            const token = localStorage.getItem('token');  // Get the token from localStorage
            if (!token) {
            navigate('/login');  // Redirect to login if no token
            } else {
            const res = await axios.get('/travellogs/personal', {
                headers: { Authorization: `Bearer ${token}` },  // Send token in headers
            });
            setLogs(res.data);  // Set the fetched logs in the state
            }
        } catch (err) {
            console.error('Error fetching personal logs:', err);
        } finally {
            setLoading(false);  // Set loading to false once data is fetched
        }
        };
      fetchPersonalLogs();
    }
  }, [navigate]);

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to log in first!');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this log?');
    if (confirmDelete) {
      try {
        await axios.delete(`/travellogs/${id}`, {
          headers: { Authorization: `Bearer ${token}` },  // Send token in headers
        });
        setLogs(logs.filter(log => log._id !== id));  // Remove the deleted log from the state
      } catch (err) {
        console.error('Error deleting log:', err);
        alert('Failed to delete log. Please try again.');
      }
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-log/${id}`);  // Navigate to the EditLog page
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Your Travel Logs</h2>
      {logs.length === 0 ? (
        <p>You have no personal logs yet!</p>
      ) : (
        <ul>
          {logs.map((log, index) => (
            <li key={index}>
              <h3>{log.title}</h3>
              <p>{log.description}</p>
              <img src={log.imageUrl} alt={log.title} style={{ width: '200px' }} />
              <p>Location: {log.location}</p>
              <p>Tags: {log.tags.join(', ')}</p>
              {/* Edit and Delete buttons */}
              <Button
                color="primary"
                variant="outlined"
                onClick={() => handleEdit(log._id)}  // Edit log
              >
                Edit
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => handleDelete(log._id)}  // Delete log
              >
                Delete
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
