import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';  // Make sure axios is correctly set up

function Comments({ logId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  // Fetch comments for the specific log
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/comments/${logId}`);
        setComments(res.data);  // Set fetched comments
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };

    fetchComments();
  }, [logId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(
        `/comments`,
        { travelLogId: logId, text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([res.data, ...comments]);  // Add the new comment to the list
      setNewComment('');  // Clear the input field
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div>
      <h4>Comments</h4>
      <form onSubmit={handleSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment"
        />
        <button type="submit">Submit</button>
      </form>

      <ul>
        {comments.map((comment) => (
          <li key={comment._id}>
            <p>{comment.text}</p>
            <p><strong>{comment.user.username}</strong></p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Comments;
