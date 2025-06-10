import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';  // Import the axios instance
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

function AllLogs() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/travellogs');  // Fetch all travel logs
        setLogs(res.data);  // Set the fetched logs in the state
      } catch (err) {
        console.error('Error fetching travel logs:', err);
      } finally {
        setLoading(false);  // Set loading to false once data is fetched
      }
    };

    fetchLogs();
  }, []);

  const handleViewComments = (logId) => {
    navigate(`/comments/${logId}`);  // Navigate to the comments page of the specific log
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>All Travel Logs</h2>
      {logs.length === 0 ? (
        <p>No logs available.</p>
      ) : (
        <ul>
          {logs.map((log) => (
            <li key={log._id}>
              <h3>{log.title}</h3>
              <p>{log.description}</p>
              <img src={log.imageUrl} alt={log.title} style={{ width: '200px' }} />
              <p>Location: {log.location}</p>
              <p>Tags: {log.tags.join(', ')}</p>
              {/* View Comments button */}
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleViewComments(log._id)}
              >
                View Comments
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AllLogs;
