import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BellRing, ArrowUpRight, ArrowDownRight, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { Token } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  db,
  collection,
  addDoc,
  serverTimestamp,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { TokenLogo } from './TokenLogo';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialTokenSymbol?: string;
  tokens: Token[];
  onAlertCreated?: () => void;
}

export const SetPriceAlertModal: React.FC<Props> = ({
  isOpen,
  onClose,
  initialTokenSymbol = 'SDA',
  tokens,
  onAlertCreated
}) => {
  const { user, openAuthModal } = useAuth();
  const [selectedSymbol, setSelectedSymbol] = useState(initialTokenSymbol);
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [thresholdValue, setThresholdValue] = useState<string>('');
  const [channel, setChannel] = useState<'In-App' | 'Email' | 'Webhook'>('In-App');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync selected symbol and reset target value when initialTokenSymbol or modal opens
  useEffect(() => {
    if (isOpen) {
      const sym = initialTokenSymbol || (tokens[0]?.symbol || 'SDA');
      setSelectedSymbol(sym);
      const token = tokens.find(t => t.symbol === sym) || tokens[0];
      if (token) {
        const basePrice = token.priceSda || 1;
        const initialVal = condition === 'ABOVE' ? (basePrice * 1.05).toFixed(4) : (basePrice * 0.95).toFixed(4);
        setThresholdValue(initialVal);
      }
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, initialTokenSymbol, tokens]);

  const currentToken = tokens.find(t => t.symbol === selectedSymbol) || tokens[0];

  const handleSymbolChange = (sym: string) => {
    setSelectedSymbol(sym);
    const token = tokens.find(t => t.symbol === sym);
    if (token) {
      const basePrice = token.priceSda || 1;
      const val = condition === 'ABOVE' ? (basePrice * 1.05).toFixed(4) : (basePrice * 0.95).toFixed(4);
      setThresholdValue(val);
    }
  };

  const applyPercentPreset = (percent: number) => {
    if (!currentToken) return;
    const basePrice = currentToken.priceSda || 1;
    const targetPrice = basePrice * (1 + percent / 100);
    setThresholdValue(targetPrice.toFixed(targetPrice < 0.001 ? 6 : targetPrice < 0.1 ? 4 : 2));
    if (percent > 0) setCondition('ABOVE');
    else setCondition('BELOW');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!user) {
      openAuthModal('signin');
      setErrorMsg('Please sign in or continue as Guest to save price alerts to your Firestore profile.');
      return;
    }

    const numericVal = parseFloat(thresholdValue);
    if (isNaN(numericVal) || numericVal <= 0) {
      setErrorMsg('Please enter a valid target price threshold greater than 0.');
      return;
    }

    setSubmitting(true);
    const alertPath = `users/${user.uid}/alerts`;

    try {
      await addDoc(collection(db, 'users', user.uid, 'alerts'), {
        tokenSymbol: selectedSymbol,
        type: condition,
        thresholdValue: numericVal,
        channel,
        currentPriceAtCreation: currentToken?.priceSda || 0,
        active: true,
        createdAt: serverTimestamp()
      });

      setSuccessMsg(`Price Alert set! ${selectedSymbol} when price goes ${condition.toLowerCase()} ${numericVal} SDA.`);
      if (onAlertCreated) onAlertCreated();

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Failed to create Firestore alert:', err);
      try {
        handleFirestoreError(err, OperationType.WRITE, alertPath);
      } catch (formattedErr: any) {
        setErrorMsg('Failed to save alert to Firestore profile. Please check permissions.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-lg bg-[#0b1329] border border-yellow-500/30 rounded-2xl p-6 shadow-2xl overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="p-3 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                Set Price Threshold Alert
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Save target triggers directly to your cloud Firestore profile
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Token Selector & Current Price Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Select Token
                </label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => handleSymbolChange(e.target.value)}
                  className="w-full bg-[#050b1a] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-yellow-500/50 transition-all font-semibold"
                >
                  {tokens.map((t) => (
                    <option key={t.id || t.symbol} value={t.symbol} className="bg-[#0b1329] text-white">
                      {t.symbol} - {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {currentToken && (
                <div className="bg-[#050b1a] border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TokenLogo token={currentToken} size="xs" />
                    <div>
                      <p className="text-[10px] text-gray-400 font-semibold uppercase">Live Market Rate</p>
                      <p className="text-xs font-mono font-bold text-yellow-400">
                        {currentToken.priceSda.toFixed(currentToken.priceSda < 0.001 ? 6 : currentToken.priceSda < 0.1 ? 4 : 2)} SDA
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-semibold font-mono ${currentToken.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {currentToken.change24h >= 0 ? '+' : ''}{currentToken.change24h}%
                  </span>
                </div>
              )}
            </div>

            {/* Condition: ABOVE vs BELOW */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Trigger Condition
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCondition('ABOVE')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    condition === 'ABOVE'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 shadow-md'
                      : 'bg-[#050b1a] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Rises Above
                </button>
                <button
                  type="button"
                  onClick={() => setCondition('BELOW')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition-all ${
                    condition === 'BELOW'
                      ? 'bg-red-500/20 border-red-500/50 text-red-400 shadow-md'
                      : 'bg-[#050b1a] border-white/10 text-gray-400 hover:text-white'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  Drops Below
                </button>
              </div>
            </div>

            {/* Threshold Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
                  Target Price Threshold (SDA)
                </label>
                <span className="text-[10px] text-gray-400 font-mono">
                  Current: {currentToken?.priceSda.toFixed(4)} SDA
                </span>
              </div>
              <input
                type="number"
                step="any"
                required
                value={thresholdValue}
                onChange={(e) => setThresholdValue(e.target.value)}
                placeholder="e.g. 15.50"
                className="w-full bg-[#050b1a] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 transition-all"
              />

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-gray-400 mr-1 font-semibold">Presets:</span>
                {[
                  { label: '+5%', pct: 5 },
                  { label: '+10%', pct: 10 },
                  { label: '+25%', pct: 25 },
                  { label: '-5%', pct: -5 },
                  { label: '-10%', pct: -10 },
                  { label: '-25%', pct: -25 }
                ].map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => applyPercentPreset(preset.pct)}
                    className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-mono text-gray-300 hover:text-white transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Alert Delivery Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['In-App', 'Email', 'Webhook'] as const).map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all ${
                      channel === ch
                        ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400'
                        : 'bg-[#050b1a] border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {/* Auth note or Submit */}
            <div className="pt-2">
              {!user && (
                <div className="mb-3 p-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-xs flex items-center justify-between">
                  <span>Sign in required to persist alerts in Firestore</span>
                  <button
                    type="button"
                    onClick={() => openAuthModal('signin')}
                    className="font-bold underline text-white hover:text-yellow-400 ml-2"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-yellow-500 to-amber-500 text-black hover:opacity-95 transition-all shadow-lg shadow-yellow-500/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Save Target Price Alert to Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
