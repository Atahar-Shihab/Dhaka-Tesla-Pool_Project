import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatFare } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import StatusBadge from '../../components/StatusBadge';
import { MapPin, Navigation, User, Users, CheckCircle, Play, Flag, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const PoolDetails = () => {
  const { poolId } = useParams();
  const navigate = useNavigate();
  const [pool, setPool] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPoolDetails = async () => {
    try {
      const res = await api.get(`/driver/pool/${poolId}`);
      setPool(res.data);
    } catch (error) {
      toast.error('Failed to load pool details');
      navigate('/driver');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPoolDetails();
  }, [poolId]);

  const handleRideAction = async (rideId, action) => {
    try {
      setActionLoading(`${rideId}-${action}`);
      await api.patch(`/driver/rides/${rideId}/${action}`);
      toast.success(`Ride marked as ${action.replace('_', ' ')}`);
      fetchPoolDetails(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to update ride status`);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) return <div className="pt-20"><LoadingSpinner /></div>;
  if (!pool) return <div className="pt-20 text-center text-white">Pool not found</div>;

  const totalSeats = 3;
  const occupiedSeats = pool.rides?.reduce((acc, ride) => 
    ['MATCHED', 'DRIVER_ARRIVED', 'IN_PROGRESS'].includes(ride.status) ? acc + ride.seats : acc
  , 0) || 0;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={() => navigate('/driver')}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
          </button>
          <StatusBadge status={pool.status} />
        </div>

        {/* Pool Overview Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Pool Management</h1>
              <p className="text-gray-400">Manage your active passengers and route.</p>
            </div>
            
            {/* Seat Visualization */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Capacity</p>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-300" />
                  <span className="text-xl font-bold text-white">{occupiedSeats} / {totalSeats}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {[...Array(totalSeats)].map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                      i < occupiedSeats 
                        ? 'bg-green-500/20 border-green-500/50 text-green-400' 
                        : 'bg-slate-800 border-slate-700 text-slate-600'
                    }`}
                  >
                    <User className="w-5 h-5" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Passengers List */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Passengers ({pool.rides?.length || 0})</h2>
          
          <div className="space-y-4">
            {pool.rides?.length > 0 ? (
              pool.rides.map((ride) => (
                <div key={ride.id} className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
                  <div className="p-5 md:p-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      
                      {/* Passenger Info & Route */}
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{ride.passenger?.name || 'Passenger'}</h3>
                              <p className="text-sm text-gray-400">{ride.seats} Seat{ride.seats > 1 ? 's' : ''}</p>
                            </div>
                          </div>
                          <StatusBadge status={ride.status} />
                        </div>

                        <div className="flex items-start gap-4 bg-slate-800/30 p-4 rounded-xl">
                          <div className="flex flex-col items-center mt-1">
                            <MapPin className="w-4 h-4 text-green-400" />
                            <div className="w-0.5 h-8 bg-slate-700 my-1"></div>
                            <Navigation className="w-4 h-4 text-red-400" />
                          </div>
                          <div className="space-y-4 flex-1">
                            <div>
                              <p className="text-white text-sm">{ride.pickupLocation?.name}</p>
                            </div>
                            <div>
                              <p className="text-white text-sm">{ride.dropoffLocation?.name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Fare</p>
                            <p className="text-lg font-bold text-green-400">{formatFare(ride.fare)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col justify-center gap-3 md:w-48 border-t border-slate-800 pt-4 md:pt-0 md:border-t-0 md:border-l md:pl-6">
                        {ride.status === 'MATCHED' && (
                          <button
                            onClick={() => handleRideAction(ride.id, 'arrive')}
                            disabled={actionLoading === `${ride.id}-arrive`}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl transition-all"
                          >
                            <CheckCircle className="w-4 h-4" /> Arrived
                          </button>
                        )}
                        
                        {ride.status === 'DRIVER_ARRIVED' && (
                          <button
                            onClick={() => handleRideAction(ride.id, 'start')}
                            disabled={actionLoading === `${ride.id}-start`}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 rounded-xl transition-all"
                          >
                            <Play className="w-4 h-4" /> Start Trip
                          </button>
                        )}
                        
                        {ride.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => handleRideAction(ride.id, 'complete')}
                            disabled={actionLoading === `${ride.id}-complete`}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-xl transition-all"
                          >
                            <Flag className="w-4 h-4" /> Complete
                          </button>
                        )}

                        {['COMPLETED', 'CANCELLED'].includes(ride.status) && (
                          <div className="text-center py-3 text-gray-500 text-sm italic">
                            No actions available
                          </div>
                        )}
                      </div>
                      
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-900/50 border border-slate-800 rounded-2xl">
                <p className="text-gray-400">No passengers in this pool yet.</p>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default PoolDetails;
