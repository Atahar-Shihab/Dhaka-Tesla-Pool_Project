/**
 * ProtectedRoute.jsx
 * A wrapper component that checks if a user is logged in and has the correct role
 * before rendering the child components.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRole }) => {
  const { user, loading } = useAuth();

  // Show a loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in but wrong role, redirect to home
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  // If authorized, render the children
  return children;
};

export default ProtectedRoute;
