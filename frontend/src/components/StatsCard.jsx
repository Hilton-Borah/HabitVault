import React from 'react';

const StatsCard = ({ title, value, description }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col">
        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
        <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
        {description && (
          <dd className="mt-2 text-sm text-gray-500">{description}</dd>
        )}
      </div>
    </div>
  );
};

export default StatsCard; 