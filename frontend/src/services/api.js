import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
    }
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      baseURL: config.baseURL,
      hasToken: !!token
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/me', profileData),
};

// Post endpoints
export const postAPI = {
  createPost: (postData) => api.post('/posts', postData),
  getFeed: () => api.get('/posts'),
  toggleLike: (postId) => api.put(`/posts/like/${postId}`),
  addComment: (postId, commentData) => api.post(`/posts/${postId}/comment`, commentData),
  getUserPosts: (userId) => api.get(`/posts/user/${userId}`),
  updatePost: (postId, postData) => api.put(`/posts/${postId}`, postData),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
};

// Project endpoints
export const projectAPI = {
  getAllProjects: () => api.get('/projects'),
  getMyProjects: () => api.get('/projects/my'),
  createProject: (projectData) => api.post('/projects', projectData),
  requestToJoin: (projectId, message) => api.post(`/projects/${projectId}/join`, { message }),
  handleJoinRequest: (projectId, requestId, action) => 
    api.put(`/projects/${projectId}/requests/${requestId}`, { action }),
  getUserProjects: (userId) => api.get(`/projects/user/${userId}`),
  updateProject: (projectId, projectData) => api.put(`/projects/${projectId}`, projectData),
  deleteProject: (projectId) => api.delete(`/projects/${projectId}`),
};

// Forum endpoints
export const forumAPI = {
  getAllThreads: () => api.get('/forums'),
  askQuestion: (questionData) => api.post('/forums/ask', questionData),
  answerQuestion: (questionId, answerData) => api.post(`/forums/answers/${questionId}`, answerData),
  updateQuestion: (questionId, questionData) => api.put(`/forums/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/forums/${questionId}`),
  deleteAnswer: (questionId, answerId) => api.delete(`/forums/${questionId}/answers/${answerId}`),
};

// Interview endpoints
export const interviewAPI = {
  getUserInterviews: () => api.get('/interviews'),
  scheduleInterview: (interviewData) => api.post('/interviews', interviewData),
  respondToInterview: (interviewId, responseData) => api.put(`/interviews/${interviewId}/respond`, responseData),
  acceptProposedTime: (interviewId) => api.put(`/interviews/${interviewId}/accept-proposed`),
  markInterviewComplete: (interviewId) => api.put(`/interviews/${interviewId}/complete`),
};

export default api;
