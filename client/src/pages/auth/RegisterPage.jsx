/**
 * RegisterPage.jsx
 * Allows new users to create an account as a passenger or driver.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserPlus } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PASSENGER' // Default role
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await register(formData.name, formData.email, formData.password, formData.role);
      // Redirect based on role
      if (user.role === 'DRIVER') {
        navigate('/driver/dashboard');
      } else {
        navigate('/passenger/dashboard');
      }
    } catch (error) {
      // Error is handled by context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join Dhaka Tesla Pool today
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label-[0] htmlFor="name" className="sr-only">Full Name</label-[0]>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <label-[0] htmlFor="email" className="sr-only">Email address</label-[0]>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label-[0] htmlFor="password" className="sr-only">Password</label-[0]>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Password (min. 6 characters)"
                value={formData.password}
                onChange={handleChange}
                minLength={6}
              />
            </div>

            {/* Role Selection */}
            <div className="pt-2">
              <p className="text-sm font-medium text-gray-700 mb-2">I want to:</p>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="PASSENGER"
                    checked={formData.role === 'PASSENGER'}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Ride (Passenger)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="DRIVER"
                    checked={formData.role === 'DRIVER'}
                    onChange={handleChange}
                    className="h-4 w-4 text-tesla-600 focus:ring-tesla-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Drive (Driver)</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${formData.role === 'DRIVER' ? 'bg-tesla-600 hover:bg-tesla-700 focus:ring-tesla-500' : 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <UserPlus className={`h-5 w-5 ${formData.role === 'DRIVER' ? 'text-tesla-500 group-hover:text-tesla-400' : 'text-primary-500 group-hover:text-primary-400'}`} />
              </span>
              {isSubmitting ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Already have an account? </span>
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
