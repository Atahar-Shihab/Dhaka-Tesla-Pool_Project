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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pt-24 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header & Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Driver Portal</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Welcome back, {user?.name?.split(' ')[0] || 'Jashim'}</p>
          </div>

          <button
            onClick={handleToggleStatus}
            disabled={isToggling}
            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-xl transition-all shadow-md ${
              isActive 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20'
                : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            <Power className="w-5 h-5" />
            {isToggling ? 'Updating...' : isActive ? 'Online - Go Offline' : 'Offline - Go Online'}
          </button>
        </div>

        {/* Vehicle Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-500/10 rounded-xl text-red-600 dark:text-red-400">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Vehicle</h2>
              <p className="text-slate-600 dark:text-slate-400 text-sm">Bullet (Red Electric Battery-Powered Rickshaw)</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Plate Number</p>
              <p className="text-slate-900 dark:text-white font-medium mt-1 font-mono">DHA-METRO-EA-11</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Max Capacity</p>
              <p className="text-slate-900 dark:text-white font-medium mt-1 font-mono">3 Seats (ACID Locked)</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Completed Trips</p>
              <p className="text-slate-900 dark:text-white font-medium mt-1 font-mono">{stats.completedPools}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Earnings</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1 font-mono">{formatFare(stats.totalEarned)}</p>
            </div>
          </div>
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Active Pool Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Current Status</h2>
            {currentPool ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <StatusBadge status={currentPool.status} />
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-mono">{currentPool.rides?.length || 0} / 3 Passengers</span>
                </div>
                <Link 
                  to={`/driver/pool/${currentPool.id}`}
                  className="w-full flex items-center justify-center py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-xl transition-all font-semibold"
                >
                  Manage Current Pool
                </Link>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-600 dark:text-slate-400 mb-4">No active pool right now.</p>
                <Link 
                  to="/driver/requests"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md shadow-emerald-500/20"
                >
                  <Users className="w-5 h-5" /> View Ride Requests
                </Link>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/driver/requests" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3 text-slate-800 dark:text-white font-medium">
                  <MapPin className="w-5 h-5 text-red-500" /> Browse Available Requests
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>
              <Link to="/driver/history" className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl transition-colors">
                <div className="flex items-center gap-3 text-slate-800 dark:text-white font-medium">
                  <History className="w-5 h-5 text-blue-500" /> View Ride History
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>
            </div>
          </div>
          
        </div>

      </div>
    </div>
  );
};

export default DriverDashboard;
