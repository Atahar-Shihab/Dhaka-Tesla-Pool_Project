import React from 'react';

const StatusBadge = ({ status }) => {
  // Define styles for each status to pop on dark backgrounds
  const styles = {
    REQUESTED: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    MATCHED: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    DRIVER_ARRIVED: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    IN_PROGRESS: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    COMPLETED: 'bg-green-500/10 text-green-400 border-green-500/20',
    CANCELLED: 'bg-red-500/10 text-red-400 border-red-500/20',
    OPEN: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    DEFAULT: 'bg-gray-500/10 text-gray-400 border-gray-500/20'
  };

  const badgeStyle = styles[status] || styles.DEFAULT;

  return (
    <span className={`border rounded-full px-3 py-1 text-xs font-mono tracking-wider ${badgeStyle}`}>
      {status ? status.replace('_', ' ') : 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
