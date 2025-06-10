import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import CreateLog from './pages/CreateLog'; // Make sure this is correct

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-log" element={<ProtectedRoute><CreateLog /></ProtectedRoute>} /> {/* This should work */}
        <Route path="/" element={<Home />} /> {/* This should also work */}
      </Routes>
    </Router>
  );
}

export default App;
