/**
 * MyRides.jsx
 * Displays a list of all rides for the logged-in passenger.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatDate, formatFare } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ArrowRight, MapPin } from 'lucide-react';

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await api.get('/rides/my');
        setRides(response.data);
      } catch (error) {
        console.error("Error fetching rides", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Rides</h1>
        <Link to="/passenger/request-ride" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
          New Ride
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {rides.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MapPin className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-lg">No rides found.</p>
            <p className="text-sm mt-1">Request a ride to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fare</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rides.map((ride) => (
                  <tr key={ride.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(ride.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm font-medium text-gray-900">
                        <span className="truncate max-w-[120px]">{ride.pickupLocation?.name}</span>
                        <ArrowRight size={14} className="mx-2 text-gray-400 flex-shrink-0" />
                        <span className="truncate max-w-[120px]">{ride.destinationLocation?.name}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{ride.seatsNeeded} seat(s)</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={ride.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatFare(ride.fare)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/passenger/rides/${ride.id}`} className="text-primary-600 hover:text-primary-900">
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRides;
