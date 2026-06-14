import React from 'react';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user } = useAuth();
  const userAvatar = `https://ui-avatars.com/api/?name=${user?.fullName}&background=667eea&color=fff`;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 px-8 py-4 flex justify-between items-center fixed top-0 right-0 left-64 z-30 backdrop-blur-sm bg-opacity-95">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Search students, professors, projects..."
            className="w-96 px-5 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-sm"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        {/* Notification Bell */}
        <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-all duration-200 group">
          <svg className="w-6 h-6 text-gray-600 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        {/* User Profile */}
        <div className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-100 hover:shadow-md transition-all duration-200">
          <img
            src={userAvatar}
            alt={user?.fullName}
            className="w-11 h-11 rounded-full border-3 border-white shadow-lg ring-2 ring-blue-200"
          />
          <div>
            <p className="text-sm font-bold text-gray-800">{user?.fullName}</p>
            <p className="text-xs font-medium text-blue-600">{user?.role}</p>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
