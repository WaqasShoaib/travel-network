import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import EmojiPicker from 'emoji-picker-react';

function Comments({ logId, logOwnerId, currentUserId, allowModeration = false }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);

  // Fetch comments for the specific log
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await axios.get(`/comments/${logId}`);
        setComments(res.data);
      } catch (err) {
        console.error('Error fetching comments:', err);
      }
    };

    if (logId) {
      fetchComments();
    }
  }, [logId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to comment');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `/comments`,
        { travelLogId: logId, text: newComment.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments([res.data, ...comments]);
      setNewComment('');
      setShowEmojiPicker(false);
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewComment(prev => prev + emojiObject.emoji);
  };

  const handleEditEmojiClick = (emojiObject) => {
    setEditText(prev => prev + emojiObject.emoji);
  };

  const handleEdit = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.text);
    setShowEditEmojiPicker(false);
  };

  const handleUpdate = async (commentId) => {
    if (!editText.trim()) return;

    const token = localStorage.getItem('token');
    setLoading(true);
    try {
      const res = await axios.put(
        `/comments/${commentId}`,
        { text: editText.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setComments(comments.map(comment => 
        comment._id === commentId ? res.data : comment
      ));
      setEditingId(null);
      setEditText('');
      setShowEditEmojiPicker(false);
    } catch (err) {
      console.error('Error updating comment:', err);
      alert('Failed to update comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (commentId, commentUserId) => {
    const token = localStorage.getItem('token');
    
    // Check if user can delete this comment
    const isOwner = currentUserId === commentUserId;
    const isPostOwner = allowModeration && currentUserId === logOwnerId;
    
    if (!isOwner && !isPostOwner) {
      alert('You can only delete your own comments');
      return;
    }

    const confirmMessage = isPostOwner && !isOwner 
      ? 'As the post owner, are you sure you want to delete this comment?' 
      : 'Are you sure you want to delete your comment?';
      
    if (!window.confirm(confirmMessage)) return;

    setLoading(true);
    try {
      await axios.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
    setShowEditEmojiPicker(false);
  };

  // Check if current user can perform actions on a comment
  const canEditComment = (comment) => {
    return currentUserId === comment.user._id;
  };

  const canDeleteComment = (comment) => {
    const isOwner = currentUserId === comment.user._id;
    const isPostOwner = allowModeration && currentUserId === logOwnerId;
    return isOwner || isPostOwner;
  };

  const commentStyle = {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '15px',
    backgroundColor: '#f9f9f9'
  };

  const buttonStyle = {
    padding: '5px 10px',
    margin: '0 5px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '12px'
  };

  const textareaStyle = {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'inherit',
    resize: 'vertical'
  };

  const emojiButtonStyle = {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: '#f5f5f5',
    cursor: 'pointer',
    fontSize: '16px',
    marginLeft: '10px'
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h4>Comments ({comments.length})</h4>

      {/* Add Comment Form */}
      <div style={{ ...commentStyle, backgroundColor: '#fff' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative' }}>
            <textarea
              style={{ ...textareaStyle, minHeight: '80px' }}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... 😊"
            />
            
            {/* Emoji Picker for New Comment */}
            {showEmojiPicker && (
              <div style={{
                position: 'absolute',
                top: '90px',
                right: '0',
                zIndex: 1000,
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  width={300}
                  height={400}
                />
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
            <button 
              type="submit" 
              disabled={loading || !newComment.trim()}
              style={{
                ...buttonStyle,
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '8px 16px'
              }}
            >
              {loading ? 'Posting...' : 'Post Comment'}
            </button>
            
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              style={emojiButtonStyle}
              title="Add emoji"
            >
              😀
            </button>
            
            {/* Quick Emoji Shortcuts */}
            <div style={{ marginLeft: '10px' }}>
              {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewComment(prev => prev + emoji)}
                  style={{
                    padding: '4px 8px',
                    border: 'none',
                    backgroundColor: 'transparent',
                    cursor: 'pointer',
                    fontSize: '16px'
                  }}
                  title={`Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Comments List */}
      {comments.length === 0 ? (
        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
          No comments yet. Be the first to comment! 💬
        </p>
      ) : (
        comments.map((comment) => (
          <div key={comment._id} style={commentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#1976d2' }}>
                  {comment.user.username}
                  {allowModeration && currentUserId === logOwnerId && currentUserId !== comment.user._id && (
                    <span style={{ fontSize: '11px', color: '#666', fontWeight: 'normal', marginLeft: '10px' }}>
                      (You can moderate this comment)
                    </span>
                  )}
                </p>
                
                {editingId === comment._id ? (
                  <div style={{ position: 'relative' }}>
                    <textarea
                      style={{ ...textareaStyle, minHeight: '60px', marginBottom: '10px' }}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                    />
                    
                    {/* Emoji Picker for Edit */}
                    {showEditEmojiPicker && (
                      <div style={{
                        position: 'absolute',
                        top: '70px',
                        right: '0',
                        zIndex: 1000,
                        border: '1px solid #ddd',
                        borderRadius: '8px',
                        backgroundColor: 'white',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}>
                        <EmojiPicker
                          onEmojiClick={handleEditEmojiClick}
                          width={300}
                          height={400}
                        />
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <button 
                        onClick={() => handleUpdate(comment._id)}
                        disabled={loading || !editText.trim()}
                        style={{ ...buttonStyle, backgroundColor: '#4caf50', color: 'white' }}
                      >
                        💾 Save
                      </button>
                      <button 
                        onClick={cancelEdit}
                        disabled={loading}
                        style={buttonStyle}
                      >
                        ❌ Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowEditEmojiPicker(!showEditEmojiPicker)}
                        style={emojiButtonStyle}
                        title="Add emoji"
                      >
                        😀
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: '0 0 10px 0', lineHeight: '1.5', fontSize: '15px' }}>
                    {comment.text}
                  </p>
                )}
                
                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                  {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                </p>
              </div>

              {/* Action Buttons */}
              {currentUserId && (
                <div style={{ marginLeft: '15px' }}>
                  {canEditComment(comment) && editingId !== comment._id && (
                    <button 
                      onClick={() => handleEdit(comment)}
                      disabled={loading}
                      style={buttonStyle}
                    >
                      ✏️ Edit
                    </button>
                  )}
                  {canDeleteComment(comment) && (
                    <button 
                      onClick={() => handleDelete(comment._id, comment.user._id)}
                      disabled={loading}
                      style={{ ...buttonStyle, color: '#d32f2f' }}
                    >
                      🗑️ Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Comments;