import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  const features = [
    {
      icon: '👤',
      title: 'Profile Showcasing',
      description: 'Create detailed profiles highlighting your skills, projects, and academic achievements.'
    },
    {
      icon: '🤝',
      title: 'Project Collaboration',
      description: 'Find and join research projects that match your interests and expertise.'
    },
    {
      icon: '💬',
      title: 'Discussion Forums',
      description: 'Engage in academic discussions with students and professors in dedicated forums.'
    },
    {
      icon: '🏆',
      title: 'Ranking & Rewards',
      description: 'Earn reputation points and badges for your contributions to the community.'
    },
    {
      icon: '📅',
      title: 'Interview Management',
      description: 'Schedule and manage academic interviews and collaboration meetings seamlessly.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">GEU-Connect</h1>
          <div className="space-x-4">
            <Link
              to="/login"
              className="px-6 py-2 text-primary hover:text-blue-700 font-medium transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <h2 className="text-5xl font-bold text-gray-900 mb-6">
          GEU-Connect – Academic Networking Simplified
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          A smart platform connecting students and professors for seamless collaboration, 
          research opportunities, and academic growth within your university.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/register"
            className="px-8 py-4 bg-primary text-white rounded-lg hover:bg-blue-700 transition text-lg font-semibold shadow-lg"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 border-2 border-primary text-primary rounded-lg hover:bg-blue-50 transition text-lg font-semibold"
          >
            Login
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Why Choose GEU-Connect?
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h4 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h4>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-bold text-lg mb-4">GEU-Connect</h5>
              <p className="text-gray-400 text-sm">
                Empowering academic collaboration and networking.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Legal</h5>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Contact</h5>
              <p className="text-gray-400 text-sm">support@geuconnect.edu</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2026 GEU-Connect. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
