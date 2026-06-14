import React, { useState, useEffect } from 'react';
import { forumAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function Forum() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [expandedThread, setExpandedThread] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: ''
  });
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    tags: ''
  });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      setLoading(true);
      const response = await forumAPI.getAllThreads();
      setThreads(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load forum threads');
      console.error('Error fetching threads:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const questionData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      const response = await forumAPI.askQuestion(questionData);
      setThreads([response.data.question, ...threads]);
      setShowCreateModal(false);
      setFormData({ title: '', description: '', tags: '' });
      setError('');
      alert('✅ Question posted successfully!');
    } catch (err) {
      setError('Failed to post question');
      console.error('Error posting question:', err);
      alert('❌ Failed to post question');
    } finally {
      setCreating(false);
    }
  };

  const handleEditQuestion = (thread) => {
    setEditingQuestion(thread._id);
    setEditFormData({
      title: thread.title,
      description: thread.description,
      tags: thread.tags ? thread.tags.join(', ') : ''
    });
    setShowEditModal(true);
  };

  const handleUpdateQuestion = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        ...editFormData,
        tags: editFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };
      await forumAPI.updateQuestion(editingQuestion, questionData);
      await fetchThreads();
      setShowEditModal(false);
      setEditingQuestion(null);
      alert('✅ Question updated successfully!');
    } catch (err) {
      console.error('Error updating question:', err);
      alert('❌ Failed to update question');
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      try {
        await forumAPI.deleteQuestion(questionId);
        setThreads(threads.filter(t => t._id !== questionId));
        alert('✅ Question deleted successfully!');
      } catch (err) {
        console.error('Error deleting question:', err);
        alert('❌ Failed to delete question');
      }
    }
  };

  const handleDeleteAnswer = async (questionId, answerId) => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      try {
        await forumAPI.deleteAnswer(questionId, answerId);
        await fetchThreads();
        alert('✅ Answer deleted successfully!');
      } catch (err) {
        console.error('Error deleting answer:', err);
        alert('❌ Failed to delete answer');
      }
    }
  };

  const handleSubmitAnswer = async (threadId) => {
    if (!answerText.trim()) return;
    
    try {
      setSubmittingAnswer(true);
      await forumAPI.answerQuestion(threadId, { text: answerText });
      await fetchThreads();
      setAnswerText('');
      setError('');
      alert('✅ Answer posted successfully!');
    } catch (err) {
      setError('Failed to post answer');
      console.error('Error posting answer:', err);
      alert('❌ Failed to post answer');
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const toggleThread = (threadId) => {
    setExpandedThread(expandedThread === threadId ? null : threadId);
    setAnswerText('');
  };

  const formatDate = (timestamp) => {
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

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
        <p className="mt-6 text-xl text-gray-600 font-semibold">Loading forum threads...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 flex items-center space-x-3">
              <span className="text-5xl">💬</span>
              <span>Discussion Forums</span>
            </h1>
            <p className="text-indigo-100 text-lg">Ask academic questions and share knowledge with the community</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 bg-white text-indigo-600 rounded-2xl hover:shadow-2xl transition-all duration-200 font-bold text-lg transform hover:scale-105"
          >
            + Ask Question
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-2 border-red-300 text-red-700 rounded-2xl shadow-lg text-base font-semibold">
          {error}
        </div>
      )}

      {threads.length > 0 ? (
        <div className="space-y-6">
          {threads.map((thread) => (
            <div key={thread._id} className="bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100">
              <div className="p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 flex-1">{thread.title}</h3>
                  {thread.user?._id === user?.id && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleEditQuestion(thread)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition"
                        title="Edit question"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(thread._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition"
                        title="Delete question"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-700 mb-6 text-base leading-relaxed">{thread.description}</p>
                
                {thread.tags && thread.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {thread.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-md"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-base text-gray-600">
                    <span className="font-bold">{thread.user?.fullName || 'Unknown'}</span>
                    <span>•</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      thread.user?.role === 'Professor' 
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white' 
                        : 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                    }`}>
                      {thread.user?.role || 'User'}
                    </span>
                    <span>•</span>
                    <span className="font-medium">{formatDate(thread.createdAt)}</span>
                  </div>
                  
                  <button 
                    onClick={() => toggleThread(thread._id)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold transform hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>
                      {thread.answers?.length || 0} {thread.answers?.length === 1 ? 'Answer' : 'Answers'}
                    </span>
                    <svg 
                      className={`w-5 h-5 transition-transform ${expandedThread === thread._id ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Answers Section */}
              {expandedThread === thread._id && (
                <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 p-8">
                  <h4 className="font-bold text-gray-900 mb-6 text-xl">
                    {thread.answers?.length || 0} {thread.answers?.length === 1 ? 'Answer' : 'Answers'}
                  </h4>
                  
                  {/* Existing Answers */}
                  {thread.answers && thread.answers.length > 0 ? (
                    <div className="space-y-4 mb-6">
                      {thread.answers.map((answer, index) => (
                        <div key={index} className="bg-white rounded-2xl p-6 border-2 border-gray-100 shadow-md hover:shadow-lg transition-all duration-200">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-lg shadow-lg">
                              {answer.user?.fullName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <span className="font-bold text-gray-900 text-base">
                                    {answer.user?.fullName || 'Unknown User'}
                                  </span>
                                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                    answer.user?.role === 'Professor' 
                                      ? 'bg-gradient-to-r from-purple-400 to-pink-400 text-white' 
                                      : 'bg-gradient-to-r from-blue-400 to-cyan-400 text-white'
                                  }`}>
                                    {answer.user?.role || 'User'}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatDate(answer.createdAt)}
                                  </span>
                                </div>
                                {answer.user?._id === user?.id && (
                                  <button
                                    onClick={() => handleDeleteAnswer(thread._id, answer._id)}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium transition"
                                    title="Delete answer"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                              <p className="text-gray-700">{answer.text}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-6">No answers yet. Be the first to answer!</p>
                  )}

                  {/* Answer Form */}
                  <div className="bg-white rounded-lg p-4 border-2 border-primary">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Your Answer
                    </label>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Write your answer here..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      rows="4"
                      disabled={submittingAnswer}
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => handleSubmitAnswer(thread._id)}
                        disabled={submittingAnswer || !answerText.trim()}
                        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submittingAnswer ? 'Posting...' : 'Post Answer'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl shadow-xl p-16 text-center border border-indigo-100">
          <div className="text-8xl mb-6">💬</div>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">No Questions Yet</h3>
          <p className="text-gray-600 text-lg mb-8">Be the first to ask a question and start a discussion!</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:shadow-2xl transition-all duration-200 font-bold text-lg transform hover:scale-105"
          >
            Ask Your First Question
          </button>
        </div>
      )}

      {/* Create Question Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Ask a Question</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleAskQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Question Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="What's your question?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                    disabled={creating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Provide more details about your question..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="6"
                    required
                    disabled={creating}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="javascript, react, database"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={creating}
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={creating}
                  >
                    {creating ? 'Posting...' : 'Post Question'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Question</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleUpdateQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Question Title *
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    placeholder="What's your question?"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                    placeholder="Provide more details about your question..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    rows="6"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editFormData.tags}
                    onChange={(e) => setEditFormData({ ...editFormData, tags: e.target.value })}
                    placeholder="javascript, react, database"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Forum;
