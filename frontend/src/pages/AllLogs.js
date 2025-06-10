import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';  // Import the axios instance

function AllLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await axios.get('/travellogs');  // Fetch all travel logs
        setLogs(response.data);  // Set the logs in state
      } catch (error) {
        console.error('Error fetching travel logs:', error);
      } finally {
        setLoading(false);  // Set loading to false after data is fetched
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <div>Loading logs...</div>;  // Show loading message while fetching logs
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
