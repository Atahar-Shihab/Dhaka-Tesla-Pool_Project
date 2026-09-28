/**
 * RequestRide.jsx
 * Form for passengers to request a new ride.
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { MapPin, Users, DollarSign } from 'lucide-react';
import { formatFare } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

const RequestRide = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [estimating, setEstimating] = useState(false);
  const [requesting, setRequesting] = useState(false);
  
  const [formData, setFormData] = useState({
    pickupId: '',
    destinationId: '',
    seatsNeeded: 1
  });
  
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await api.get('/locations');
        setLocations(response.data);
      } catch (error) {
        toast.error('Failed to load locations');
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'seatsNeeded' ? parseInt(value, 10) : parseInt(value, 10)
    }));
    // Clear estimate when form changes
    setEstimate(null);
  };

  const handleEstimate = async () => {
    if (!formData.pickupId || !formData.destinationId) {
      toast.error('Please select both pickup and destination');
      return;
    }
    if (formData.pickupId === formData.destinationId) {
      toast.error('Pickup and destination cannot be the same');
      return;
    }

    setEstimating(true);
    try {
      const response = await api.post('/rides/estimate', formData);
      setEstimate(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get estimate');
    } finally {
      setEstimating(false);
    }
  };

  const handleRequest = async () => {
    setRequesting(true);
    try {
      const response = await api.post('/rides', formData);
      toast.success('Ride requested successfully!');
      navigate(`/passenger/rides/${response.data.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request ride');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="bg-primary-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <MapPin className="mr-2" /> Request a Ride
          </h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Location</label>
              <select
                name="pickupId"
                value={formData.pickupId}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
              >
                <option value="">Select pickup location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <select
                name="destinationId"
                value={formData.destinationId}
                onChange={handleChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
              >
                <option value="">Select destination...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seats Needed (Max 3)</label>
              <div className="flex items-center">
                <Users className="text-gray-400 mr-2" size={20} />
                <input
                  type="number"
                  name="seatsNeeded"
                  min="1"
                  max="3"
                  value={formData.seatsNeeded}
                  onChange={handleChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 p-2 border"
                />
              </div>
            </div>
          </div>

          {/* Estimate Section */}
          {estimate && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                <DollarSign size={16} className="mr-1" /> Fare Estimate
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-medium text-gray-900">{formatFare(estimate.breakdown.baseFare)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Distance Charge ({estimate.breakdown.distance} km)</span>
                  <span className="font-medium text-gray-900">{formatFare(estimate.breakdown.distanceCharge)}</span>
                </div>
                {estimate.breakdown.poolDiscount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Pool Discount (25%)</span>
                    <span className="font-medium">-{formatFare(estimate.breakdown.poolDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-blue-200 pt-2 flex justify-between font-bold text-base">
                  <span className="text-gray-900">Total</span>
                  <span className="text-primary-700">{formatFare(estimate.totalFare)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {!estimate ? (
              <button
                onClick={handleEstimate}
                disabled={estimating || !formData.pickupId || !formData.destinationId}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 disabled:opacity-50"
              >
                {estimating ? 'Calculating...' : 'Get Fare Estimate'}
              </button>
            ) : (
              <>
                <button
                  onClick={() => setEstimate(null)}
                  className="w-full sm:w-1/3 flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Edit
                </button>
                <button
                  onClick={handleRequest}
                  disabled={requesting}
                  className="w-full sm:w-2/3 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
                >
                  {requesting ? 'Requesting...' : 'Confirm Request'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestRide;
