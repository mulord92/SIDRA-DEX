import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface Props {
  address: string;
  variant?: 'button' | 'icon' | 'pill';
  className?: string;
  truncate?: boolean;
}

export const CopyAddressButton: React.FC<Props> = ({
  address,
  variant = 'button',
  className = '',
  truncate = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedAddr = truncate && address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  if (variant === 'icon') {
    return (
      <button
        onClick={handleCopy}
        type="button"
        className={`p-1.5 rounded-lg text-gray-400 hover:text-[#f2ca50] hover:bg-white/10 transition-colors flex items-center gap-1 text-[11px] font-mono ${className}`}
        title="Copy Contract Address"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-semibold text-[10px]">Copied!</span>
          </>
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    );
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={handleCopy}
        type="button"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-gray-300 transition-all cursor-pointer ${
          copied ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : ''
        } ${className}`}
        title="Click to copy contract address"
      >
        {copied ? (
          <>
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="font-semibold text-emerald-400">Copied!</span>
          </>
        ) : (
          <>
            <span>{formattedAddr}</span>
            <Copy className="w-3 h-3 text-gray-400 hover:text-yellow-400" />
          </>
        )}
      </button>
    );
  }

  // Default 'button' variant
  return (
    <button
      onClick={handleCopy}
      type="button"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-xs font-mono text-[#f2ca50] font-semibold transition-all cursor-pointer ${
        copied ? '!bg-emerald-500/20 !border-emerald-500/40 !text-emerald-400' : ''
      } ${className}`}
      title="Copy contract address to clipboard"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Address</span>
        </>
      )}
    </button>
  );
};
