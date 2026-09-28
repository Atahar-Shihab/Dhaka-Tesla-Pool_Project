import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatFare } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { Power, Car, History, Users, ChevronRight, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const DriverDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [stats, setStats] = useState({ totalEarned: 0, completedPools: 0 });
  const [currentPool, setCurrentPool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        // Fetch current user status
        const meRes = await api.get('/auth/me');
        setIsActive(meRes.data.isActive || false);

        // Fetch driver history for stats
        const historyRes = await api.get('/driver/history');
        const pools = historyRes.data || [];
        
        const completed = pools.filter(p => p.status === 'COMPLETED');
        const earned = completed.reduce((sum, pool) => {
          const poolEarnings = pool.rides.reduce((rSum, ride) => rSum + (Number(ride.fare) || 0), 0);
          return sum + poolEarnings;
        }, 0);

        setStats({
          completedPools: completed.length,
          totalEarned: earned
        });

        // Check if there is an active pool
        const activePool = pools.find(p => ['OPEN', 'IN_PROGRESS'].includes(p.status));
        setCurrentPool(activePool || null);

      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDriverData();
  }, []);

  const handleToggleStatus = async () => {
    setIsToggling(true);
    try {
      const res = await api.patch('/driver/status', { isActive: !isActive });
      setIsActive(res.data.isActive);
      toast.success(res.data.isActive ? 'You are now online' : 'You are now offline');
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setIsToggling(false);
    }
  };

  if (isLoading) return <div className="pt-20"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 pt-24">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Driver Portal</h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>

          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`flex items-center gap-2 px-6 py-3 font-medium rounded-xl transition-all shadow-lg ${
              isActive 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-green-500/20'
                : 'bg-slate-800 border border-slate-700 text-gray-300 hover:bg-slate-700'
            }`}
          >
            <Power className="w-5 h-5" />
            {isToggling ? 'Updating...' : isActive ? 'Online - Go Offline' : 'Offline - Go Online'}
          </button>
        </div>

        {/* Vehicle Info */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Your Vehicle</h2>
              <p className="text-gray-400 text-sm">Tesla Model 3 (Black)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-sm text-gray-500">Plate Number</p>
              <p className="text-white font-medium mt-1">DHA-1234</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-sm text-gray-500">Max Capacity</p>
              <p className="text-white font-medium mt-1">3 Seats</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-sm text-gray-500">Completed Trips</p>
              <p className="text-white font-medium mt-1">{stats.completedPools}</p>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
              <p className="text-sm text-gray-500">Total Earnings</p>
              <p className="text-green-400 font-bold mt-1">{formatFare(stats.totalEarned)}</p>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Active Pool Card */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Current Status</h2>
            {currentPool ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={currentPool.status} />
                  <span className="text-gray-400 text-sm">{currentPool.rides?.length || 0} Passengers</span>
                </div>
                <Link 
                  to={`/driver/pool/${currentPool.id}`}
                  className="w-full flex items-center justify-center py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all font-medium"
                >
                  Manage Current Pool
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-400 mb-4">No active pool right now.</p>
                <Link 
                  to="/driver/requests"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl shadow-lg shadow-green-500/20"
                >
                  <Users className="w-5 h-5" /> View Ride Requests
                </Link>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/driver/requests" className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3 text-white">
                  <MapPin className="w-5 h-5 text-red-400" /> Browse Available Requests
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </Link>
              <Link to="/driver/history" className="flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3 text-white">
                  <History className="w-5 h-5 text-blue-400" /> View Ride History
                </div>
                <ChevronRight className="w-5 h-5 text-gray-500" />
              </Link>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default DriverDashboard;
