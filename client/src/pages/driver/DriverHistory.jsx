/**
 * DriverHistory.jsx
 * Displays a history of all past pools managed by the driver.
 */
import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { formatDate, formatFare } from '../../utils/helpers';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { History, Users } from 'lucide-react';

const DriverHistory = () => {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/driver/history');
        setPools(response.data);
      } catch (error) {
        console.error("Error fetching history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <History className="mr-2" /> Driving History
        </h1>
        <p className="text-gray-600 mt-1">Review your past pools and rides.</p>
      </div>

      {pools.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <History className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p className="text-lg text-gray-500">You haven't completed any pools yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pools.map(pool => {
            // Calculate total earnings from completed rides in this pool
            const totalEarnings = pool.rides
              .filter(r => r.status === 'COMPLETED')
              .reduce((sum, r) => sum + r.fare, 0);

            return (
              <div key={pool.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900">Pool #{pool.id}</h3>
                    <p className="text-xs text-gray-500">{formatDate(pool.createdAt)}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Earnings</p>
                      <p className="font-bold text-tesla-600">{formatFare(totalEarnings)}</p>
                    </div>
                    <StatusBadge status={pool.status} />
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Users size={16} className="mr-2" /> Passengers ({pool.rides.length})
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                      <thead>
                        <tr>
                          <th className="px-3 py-2 text-left text-xs text-gray-500 font-medium">Passenger</th>
                          <th className="px-3 py-2 text-left text-xs text-gray-500 font-medium">Route</th>
                          <th className="px-3 py-2 text-left text-xs text-gray-500 font-medium">Status</th>
                          <th className="px-3 py-2 text-right text-xs text-gray-500 font-medium">Fare</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {pool.rides.map(ride => (
                          <tr key={ride.id}>
                            <td className="px-3 py-2 text-sm text-gray-900">{ride.passenger?.name}</td>
                            <td className="px-3 py-2 text-xs text-gray-600">
                              {ride.pickupLocation?.name} → {ride.destinationLocation?.name}
                            </td>
                            <td className="px-3 py-2"><StatusBadge status={ride.status} /></td>
                            <td className="px-3 py-2 text-right text-sm font-medium">{formatFare(ride.fare)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DriverHistory;
