import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';  // Import axios instance
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [savedLogs, setSavedLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');  // Redirect to login if no token
    } else {
      // Fetch saved travel logs using the stored token
      const fetchSavedLogs = async () => {
        try {
          const res = await axios.get('/user/saved-logs', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSavedLogs(res.data);  // Set saved logs in state
        } catch (err) {
          console.error('Error fetching saved logs:', err);
        } finally {
          setIsLoading(false); // Set loading to false once data is fetched
        }
      };
      fetchSavedLogs();
    }
  }, [navigate]);

  // Handle unsaving (removing) a log
  const handleUnsave = async (logId) => {
    const token = localStorage.getItem('token');
    try {
      await axios.post('/user/unsave-log', { logId }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSavedLogs(savedLogs.filter((log) => log._id !== logId));  // Remove log from state
    } catch (err) {
      console.error('Error unsaving log:', err);
    }
  };

  if (isLoading) return <div>Loading...</div>; // Show loading state if fetching data

  return (
    <div>
      <h2>Welcome to Your Dashboard!</h2>
      <h3>Your Saved Logs:</h3>

      {savedLogs.length === 0 ? (
        <p>You have no saved logs yet!</p>
      ) : (
        <ul>
          {savedLogs.map((log, index) => (
            <li key={index}>
              <h4>{log.title}</h4>
              <p>{log.description}</p>
              <button onClick={() => handleUnsave(log._id)}>Unsave</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Dashboard;
