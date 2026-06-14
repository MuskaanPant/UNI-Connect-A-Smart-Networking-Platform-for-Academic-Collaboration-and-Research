import React, { useState } from 'react';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function PostCard({ post, onPostUpdated, onPostDeleted }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.likes?.some(like => like.user === user?.id) || false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [newComment, setNewComment] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editImages, setEditImages] = useState(post.images || []);
  const [imagePreviews, setImagePreviews] = useState(post.images || []);
  const [saving, setSaving] = useState(false);
  const fileInputRef = React.useRef(null);

  const isOwner = post.user?._id === user?.id;

  const handleLike = async () => {
    try {
      await postAPI.toggleLike(post._id);
      if (liked) {
        setLikeCount(likeCount - 1);
      } else {
        setLikeCount(likeCount + 1);
      }
      setLiked(!liked);
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        const response = await postAPI.addComment(post._id, { text: newComment });
        console.log('Comment response:', response);
        setComments(response.data);
        setNewComment('');
      } catch (err) {
        console.error('Error adding comment:', err);
        console.error('Error details:', {
          status: err.response?.status,
          data: err.response?.data,
          message: err.message
        });
        alert('Failed to post comment: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleEditPost = async () => {
    try {
      setSaving(true);
      const response = await postAPI.updatePost(post._id, {
        content: editContent,
        images: imagePreviews
      });
      if (onPostUpdated) onPostUpdated(response.data);
      setShowEditModal(false);
      alert('✅ Post updated successfully!');
    } catch (err) {
      console.error('Error updating post:', err);
      alert('❌ Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        await postAPI.deletePost(post._id);
        if (onPostDeleted) onPostDeleted(post._id);
        alert('✅ Post deleted successfully!');
      } catch (err) {
        console.error('Error deleting post:', err);
        alert('❌ Failed to delete post');
      }
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (files.length > 4) {
      alert('You can upload maximum 4 images');
      return;
    }
    
    const validFiles = [];
    const previews = [];
    
    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 5MB`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }
      validFiles.push(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return 'Just now';
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const userName = post.user?.fullName || 'Unknown User';
  const userRole = post.user?.role || 'Student';
  const userAvatar = `https://ui-avatars.com/api/?name=${userName}&background=1e40af&color=fff`;
  const timestamp = formatTimestamp(post.createdAt);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition">
      <div className="flex items-start space-x-4">
        <img
          src={userAvatar}
          alt={userName}
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{userName}</h3>
              <p className="text-sm text-gray-500">{userRole} • {timestamp}</p>
            </div>
            {isOwner && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-blue-600 hover:text-blue-800 transition"
                  title="Edit post"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={handleDeletePost}
                  className="text-red-600 hover:text-red-800 transition"
                  title="Delete post"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          
          <p className="mt-3 text-gray-700 leading-relaxed">{post.content}</p>
          
          {/* Display multiple images if available */}
          {post.images && post.images.length > 0 && (
            <div className={`mt-4 grid gap-2 ${
              post.images.length === 1 ? 'grid-cols-1' :
              post.images.length === 2 ? 'grid-cols-2' :
              post.images.length === 3 ? 'grid-cols-2' :
              'grid-cols-2'
            }`}>
              {post.images.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Post content ${index + 1}`}
                  className={`rounded-lg w-full object-cover ${
                    post.images.length === 1 ? 'max-h-96' :
                    post.images.length === 3 && index === 0 ? 'col-span-2 max-h-64' :
                    'max-h-48'
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Fallback to single imageURL for backward compatibility */}
          {(!post.images || post.images.length === 0) && post.imageURL && (
            <img
              src={post.imageURL}
              alt="Post content"
              className="mt-4 rounded-lg w-full object-cover max-h-96"
            />
          )}
          
          <div className="flex items-center space-x-6 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 transition ${
                liked ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span className="font-medium">{likeCount}</span>
            </button>
            
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span className="font-medium">{comments.length}</span>
            </button>
            
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span className="font-medium">Share</span>
            </button>
          </div>
          
          {showComments && (
            <div className="mt-4 space-y-4">
              {comments.map((comment, index) => {
                const commentUser = comment.user?.fullName || 'Unknown';
                const commentAvatar = `https://ui-avatars.com/api/?name=${commentUser}&background=1e40af&color=fff`;
                const commentTime = formatTimestamp(comment.date);
                
                return (
                  <div key={comment._id || index} className="flex space-x-3 bg-gray-50 p-3 rounded-lg">
                    <img
                      src={commentAvatar}
                      alt={commentUser}
                      className="w-8 h-8 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm">{commentUser}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          comment.user?.role === 'Professor' 
                            ? 'bg-purple-100 text-purple-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {comment.user?.role || 'User'}
                        </span>
                        <span className="text-xs text-gray-500">{commentTime}</span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                    </div>
                  </div>
                );
              })}
              
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Post
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Post Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Post</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Content *
                  </label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    rows="4"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Images (Max 4)
                  </label>
                  
                  {imagePreviews.length > 0 && (
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-full h-48 rounded-lg object-cover"
                          />
                          <button
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 hover:bg-red-700 transition shadow-lg"
                            title="Remove image"
                            type="button"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                    id="edit-image-upload"
                  />
                  <label
                    htmlFor="edit-image-upload"
                    className="flex items-center justify-center space-x-2 w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary transition cursor-pointer"
                  >
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium text-gray-600">
                      {imagePreviews.length > 0 ? 'Change Images' : 'Add Images'}
                    </span>
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditPost}
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={saving || !editContent.trim()}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PostCard;
