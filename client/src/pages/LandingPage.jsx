/**
 * LandingPage.jsx
 * The main entry point for unauthenticated users.
 * Explains the service and provides links to register/login.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Users, MapPin, DollarSign } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-tesla-900 opacity-90"></div>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6">
            Share a seat. Split the fare.<br />Survive Dhaka traffic.
          </h1>
          <p className="mt-4 max-w-3xl text-xl text-primary-100 mb-10">
            Experience the comfort of a Tesla while beating the traffic and sharing the cost with fellow commuters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-900 bg-white hover:bg-gray-50 md:py-4 md:text-lg px-10 transition-colors shadow-lg">
              Ride as Passenger
            </Link>
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-tesla-600 hover:bg-tesla-700 md:py-4 md:text-lg px-10 transition-colors shadow-lg">
              Drive Your Tesla
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">Why Choose Dhaka Tesla Pool?</h2>
          </div>
          
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
                <Users size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Pool Rides</h3>
              <p className="text-gray-500">Share your ride with others heading the same way. Less cars on the road, more friends made.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="p-3 bg-green-100 text-green-600 rounded-full mb-4">
                <DollarSign size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Fair Fares</h3>
              <p className="text-gray-500">Enjoy upfront pricing and automatic fare splitting. Save money on every comfortable commute.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center flex flex-col items-center">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-full mb-4">
                <MapPin size={32} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Tracking</h3>
              <p className="text-gray-500">Know exactly where your driver is and when they'll arrive with real-time status updates.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
