import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, TrendingUp, TrendingDown, Activity, RefreshCw, Zap, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export interface SentimentData {
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  score: number;
  confidence: number;
  summary: string;
  keyFactors: string[];
  signals: Array<{
    symbol: string;
    sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    reason: string;
  }>;
  timestamp: string;
  provider: string;
}

export const MarketSentimentAI: React.FC = () => {
  const [data, setData] = useState<SentimentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchSentiment = async (isManual = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/sentiment');
      if (!res.ok) {
        throw new Error('Failed to fetch AI market sentiment');
      }
      const result: SentimentData = await res.json();
      setData(result);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err: any) {
      console.error('Sentiment fetch error:', err);
      setError(err?.message || 'Unable to load Gemini sentiment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentiment();
  }, []);

  const getSentimentTheme = (sentiment?: string) => {
    switch (sentiment) {
      case 'BULLISH':
        return {
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          glow: 'shadow-[0_0_25px_rgba(16,185,129,0.15)]',
          barBg: 'from-emerald-500 to-teal-400',
          icon: TrendingUp,
          label: 'Bullish Market'
        };
      case 'BEARISH':
        return {
          color: 'text-rose-400',
          bg: 'bg-rose-500/10',
          border: 'border-rose-500/30',
          glow: 'shadow-[0_0_25px_rgba(244,63,94,0.15)]',
          barBg: 'from-rose-500 to-red-400',
          icon: TrendingDown,
          label: 'Bearish Market'
        };
      default:
        return {
          color: 'text-amber-400',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          glow: 'shadow-[0_0_25px_rgba(245,158,11,0.15)]',
          barBg: 'from-amber-500 to-yellow-400',
          icon: Activity,
          label: 'Neutral Market'
        };
    }
  };

  const theme = getSentimentTheme(data?.sentiment);
  const IconComp = theme.icon;

  return (
    <div className={`glass-panel rounded-2xl p-5 md:p-6 border border-white/10 relative overflow-hidden transition-all duration-300 ${theme.glow}`}>
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-yellow-500/5 via-emerald-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-500/20 to-amber-500/10 border border-yellow-500/30 text-yellow-400 shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white font-['Outfit'] tracking-wide">
                SidraChain AI Market Trends
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300 border border-yellow-500/30 flex items-center gap-1 font-semibold">
                <Zap className="w-3 h-3 text-yellow-400" /> Gemini 3.6 AI
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Real-time deep learning sentiment indicator & quantitative DEX flow analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {lastUpdated && (
            <span className="text-[11px] font-mono text-gray-400 hidden md:inline">
              Sync: {lastUpdated}
            </span>
          )}
          <button
            onClick={() => fetchSentiment(true)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all flex items-center gap-1.5 text-xs font-semibold hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-yellow-400' : ''}`} />
            <span>{loading ? 'Analyzing...' : 'Re-Analyze'}</span>
          </button>
        </div>
      </div>

      {/* Body Content */}
      {loading && !data ? (
        <div className="py-10 flex flex-col items-center justify-center space-y-3 text-center">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-yellow-500/20 border-t-yellow-400 animate-spin" />
            <Sparkles className="w-5 h-5 text-yellow-400 absolute inset-0 m-auto animate-pulse" />
          </div>
          <p className="text-xs font-mono text-gray-300 animate-pulse">
            Analyzing 88 SidraDEX Liquidity Pools & Trade Volumes with Gemini 3.6...
          </p>
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => fetchSentiment(true)} className="underline hover:text-rose-200">
            Retry
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Main Indicator Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
            {/* Left Box: Big Bullish/Bearish Badge */}
            <div className={`md:col-span-5 p-5 rounded-xl border ${theme.bg} ${theme.border} flex flex-col justify-between space-y-4`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                  Current Market Stance
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-gray-300 border border-white/10">
                  {data.confidence}% Confidence
                </span>
              </div>

              <div className="flex items-center gap-4 my-1">
                <div className={`p-3.5 rounded-2xl bg-black/40 border ${theme.border} text-white shadow-lg`}>
                  <IconComp className={`w-8 h-8 ${theme.color}`} />
                </div>
                <div>
                  <h4 className={`text-2xl md:text-3xl font-black font-['Outfit'] uppercase tracking-wider ${theme.color}`}>
                    {data.sentiment}
                  </h4>
                  <p className="text-xs text-gray-300 font-mono mt-0.5">
                    Score: <strong className="text-white">{data.score}</strong> / 100
                  </p>
                </div>
              </div>

              {/* Score Meter Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-mono text-gray-400">
                  <span>Bearish (0)</span>
                  <span>Neutral (50)</span>
                  <span>Bullish (100)</span>
                </div>
                <div className="w-full h-3 bg-black/50 rounded-full p-0.5 border border-white/10 overflow-hidden relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${data.score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full rounded-full bg-gradient-to-r ${theme.barBg}`}
                  />
                </div>
              </div>
            </div>

            {/* Right Box: AI Summary Commentary */}
            <div className="md:col-span-7 bg-black/30 p-5 rounded-xl border border-white/5 flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 font-['Outfit'] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                <span>Gemini Quantitative Market Analysis</span>
              </div>

              <p className="text-xs md:text-sm text-gray-200 leading-relaxed font-sans">
                "{data.summary}"
              </p>

              <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 pt-2 border-t border-white/5">
                <span>Data Source: SidraChain Mainnet Indexer</span>
                <span className="text-yellow-400 font-semibold">{data.provider}</span>
              </div>
            </div>
          </div>

          {/* Key Drivers Bullet Cards */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider font-['Outfit'] flex items-center gap-1.5">
              <span>Primary Trend Catalysts</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {data.keyFactors.map((factor, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-black/40 border border-white/5 hover:border-white/15 transition-all text-xs text-gray-300 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Token Signal Matrix Preview */}
          {data.signals && data.signals.length > 0 && (
            <div className="space-y-2 pt-1 border-t border-white/5">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider font-['Outfit']">
                Individual Token Sentiment Signals
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {data.signals.map((sig, idx) => {
                  const sigTheme = getSentimentTheme(sig.sentiment);
                  return (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-black/40 border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between space-y-1"
                      title={sig.reason}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs font-mono">{sig.symbol}</span>
                        <span className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded ${sigTheme.bg} ${sigTheme.color}`}>
                          {sig.sentiment}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-400 line-clamp-1 font-mono">{sig.reason}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
