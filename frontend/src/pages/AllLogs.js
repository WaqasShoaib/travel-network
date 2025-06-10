import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';  // Import the axios instance
import { useNavigate } from 'react-router-dom';

function AllLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/travellogs');  // Fetch all travel logs
        setLogs(res.data);
      } catch (error) {
        console.error('Error fetching travel logs:', error);
      } finally {
        setLoading(false);  // Set loading to false once data is fetched
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AllLogs;
