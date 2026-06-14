import React, { useState, useEffect } from 'react';
import PostCard from '../components/PostCard';
import { postAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await postAPI.getFeed();
      setPosts(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load posts. Please try again.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (newPostContent.trim()) {
      try {
        setPosting(true);
        
        // Send all images as base64 array
        const postData = {
          content: newPostContent,
          images: imagePreviews // Send all images
        };
        
        console.log('Creating post with data:', { 
          content: postData.content, 
          imageCount: postData.images.length 
        });
        
        const response = await postAPI.createPost(postData);
        setPosts([response.data, ...posts]);
        setNewPostContent('');
        setSelectedImages([]);
        setImagePreviews([]);
        setError('');
      } catch (err) {
        setError('Failed to create post. Please try again.');
        console.error('Error creating post:', err);
        console.error('Error details:', err.response?.data);
      } finally {
        setPosting(false);
      }
    }
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Limit to 4 images
    if (files.length > 4) {
      alert('You can upload maximum 4 images');
      return;
    }
    
    const validFiles = [];
    const previews = [];
    
    files.forEach(file => {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} is too large. Max size is 5MB`);
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} is not an image file`);
        return;
      }

      validFiles.push(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        previews.push(reader.result);
        if (previews.length === validFiles.length) {
          setImagePreviews(previews);
        }
      };
      reader.readAsDataURL(file);
    });
    
    setSelectedImages(validFiles);
  };

  const handleRemoveImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
    
    if (newImages.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-xl text-gray-600 font-semibold">Loading feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-green-500 via-teal-500 to-cyan-500 rounded-3xl shadow-2xl p-8 text-white">
        <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
          <span className="text-5xl">📰</span>
          <span>Activity Feed</span>
        </h1>
        <p className="text-green-100 text-lg">Share your academic updates and connect with peers</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-300 text-red-700 rounded-2xl shadow-lg text-base font-semibold">
          {error}
        </div>
      )}

      {/* Create Post */}
      <div className="bg-white rounded-3xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100">
        <div className="flex items-start space-x-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-xl shadow-lg">
            {user?.fullName?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="Share your academic update, ideas, or achievements..."
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 resize-none text-base transition-all duration-200"
              rows="4"
              disabled={posting}
            />
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={preview} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-56 rounded-2xl object-cover shadow-lg group-hover:shadow-2xl transition-all duration-300"
                    />
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition shadow-xl transform hover:scale-110"
                      title="Remove image"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer text-gray-700 font-semibold"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-base">
                    {selectedImages.length > 0 
                      ? `${selectedImages.length} image${selectedImages.length > 1 ? 's' : ''}` 
                      : 'Add Images'}
                  </span>
                </label>
              </div>
              <button
                onClick={handleCreatePost}
                disabled={posting || !newPostContent.trim()}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-200 font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
              >
                {posting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard 
              key={post._id} 
              post={post}
              onPostUpdated={(updatedPost) => {
                setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
              }}
              onPostDeleted={(postId) => {
                setPosts(posts.filter(p => p._id !== postId));
              }}
            />
          ))
        ) : (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl shadow-xl p-16 text-center border border-blue-100">
            <div className="text-7xl mb-4">📝</div>
            <p className="text-gray-600 text-xl font-semibold">No posts yet. Be the first to share!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Feed;
