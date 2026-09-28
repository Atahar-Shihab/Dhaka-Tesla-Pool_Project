/**
 * PassengerDashboard.jsx
 * Dashboard for passengers to view stats and recent rides.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Car, CheckCircle, DollarSign, Clock, ArrowRight } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { formatFare, formatDate } from '../../utils/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';

const PassengerDashboard = () => {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, completed: 0, spent: 0 });

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const response = await api.get('/rides/my');
        const data = response.data;
        setRides(data);

        // Calculate stats
        let active = 0;
        let completed = 0;
        let spent = 0;

        data.forEach(ride => {
          if (['REQUESTED', 'MATCHED', 'DRIVER_ARRIVED', 'IN_PROGRESS'].includes(ride.status)) {
            active++;
          } else if (ride.status === 'COMPLETED') {
            completed++;
            spent += ride.fare;
          }
        });

        setStats({ active, completed, spent });
      } catch (error) {
        console.error("Failed to fetch rides", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRides();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}! 👋</h1>
        <p className="text-gray-600 mt-1">Here is an overview of your rides.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="bg-blue-100 p-4 rounded-lg mr-4">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Rides</p>
            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="bg-green-100 p-4 rounded-lg mr-4">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Completed Rides</p>
            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
          <div className="bg-purple-100 p-4 rounded-lg mr-4">
            <DollarSign className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">{formatFare(stats.spent)}</p>
          </div>
        </div>
      </div>

      {/* Actions & Recent Rides */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <Link to="/passenger/request-ride" className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 shadow-sm">
              <Car className="mr-2 h-5 w-5" />
              Request a Ride
            </Link>
            <Link to="/passenger/rides" className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm">
              View All Rides
            </Link>
          </div>
        </div>

        {/* Recent Rides List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Rides</h2>
            <Link to="/passenger/rides" className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
              See all <ArrowRight size={16} className="ml-1" />
            </Link>
          </div>
          
          {rides.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Car className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p>You haven't requested any rides yet.</p>
              <Link to="/passenger/request-ride" className="text-primary-600 font-medium mt-2 inline-block">Request your first ride!</Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {rides.slice(0, 5).map((ride) => (
                <li key={ride.id}>
                  <Link to={`/passenger/rides/${ride.id}`} className="block hover:bg-gray-50 transition-colors">
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2 text-sm font-medium text-gray-900 mb-1">
                          <span>{ride.pickupLocation?.name}</span>
                          <ArrowRight size={14} className="text-gray-400" />
                          <span>{ride.destinationLocation?.name}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(ride.createdAt)} • {ride.seatsNeeded} seat(s)
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <StatusBadge status={ride.status} />
                        <span className="text-sm font-semibold mt-2">{formatFare(ride.fare)}</span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassengerDashboard;
