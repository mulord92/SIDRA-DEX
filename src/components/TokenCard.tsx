import React from 'react';
import { motion } from 'motion/react';
import { Token } from '../types/index';
import { TokenLogo } from './TokenLogo';
import { CopyAddressButton } from './CopyAddressButton';
import { DemoDataBadge } from './DemoDataBadge';
import { ExternalLink, TrendingUp, TrendingDown, Users, Droplets, BellRing } from 'lucide-react';

interface Props {
  token: Token;
  compact?: boolean;
  onSetAlert?: (tokenSymbol: string) => void;
}

export const TokenCard: React.FC<Props> = ({ token, compact = false, onSetAlert }) => {
  const isPositive = token.change24h >= 0;

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.015, y: -2 }}
        whileTap={{ scale: 0.985 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="glass-panel rounded-xl p-3.5 border border-white/5 hover:border-yellow-500/30 transition-all flex items-center justify-between gap-3 group"
      >
        <a href={`/token/${token.symbol}`} className="flex items-center gap-3 flex-1 min-w-0">
          <TokenLogo token={token} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[#e0e2e6] group-hover:text-[#f2ca50] transition-colors truncate">
                {token.symbol}
              </span>
              <span className="text-[10px] text-gray-400 truncate">({token.name})</span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono">
              {token.holdersCount?.toLocaleString() || '1,200'} holders
            </p>
          </div>
        </a>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="font-mono font-semibold text-sm text-[#e0e2e6]">
              {token.priceSda.toFixed(token.priceSda < 0.001 ? 6 : token.priceSda < 0.1 ? 4 : 2)} SDA
            </p>
            <p className={`text-xs font-semibold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}{token.change24h}%
            </p>
          </div>

          {onSetAlert && (
            <button
              onClick={() => onSetAlert(token.symbol)}
              className="p-1.5 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 transition-colors"
              title={`Set Price Alert for ${token.symbol}`}
            >
              <BellRing className="w-3.5 h-3.5" />
            </button>
          )}

          <CopyAddressButton
            address={token.contractAddress}
            variant="icon"
          />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
      className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-yellow-500/40 transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden bg-gradient-to-b from-black/40 to-black/70"
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3">
        <a href={`/token/${token.symbol}`} className="flex items-center gap-3 group-hover:opacity-95">
          <TokenLogo token={token} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[#e0e2e6] group-hover:text-[#f2ca50] transition-colors font-['Outfit']">
                {token.name}
              </h3>
              <span className="text-xs font-mono font-semibold text-gray-400">({token.symbol})</span>
            </div>
            <div className="mt-1">
              <DemoDataBadge status={token.verificationStatus} isDemoData={false} />
            </div>
          </div>
        </a>

        <div className="flex items-center gap-2">
          {onSetAlert && (
            <button
              onClick={() => onSetAlert(token.symbol)}
              className="p-1.5 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 transition-colors flex items-center gap-1 text-[11px] font-bold"
              title={`Set Price Alert for ${token.symbol}`}
            >
              <BellRing className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Alert</span>
            </button>
          )}
          {/* 24h Rank Badge */}
          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400">
            #{token.rank}
          </span>
        </div>
      </div>

      {/* Pricing & Performance */}
      <div className="space-y-1 bg-black/30 p-3 rounded-xl border border-white/5">
        <div className="flex justify-between items-baseline">
          <span className="text-[10px] text-gray-400 font-semibold uppercase">Price (SDA)</span>
          <span className="text-[10px] text-gray-400 font-semibold uppercase">24h Change</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold font-mono text-white">
            {token.priceSda.toFixed(token.priceSda < 0.0001 ? 6 : token.priceSda < 0.1 ? 4 : 2)} SDA
          </span>
          <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-semibold font-mono ${
            isPositive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {isPositive ? '+' : ''}{token.change24h}%
          </span>
        </div>
        <div className="text-[11px] text-gray-400 font-mono">
          ≈ ${(token.priceUsd || (token.priceSda * 15)).toFixed(2)} USD
        </div>
      </div>

      {/* On-Chain Metrics */}
      <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
        <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-lg">
          <Users className="w-3.5 h-3.5 text-[#f2ca50]" />
          <div>
            <p className="text-[10px] text-gray-400">Holders</p>
            <p className="font-mono font-semibold">{token.holdersCount?.toLocaleString() || '1,200'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 p-2 rounded-lg">
          <Droplets className="w-3.5 h-3.5 text-[#f2ca50]" />
          <div>
            <p className="text-[10px] text-gray-400">Liquidity</p>
            <p className="font-mono font-semibold">${(token.liquidityUsd / 1000).toFixed(1)}K</p>
          </div>
        </div>
      </div>

      {/* Contract Address & Copy Button Row */}
      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
        <CopyAddressButton
          address={token.contractAddress}
          variant="button"
        />

        <a
          href={`/token/${token.symbol}`}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-colors"
        >
          <span>Details</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </motion.div>
  );
};

