import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { formatFare, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { Car, Clock, CreditCard, ChevronRight, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PassengerDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    activeRides: 0,
    completedRides: 0,
    totalSpent: 0,
  });
  const [recentRides, setRecentRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch passenger data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch all rides for this passenger
        const response = await api.get('/rides/my');
        const rawRides = response.data?.data || response.data;
        const rides = Array.isArray(rawRides) ? rawRides : [];
        
        // Calculate basic stats
        const activeCount = rides.filter(r => 
          ['REQUESTED', 'MATCHED', 'DRIVER_ARRIVED', 'IN_PROGRESS'].includes(r.status)
        ).length;
        
        const completedCount = rides.filter(r => r.status === 'COMPLETED').length;
        
        const spent = rides
          .filter(r => r.status === 'COMPLETED')
          .reduce((sum, ride) => sum + (Number(ride.fareAmount || ride.fare) || 0), 0);
          
        setStats({
          activeRides: activeCount,
          completedRides: completedCount,
          totalSpent: spent
        });

        // Get top 5 recent rides
        const sortedRides = [...rides].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRecentRides(sortedRides.slice(0, 5));
        
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Failed to load dashboard data");
        toast.error("Could not fetch latest data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <div className="pt-20"><LoadingSpinner /></div>;
  
  if (error) return (
    <div className="pt-20 p-6 text-center text-red-400 bg-slate-900 border border-slate-800 rounded-2xl mx-4 my-8">
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-slate-800 rounded text-white">Retry</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pt-24 text-slate-800 dark:text-slate-100 transition-colors">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, {user?.name?.split(' ')[0] || 'Passenger'}!</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Here's your ride summary today.</p>
          </div>
          
          <Link 
            to="/passenger/request-ride" 
            className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl transition-all shadow-md shadow-emerald-500/20"
          >
            <PlusCircle className="w-5 h-5" />
            Request a Ride
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Rides Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 dark:text-blue-400">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Rides</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.activeRides}</h3>
              </div>
            </div>
          </div>

          {/* Completed Rides Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed Rides</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedRides}</h3>
              </div>
            </div>
          </div>

          {/* Total Spent Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Spent</p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatFare(stats.totalSpent)}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Rides Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Rides</h2>
            <Link to="/passenger/rides" className="text-emerald-600 dark:text-emerald-400 hover:underline text-sm font-medium flex items-center">
              View all <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {recentRides.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRides.map((ride) => (
                  <Link 
                    key={ride.id} 
                    to={`/passenger/rides/${ride.id}`}
                    className="block p-4 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <StatusBadge status={ride.status} />
                          <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(ride.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{ride.pickupLocation?.name || 'Unknown Pickup'}</span>
                        </div>
                        <div className="w-0.5 h-3 bg-slate-300 dark:bg-slate-700 ml-1 my-1"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{ride.dropoffLocation?.name || 'Unknown Dropoff'}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{formatFare(ride.fareAmount ?? ride.fare)}</span>
                        <div className="text-slate-500 dark:text-slate-400 flex items-center text-xs">
                          Details <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                      
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Car className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 mb-4">No recent rides found.</p>
                <Link 
                  to="/passenger/request-ride"
                  className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-semibold"
                >
                  Request your first ride
                </Link>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PassengerDashboard;
