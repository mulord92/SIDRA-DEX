import React from 'react';

export const DisclaimerFooter: React.FC = () => {
  return (
    <footer className="w-full bg-black flex flex-col items-center justify-between px-6 py-4 border-t border-white/5 shrink-0 mt-auto z-10 text-[10px] text-gray-500 gap-4">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-3 bg-yellow-500/5 border border-yellow-500/15 rounded-xl px-4 py-2.5 text-[11px] text-gray-300">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-yellow-500/20 text-yellow-400 font-mono font-bold text-[10px] border border-yellow-500/30">
            BENCHMARK PEG
          </span>
          <p className="leading-normal">
            <strong className="text-yellow-400 font-mono">Reference Peg:</strong> The system maintains an exchange rate of <strong className="text-white font-mono">1 SDA = $15.00 USD</strong> as the benchmark conversion standard for the Sidra ecosystem (Sample analytical reference standard for USD valuations and dollar volume metrics, not an official fiat peg).
          </p>
        </div>
        <span className="text-[10px] text-gray-400 font-mono shrink-0">
          Sample Reference Benchmark
        </span>
      </div>

      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 max-w-[700px]">
          <img src="/app-logo.png" alt="Sidra Swap Watch Logo" className="w-5 h-5 object-contain shrink-0" />
          <p className="leading-normal">
            SIDRA SWAP WATCH is an independent market-information and token-analytics platform. It does not execute swaps, custody assets, or provide investment advice.
          </p>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-[10px] font-bold text-yellow-600 tracking-wider">BETA V1.0.4</span>
          <span className="text-[10px] text-gray-500">© 2026 Sidra Swap Watch</span>
        </div>
      </div>
    </footer>
  );
};
