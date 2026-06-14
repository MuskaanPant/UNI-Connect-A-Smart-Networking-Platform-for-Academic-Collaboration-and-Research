import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊', gradient: 'from-blue-500 to-cyan-500' },
    { name: 'My Profile', path: '/profile', icon: '👤', gradient: 'from-purple-500 to-pink-500' },
    { name: 'Feed', path: '/feed', icon: '📰', gradient: 'from-green-500 to-teal-500' },
    { name: 'Projects', path: '/projects', icon: '💼', gradient: 'from-orange-500 to-red-500' },
    { name: 'Forum', path: '/forum', icon: '💬', gradient: 'from-indigo-500 to-purple-500' },
    { name: 'Interviews', path: '/interviews', icon: '📅', gradient: 'from-pink-500 to-rose-500' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-white shadow-2xl h-screen fixed top-0 left-0 flex flex-col z-40 border-r border-gray-100">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-purple-600">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
          <span className="text-3xl">🎓</span>
          <span>GEU Connect</span>
        </h2>
        <p className="text-blue-100 text-sm mt-1">Academic Network</p>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg transform scale-105`
                  : 'text-gray-700 hover:bg-gray-50 hover:shadow-md hover:scale-102'
              }`}
            >
              <span className={`text-2xl transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="font-semibold">{item.name}</span>
              {isActive && (
                <span className="ml-auto">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      
      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100 bg-gray-50">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-3 px-4 py-3.5 rounded-xl text-white bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
        >
          <span className="text-xl">🚪</span>
          <span className="font-semibold">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
