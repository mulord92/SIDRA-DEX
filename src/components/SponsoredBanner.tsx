import React, { useState, useEffect } from 'react';
import { SponsoredProject } from '../types/index';
import { subscriptionService } from '../services/subscriptionService';
import { Flame, Sparkles, ExternalLink, ShieldCheck, Zap, X } from 'lucide-react';

interface Props {
  onUpgradeClick?: () => void;
  type?: 'featured_token' | 'native_ad';
}

const FEATURED_PROJECTS: SponsoredProject[] = [
  {
    id: 'wpx-featured',
    tokenSymbol: 'WPX',
    tokenName: 'Widpnix',
    tagline: 'Leading decentralized liquidity and high-throughput ecosystem asset on SidraChain.',
    logoUrl: '/tokens/wpx.png',
    badge: 'Featured Project',
    promotedUntil: '2026-12-31',
    ctaLink: '/token/WPX',
    priceSda: 14.85,
    priceUsd: 29.70,
    change24h: 12.4,
    volume24hUsd: 148500,
    contractAddress: '0xfaeCbE5956a02e45Ee663922174F955ae78D0309'
  },
  {
    id: 'fbay-vip',
    tokenSymbol: 'FBAY',
    tokenName: 'Flash Bay Protocol',
    tagline: 'Deep automated liquidity layer and institutional decentralized exchange token.',
    logoUrl: '/tokens/fbay.png',
    badge: 'VIP Partner',
    promotedUntil: '2026-12-31',
    ctaLink: '/token/FBAY',
    priceSda: 48.50,
    priceUsd: 97.00,
    change24h: 8.9,
    volume24hUsd: 248000,
    contractAddress: '0x3a92b109e23f8101742a98f12c3328e192fb1f3a'
  }
];

export const SponsoredBanner: React.FC<Props> = ({ onUpgradeClick, type = 'featured_token' }) => {
  const [isPro, setIsPro] = useState(subscriptionService.isProOrAbove());
  const [dismissed, setDismissed] = useState(false);
  const project = FEATURED_PROJECTS[0]; // Featured Project WPX

  useEffect(() => {
    return subscriptionService.subscribe((sub) => {
      setIsPro(sub.plan === 'pro' || sub.plan === 'elite');
    });
  }, []);

  if (dismissed && isPro) return null;

  if (type === 'native_ad' && isPro) {
    return null; // Pro users enjoy an ad-free experience!
  }

  if (type === 'native_ad') {
    return (
      <div className="rounded-2xl p-4 bg-gradient-to-r from-black/80 via-[#101524] to-black/80 border border-yellow-500/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs my-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-mono text-[10px] font-bold uppercase border border-yellow-500/20 shrink-0">
            Sponsored Ad
          </div>
          <p className="text-gray-300 leading-normal">
            <strong className="text-white">Sidra DeFi Gateway:</strong> Trade verified Sidra tokens with zero gas subsidies. Connect your non-custodial wallet today.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/token/WPX"
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors flex items-center gap-1"
          >
            <span>Learn More</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="px-3 py-1.5 rounded-xl bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 font-bold text-xs transition-colors flex items-center gap-1 border border-yellow-500/30"
              title="Upgrade to Pro to remove all banner ads"
            >
              <Zap className="w-3 h-3" />
              <span>Remove Ads with Pro</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl p-4 md:p-5 bg-gradient-to-r from-[#171408] via-[#0d121c] to-[#120f06] border border-yellow-500/30 shadow-[0_0_20px_rgba(242,202,80,0.1)] overflow-hidden my-4">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl bg-black/60 border border-yellow-500/40 p-1.5 flex items-center justify-center shadow-md">
              <img
                src={project.logoUrl}
                alt={project.tokenName}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <span className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-yellow-500 text-black">
              <Flame className="w-3 h-3 fill-black" />
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                <Flame className="w-3 h-3" />
                <span>Featured Project — {project.tokenSymbol}</span>
              </span>
              <span className="text-xs text-gray-400 font-medium">({project.tokenName})</span>
            </div>
            <p className="text-xs text-gray-200 mt-1 max-w-xl leading-relaxed">
              {project.tagline}
            </p>
          </div>
        </div>

        {/* Price & Action */}
        <div className="flex items-center gap-4 self-end md:self-center shrink-0">
          <div className="text-right">
            <div className="text-sm font-extrabold text-white font-mono">
              {project.priceSda} <span className="text-yellow-400 text-xs">SDA</span>
            </div>
            <div className="text-xs font-semibold text-emerald-400">
              +{project.change24h}% (24h)
            </div>
          </div>

          <a
            href={project.ctaLink}
            className="px-4 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs transition-all shadow-[0_0_15px_rgba(242,202,80,0.25)] flex items-center gap-1.5"
          >
            <span>Explore Token</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
