import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { formatFare } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import { MapPin, Navigation, Car, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const RequestRide = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEstimating, setIsEstimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    pickupLocationId: '',
    dropoffLocationId: '',
    seats: 1
  });
  
  const [estimate, setEstimate] = useState(null);

  // Fetch locations on mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get('/locations');
        const locs = res.data?.data || res.data;
        setLocations(Array.isArray(locs) ? locs : []);
      } catch (error) {
        toast.error('Failed to load locations');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLocations();
  }, []);

  // Fetch estimate when locations change
  useEffect(() => {
    const getEstimate = async () => {
      if (!formData.pickupLocationId || !formData.dropoffLocationId) {
        setEstimate(null);
        return;
      }
      
      if (formData.pickupLocationId === formData.dropoffLocationId) {
        toast.error('Pickup and dropoff cannot be the same');
        setEstimate(null);
        return;
      }
      
      setIsEstimating(true);
      try {
        const res = await api.get(`/rides/estimate?pickupLocationId=${formData.pickupLocationId}&dropoffLocationId=${formData.dropoffLocationId}`);
        const estimatePayload = res.data?.data || res.data;
        const solo = estimatePayload.solo || estimatePayload;
        const pooled = estimatePayload.pooled || estimatePayload;
        const distKm = ((solo.distanceCharge || 0) / 1500).toFixed(1);
        
        setEstimate({
          distanceKm: distKm,
          estimatedDurationMinutes: Math.max(5, Math.round(Number(distKm) * 4)),
          estimatedFare: pooled.totalFare || solo.totalFare || 3000,
          soloFare: solo.totalFare,
          pooledFare: pooled.totalFare
        });
      } catch (error) {
        setEstimate(null);
        toast.error('Failed to get fare estimate');
      } finally {
        setIsEstimating(false);
      }
    };

    getEstimate();
  }, [formData.pickupLocationId, formData.dropoffLocationId]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.pickupLocationId || !formData.dropoffLocationId) {
      toast.error('Please select pickup and dropoff locations');
      return;
    }
    
    if (formData.pickupLocationId === formData.dropoffLocationId) {
      toast.error('Pickup and dropoff cannot be the same');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        pickupLocationId: formData.pickupLocationId,
        dropoffLocationId: formData.dropoffLocationId,
        seatsNeeded: Number(formData.seats) || 1
      };
      const res = await api.post('/rides', payload);
      const createdRide = res.data?.data || res.data;
      toast.success('Ride requested successfully!');
      navigate(`/passenger/rides/${createdRide.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request ride');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="pt-20"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 pt-24">
      <div className="max-w-2xl mx-auto">
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Request a Ride</h1>
          <p className="text-gray-400">Book a Tesla Pool to your destination.</p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-400" /> Pickup Location
              </label>
              <select
                name="pickupLocationId"
                value={formData.pickupLocationId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
              >
                <option value="">Select pickup location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* Dropoff Location */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-red-400" /> Dropoff Location
              </label>
              <select
                name="dropoffLocationId"
                value={formData.dropoffLocationId}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
              >
                <option value="">Select dropoff location...</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>

            {/* Seats */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Number of Seats (Max 3)</label>
              <select
                name="seats"
                value={formData.seats}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-green-500 transition-colors"
              >
                <option value={1}>1 Seat</option>
                <option value={2}>2 Seats</option>
                <option value={3}>3 Seats</option>
              </select>
            </div>

            {/* Estimate Card */}
            {isEstimating ? (
              <div className="flex justify-center p-6 border border-slate-800 rounded-xl bg-slate-800/30">
                <div className="w-6 h-6 border-2 border-slate-700 border-t-green-500 rounded-full animate-spin"></div>
              </div>
            ) : estimate ? (
              <div className="p-5 border border-slate-700 bg-slate-800/50 rounded-xl">
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Car className="w-5 h-5 text-green-400" /> Ride Estimate
                </h3>
                <div className="flex justify-between items-center text-sm mb-2">
                  <span className="text-gray-400">Distance</span>
                  <span className="text-white">{estimate.distanceKm} km</span>
                </div>
                <div className="flex justify-between items-center text-sm mb-3 pb-3 border-b border-slate-700">
                  <span className="text-gray-400">Duration</span>
                  <span className="text-white">~{estimate.estimatedDurationMinutes} mins</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 font-medium">Estimated Fare</span>
                  <span className="text-2xl font-bold text-green-400">
                    {formatFare(estimate.estimatedFare * formData.seats)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-4 border border-slate-800 bg-slate-800/20 rounded-xl flex items-start gap-3 text-sm text-gray-500">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>Select your pickup and dropoff locations to see the fare estimate before booking.</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !estimate}
              className="w-full flex items-center justify-center py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Requesting...' : 'Confirm Request'}
            </button>
            
          </form>
        </div>
      </div>
    </div>
  );
};

export default RequestRide;
