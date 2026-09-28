/**
 * PoolDetails.jsx
 * Displays the current active pool and allows driver to update ride statuses.
 */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { User, MapPin, CheckCircle, Navigation, Play, Check } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { formatFare } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

const PoolDetails = () => {
  const { poolId } = useParams();
  const navigate = useNavigate();
  const [pool, setPool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPool = async () => {
    try {
      const response = await api.get(`/driver/pool/${poolId}`);
      setPool(response.data);
    } catch (error) {
      toast.error('Failed to load pool');
      navigate('/driver/dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPool();
    const interval = setInterval(fetchPool, 5000); // Poll frequently during active trip
    return () => clearInterval(interval);
  }, [poolId]);

  const updateRideStatus = async (rideId, action) => {
    setUpdatingId(rideId);
    try {
      await api.patch(`/driver/ride/${rideId}/status`, { action });
      toast.success('Status updated');
      fetchPool();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!pool) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Pool Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="bg-tesla-600 px-6 py-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">Active Pool #{pool.id}</h2>
          <StatusBadge status={pool.status} />
        </div>
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex-1 w-full bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-1">Capacity</p>
              <p className="text-2xl font-bold text-gray-900">{pool.occupiedSeats} / {pool.capacity}</p>
            </div>
            <div className="flex-1 w-full bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
              <p className="text-sm text-gray-500 mb-1">Total Passengers</p>
              <p className="text-2xl font-bold text-gray-900">{pool.rides?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-4">Passenger Manifest</h3>

      {/* Ride List */}
      <div className="space-y-4">
        {pool.rides?.map((ride) => (
          <div key={ride.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              
              {/* Info section */}
              <div className="flex-1">
                <div className="flex items-center mb-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                    <User size={20} className="text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{ride.passenger?.name}</h4>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <StatusBadge status={ride.status} />
                      <span className="text-xs text-gray-500">• {ride.seatsNeeded} seat(s)</span>
                      <span className="text-xs font-semibold text-tesla-600">• {formatFare(ride.fare)}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-13 space-y-2 mt-4 text-sm">
                  <div className="flex items-center">
                    <MapPin size={16} className="text-blue-500 mr-2" />
                    <span className="text-gray-600">Pickup:</span>
                    <span className="ml-1 font-medium">{ride.pickupLocation?.name}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={16} className="text-green-500 mr-2" />
                    <span className="text-gray-600">Dropoff:</span>
                    <span className="ml-1 font-medium">{ride.destinationLocation?.name}</span>
                  </div>
                </div>
              </div>

              {/* Actions section */}
              <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4 min-w-[150px]">
                {ride.status === 'MATCHED' && (
                  <button
                    onClick={() => updateRideStatus(ride.id, 'mark_arrived')}
                    disabled={updatingId === ride.id}
                    className="w-full flex items-center justify-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium text-sm transition"
                  >
                    <Navigation size={16} className="mr-2" /> Mark Arrived
                  </button>
                )}
                {ride.status === 'DRIVER_ARRIVED' && (
                  <button
                    onClick={() => updateRideStatus(ride.id, 'start_trip')}
                    disabled={updatingId === ride.id}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition"
                  >
                    <Play size={16} className="mr-2" /> Start Trip
                  </button>
                )}
                {ride.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => updateRideStatus(ride.id, 'complete_trip')}
                    disabled={updatingId === ride.id}
                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium text-sm transition"
                  >
                    <Check size={16} className="mr-2" /> Complete Trip
                  </button>
                )}
                {['COMPLETED', 'CANCELLED'].includes(ride.status) && (
                  <div className="text-center py-2 text-sm text-gray-500 font-medium flex items-center justify-center">
                    <CheckCircle size={16} className="mr-1" /> Handled
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}

        {pool.rides?.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-200">
            No passengers in this pool yet.
          </div>
        )}
      </div>
    </div>
  );
};

export default PoolDetails;
