import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatFare, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ChevronRight, MapPin, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, ACTIVE, COMPLETED, CANCELLED

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const res = await api.get('/rides/my');
        // Sort descending by date
        const rawRides = res.data?.data || res.data;
        const ridesList = Array.isArray(rawRides) ? rawRides : [];
        const sorted = [...ridesList].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRides(sorted);
      } catch (error) {
        toast.error('Failed to load ride history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRides();
  }, []);

  const filteredRides = rides.filter(ride => {
    if (filter === 'ALL') return true;
    if (filter === 'COMPLETED') return ride.status === 'COMPLETED';
    if (filter === 'CANCELLED') return ride.status === 'CANCELLED';
    if (filter === 'ACTIVE') return ['REQUESTED', 'MATCHED', 'DRIVER_ARRIVED', 'IN_PROGRESS'].includes(ride.status);
    return true;
  });

  if (isLoading) return <div className="pt-20"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Rides</h1>
          <p className="text-gray-400">View and manage your ride history.</p>
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto pb-4 mb-4 gap-2 no-scrollbar">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f 
                  ? 'bg-slate-800 text-white border border-slate-600' 
                  : 'bg-slate-900/50 text-gray-400 border border-slate-800 hover:bg-slate-800/80'
              }`}
            >
              {f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Ride List */}
        <div className="space-y-4">
          {filteredRides.length > 0 ? (
            filteredRides.map((ride) => (
              <Link 
                key={ride.id} 
                to={`/passenger/rides/${ride.id}`}
                className="block bg-slate-900/50 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Status & Date */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <StatusBadge status={ride.status} />
                      <span className="text-sm text-gray-500">{formatDate(ride.createdAt)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        <span className="text-gray-300 font-medium">{ride.pickupLocation?.name}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <Navigation className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <span className="text-gray-300 font-medium">{ride.dropoffLocation?.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Fare & Chevron */}
                  <div className="flex md:flex-col items-center md:items-end justify-between border-t border-slate-800 md:border-0 pt-4 md:pt-0 mt-2 md:mt-0">
                    <div className="text-xl font-bold text-white mb-2">{formatFare(ride.fareAmount ?? ride.fare)}</div>
                    <div className="text-gray-500 flex items-center text-sm group-hover:text-green-400">
                      View details <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                  
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 bg-slate-900/30 border border-slate-800 rounded-2xl">
              <p className="text-gray-400 mb-4">No rides found in this category.</p>
              {filter === 'ALL' && (
                <Link to="/passenger/request" className="inline-block px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">
                  Book a Ride
                </Link>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MyRides;
