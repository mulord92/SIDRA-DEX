import React, { useState, useEffect } from 'react';
import { SwapEstimate } from '../types/index';
import { ArrowDownUp, RefreshCw, Info, Settings, ShieldCheck, Wallet } from 'lucide-react';

export const CalculatorPage: React.FC = () => {
  const [baseToken, setBaseToken] = useState('SDA');
  const [targetToken, setTargetToken] = useState('USDT');
  const [amountIn, setAmountIn] = useState('1000');
  const [estimate, setEstimate] = useState<SwapEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<number>(12);

  const availableTokens = ['SDA', 'USDT', 'FBAY', 'HPDA', 'GPC', 'RIDEX', 'SXD'];

  const calculateEstimate = async () => {
    const num = parseFloat(amountIn);
    if (isNaN(num) || num <= 0) return;

    setLoading(true);
    try {
      const res = await fetch('/api/calculator/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseSymbol: baseToken,
          targetSymbol: targetToken,
          amount: num
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEstimate(data);
        setLastRefreshed(1);
      }
    } catch (err) {
      console.error('Swap estimate error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateEstimate();
  }, [baseToken, targetToken, amountIn]);

  const handleSwapTokens = () => {
    const temp = baseToken;
    setBaseToken(targetToken);
    setTargetToken(temp);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] relative py-8 px-4">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center overflow-hidden opacity-25 -z-10">
        <div className="w-[500px] h-[500px] bg-[#f2ca50] rounded-full blur-[140px]" />
      </div>

      {/* Main Calculator Card Container */}
      <div className="w-full max-w-md bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 rounded-[28px] p-5 sm:p-6 shadow-2xl relative z-10 flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-center px-1 mb-1">
          <h1 className="text-2xl font-bold text-[#e0e2e6] font-['Outfit']">
            Swap Estimate
          </h1>
          <button className="text-gray-400 hover:text-[#f2ca50] transition-colors p-2 rounded-full hover:bg-white/5">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Input Section (You Pay) */}
        <div className="bg-[#191c1f] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
          <label className="text-xs font-semibold text-[#d0c5af] block mb-1">
            You Pay
          </label>
          <div className="flex justify-between items-center gap-3">
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="bg-transparent border-none text-2xl sm:text-3xl font-bold font-mono text-[#e0e2e6] p-0 focus:outline-none focus:ring-0 w-full placeholder-gray-600"
            />

            <select
              value={baseToken}
              onChange={(e) => setBaseToken(e.target.value)}
              className="bg-[#0a0a0c] border border-white/10 rounded-full px-4 py-2 font-bold text-xs text-[#e0e2e6] hover:border-[#f2ca50] transition-colors shrink-0 outline-none cursor-pointer"
            >
              {availableTokens.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-400 mt-2 font-mono">
            ~${estimate ? estimate.amountInUsd.toLocaleString() : '1,240.50'} USD
          </div>
        </div>

        {/* Swap Direction Toggle Icon */}
        <div className="relative h-4 flex justify-center items-center my-0.5">
          <div className="absolute w-full h-[1px] bg-white/5" />
          <button
            onClick={handleSwapTokens}
            className="w-9 h-9 rounded-xl bg-[#1d2023] border border-white/10 flex justify-center items-center text-gray-300 hover:text-[#f2ca50] hover:border-[#f2ca50] transition-all z-10 shadow-sm"
            title="Invert tokens"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
        </div>

        {/* Output Section (You Receive Estimated) */}
        <div className="bg-[#191c1f] rounded-2xl p-4 border border-white/5 hover:border-white/10 transition-colors">
          <label className="text-xs font-semibold text-[#d0c5af] block mb-1">
            You Receive (Estimated)
          </label>
          <div className="flex justify-between items-center gap-3">
            <input
              type="text"
              readOnly
              value={loading ? 'Calculating...' : estimate ? estimate.estimatedOut.toLocaleString() : '1,238.25'}
              className="bg-transparent border-none text-2xl sm:text-3xl font-bold font-mono text-[#f2ca50] p-0 focus:outline-none focus:ring-0 w-full"
            />

            <select
              value={targetToken}
              onChange={(e) => setTargetToken(e.target.value)}
              className="bg-[#0a0a0c] border border-white/10 rounded-full px-4 py-2 font-bold text-xs text-[#e0e2e6] hover:border-[#f2ca50] transition-colors shrink-0 outline-none cursor-pointer"
            >
              {availableTokens.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="text-xs text-gray-400 mt-2 flex justify-between font-mono">
            <span>~${estimate ? estimate.estimatedOutUsd.toLocaleString() : '1,238.25'} USD</span>
            <span className="text-amber-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Price Impact {estimate ? estimate.priceImpactPercent : '-0.18'}%
            </span>
          </div>
        </div>

        {/* Exchange Rate & Refresh Info */}
        <div className="px-2 py-3 flex justify-between items-center border-t border-white/5 mt-1 text-xs text-[#d0c5af]">
          <div className="flex items-center gap-1.5 font-mono">
            <Info className="w-3.5 h-3.5 text-[#f2ca50]" />
            <span>1 {baseToken} = {estimate ? estimate.exchangeRate : '1.2405'} {targetToken}</span>
          </div>

          <button
            onClick={calculateEstimate}
            className="flex items-center gap-1 text-gray-400 hover:text-[#f2ca50] transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#f2ca50]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={() => {
            alert('SIDRA SWAP WATCH is a market analytics and price watch dashboard, not a token execution exchange.');
          }}
          className="w-full py-3.5 bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(242,202,80,0.2)] flex items-center justify-center gap-2"
        >
          <Wallet className="w-4 h-4" />
          <span>Connect Wallet to Swap</span>
        </button>
      </div>

      {/* Mandatory Disclaimer */}
      <div className="mt-6 max-w-md text-center">
        <p className="text-xs text-[#99907c] leading-relaxed">
          Estimated values only. Actual market values may differ because of liquidity, price movement, and data availability.
        </p>
      </div>
    </div>
  );
};
