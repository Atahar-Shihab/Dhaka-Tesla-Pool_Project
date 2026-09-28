/**
 * RideDetails.jsx
 * Displays details for a specific ride request.
 * Allows passenger to cancel if not yet picked up.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { MapPin, Navigation, User, Car, CheckCircle, AlertCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { formatFare, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchRideDetails = async () => {
    try {
      const response = await api.get(`/rides/${id}`);
      setRide(response.data);
    } catch (error) {
      toast.error('Failed to load ride details');
      navigate('/passenger/rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideDetails();
    // In a real app, we might poll here or use WebSockets for live updates
    const interval = setInterval(fetchRideDetails, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this ride?')) return;
    
    setCancelling(true);
    try {
      await api.post(`/rides/${id}/cancel`);
      toast.success('Ride cancelled');
      fetchRideDetails();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel ride');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!ride) return null;

  const canCancel = ['REQUESTED', 'MATCHED'].includes(ride.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Ride Details</h2>
            <p className="text-xs text-gray-500 mt-1">ID: {ride.id} • {formatDate(ride.createdAt)}</p>
          </div>
          <StatusBadge status={ride.status} />
        </div>

        <div className="p-6 space-y-6">
          {/* Route Info */}
          <div className="relative pl-8 space-y-6">
            <div className="absolute top-2 left-3 w-0.5 h-16 bg-gray-200"></div>
            
            <div className="relative">
              <div className="absolute -left-8 top-0.5 bg-white p-1">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pickup</p>
                <p className="text-lg font-medium text-gray-900">{ride.pickupLocation?.name}</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-8 top-0.5 bg-white p-1">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Destination</p>
                <p className="text-lg font-medium text-gray-900">{ride.destinationLocation?.name}</p>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Trip Information</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
              <div>
                <p className="text-xs text-gray-500">Seats Needed</p>
                <p className="font-semibold text-gray-900">{ride.seatsNeeded}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Fare</p>
                <p className="font-semibold text-primary-700 text-lg">{formatFare(ride.fare)}</p>
              </div>
            </div>
          </div>

          {/* Driver & Pool Info (if matched) */}
          {ride.pool && (
            <div className="border-t border-gray-100 pt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Driver Information</h3>
              <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-white">
                <div className="h-12 w-12 rounded-full bg-tesla-100 text-tesla-600 flex items-center justify-center mr-4">
                  <User size={24} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{ride.pool.driver?.name}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Car size={16} className="mr-1" />
                    <span>Tesla Pool ({ride.pool.occupiedSeats}/{ride.pool.capacity} seats full)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {canCancel && (
            <div className="border-t border-gray-100 pt-6">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="w-full flex justify-center py-2.5 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Ride'}
              </button>
              <p className="text-xs text-center text-gray-500 mt-2">
                You can cancel without penalty before the driver arrives.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideDetails;
