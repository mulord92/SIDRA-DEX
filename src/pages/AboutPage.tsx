import React, { useState } from 'react';
import { ShieldCheck, Database, Layers, Info, CheckCircle2, Lock, Copy, Check, ExternalLink, Network } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const NETWORK_SETTINGS = {
    chainName: 'Sidra Chain',
    rpcUrl: 'https://node.sidrachain.com',
    chainId: '97453',
    currencySymbol: 'SDA',
    blockExplorerUrl: 'https://ledger.sidrachain.com'
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white font-['Outfit']">
          About SIDRA SWAP WATCH
        </h1>
        <p className="text-xs md:text-sm text-yellow-500 mt-1 font-semibold">
          Market-data, verification, and token-analytics dashboard engineered for the SidraChain ecosystem.
        </p>
      </div>

      {/* Network Settings Box */}
      <div className="bg-black/40 border border-yellow-500/30 rounded-2xl p-6 backdrop-blur-md space-y-4 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-bold text-white font-['Outfit']">
            Official Sidra Chain Network Parameters
          </h2>
        </div>
        <p className="text-xs text-gray-300">
          Use these network configuration settings to connect your Web3 wallet (MetaMask, Sidra Wallet, or Trust Wallet) to the Sidra Chain mainnet:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono pt-2">
          <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-sans">Network Name</p>
              <p className="text-white font-bold">{NETWORK_SETTINGS.chainName}</p>
            </div>
            <button onClick={() => handleCopy(NETWORK_SETTINGS.chainName, 'name')} className="p-1.5 rounded text-gray-400 hover:text-yellow-400 hover:bg-white/5 transition-colors">
              {copiedField === 'name' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-sans">Chain ID</p>
              <p className="text-yellow-400 font-bold">{NETWORK_SETTINGS.chainId}</p>
            </div>
            <button onClick={() => handleCopy(NETWORK_SETTINGS.chainId, 'chain')} className="p-1.5 rounded text-gray-400 hover:text-yellow-400 hover:bg-white/5 transition-colors">
              {copiedField === 'chain' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between md:col-span-2">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-sans">RPC URL</p>
              <p className="text-gray-200 text-xs font-bold">{NETWORK_SETTINGS.rpcUrl}</p>
            </div>
            <button onClick={() => handleCopy(NETWORK_SETTINGS.rpcUrl, 'rpc')} className="p-1.5 rounded text-gray-400 hover:text-yellow-400 hover:bg-white/5 transition-colors">
              {copiedField === 'rpc' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-sans">Currency Symbol</p>
              <p className="text-white font-bold">{NETWORK_SETTINGS.currencySymbol}</p>
            </div>
            <button onClick={() => handleCopy(NETWORK_SETTINGS.currencySymbol, 'symbol')} className="p-1.5 rounded text-gray-400 hover:text-yellow-400 hover:bg-white/5 transition-colors">
              {copiedField === 'symbol' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="p-3 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-sans">Block Explorer URL</p>
              <a href={NETWORK_SETTINGS.blockExplorerUrl} target="_blank" rel="noreferrer" className="text-yellow-400 hover:underline text-xs font-bold flex items-center gap-1">
                ledger.sidrachain.com <ExternalLink className="w-3 h-3 inline" />
              </a>
            </div>
            <button onClick={() => handleCopy(NETWORK_SETTINGS.blockExplorerUrl, 'explorer')} className="p-1.5 rounded text-gray-400 hover:text-yellow-400 hover:bg-white/5 transition-colors">
              {copiedField === 'explorer' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mission */}
      <div className="bg-black/40 border border-white/10 rounded-2xl p-6 space-y-3">
        <h2 className="text-lg font-bold text-yellow-500 font-['Outfit'] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-yellow-500" />
          Platform Philosophy & Mission
        </h2>
        <p className="text-xs md:text-sm text-gray-200 leading-relaxed">
          SIDRA SWAP WATCH is strictly a market-information and token-analytics dashboard. It is designed to foster transparency across SidraChain assets by providing live price tracking, contract verification status badges, and contract security scans.
        </p>
        <p className="text-xs text-gray-400 leading-relaxed">
          The platform does not execute swaps, custody user funds, manage private keys, or accept direct deposits/withdrawals. All swap calculations are market estimates.
        </p>
      </div>

      {/* Provider Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold text-xs">
            1
          </div>
          <h3 className="font-bold text-sm text-white">Demo Data Provider</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Active in development environments. Seeds verified sample tokens with realistic volatility loops for testing.
          </p>
        </div>

        <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs">
            2
          </div>
          <h3 className="font-bold text-sm text-white">Official Sidra API</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Directly hooks into official SidraChain API endpoints when live environment credentials are standard.
          </p>
        </div>

        <div className="bg-black/40 rounded-2xl p-5 border border-white/5 space-y-2">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 flex items-center justify-center font-bold text-xs">
            3
          </div>
          <h3 className="font-bold text-sm text-white">Indexer Provider</h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            Queries decentralized indexers and RPC nodes (`https://node.sidrachain.com`) to parse verified pair contracts and liquidity depth on-chain.
          </p>
        </div>
      </div>

      {/* Data Integrity Rules */}
      <div className="bg-black/40 rounded-2xl p-6 space-y-4 border border-white/10">
        <h2 className="text-base font-bold text-white font-['Outfit']">
          Data Integrity Standards
        </h2>
        <div className="space-y-3 text-xs text-gray-300">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
            <span>
              <strong>Clear Labelling:</strong> Every asset is labeled with its verification status (Verified, Pending Review, Unverified) and data source tag.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
            <span>
              <strong>No Unverified Swaps:</strong> All calculator rates clearly show liquidity depth and price impact estimations.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
            <span>
              <strong>Contract Audit Scanner:</strong> Automated honeypot checks and tax checks are executed prior to displaying risk assessments.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

