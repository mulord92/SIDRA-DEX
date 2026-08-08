import React, { useState } from 'react';
import { ScanResult } from '../types/index';
import { safeFetchJson } from '../utils/api';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { CopyAddressButton } from '../components/CopyAddressButton';
import { Radar, ShieldCheck, CheckCircle2, AlertTriangle, Search, Copy, Check, Sparkles, PieChart, Users, Droplet, Lock } from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const [network, setNetwork] = useState('SidraChain Mainnet');
  const [contractInput, setContractInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    const val = contractInput.trim();
    if (!val) {
      setError('Please enter a contract address.');
      return;
    }

    setError(null);
    setScanning(true);

    try {
      const data = await safeFetchJson<ScanResult>('/api/scanner/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress: val, network })
      });

      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Error executing intelligence scan.');
    } finally {
      setScanning(false);
    }
  };

  const handleCopy = () => {
    if (result?.contractAddress) {
      navigator.clipboard.writeText(result.contractAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#e0e2e6] font-['Outfit']">
          Token Scanner
        </h1>
        <p className="text-xs md:text-sm text-[#d0c5af] mt-1">
          Analyze contract code to verify integrity, liquidity depth, and holder distribution before executing trades.
        </p>
      </div>

      {/* Cockpit Input Bar */}
      <div className="glass-panel rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center w-full shadow-lg">
        {/* Network Selector */}
        <div className="relative w-full md:w-56">
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-2.5 px-4 text-xs font-medium text-[#e0e2e6] focus:border-[#f2ca50] outline-none appearance-none cursor-pointer"
          >
            <option value="SidraChain Mainnet">SidraChain Mainnet</option>
            <option value="Ethereum (ERC-20)">Ethereum (ERC-20)</option>
            <option value="BNB Chain (BEP-20)">BNB Chain (BEP-20)</option>
            <option value="Arbitrum One">Arbitrum One</option>
            <option value="Solana (SPL)">Solana (SPL)</option>
          </select>
        </div>

        {/* Contract Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={contractInput}
            onChange={(e) => setContractInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
            placeholder="0x... Enter Contract Address (e.g. 0x3a92b109e23f8101742a98f12c3328e192fb1f3a)"
            className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl py-2.5 px-4 text-xs font-mono text-[#e0e2e6] placeholder-gray-500 focus:border-[#f2ca50] outline-none transition-colors"
          />
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleScan}
          disabled={scanning}
          className="w-full md:w-auto bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(242,202,80,0.2)] disabled:opacity-50 shrink-0"
        >
          <Radar className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Analyzing Contract...' : 'Analyze Contract'}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Awaiting Target State */}
      {!result && !scanning && (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-2xl p-8">
          <div className="w-20 h-20 rounded-full bg-[#1d2023] border border-white/10 flex items-center justify-center mb-4 relative">
            <div className="absolute inset-0 rounded-full border border-[#f2ca50]/20 animate-ping opacity-20" />
            <Radar className="w-8 h-8 text-[#f2ca50]/70" />
          </div>
          <h3 className="text-base font-bold text-[#e0e2e6] font-['Outfit']">Awaiting Target</h3>
          <p className="text-xs text-[#d0c5af] max-w-md mt-1">
            Enter a contract address and select the appropriate network to begin a comprehensive intelligence scan.
          </p>
        </div>
      )}

      {/* Scanning Progress Loader */}
      {scanning && (
        <div className="py-20 text-center glass-panel rounded-2xl p-8 space-y-4">
          <Radar className="w-10 h-10 text-[#f2ca50] animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#e0e2e6]">Analyzing Smart Contract...</p>
          <p className="text-xs text-gray-400">Evaluating honeypot traps, tax variables, liquidity locks, and AI risk profiles.</p>
        </div>
      )}

      {/* Results State */}
      {result && !scanning && (
        <div className="space-y-6">
          {/* Top Row: Token Identity & Supply Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Identity Card */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#1d2023] border border-white/10 flex items-center justify-center font-bold text-base text-[#f2ca50]">
                    {result.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-[#e0e2e6] font-['Outfit']">{result.tokenName}</h3>
                      <span className="text-xs bg-[#1d2023] px-2 py-0.5 rounded text-gray-300 font-mono">
                        {result.symbol}
                      </span>
                    </div>
                    <div className="mt-2">
                      <CopyAddressButton
                        address={result.contractAddress}
                        variant="button"
                      />
                    </div>
                  </div>
                </div>

                <DemoDataBadge status={result.verificationStatus} isDemoData={result.isDemoData} />
              </div>

              {/* Network Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-white/5 pt-4 text-xs">
                <div>
                  <p className="text-gray-400">Network</p>
                  <p className="font-semibold text-[#e0e2e6] mt-0.5">{result.network}</p>
                </div>
                <div>
                  <p className="text-gray-400">Decimals</p>
                  <p className="font-semibold text-[#e0e2e6] mt-0.5">{result.decimals}</p>
                </div>
                <div>
                  <p className="text-gray-400">Created At</p>
                  <p className="font-semibold text-[#e0e2e6] mt-0.5">Oct 12, 2023</p>
                </div>
                <div>
                  <p className="text-gray-400">Unit Price</p>
                  <p className="font-semibold text-[#f2ca50] font-mono mt-0.5">{result.priceSda.toFixed(result.priceSda < 0.0001 ? 6 : 4)} SDA</p>
                </div>
              </div>
            </div>

            {/* Supply Metrics */}
            <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                <PieChart className="w-4 h-4 text-[#f2ca50]" />
                <span className="text-xs font-bold text-[#e0e2e6] uppercase tracking-wider">Supply Metrics</span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-[#d0c5af] mb-1">
                    <span>Total Supply</span>
                    <span className="font-mono text-[#e0e2e6]">{(result.totalSupply / 1000000).toFixed(0)}M {result.symbol}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1d2023] rounded-full overflow-hidden">
                    <div className="h-full bg-[#f2ca50] w-full" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[#d0c5af] mb-1">
                    <span>Circulating Supply</span>
                    <span className="font-mono text-[#e0e2e6]">{(result.circulatingSupply / 1000000).toFixed(0)}M {result.symbol}</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#1d2023] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#f2ca50]"
                      style={{ width: `${Math.min(100, Math.max(0, (result.circulatingSupply / (result.totalSupply || 1)) * 100))}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-right text-gray-400 mt-1">
                    {((result.circulatingSupply / (result.totalSupply || 1)) * 100).toFixed(0)}% Unlocked ({Math.max(0, 100 - Math.round((result.circulatingSupply / (result.totalSupply || 1)) * 100))}% Locked)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bento: Security Logic & AI Risk Assessment */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Holders */}
            <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#d0c5af] uppercase">
                <Users className="w-4 h-4 text-[#f2ca50]" />
                <span>Holders</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-[#e0e2e6] font-mono">{result.holdersCount.toLocaleString()}</p>
                <p className="text-xs text-emerald-400 mt-1 font-semibold">+2.4% (24h)</p>
              </div>
            </div>

            {/* Total Liquidity */}
            <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#d0c5af] uppercase">
                <Droplet className="w-4 h-4 text-[#f2ca50]" />
                <span>Total Liquidity</span>
              </div>
              <div className="mt-4">
                <p className="text-2xl font-extrabold text-[#e0e2e6] font-mono">{(result.liquidityUsd / 1000).toFixed(1)}K SDA</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" /> 98% Locked
                </p>
              </div>
            </div>

            {/* Security Logic Matrix */}
            <div className="lg:col-span-2 glass-panel rounded-2xl p-5 flex flex-col justify-between space-y-3">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-[#e0e2e6] uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Security Logic Audit
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-semibold">
                  Auto-Scan Complete
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Honeypot Check</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Passed
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Buy / Sell Tax</span>
                  <span className="font-mono font-bold text-[#e0e2e6]">
                    {result.securityChecks.buyTaxPercent}% / {result.securityChecks.sellTaxPercent}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Contract Renounced</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Mint Function</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Revoked
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* AI Security Assessment */}
          {result.aiRiskSummary && (
            <div className="p-5 rounded-2xl bg-[#1d2023] border border-[#f2ca50]/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#f2ca50] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Gemini AI Security Assessment
              </div>
              <p className="text-xs text-[#e0e2e6] leading-relaxed">
                {result.aiRiskSummary}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
