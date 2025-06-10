import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');  // Redirect to login if no token
    } else {
      // Fetch user data from API if token exists
      // Replace with actual API call to fetch user-specific data
      setUserData({
        username: 'JohnDoe',
        savedLogs: ['Log 1', 'Log 2'],
      });
    }
  }, [navigate]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
      <h2>Welcome {userData.username}!</h2>
      <h3>Your Saved Logs:</h3>
      <ul>
        {userData.savedLogs.map((log, index) => (
          <li key={index}>{log}</li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
