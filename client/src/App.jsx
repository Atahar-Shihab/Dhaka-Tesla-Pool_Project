/**
 * App.jsx
 * The main application component that sets up routing and global providers.
 */
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PassengerDashboard from './pages/passenger/PassengerDashboard';
import RequestRide from './pages/passenger/RequestRide';
import MyRides from './pages/passenger/MyRides';
import RideDetails from './pages/passenger/RideDetails';
import DriverDashboard from './pages/driver/DriverDashboard';
import AvailableRequests from './pages/driver/AvailableRequests';
import PoolDetails from './pages/driver/PoolDetails';
import DriverHistory from './pages/driver/DriverHistory';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Passenger Routes */}
            <Route path="/passenger/dashboard" element={<ProtectedRoute allowedRole="PASSENGER"><PassengerDashboard /></ProtectedRoute>} />
            <Route path="/passenger/request-ride" element={<ProtectedRoute allowedRole="PASSENGER"><RequestRide /></ProtectedRoute>} />
            <Route path="/passenger/rides" element={<ProtectedRoute allowedRole="PASSENGER"><MyRides /></ProtectedRoute>} />
            <Route path="/passenger/rides/:id" element={<ProtectedRoute allowedRole="PASSENGER"><RideDetails /></ProtectedRoute>} />

            {/* Driver Routes */}
            <Route path="/driver/dashboard" element={<ProtectedRoute allowedRole="DRIVER"><DriverDashboard /></ProtectedRoute>} />
            <Route path="/driver/requests" element={<ProtectedRoute allowedRole="DRIVER"><AvailableRequests /></ProtectedRoute>} />
            <Route path="/driver/pool/:poolId" element={<ProtectedRoute allowedRole="DRIVER"><PoolDetails /></ProtectedRoute>} />
            <Route path="/driver/history" element={<ProtectedRoute allowedRole="DRIVER"><DriverHistory /></ProtectedRoute>} />
          </Routes>
        </main>
        <Toaster position="top-right" />
        <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      </div>
    </AuthProvider>
  );
}

export default App;
