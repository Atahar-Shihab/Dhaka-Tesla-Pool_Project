import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatFare, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { History, Users, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const DriverHistory = () => {
  const [pools, setPools] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/driver/history');
        const rawPools = res.data?.data || res.data;
        const poolsList = Array.isArray(rawPools) ? rawPools : [];
        const sorted = [...poolsList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPools(sorted);
      } catch (error) {
        toast.error('Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (isLoading) return <div className="pt-20"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8 flex items-center gap-3">
          <History className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Ride History</h1>
            <p className="text-slate-600 dark:text-slate-400">View your past pools and earnings.</p>
          </div>
        </div>

        {pools.length > 0 ? (
          <div className="space-y-6">
            {pools.map((pool) => {
              // Calculate total earnings and seats for this pool
              const rides = pool.rideRequests || pool.rides || [];
              const totalEarned = rides.reduce((sum, ride) => sum + (Number(ride.fareAmount || ride.fare) || 0), 0);
              const totalPassengers = rides.length;

              return (
                <div key={pool.id} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  
                  {/* Pool Header */}
                  <div className="bg-slate-100 dark:bg-slate-800/30 p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                      <StatusBadge status={pool.status} />
                      <span className="text-slate-600 dark:text-slate-400 text-sm">{formatDate(pool.createdAt)}</span>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Passengers</p>
                        <p className="text-slate-900 dark:text-white font-medium flex items-center justify-end gap-1">
                          <Users className="w-4 h-4" /> {totalPassengers}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Total Earned</p>
                        <p className="text-green-400 font-bold">{formatFare(totalEarned)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Pool Rides */}
                  <div className="p-5 divide-y divide-slate-800/50">
                    {rides.map(ride => (
                      <div key={ride.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-slate-900 dark:text-white">{ride.passenger?.name || 'Passenger'}</span>
                            <span className="text-slate-500 dark:text-slate-400 text-sm">• {ride.seatsNeeded ?? ride.seats ?? 1} Seat{(ride.seatsNeeded ?? ride.seats ?? 1) > 1 ? 's' : ''}</span>
                            <span className="ml-2 scale-75 origin-left"><StatusBadge status={ride.status} /></span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-600 dark:text-slate-400">{ride.pickupLocation?.name}</span>
                            <ArrowRight className="w-4 h-4 text-gray-600" />
                            <span className="text-slate-600 dark:text-slate-400">{ride.dropoffLocation?.name}</span>
                          </div>
                        </div>
                        
                        <div className="text-right flex items-center md:items-start">
                          <span className="text-gray-300 font-medium">{formatFare(ride.fareAmount ?? ride.fare)}</span>
                        </div>
                      </div>
                    ))}
                    
                    {rides.length === 0 && (
                      <p className="text-slate-500 dark:text-slate-400 text-sm py-2">No completed rides in this pool.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <History className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-slate-900 dark:text-white mb-2">No History Yet</h3>
            <p className="text-slate-600 dark:text-slate-400">Complete some pools to see them appear here.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default DriverHistory;

