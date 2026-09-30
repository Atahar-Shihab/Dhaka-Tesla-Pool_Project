import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // Demo fillers
  const fillNusrat = () => setFormData({ email: 'nusrat@teslapool.com', password: 'password123' });
  const fillJashim = () => setFormData({ email: 'jashim@teslapool.com', password: 'password123' });

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      const user = await login(formData.email, formData.password);
      toast.success('Successfully logged in!');
      
      // Redirect based on role
      if (user.role === 'DRIVER') {
        navigate('/driver/dashboard');
      } else {
        navigate('/passenger/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-xl dark:shadow-2xl">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
            <p className="text-slate-600 dark:text-slate-400">Sign in to your Tesla Pool account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Login Buttons */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs text-center text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wider font-mono">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={fillNusrat}
                className="py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-600 dark:text-emerald-400 text-sm font-medium transition-colors"
              >
                Nusrat (Passenger)
              </button>
              <button
                type="button"
                onClick={fillJashim}
                className="py-2 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium transition-colors"
              >
                Jashim (Driver)
              </button>
            </div>
          </div>
          
          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/register')}
                className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium transition-colors"
              >
                Register here
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
