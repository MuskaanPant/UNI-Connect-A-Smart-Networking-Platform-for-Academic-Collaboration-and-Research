import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { 
      label: 'Reputation Points', 
      value: user?.reputationPoints || 0, 
      icon: '⭐', 
      gradient: 'from-yellow-400 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50'
    },
    { 
      label: 'Role', 
      value: user?.role || 'Student', 
      icon: '👤', 
      gradient: 'from-purple-400 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50'
    },
    { 
      label: 'Skills', 
      value: user?.skills?.length || 0, 
      icon: '🎯', 
      gradient: 'from-blue-400 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50'
    }
  ];

  const recentActivity = [
    { 
      action: 'Why to use feed ??', 
      detail: 'Have an innovative idea? Share it along with relevant visuals to bring your concept to life and attract like-minded individuals. This not only opens doors to meaningful collaborations but also allows experienced mentors and teachers to guide you in the right direction.',
      icon: '📰',
      color: 'from-green-400 to-teal-500'
    },
    { 
      action: 'Why to use discussion forum ??', 
      detail: 'Facing challenges while learning something new? Engage in discussion forums where you can clear your doubts, exchange knowledge, and grow together with your peers.',
      icon: '💬',
      color: 'from-indigo-400 to-purple-500'
    },
    { 
      action: 'What to do if you like someone project ??', 
      detail: 'Looking for a strong team or an exciting project? Explore opportunities to join existing projects that match your interests, or connect with others who share your vision. The right collaboration can turn a simple idea into something truly impactful.',
      icon: '💼',
      color: 'from-orange-400 to-red-500'
    },
  ];

  const quickActions = [
    { label: 'Create Post', icon: '📝', path: '/feed', gradient: 'from-blue-500 to-cyan-500' },
    { label: 'Browse Projects', icon: '💼', path: '/projects', gradient: 'from-green-500 to-emerald-500' },
    { label: 'Join Discussion', icon: '💬', path: '/forum', gradient: 'from-purple-500 to-pink-500' },
    { label: 'Schedule Interview', icon: '📅', path: '/interviews', gradient: 'from-orange-500 to-red-500' }
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.fullName}! 👋</h1>
          <p className="text-blue-100 text-lg">Here's what's happening with your academic network today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className={`bg-gradient-to-br ${stat.bgGradient} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-white hover:-translate-y-2 transform`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold uppercase tracking-wide">{stat.label}</p>
                <p className="text-4xl font-bold text-gray-800 mt-2">{stat.value}</p>
              </div>
              <div className={`text-5xl bg-gradient-to-r ${stat.gradient} w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
              <span className="text-3xl">📊</span>
              <span>Recent Activity</span>
            </h2>
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="group flex items-start space-x-4 p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-r ${activity.color} rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-lg mb-1">{activity.action}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{activity.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <span className="text-3xl">⚡</span>
            <span>Quick Actions</span>
          </h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <button 
                key={index}
                onClick={() => navigate(action.path)}
                className={`w-full px-6 py-4 bg-gradient-to-r ${action.gradient} text-white rounded-xl hover:shadow-xl transition-all duration-200 text-left flex items-center space-x-3 font-semibold transform hover:scale-105`}
              >
                <span className="text-2xl">{action.icon}</span>
                <span>{action.label}</span>
                <svg className="w-5 h-5 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <span className="text-3xl">📈</span>
          <span>Your Progress</span>
        </h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-3">
              <span className="text-sm font-bold text-gray-700">Reputation Progress</span>
              <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{user?.reputationPoints || 0} / 1000 pts</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-1000 shadow-lg relative overflow-hidden"
                style={{ width: `${((user?.reputationPoints || 0) / 1000) * 100}%` }}
              >
                <div className="absolute inset-0 bg-white opacity-30 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
