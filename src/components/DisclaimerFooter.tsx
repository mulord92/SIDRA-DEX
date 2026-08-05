import React from 'react';

export const DisclaimerFooter: React.FC = () => {
  return (
    <footer className="w-full bg-black flex flex-col md:flex-row items-center justify-between px-6 py-4 border-t border-white/5 shrink-0 mt-auto z-10 text-[10px] text-gray-500 gap-4">
      <p className="max-w-[700px] leading-normal">
        SIDRA SWAP WATCH is an independent market-information and token-analytics platform. It does not execute swaps, custody assets, or provide investment advice.
      </p>
      <div className="flex items-center gap-4 shrink-0">
        <span className="text-[10px] font-bold text-yellow-600 tracking-wider">BETA V1.0.4</span>
        <span className="text-[10px] text-gray-500">© 2026 Sidra Swap Watch</span>
      </div>
    </footer>
  );
};
