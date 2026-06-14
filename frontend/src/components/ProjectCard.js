import React, { useState } from 'react';
import { projectAPI, postAPI, interviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ProjectCard({ project, onRequestSent, onRequestHandled, onEdit, onClose, onDelete }) {
  const { user } = useAuth();
  const [requesting, setRequesting] = useState(false);
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState('');
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [handlingRequest, setHandlingRequest] = useState(null);
  const [interviewData, setInterviewData] = useState({
    meetLink: '',
    date: '',
    time: '',
    topic: ''
  });

  const isClosed = project.status === 'Closed';

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-green-100 text-green-700';
      case 'Closed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleRequestToJoin = async () => {
    try {
      setRequesting(true);
      setError('');
      const response = await projectAPI.requestToJoin(project._id, 'I would like to join this project');
      console.log('Request to join response:', response);
      setRequested(true);
      if (onRequestSent) onRequestSent();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send request';
      setError(errorMessage);
      console.error('Error requesting to join:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
    } finally {
      setRequesting(false);
    }
  };

  const handleJoinRequestAction = async (requestId, action) => {
    try {
      setHandlingRequest(requestId);
      await projectAPI.handleJoinRequest(project._id, requestId, action);
      
      // Refresh the project list
      if (onRequestHandled) {
        onRequestHandled();
      }
      
      // Close modal after successful action
      setShowRequestsModal(false);
    } catch (err) {
      console.error(`Error ${action}ing request:`, err);
      alert(`Failed to ${action} request: ${err.response?.data?.message || err.message}`);
    } finally {
      setHandlingRequest(null);
    }
  };

  const handleViewProfile = async (request) => {
    try {
      setLoadingProfile(true);
      setSelectedRequest(request);
      setShowProfileModal(true);
      
      // Get user ID - handle both object and string cases
      const userId = request.user?._id || request.user;
      
      if (!userId) {
        console.error('No user ID found in request:', request);
        alert('Cannot load profile: User information is missing');
        setShowProfileModal(false);
        return;
      }
      
      console.log('Fetching profile for user ID:', userId);
      
      // Fetch user's posts and projects
      const [postsResponse, projectsResponse] = await Promise.all([
        postAPI.getUserPosts(userId),
        projectAPI.getUserProjects(userId)
      ]);
      
      setUserProfile({
        posts: postsResponse.data,
        projects: projectsResponse.data
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setUserProfile({ posts: [], projects: [] }); // Show empty instead of error
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleScheduleInterview = (request) => {
    // Get user ID - handle both object and string cases
    const userId = request.user?._id || request.user;
    
    if (!userId) {
      console.error('No user ID found in request:', request);
      alert('Cannot schedule interview: User information is missing');
      return;
    }
    
    setSelectedRequest(request);
    setShowInterviewModal(true);
    setInterviewData({
      meetLink: '',
      date: '',
      time: '',
      topic: project.title
    });
  };

  const handleSubmitInterview = async () => {
    try {
      if (!interviewData.meetLink || !interviewData.date || !interviewData.time) {
        alert('Please fill in all required fields');
        return;
      }

      // Get user ID - handle both object and string cases
      const userId = selectedRequest.user?._id || selectedRequest.user;
      
      if (!userId) {
        alert('Cannot schedule interview: User information is missing');
        return;
      }

      // Combine date and time into a single Date object
      const dateTime = new Date(`${interviewData.date}T${interviewData.time}`);

      // Prepare interview data matching backend schema
      const interviewPayload = {
        interviewerId: userId,  // The person requesting
        title: interviewData.topic || project.title,
        type: 'Project Discussion',
        date: dateTime,
        time: interviewData.time,
        meetingLink: interviewData.meetLink
      };

      console.log('Scheduling interview with data:', interviewPayload);

      await interviewAPI.scheduleInterview(interviewPayload);

      alert('Interview scheduled successfully! Both users can see it in Interviews page.');
      setShowInterviewModal(false);
      setShowRequestsModal(false);
      
      // Optionally accept the request after scheduling
      await handleJoinRequestAction(selectedRequest._id, 'accept');
      
      if (onRequestHandled) {
        onRequestHandled();
      }
    } catch (err) {
      console.error('Error scheduling interview:', err);
      console.error('Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      alert(`Failed to schedule interview: ${err.response?.data?.message || err.message}`);
    }
  };

  const isOwner = project.user?._id === user?.id;
  
  // Fix: Check both object ID and string ID for hasRequested
  const hasRequested = project.joinRequests?.some(req => {
    const requestUserId = req.user?._id || req.user;
    return requestUserId === user?.id;
  }) || requested;
  
  // Debug: Log join requests
  console.log('Project:', project.title);
  console.log('Is Owner:', isOwner);
  console.log('Join Requests:', project.joinRequests);
  console.log('Pending Requests Count:', project.joinRequests?.filter(r => r.status === 'pending').length);
  
  const pendingRequests = project.joinRequests?.filter(r => r.status === 'pending') || [];

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                {project.isResearchProject && (
                  <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                    🔬 Research Project
                  </span>
                )}
              </div>
              {isOwner && (
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => onEdit(project)}
                    className="text-blue-600 hover:text-blue-800 transition"
                    title="Edit project"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {!isClosed && (
                    <button
                      onClick={() => onClose(project._id)}
                      className="text-orange-600 hover:text-orange-800 transition"
                      title="Close project"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(project._id)}
                    className="text-red-600 hover:text-red-800 transition"
                    title="Delete project"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        
        <p className="text-gray-700 mb-4">{project.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-semibold mr-2">Posted by:</span>
            <span>{project.user?.fullName || 'Unknown'} ({project.user?.role || 'User'})</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="font-semibold mr-2">Created:</span>
            <span>{formatDate(project.createdAt)}</span>
          </div>
          {pendingRequests.length > 0 && isOwner && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-semibold mr-2">Join Requests:</span>
              <button
                onClick={() => setShowRequestsModal(true)}
                className="text-primary hover:text-blue-700 font-semibold underline"
              >
                {pendingRequests.length} pending request(s)
              </button>
            </div>
          )}
        </div>
        
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">Tech Stack:</p>
          <div className="flex flex-wrap gap-2">
            {project.techStack && project.techStack.map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        
        {!isOwner && !isClosed && (
          <button 
            onClick={handleRequestToJoin}
            disabled={requesting || hasRequested}
            className={`w-full px-4 py-2 rounded-lg transition font-medium ${
              hasRequested 
                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-blue-700'
            }`}
          >
            {requesting ? 'Sending Request...' : hasRequested ? '✓ Request Sent' : 'Request to Join'}
          </button>
        )}

        {!isOwner && isClosed && (
          <div className="w-full px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-center font-medium">
            🔒 This project is closed
          </div>
        )}

        {isOwner && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold">Your Project</span>
                {pendingRequests.length > 0 && (
                  <span className="ml-2">• {pendingRequests.length} new request(s)</span>
                )}
              </div>
              {pendingRequests.length > 0 && (
                <button
                  onClick={() => setShowRequestsModal(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs font-medium"
                >
                  View Requests
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Join Requests Modal */}
      {showRequestsModal && isOwner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Join Requests</h2>
                <button
                  onClick={() => setShowRequestsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {pendingRequests.length > 0 ? (
                  pendingRequests.map((request) => (
                    <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <img
                            src={`https://ui-avatars.com/api/?name=${request.user?.fullName || 'User'}&background=1e40af&color=fff`}
                            alt={request.user?.fullName || 'User'}
                            className="w-12 h-12 rounded-full"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{request.user?.fullName || 'Unknown User'}</h3>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                request.user?.role === 'Professor' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {request.user?.role || 'Student'}
                              </span>
                              <span className="text-xs text-gray-500">{request.user?.email}</span>
                            </div>
                            {request.message && (
                              <p className="text-sm text-gray-600 mt-2">{request.message}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              Requested on {formatDate(request.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <button 
                          onClick={() => handleViewProfile(request)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                        >
                          👤 View Profile
                        </button>
                        <button 
                          onClick={() => handleScheduleInterview(request)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm font-medium"
                        >
                          📅 Schedule Interview
                        </button>
                        <button 
                          onClick={() => handleJoinRequestAction(request._id, 'reject')}
                          disabled={handlingRequest === request._id}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
                        >
                          {handlingRequest === request._id ? 'Processing...' : '✗ Reject'}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No pending join requests</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    setUserProfile(null);
                    setSelectedRequest(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {loadingProfile ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading profile...</p>
                </div>
              ) : userProfile ? (
                <div className="space-y-6">
                  {/* User Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-4">
                      <img
                        src={`https://ui-avatars.com/api/?name=${selectedRequest.user?.fullName || 'User'}&background=1e40af&color=fff&size=80`}
                        alt="User"
                        className="w-20 h-20 rounded-full"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {selectedRequest.user?.fullName || 'Unknown User'}
                        </h3>
                        <p className="text-gray-600">
                          {selectedRequest.user?.role || 'Student'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedRequest.user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Projects */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Projects ({userProfile.projects.length})
                    </h3>
                    {userProfile.projects.length > 0 ? (
                      <div className="space-y-3">
                        {userProfile.projects.map((proj) => (
                          <div key={proj._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{proj.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{proj.description}</p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {proj.techStack?.map((tech, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(proj.status)}`}>
                                {proj.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No projects yet</p>
                    )}
                  </div>

                  {/* Posts */}
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">
                      Posts ({userProfile.posts.length})
                    </h3>
                    {userProfile.posts.length > 0 ? (
                      <div className="space-y-3">
                        {userProfile.posts.map((post) => (
                          <div key={post._id} className="border border-gray-200 rounded-lg p-4">
                            <p className="text-gray-700">{post.content}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>👍 {post.likes?.length || 0} likes</span>
                              <span>💬 {post.comments?.length || 0} comments</span>
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No posts yet</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        handleScheduleInterview(selectedRequest);
                      }}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                    >
                      📅 Schedule Interview
                    </button>
                    <button
                      onClick={() => {
                        setShowProfileModal(false);
                        handleJoinRequestAction(selectedRequest._id, 'reject');
                      }}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showInterviewModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Schedule Interview</h2>
                <button
                  onClick={() => setShowInterviewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">With:</span> {selectedRequest.user?.fullName}
                </p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Email:</span> {selectedRequest.user?.email}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Google Meet Link *
                  </label>
                  <input
                    type="url"
                    value={interviewData.meetLink}
                    onChange={(e) => setInterviewData({ ...interviewData, meetLink: e.target.value })}
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={interviewData.date}
                    onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Time *
                  </label>
                  <input
                    type="time"
                    value={interviewData.time}
                    onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Topic
                  </label>
                  <input
                    type="text"
                    value={interviewData.topic}
                    onChange={(e) => setInterviewData({ ...interviewData, topic: e.target.value })}
                    placeholder="Discussion about the project"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowInterviewModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitInterview}
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                  >
                    Schedule Interview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectCard;
