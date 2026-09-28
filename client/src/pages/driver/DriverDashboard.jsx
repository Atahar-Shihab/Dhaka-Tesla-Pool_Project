/**
 * DriverDashboard.jsx
 * Dashboard for drivers to view stats, toggle status, and manage active pool.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Power, Car, Users, History, AlertCircle } from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatFare } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';

const DriverDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [activePool, setActivePool] = useState(null);
  const [stats, setStats] = useState({ todayCompleted: 0, earnings: 0 });

  const fetchDashboardData = async () => {
    try {
      // Get driver status
      const statusRes = await api.get('/driver/status');
      setIsOnline(statusRes.data.isOnline);
      
      // Get active pool if any
      if (statusRes.data.activePoolId) {
        const poolRes = await api.get(`/driver/pool/${statusRes.data.activePoolId}`);
        setActivePool(poolRes.data);
      } else {
        setActivePool(null);
      }
      
      // In a real app, we'd fetch actual daily stats here
      // For now we just mock or use history
      const historyRes = await api.get('/driver/history');
      let earnings = 0;
      let completed = 0;
      
      historyRes.data.forEach(pool => {
        if (pool.status === 'COMPLETED') {
          completed++;
          pool.rides.forEach(r => { if(r.status === 'COMPLETED') earnings += r.fare });
        }
      });
      setStats({ todayCompleted: completed, earnings });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleStatus = async () => {
    try {
      const response = await api.patch('/driver/status', { isOnline: !isOnline });
      setIsOnline(response.data.isOnline);
      toast.success(response.data.isOnline ? 'You are now online' : 'You are now offline');
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, Driver {user.name}! 🚘</h1>
          <p className="text-gray-600 mt-1 flex items-center">
            Vehicle: <span className="font-semibold ml-1">Tesla Bullet</span> (Max Capacity: 4)
          </p>
        </div>
        
        {/* Status Toggle */}
        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm flex items-center space-x-3">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <button 
            onClick={toggleStatus}
            className={`flex items-center px-4 py-2 rounded-md text-white font-medium transition-colors ${isOnline ? 'bg-tesla-600 hover:bg-tesla-700' : 'bg-gray-400 hover:bg-gray-500'}`}
          >
            <Power size={18} className="mr-2" />
            {isOnline ? 'Online' : 'Offline'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Pool Alert */}
          {activePool ? (
            <div className="bg-white border-2 border-tesla-500 rounded-xl p-6 shadow-md">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Car className="mr-2 text-tesla-600" /> Active Pool
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Pool ID: {activePool.id}</p>
                </div>
                <StatusBadge status={activePool.status} />
              </div>
              
              <div className="flex justify-between items-center mb-6 bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-700">Capacity Filled:</span>
                <span className="text-lg font-bold text-gray-900">
                  {activePool.occupiedSeats} / {activePool.capacity} seats
                </span>
              </div>
              
              <Link to={`/driver/pool/${activePool.id}`} className="w-full block text-center bg-tesla-600 hover:bg-tesla-700 text-white py-3 rounded-lg font-medium transition">
                Manage Current Pool
              </Link>
            </div>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center flex flex-col items-center justify-center h-full min-h-[200px]">
              <AlertCircle size={48} className="text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Active Pool</h3>
              <p className="text-gray-500 mb-6">You don't have any ongoing trips right now.</p>
              {isOnline ? (
                <Link to="/driver/requests" className="bg-tesla-600 hover:bg-tesla-700 text-white px-6 py-2 rounded-md font-medium transition">
                  Find Requests
                </Link>
              ) : (
                <button onClick={toggleStatus} className="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-md font-medium transition">
                  Go Online First
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center"><History size={18} className="mr-2" /> Total Pools</span>
                <span className="font-semibold">{stats.todayCompleted}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-600 flex items-center"><Car size={18} className="mr-2" /> Est. Earnings</span>
                <span className="font-semibold text-tesla-600">{formatFare(stats.earnings)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Navigation</h3>
            <div className="space-y-3">
              <Link to="/driver/requests" className="flex items-center text-gray-700 hover:text-tesla-600 p-2 rounded-lg hover:bg-gray-50 transition">
                <Users className="mr-3" size={20} /> Browse Requests
              </Link>
              <Link to="/driver/history" className="flex items-center text-gray-700 hover:text-tesla-600 p-2 rounded-lg hover:bg-gray-50 transition">
                <History className="mr-3" size={20} /> View History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
