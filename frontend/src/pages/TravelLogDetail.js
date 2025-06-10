import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import Comments from '../components/Comments'  // Ensure this path is correct (if Comments is in the same folder as TravelLogDetail.js)
import { useParams } from 'react-router-dom';

function TravelLogDetail() {
  const { id } = useParams();  // Get travel log ID from URL
  const [log, setLog] = useState(null);

  useEffect(() => {
    const fetchLog = async () => {
      try {
        const res = await axios.get(`/travellogs/${id}`);
        setLog(res.data);
      } catch (err) {
        console.error('Error fetching travel log:', err);
      }
    };

    fetchLog();
  }, [id]);

  if (!log) return <div>Loading...</div>;

  return (
    <div>
      <h2>{log.title}</h2>
      <p>{log.description}</p>
      <img src={log.imageUrl} alt={log.title} style={{ width: '100%' }} />
      <p>Location: {log.location}</p>
      <p>Tags: {log.tags.join(', ')}</p>

      {/* Comments Section */}
      <Comments logId={id} />  {/* Pass logId to the Comments component */}
    </div>
  );
}

export default TravelLogDetail;
