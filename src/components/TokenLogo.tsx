import React, { useState } from 'react';
import { Token } from '../types';

interface TokenLogoProps {
  token?: Partial<Token> | { symbol: string; name?: string; logoUrl?: string; icon?: string };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const TokenLogo: React.FC<TokenLogoProps> = ({ token, size = 'md', className = '' }) => {
  const [attempt, setAttempt] = useState(0);

  const symbol = token?.symbol || 'SDA';
  const name = token?.name || symbol;

  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  }[size];

  const getGradient = (sym: string) => {
    let hash = 0;
    for (let i = 0; i < sym.length; i++) {
      hash = sym.charCodeAt(i) + ((hash << 5) - hash);
    }
    const gradients = [
      'from-amber-500/20 to-yellow-600/30 text-amber-300 border-amber-500/30',
      'from-emerald-500/20 to-teal-600/30 text-emerald-300 border-emerald-500/30',
      'from-blue-500/20 to-indigo-600/30 text-blue-300 border-blue-500/30',
      'from-purple-500/20 to-violet-600/30 text-purple-300 border-purple-500/30',
      'from-rose-500/20 to-pink-600/30 text-rose-300 border-rose-500/30',
      'from-cyan-500/20 to-blue-600/30 text-cyan-300 border-cyan-500/30',
      'from-orange-500/20 to-amber-600/30 text-orange-300 border-orange-500/30',
    ];
    return gradients[Math.abs(hash) % gradients.length];
  };

  const cleanSym = symbol.toLowerCase().replace(/[^a-z0-9]/g, '');
  const sources = [
    token?.logoUrl,
    `/tokens/${cleanSym}.png`,
    `https://masatos007.github.io/SidraDEX-Live-Prices/img/${cleanSym}.png`,
    `https://masatos007.github.io/SidraDEX-Live-Prices/img/${symbol.toLowerCase()}.png`,
    `https://api.dicebear.com/7.x/identicon/svg?seed=${symbol}&backgroundColor=121417`
  ].filter(Boolean) as string[];

  const currentSrc = sources[attempt];

  if (currentSrc && attempt < sources.length) {
    return (
      <div className={`relative rounded-full overflow-hidden bg-[#121417] border border-white/10 shrink-0 flex items-center justify-center p-0.5 shadow-sm ${sizeClasses} ${className}`}>
        <img
          src={currentSrc}
          alt={`${symbol} logo`}
          className="w-full h-full object-cover rounded-full"
          onError={() => setAttempt(prev => prev + 1)}
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br border shrink-0 flex items-center justify-center font-bold font-mono uppercase shadow-inner ${getGradient(
        symbol
      )} ${sizeClasses} ${className}`}
      title={name}
    >
      {symbol.slice(0, 3)}
    </div>
  );
};
