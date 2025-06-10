import React, { useState } from 'react';
import axios from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Button } from '@mui/material';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard'); // Redirect to dashboard after successful registration
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Username"
          variant="outlined"
          name="username"
          value={formData.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Email"
          variant="outlined"
          name="email"
          value={formData.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          variant="outlined"
          name="password"
          value={formData.password}
          onChange={handleChange}
          type="password"
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" fullWidth>Register</Button>
      </form>
    </div>
  );
}

export default Register;
