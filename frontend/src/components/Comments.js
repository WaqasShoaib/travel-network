import React, { useState, useEffect, useRef } from 'react';
import axios from '../utils/axios';
import EmojiPicker from 'emoji-picker-react';
import './Comments.css'; // Import the enhanced CSS

const Comments = ({ logId, logOwnerId, currentUserId, allowModeration = false }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showEditEmojiPicker, setShowEditEmojiPicker] = useState(false);
  
  // Refs for click outside detection
  const emojiPickerRef = useRef(null);
  const editEmojiPickerRef = useRef(null);

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

  // Close emoji pickers when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (editEmojiPickerRef.current && !editEmojiPickerRef.current.contains(event.target)) {
        setShowEditEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close emoji picker when pressing Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowEmojiPicker(false);
        setShowEditEmojiPicker(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

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

  const quickEmojis = ['👍', '❤️', '😂', '😮', '😢', '🎉'];

  return (
    <div className="comments-container">
      <h4 className="comments-header">
        💬 Comments
        <span className="comments-count">{comments.length}</span>
      </h4>

      {/* Add Comment Form */}
      <div className="new-comment-form">
        <form onSubmit={handleSubmit}>
          <textarea
            className="comment-textarea"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Share your thoughts... What did you think about this adventure? 🌟"
            rows={3}
          />
          
          <div className="form-actions">
            <div className="primary-actions">
              <button 
                type="submit" 
                disabled={loading || !newComment.trim()}
                className={`submit-button ${loading ? 'loading' : ''}`}
              >
                <span>{loading ? '✨ Posting...' : '🚀 Post Comment'}</span>
              </button>
              
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`emoji-toggle-button ${showEmojiPicker ? 'active' : ''}`}
                title="Add emoji"
              >
                😀
              </button>
            </div>
            
            <div className="quick-emojis">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setNewComment(prev => prev + emoji)}
                  className="quick-emoji"
                  title={`Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Emoji Picker for New Comment - Fixed Overlay */}
      {showEmojiPicker && (
        <>
          <div 
            className="emoji-picker-backdrop" 
            onClick={() => setShowEmojiPicker(false)}
          />
          <div ref={emojiPickerRef} className="emoji-picker-overlay">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={350}
              height={450}
              searchDisabled={false}
              skinTonesDisabled={false}
              previewConfig={{
                showPreview: true,
                defaultCaption: "Pick the perfect emoji!",
                defaultEmoji: "1f60a"
              }}
            />
          </div>
        </>
      )}

      {/* Comments List */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <div className="no-comments">
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💭</div>
            <div>No comments yet. Be the first to share your thoughts!</div>
            <div style={{ fontSize: '0.9rem', marginTop: '5px', opacity: 0.7 }}>
              Start a conversation about this amazing travel experience
            </div>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment._id} className={`comment-item ${loading ? 'loading' : ''}`}>
              <div className="comment-header">
                <div className="comment-author">
                  <p className="username">
                    👤 {comment.user.username}
                    {allowModeration && currentUserId === logOwnerId && currentUserId !== comment.user._id && (
                      <span className="moderation-badge">Moderator Access</span>
                    )}
                  </p>
                  <p className="comment-timestamp">
                    📅 {new Date(comment.createdAt).toLocaleDateString()} at {new Date(comment.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {/* Action Buttons */}
                {currentUserId && (
                  <div className="comment-actions">
                    {canEditComment(comment) && editingId !== comment._id && (
                      <button 
                        onClick={() => handleEdit(comment)}
                        disabled={loading}
                        className="action-button edit"
                      >
                        ✏️ Edit
                      </button>
                    )}
                    {canDeleteComment(comment) && (
                      <button 
                        onClick={() => handleDelete(comment._id, comment.user._id)}
                        disabled={loading}
                        className="action-button delete"
                      >
                        🗑️ Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {editingId === comment._id ? (
                <div className="edit-form">
                  <textarea
                    className="edit-textarea"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                  />
                  
                  <div className="edit-actions">
                    <button 
                      onClick={() => handleUpdate(comment._id)}
                      disabled={loading || !editText.trim()}
                      className="action-button save"
                    >
                      💾 Save Changes
                    </button>
                    <button 
                      onClick={cancelEdit}
                      disabled={loading}
                      className="action-button cancel"
                    >
                      ❌ Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEditEmojiPicker(!showEditEmojiPicker)}
                      className={`emoji-toggle-button ${showEditEmojiPicker ? 'active' : ''}`}
                      title="Add emoji"
                    >
                      😀
                    </button>
                  </div>
                </div>
              ) : (
                <div className="comment-content">
                  {comment.text}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Emoji Picker for Edit Comment - Fixed Overlay */}
      {showEditEmojiPicker && (
        <>
          <div 
            className="emoji-picker-backdrop" 
            onClick={() => setShowEditEmojiPicker(false)}
          />
          <div ref={editEmojiPickerRef} className="emoji-picker-overlay">
            <EmojiPicker
              onEmojiClick={handleEditEmojiClick}
              width={350}
              height={450}
              searchDisabled={false}
              skinTonesDisabled={false}
              previewConfig={{
                showPreview: true,
                defaultCaption: "Pick the perfect emoji!",
                defaultEmoji: "1f60a"
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Comments;