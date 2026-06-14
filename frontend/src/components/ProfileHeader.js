import React from 'react';

function ProfileHeader({ user }) {
  const userAvatar = `https://ui-avatars.com/api/?name=${user?.fullName}&background=667eea&color=fff&size=160`;
  const reputationPoints = user?.reputationPoints || 0;
  
  return (
    <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl shadow-2xl p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
      
      <div className="relative z-10 flex items-start space-x-8">
        <img
          src={userAvatar}
          alt={user?.fullName}
          className="w-32 h-32 rounded-3xl border-4 border-white shadow-2xl transform hover:scale-105 transition-transform duration-300"
        />
        
        <div className="flex-1">
          <div>
            <h2 className="text-4xl font-bold mb-2">{user?.fullName}</h2>
            <p className="text-xl text-purple-100 font-semibold">{user?.role}</p>
            <p className="text-lg text-purple-200 mt-1">{user?.email}</p>
          </div>
          
          <div className="flex items-center space-x-8 mt-6">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white border-opacity-30">
              <span className="text-3xl font-bold">{reputationPoints}</span>
              <span className="text-purple-100 ml-2 text-lg">Reputation Points</span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white border-opacity-30">
              <span className="text-3xl font-bold">{user?.activeProjects?.length || 0}</span>
              <span className="text-purple-100 ml-2 text-lg">Active Projects</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileHeader;
