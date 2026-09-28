import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatFare, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { MapPin, Navigation, Users, CheckCircle, Car } from 'lucide-react';
import toast from 'react-hot-toast';

const AvailableRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/driver/requests');
        const rawReqs = res.data?.data || res.data;
        setRequests(Array.isArray(rawReqs) ? rawReqs : []);
      } catch (error) {
        toast.error('Failed to load ride requests');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Poll every 10 seconds for new requests
    fetchRequests();
    const intervalId = setInterval(fetchRequests, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleAccept = async (rideId) => {
    try {
      setAcceptingId(rideId);
      const res = await api.post(`/driver/accept/${rideId}`);
      toast.success('Ride accepted successfully!');
      
      const payload = res.data?.data || res.data;
      const poolId = payload?.poolId || payload?.id; 
      if (poolId) {
        navigate(`/driver/pool/${poolId}`);
      } else {
        // Fallback if poolId isn't directly returned
        navigate('/driver');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept ride. It may have been taken by another driver.');
      // Remove the failed request from list
      setRequests(prev => prev.filter(r => r.id !== rideId));
    } finally {
      setAcceptingId(null);
    }
  };

  if (isLoading) return <div className="pt-20"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 pt-24">
      <div className="max-w-4xl mx-auto">
        
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Available Requests</h1>
            <p className="text-gray-400">Accept ride requests to add passengers to your pool.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm text-gray-400">Live Updates</span>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
            <Car className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">No Requests Found</h3>
            <p className="text-gray-400">There are currently no ride requests matching your criteria.</p>
            <p className="text-sm text-gray-500 mt-2">The list will refresh automatically.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {requests.map((request) => (
              <div 
                key={request.id} 
                className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col h-full hover:border-slate-700 transition-colors"
              >
                {/* Request Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{request.passenger?.name || 'Passenger'}</h3>
                    <p className="text-sm text-gray-500">{formatDate(request.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-white text-sm font-medium">{request.seatsNeeded ?? request.seats ?? 1} Seat{(request.seatsNeeded ?? request.seats ?? 1) > 1 ? 's' : ''}</span>
                  </div>
                </div>

                {/* Route */}
                <div className="space-y-4 mb-6 flex-1">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center mt-1">
                      <MapPin className="w-5 h-5 text-green-400" />
                      <div className="w-0.5 h-6 bg-slate-700 my-1"></div>
                      <Navigation className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Pickup</p>
                        <p className="text-white font-medium">{request.pickupLocation?.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Dropoff</p>
                        <p className="text-white font-medium">{request.dropoffLocation?.name}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer / Action */}
                <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Estimated Fare</p>
                    <p className="text-xl font-bold text-green-400">{formatFare(request.fareAmount ?? request.fare)}</p>
                  </div>
                  
                  <button
                    onClick={() => handleAccept(request.id)}
                    disabled={acceptingId === request.id}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-green-500/20 disabled:opacity-50 transition-all"
                  >
                    {acceptingId === request.id ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" /> Accept
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default AvailableRequests;
