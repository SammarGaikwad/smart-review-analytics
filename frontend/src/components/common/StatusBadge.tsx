import React from 'react';

interface StatusBadgeProps {
  status: 'Available' | 'Coming Soon' | 'Processing' | 'Online' | 'Offline' | 'Connected' | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const norm = status.toLowerCase();

  if (norm === 'available' || norm === 'online' || norm === 'connected' || norm === 'success') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>{status}</span>
      </span>
    );
  }

  if (norm === 'coming soon' || norm === 'integration pending') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <span>{status}</span>
      </span>
    );
  }

  if (norm === 'processing') {
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-spin" />
        <span>Processing</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      {status}
    </span>
  );
};
