import React from 'react';
import { VerificationStatus } from '../types/index';

interface Props {
  isDemoData?: boolean;
  status?: VerificationStatus;
  size?: 'sm' | 'md';
}

export const DemoDataBadge: React.FC<Props> = ({ isDemoData = true, status, size = 'sm' }) => {
  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {status && (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full ${
            size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${
            status === 'Verified'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : status === 'Pending Review'
              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
              : status === 'Unverified'
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
          }`}
        >
          <span
            className={`rounded-full ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${
              status === 'Verified'
                ? 'bg-emerald-400'
                : status === 'Pending Review'
                ? 'bg-blue-400'
                : status === 'Unverified'
                ? 'bg-amber-400'
                : 'bg-gray-400'
            }`}
          />
          {status}
        </span>
      )}

      {isDemoData && (
        <span
          className={`font-semibold rounded uppercase tracking-wider bg-[#1d2023] text-[#f2ca50]/90 border border-[#f2ca50]/20 ${
            size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
          }`}
          title="Demo Data: Values are simulated for reference"
        >
          DEMO DATA
        </span>
      )}
    </div>
  );
};
