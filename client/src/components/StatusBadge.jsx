/**
 * StatusBadge.jsx
 * A reusable component to display ride/pool statuses with different colors.
 */
import React from 'react';
import { getStatusColor } from '../utils/helpers';

const StatusBadge = ({ status }) => {
  const colorClass = getStatusColor(status);
  
  // Format the status string for display (e.g., DRIVER_ARRIVED -> Driver Arrived)
  const displayStatus = status
    ? status.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
    : 'Unknown';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {displayStatus}
    </span>
  );
};

export default StatusBadge;
