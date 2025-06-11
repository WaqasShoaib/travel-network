import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // Import the new Footer component
import CreateLog from './pages/CreateLog';
import AllLogs from './pages/AllLogs';
import EditLog from './pages/EditLog';
import SavedLogs from './pages/SavedLogs';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        
        {/* Main content area */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public routes */}
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Home />} />
            <Route path="/all-logs" element={<AllLogs />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/create-log" element={<ProtectedRoute><CreateLog /></ProtectedRoute>} />
            <Route path="/edit-log/:id" element={<ProtectedRoute><EditLog /></ProtectedRoute>} />
            <Route path="/saved-logs" element={<ProtectedRoute><SavedLogs /></ProtectedRoute>} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;