import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      {/* Green spinning circle */}
      <div className="w-10 h-10 border-4 border-slate-700 border-t-green-500 rounded-full animate-spin"></div>
      <p className="text-gray-400 font-medium">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
