import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatFare, formatDate } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { MapPin, Navigation, User, Car, XCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const res = await api.get(`/rides/${id}`);
        setRide(res.data);
      } catch (error) {
        toast.error('Failed to load ride details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRide();
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    
    try {
      setIsCancelling(true);
      const res = await api.patch(`/rides/${id}/cancel`);
      setRide(res.data);
      toast.success('Ride cancelled successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel ride');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) return <div className="pt-20"><LoadingSpinner /></div>;
  if (!ride) return <div className="pt-20 text-center text-gray-400">Ride not found</div>;

  const canCancel = ride.status === 'REQUESTED' || ride.status === 'MATCHED';

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 pt-24">
      <div className="max-w-2xl mx-auto">
        
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => navigate('/passenger/rides')}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-1" /> Back
          </button>
          <StatusBadge status={ride.status} />
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8">
          
          {/* Timeline / Route */}
          <div>
            <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Route Details</h2>
            <div className="relative pl-6 space-y-6">
              <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-slate-800"></div>
              
              <div className="relative">
                <div className="absolute -left-[27px] w-4 h-4 bg-slate-950 border-4 border-green-500 rounded-full"></div>
                <h3 className="text-white font-medium">{ride.pickupLocation?.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{ride.pickupLocation?.address}</p>
              </div>
              
              <div className="relative">
                <div className="absolute -left-[27px] w-4 h-4 bg-slate-950 border-4 border-red-500 rounded-full"></div>
                <h3 className="text-white font-medium">{ride.dropoffLocation?.name}</h3>
                <p className="text-sm text-gray-400 mt-1">{ride.dropoffLocation?.address}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-800"></div>

          {/* Fare & Info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Fare</p>
              <p className="text-2xl font-bold text-white">{formatFare(ride.fare)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Seats Booked</p>
              <p className="text-lg text-white">{ride.seats} Seat{ride.seats > 1 ? 's' : ''}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Date</p>
              <p className="text-sm text-white">{formatDate(ride.createdAt)}</p>
            </div>
          </div>

          {/* Driver Info if matched */}
          {ride.pool && ride.pool.driver && (
            <>
              <div className="border-t border-slate-800"></div>
              <div>
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Driver Details</h2>
                <div className="flex items-center gap-4 bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                  <div className="p-3 bg-slate-800 rounded-full text-gray-400">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-medium">{ride.pool.driver.name}</p>
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                      <Car className="w-4 h-4" /> {ride.pool.vehicleModel} ({ride.pool.vehicleColor})
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Cancel Action */}
          {canCancel && (
            <div className="pt-4">
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="w-full flex items-center justify-center gap-2 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all disabled:opacity-50 font-medium"
              >
                <XCircle className="w-5 h-5" />
                {isCancelling ? 'Cancelling...' : 'Cancel Ride'}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default RideDetails;
