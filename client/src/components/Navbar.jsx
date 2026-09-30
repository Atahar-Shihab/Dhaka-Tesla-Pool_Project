/**
 * Navbar.jsx
 * Navigation bar that adapts based on user role (Passenger/Driver/Guest).
 * Dark theme matching the landing page design.
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, Zap, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  // Check if a link is currently active
  const isActive = (path) => location.pathname === path;

  // Get navigation links based on user role
  const getNavLinks = () => {
    if (!user) return [];

    if (user.role === 'PASSENGER') {
      return [
        { to: '/passenger/dashboard', label: 'Dashboard' },
        { to: '/passenger/request-ride', label: 'Request Ride' },
        { to: '/passenger/rides', label: 'My Rides' },
      ];
    }

    if (user.role === 'DRIVER') {
      return [
        { to: '/driver/dashboard', label: 'Dashboard' },
        { to: '/driver/requests', label: 'Available Requests' },
        { to: '/driver/history', label: 'History' },
      ];
    }

    return [];
  };

  const { theme, toggleTheme, isDark } = useTheme();
  const navLinks = getNavLinks();

  return (
    <nav className="bg-white/90 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand / Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Dhaka <span className="text-emerald-500 dark:text-emerald-400">Tesla Pool</span>
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.to)
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side — Theme Toggle + User Info / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Animated Sliding Theme Toggle */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
                import('react-toastify').then(({ toast }) => {
                  toast.success(!isDark ? 'Switched to Dark theme 🌙' : 'Switched to Light theme ☀️');
                });
              }}
              className="relative flex items-center justify-between p-1 w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors duration-200 cursor-pointer shadow-inner focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
              aria-label="Toggle theme"
            >
              <Sun className="w-3.5 h-3.5 ml-1 text-amber-500 pointer-events-none" />
              <Moon className="w-3.5 h-3.5 mr-1 text-teal-400 pointer-events-none" />
              <div
                className={`absolute top-0.5 w-7 h-7 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-transform duration-200 ease-in-out pointer-events-none ${
                  isDark ? 'translate-x-8 text-teal-400' : 'translate-x-0.5 text-amber-500'
                }`}
              >
                {isDark ? (
                  <Moon className="w-3.5 h-3.5 pointer-events-none" />
                ) : (
                  <Sun className="w-3.5 h-3.5 pointer-events-none" />
                )}
              </div>
            </button>

            {user ? (
              <>
                {/* User badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className={`w-2 h-2 rounded-full ${user.role === 'DRIVER' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                  <span className="text-sm text-slate-800 dark:text-white font-medium">{user.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                    user.role === 'DRIVER'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  }`}>
                    {user.role}
                  </span>
                </div>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg transition-all shadow-md shadow-emerald-500/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu & Theme Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleTheme();
                import('react-toastify').then(({ toast }) => {
                  toast.success(!isDark ? 'Switched to Dark theme 🌙' : 'Switched to Light theme ☀️');
                });
              }}
              className="relative flex items-center justify-between p-1 w-14 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 transition-colors duration-200 cursor-pointer shadow-inner focus:outline-none"
              title={`Switch to ${isDark ? 'Light' : 'Dark'} theme`}
              aria-label="Toggle theme"
            >
              <Sun className="w-3 h-3 ml-0.5 text-amber-500 pointer-events-none" />
              <Moon className="w-3 h-3 mr-0.5 text-teal-400 pointer-events-none" />
              <div
                className={`absolute top-0.5 w-6 h-6 rounded-full bg-white dark:bg-slate-900 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-transform duration-200 ease-in-out pointer-events-none ${
                  isDark ? 'translate-x-7 text-teal-400' : 'translate-x-0.5 text-amber-500'
                }`}
              >
                {isDark ? <Moon className="w-3 h-3 pointer-events-none" /> : <Sun className="w-3 h-3 pointer-events-none" />}
              </div>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-4 space-y-2">
          {user && (
            <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${user.role === 'DRIVER' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
              <span className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
                user.role === 'DRIVER' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
              }`}>
                {user.role}
              </span>
            </div>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                isActive(link.to)
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
              }`}
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-medium"
            >
              Logout
            </button>
          ) : (
            <div className="space-y-2 pt-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white text-sm font-medium">Login</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 bg-emerald-500 text-slate-950 font-semibold rounded-lg text-sm text-center">Get Started</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

