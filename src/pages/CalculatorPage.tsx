import React, { useState, useEffect } from 'react';
import { Token, SwapEstimate } from '../types/index';
import { safeFetchJson } from '../utils/api';
import { ArrowDownUp, RefreshCw, Info, Settings, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { TokenLogo } from '../components/TokenLogo';

export const CalculatorPage: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [baseToken, setBaseToken] = useState('SDA');
  const [targetToken, setTargetToken] = useState('FBAY');
  const [amountIn, setAmountIn] = useState('100');
  const [estimate, setEstimate] = useState<SwapEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    safeFetchJson<{ tokens: Token[] }>('/api/tokens?limit=100')
      .then(data => {
        if (data && data.tokens && data.tokens.length > 0) {
          setTokens(data.tokens);
        }
      })
      .catch(err => console.warn('Calculator tokens load error:', err));
  }, []);

  const calculateEstimate = async () => {
    const num = parseFloat(amountIn);
    if (isNaN(num) || num <= 0) return;

    setLoading(true);
    try {
      const data = await safeFetchJson<SwapEstimate>('/api/calculator/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseSymbol: baseToken,
          targetSymbol: targetToken,
          amount: num
        })
      });

      if (data) {
        setEstimate(data);
      }
    } catch (err) {
      console.warn('Swap estimate error:', err);
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

  const selectedBase = tokens.find(t => t.symbol.toUpperCase() === baseToken.toUpperCase());
  const selectedTarget = tokens.find(t => t.symbol.toUpperCase() === targetToken.toUpperCase());

  return (
    <div className="flex flex-col items-center justify-center min-h-[75vh] relative py-8 px-4">
      {/* Background Glow */}
      <div className="absolute inset-0 pointer-events-none flex justify-center items-center overflow-hidden opacity-20 -z-10">
        <div className="w-[500px] h-[500px] bg-[#f2ca50] rounded-full blur-[140px]" />
      </div>

      {/* Main Calculator Card Container */}
      <div className="w-full max-w-md bg-[#0a0a0c]/90 backdrop-blur-2xl border border-white/10 rounded-[28px] p-5 sm:p-6 shadow-2xl relative z-10 flex flex-col gap-3">
        {/* Header */}
        <div className="flex justify-between items-center px-1 mb-1">
          <div>
            <h1 className="text-2xl font-bold text-[#e0e2e6] font-['Outfit']">
              DEX Swap Estimate
            </h1>
            <p className="text-xs text-gray-400">Live rate calculator across 88 Sidra pools</p>
          </div>
          <button
            onClick={calculateEstimate}
            className="text-gray-400 hover:text-[#f2ca50] transition-colors p-2 rounded-full hover:bg-white/5"
            title="Recalculate rate"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#f2ca50]' : ''}`} />
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

            <div className="flex items-center gap-1.5 bg-[#0a0a0c] border border-white/10 rounded-full px-3 py-1.5 shrink-0">
              {selectedBase && <TokenLogo token={selectedBase} size="xs" />}
              <select
                value={baseToken}
                onChange={(e) => setBaseToken(e.target.value)}
                className="bg-transparent font-bold text-xs text-[#e0e2e6] outline-none cursor-pointer"
              >
                {tokens.length > 0 ? (
                  tokens.map((t) => (
                    <option key={t.id} value={t.symbol} className="bg-[#121417] text-white">
                      {t.symbol} ({t.name})
                    </option>
                  ))
                ) : (
                  ['SDA', 'FBAY', 'USDT', 'GPC', 'RIDEX'].map(t => (
                    <option key={t} value={t} className="bg-[#121417] text-white">{t}</option>
                  ))
                )}
              </select>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2 font-mono flex justify-between">
            <span>Price: {selectedBase ? `${selectedBase.priceSda.toFixed(4)} SDA` : '1.0000 SDA'}</span>
            <span>≈ ${(estimate?.amountInUsd || Number(amountIn)).toLocaleString()} USD</span>
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
              value={loading ? 'Calculating...' : estimate ? estimate.estimatedOut.toLocaleString() : '0.00'}
              className="bg-transparent border-none text-2xl sm:text-3xl font-bold font-mono text-[#f2ca50] p-0 focus:outline-none focus:ring-0 w-full"
            />

            <div className="flex items-center gap-1.5 bg-[#0a0a0c] border border-white/10 rounded-full px-3 py-1.5 shrink-0">
              {selectedTarget && <TokenLogo token={selectedTarget} size="xs" />}
              <select
                value={targetToken}
                onChange={(e) => setTargetToken(e.target.value)}
                className="bg-transparent font-bold text-xs text-[#e0e2e6] outline-none cursor-pointer"
              >
                {tokens.length > 0 ? (
                  tokens.map((t) => (
                    <option key={t.id} value={t.symbol} className="bg-[#121417] text-white">
                      {t.symbol} ({t.name})
                    </option>
                  ))
                ) : (
                  ['FBAY', 'SDA', 'USDT', 'GPC', 'RIDEX'].map(t => (
                    <option key={t} value={t} className="bg-[#121417] text-white">{t}</option>
                  ))
                )}
              </select>
            </div>
          </div>
          <div className="text-xs text-gray-400 mt-2 flex justify-between font-mono">
            <span>Price: {selectedTarget ? `${selectedTarget.priceSda.toFixed(4)} SDA` : '1.0000 SDA'}</span>
            <span className="text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Slippage Impact: {estimate ? estimate.priceImpactPercent : '0.05'}%
            </span>
          </div>
        </div>

        {/* Exchange Rate & Refresh Info */}
        <div className="px-2 py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center border-t border-white/5 mt-1 text-xs text-[#d0c5af] gap-2">
          <div className="flex items-center gap-1.5 font-mono">
            <Info className="w-3.5 h-3.5 text-[#f2ca50]" />
            <span>1 {baseToken} = {estimate ? estimate.exchangeRate : '1.0'} {targetToken}</span>
          </div>

          <div className="text-[10px] text-yellow-400 font-mono flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
            <span>Peg Reference: 1 SDA = $15.00 USD</span>
          </div>
        </div>

        {/* Reference Peg Banner in Calculator */}
        <div className="p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-gray-300 leading-relaxed">
          <strong className="text-yellow-400 font-mono">Reference Peg:</strong> The system maintains an exchange rate of <strong className="text-white font-mono">1 SDA = $15.00 USD</strong> as the benchmark conversion standard for the Sidra ecosystem (Sample standard for estimating dollar values).
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowConnectModal(true)}
          className="w-full py-3.5 bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(242,202,80,0.2)] flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Execution Details & Route</span>
        </button>
      </div>

      {/* Connect / Info Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121417] border border-white/10 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#f2ca50]/20 text-[#f2ca50] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Live On-Chain Settlement</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              This application tracks real-time on-chain pricing directly from Sidra Chain (Chain ID: 97453). To execute live trades, use the native Sidra DEX terminal or your Web3 wallet.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowConnectModal(false)}
                className="w-full py-2.5 bg-[#f2ca50] text-[#3c2f00] font-bold rounded-xl text-xs hover:bg-[#ffe088] transition-colors"
              >
                Close & Return
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Disclaimer */}
      <div className="mt-6 max-w-md text-center">
        <p className="text-xs text-[#99907c] leading-relaxed">
          Estimated values derived from live Sidra DEX pool quotes. Actual settlement rates depend on pool reserves and slippage at execution block.
        </p>
      </div>
    </div>
  );
};
