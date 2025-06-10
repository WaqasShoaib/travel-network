import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import CreateLog from './pages/CreateLog';
import AllLogs from './pages/AllLogs';
import EditLog from './pages/EditLog';
import CommentsPage from './pages/TravelLogDetail';  // Import the CommentsPage

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/create-log" element={<ProtectedRoute><CreateLog /></ProtectedRoute>} />
        <Route path="/all-logs" element={<AllLogs />} />
        <Route path="/edit-log/:id" element={<ProtectedRoute><EditLog /></ProtectedRoute>} />
        
        {/* Route for viewing comments of a specific travel log */}
        <Route path="/comments/:id" element={<CommentsPage />} />  {/* Comments page for a specific log */}
      </Routes>
    </Router>
  );
}

export default App;
