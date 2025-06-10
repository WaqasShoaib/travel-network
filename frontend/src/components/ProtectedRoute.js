import React from 'react';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;  // Redirect to login if no token
  }

  return children;  // Allow access to the route if token is present
}

export default ProtectedRoute;
