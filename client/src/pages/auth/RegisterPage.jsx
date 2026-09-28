import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PASSENGER' // Default role
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Handle role selection (radio buttons)
  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const user = await register(formData.name, formData.email, formData.password, formData.role);
      toast.success('Registration successful!');
      
      // Redirect based on role
      if (user.role === 'DRIVER') {
        navigate('/driver');
      } else {
        navigate('/passenger');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Dark Card Container */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join the Tesla Pool community</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                placeholder="Enter your name"
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
                placeholder="Create a password"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">I want to sign up as a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleChange('PASSENGER')}
                  className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                    formData.role === 'PASSENGER'
                      ? 'bg-green-500/10 border-green-500 text-green-400'
                      : 'bg-slate-800 border-slate-700 text-gray-400 hover:bg-slate-700/50'
                  }`}
                >
                  Passenger
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('DRIVER')}
                  className={`py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                    formData.role === 'DRIVER'
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400'
                      : 'bg-slate-800 border-slate-700 text-gray-400 hover:bg-slate-700/50'
                  }`}
                >
                  Driver
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                formData.role === 'PASSENGER' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-green-400 hover:text-green-300 font-medium transition-colors"
              >
                Sign in here
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
