import React from 'react';
import { VerificationStatus } from '../types/index';

interface Props {
  isDemoData?: boolean;
  status?: VerificationStatus;
  size?: 'sm' | 'md';
}

export const DemoDataBadge: React.FC<Props> = ({ isDemoData = false, status, size = 'sm' }) => {
  const getDotColor = () => {
    if (status === 'Verified') return 'bg-emerald-400';
    if (status === 'Pending Review') return 'bg-blue-400';
    if (status === 'Unverified') return 'bg-amber-400';
    return 'bg-gray-400';
  };

  const getBadgeStyle = () => {
    if (status === 'Verified') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (status === 'Pending Review') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (status === 'Unverified') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  };

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      {status && (
        <span
          className={`inline-flex items-center gap-1 font-medium rounded-full border ${
            size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${getBadgeStyle()}`}
        >
          <span
            className={`rounded-full ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${getDotColor()}`}
          />
          {status}
        </span>
      )}

      <span
        className={`font-semibold rounded uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${
          size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
        }`}
        title="Live market data actively synchronized with ledger.sidrachain.com on-chain feeds"
      >
        LEDGER SYNC
      </span>
    </div>
  );
};


