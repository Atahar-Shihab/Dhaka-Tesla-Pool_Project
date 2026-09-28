/**
 * Navbar.jsx
 * The main navigation bar displayed at the top of the app.
 * It shows different links based on the user's role.
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Car } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-900">
              <span className="text-2xl">🚗</span>
              <span className="text-tesla-600">Dhaka Tesla Pool</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Passenger Links */}
                {user.role === 'PASSENGER' && (
                  <div className="hidden md:flex space-x-4">
                    <Link to="/passenger/dashboard" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                    <Link to="/passenger/request-ride" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">Request Ride</Link>
                    <Link to="/passenger/rides" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">My Rides</Link>
                  </div>
                )}

                {/* Driver Links */}
                {user.role === 'DRIVER' && (
                  <div className="hidden md:flex space-x-4">
                    <Link to="/driver/dashboard" className="text-gray-700 hover:text-tesla-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                    <Link to="/driver/requests" className="text-gray-700 hover:text-tesla-600 px-3 py-2 rounded-md text-sm font-medium">Requests</Link>
                    <Link to="/driver/history" className="text-gray-700 hover:text-tesla-600 px-3 py-2 rounded-md text-sm font-medium">History</Link>
                  </div>
                )}

                {/* User Info & Logout */}
                <div className="flex items-center space-x-3 border-l pl-4 ml-2">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${user.role === 'DRIVER' ? 'bg-tesla-100 text-tesla-800' : 'bg-primary-100 text-primary-800'}`}>
                      {user.role}
                    </span>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-gray-100 transition-colors" title="Logout">
                    <LogOut size={20} />
                  </button>
                </div>
              </>
            ) : (
              /* Not Logged In Links */
              <div className="flex space-x-4">
                <Link to="/login" className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-tesla-600 hover:bg-tesla-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
