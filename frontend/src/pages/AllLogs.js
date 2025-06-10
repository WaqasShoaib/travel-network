import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';  // Import the axios instance
import { TextField, Button, MenuItem, Select, InputLabel, FormControl } from '@mui/material';  // For filters

function AllLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('');
  const [tagsFilter, setTagsFilter] = useState('');
  const [allLocations, setAllLocations] = useState([]);  // To store available locations

  // Fetch all logs and locations
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await axios.get('/travellogs');
        setLogs(res.data);
        setFilteredLogs(res.data); // Initially, show all logs

        // Extract unique locations
        const locations = [...new Set(res.data.map(log => log.location))];
        setAllLocations(locations); // Store available locations for filtering
      } catch (error) {
        console.error('Error fetching travel logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Filter logs based on location and tags
  useEffect(() => {
    let filtered = logs;

    if (locationFilter) {
      filtered = filtered.filter((log) => log.location.toLowerCase().includes(locationFilter.toLowerCase()));
    }

    if (tagsFilter) {
      filtered = filtered.filter((log) => log.tags.some(tag => tag.toLowerCase().includes(tagsFilter.toLowerCase())));
    }

    setFilteredLogs(filtered);
  }, [locationFilter, tagsFilter, logs]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>All Travel Logs</h2>

      {/* Filter Section */}
      <div>
        <FormControl fullWidth>
          <InputLabel>Location</InputLabel>
          <Select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            label="Location"
          >
            <MenuItem value="">
              <em>All Locations</em>
            </MenuItem>
            {allLocations.map((location, index) => (
              <MenuItem key={index} value={location}>
                {location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Search by Tag"
          variant="outlined"
          fullWidth
          value={tagsFilter}
          onChange={(e) => setTagsFilter(e.target.value)}
          placeholder="Enter tags (comma-separated)"
        />

        <Button onClick={() => setLocationFilter('') & setTagsFilter('')} variant="contained">Clear Filters</Button>
      </div>

      {/* Display filtered logs */}
      {filteredLogs.length === 0 ? (
        <p>No logs match your filter criteria.</p>
      ) : (
        <ul>
          {filteredLogs.map((log, index) => (
            <li key={index}>
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
