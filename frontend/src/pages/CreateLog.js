import React, { useState } from 'react';
import axios from '../utils/axios'; // Import axios instance
import { useNavigate } from 'react-router-dom';

function CreateLog() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    tags: '',
    image: null,  // Add image to the state
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0], // Save the selected file
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const formDataToSend = new FormData(); // Use FormData to send files along with other data

    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('location', formData.location);
    formDataToSend.append('tags', formData.tags);
    formDataToSend.append('image', formData.image); // Append image

    try {
      await axios.post('/travellogs', formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data', // Set the content type to handle file uploads
        },
      });
      navigate('/dashboard'); // Redirect after successful log creation
    } catch (err) {
      console.error('Error creating travel log:', err);
    }
  };

  return (
    <div>
      <h2>Create a New Travel Log</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
        />
        <input
          type="text"
          name="tags"
          placeholder="Tags (comma separated)"
          value={formData.tags}
          onChange={handleChange}
        />
        <input
          type="file"
          name="image"
          onChange={handleImageChange} // Update the state with selected image
        />
        <button type="submit">Create Log</button>
      </form>
    </div>
  );
}

export default CreateLog;
