/**
 * AvailableRequests.jsx
 * Shows pending ride requests that the driver can accept.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { formatFare, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import { User, MapPin, ArrowRight, Car } from 'lucide-react';

const AvailableRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acceptingId, setAcceptingId] = useState(null);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const response = await api.get('/driver/requests');
      setRequests(response.data);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 10000); // Poll for new requests
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (rideId) => {
    setAcceptingId(rideId);
    try {
      const response = await api.post(`/driver/accept/${rideId}`);
      toast.success('Ride accepted and added to your pool!');
      // Navigate to the pool details
      navigate(`/driver/pool/${response.data.poolId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept ride');
    } finally {
      setAcceptingId(null);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Requests</h1>
          <p className="text-gray-600 text-sm mt-1">Accept rides to add them to your current pool.</p>
        </div>
        <button onClick={fetchRequests} className="text-tesla-600 hover:text-tesla-800 text-sm font-medium">
          Refresh List
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Car className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
          <p className="text-gray-500">Wait a moment for passengers to request rides.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((ride) => (
            <div key={ride.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                      <User size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{ride.passenger?.name}</p>
                      <p className="text-xs text-gray-500">{formatDate(ride.createdAt)}</p>
                    </div>
                  </div>
                  <div className="bg-gray-100 px-2 py-1 rounded text-xs font-semibold">
                    {ride.seatsNeeded} Seat(s)
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-start">
                    <MapPin size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{ride.pickupLocation?.name}</p>
                  </div>
                  <div className="pl-2 border-l-2 border-dashed border-gray-200 ml-1.5 h-4 my-1"></div>
                  <div className="flex items-start">
                    <MapPin size={16} className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{ride.destinationLocation?.name}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500">Est. Fare</p>
                    <p className="font-semibold text-lg text-tesla-600">{formatFare(ride.fare)}</p>
                  </div>
                  <button
                    onClick={() => handleAccept(ride.id)}
                    disabled={acceptingId === ride.id}
                    className="bg-tesla-600 hover:bg-tesla-700 text-white px-5 py-2 rounded-md font-medium text-sm transition-colors disabled:opacity-50"
                  >
                    {acceptingId === ride.id ? 'Accepting...' : 'Accept'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AvailableRequests;
