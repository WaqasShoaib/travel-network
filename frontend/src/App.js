import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';  
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';  // Import Navbar

function App() {
  return (
    <Router>
      <Navbar /> {/* Add Navbar here */}
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protect the Dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
