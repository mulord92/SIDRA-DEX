import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BellRing, BellPlus, Trash2, ArrowUpRight, ArrowDownRight, Sparkles, ShieldCheck, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { Token } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  db,
  collection,
  doc,
  deleteDoc,
  onSnapshot,
  handleFirestoreError,
  OperationType
} from '../lib/firebase';
import { TokenLogo } from './TokenLogo';

interface SavedAlert {
  id: string;
  tokenSymbol: string;
  type: 'ABOVE' | 'BELOW';
  thresholdValue: number;
  channel?: string;
  currentPriceAtCreation?: number;
  active?: boolean;
  createdAt?: any;
}

interface Props {
  tokens: Token[];
  onOpenSetAlertModal: (initialSymbol?: string) => void;
}

export const UserPriceAlertsSection: React.FC<Props> = ({ tokens, onOpenSetAlertModal }) => {
  const { user, openAuthModal } = useAuth();
  const [alerts, setAlerts] = useState<SavedAlert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setAlerts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const alertsRef = collection(db, 'users', user.uid, 'alerts');

    const unsubscribe = onSnapshot(
      alertsRef,
      (snapshot) => {
        const fetchedAlerts: SavedAlert[] = [];
        snapshot.forEach((docSnap) => {
          fetchedAlerts.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<SavedAlert, 'id'>)
          });
        });
        // Sort newest first
        fetchedAlerts.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        setAlerts(fetchedAlerts);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching Firestore user alerts:', err);
        setErrorMsg('Failed to sync alerts from your Firestore profile.');
        setLoading(false);
        try {
          handleFirestoreError(err, OperationType.LIST, `users/${user.uid}/alerts`);
        } catch (handled) {
          // Handled
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleDeleteAlert = async (alertId: string) => {
    if (!user) return;
    setDeletingId(alertId);
    setErrorMsg(null);
    const alertPath = `users/${user.uid}/alerts/${alertId}`;

    try {
      await deleteDoc(doc(db, 'users', user.uid, 'alerts', alertId));
    } catch (err) {
      console.error('Failed to delete alert from Firestore:', err);
      setErrorMsg('Could not delete price alert from Firestore profile.');
      try {
        handleFirestoreError(err, OperationType.DELETE, alertPath);
      } catch (handled) {
        // Handled
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
            <BellRing className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#e0e2e6] font-['Outfit'] flex items-center gap-2">
              Your Target Price Alerts
              {alerts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-[10px] font-mono font-bold">
                  {alerts.length} Active
                </span>
              )}
            </h2>
            <p className="text-xs text-[#d0c5af]">
              Real-time Firestore profile price thresholds for SidraChain DEX tokens.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenSetAlertModal()}
          className="px-3.5 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
        >
          <BellPlus className="w-4 h-4" />
          <span>Set Price Alert</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Guest / Unauthenticated Prompt */}
      {!user ? (
        <div className="p-4 rounded-xl bg-[#050b1a] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-yellow-400" />
              Save Price Threshold Alerts to Cloud Profile
            </p>
            <p className="text-[11px] text-gray-400">
              Sign in or continue as Guest to store price targets securely in your Firestore profile.
            </p>
          </div>
          <button
            onClick={() => openAuthModal('signin')}
            className="px-4 py-2 rounded-xl bg-yellow-500 text-black font-bold text-xs hover:bg-yellow-400 transition-colors shrink-0"
          >
            Sign In / Guest
          </button>
        </div>
      ) : loading ? (
        <div className="py-8 text-center flex items-center justify-center gap-2 text-xs text-gray-400">
          <RefreshCw className="w-4 h-4 animate-spin text-yellow-400" />
          <span>Loading Firestore price alerts...</span>
        </div>
      ) : alerts.length === 0 ? (
        <div className="p-6 text-center rounded-xl bg-[#050b1a]/50 border border-dashed border-white/10 space-y-3">
          <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto text-yellow-400">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">No Price Threshold Alerts Set</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Set target price triggers to track break-outs or dips on any of the 88 Sidra tokens.
            </p>
          </div>
          <button
            onClick={() => onOpenSetAlertModal()}
            className="px-4 py-2 rounded-xl bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/40 text-yellow-400 font-bold text-xs transition-all"
          >
            + Create Your First Price Alert
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence>
            {alerts.map((alert) => {
              const matchedToken = tokens.find((t) => t.symbol === alert.tokenSymbol);
              const currentPrice = matchedToken?.priceSda || 0;
              const targetPrice = alert.thresholdValue;

              // Calculate proximity percentage
              let proximityPct = 0;
              if (currentPrice > 0 && targetPrice > 0) {
                proximityPct = ((targetPrice - currentPrice) / currentPrice) * 100;
              }

              const isTriggered =
                alert.type === 'ABOVE' ? currentPrice >= targetPrice : currentPrice <= targetPrice;

              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`p-3.5 rounded-xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                    isTriggered
                      ? 'bg-yellow-500/10 border-yellow-500/40 shadow-lg shadow-yellow-500/5'
                      : 'bg-[#050b1a]/80 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {matchedToken && <TokenLogo token={matchedToken} size="xs" />}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white font-mono">{alert.tokenSymbol}</span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 ${
                              alert.type === 'ABOVE'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {alert.type === 'ABOVE' ? (
                              <>
                                <ArrowUpRight className="w-3 h-3" /> Above
                              </>
                            ) : (
                              <>
                                <ArrowDownRight className="w-3 h-3" /> Below
                              </>
                            )}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                          Channel: <span className="text-gray-300 font-semibold">{alert.channel || 'In-App'}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      disabled={deletingId === alert.id}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Remove Price Alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Target & Current Price Grid */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <p className="text-[10px] text-gray-400 font-sans uppercase">Target Price</p>
                      <p className="font-bold text-yellow-400">
                        {targetPrice.toFixed(targetPrice < 0.001 ? 6 : targetPrice < 0.1 ? 4 : 2)} SDA
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-sans uppercase">Live Price</p>
                      <p className="font-semibold text-white">
                        {currentPrice > 0
                          ? `${currentPrice.toFixed(currentPrice < 0.001 ? 6 : currentPrice < 0.1 ? 4 : 2)} SDA`
                          : 'Updating...'}
                      </p>
                    </div>
                  </div>

                  {/* Proximity / Trigger Status */}
                  <div className="mt-2.5 flex items-center justify-between text-[10px]">
                    {isTriggered ? (
                      <span className="text-yellow-400 font-bold flex items-center gap-1 animate-pulse">
                        <Sparkles className="w-3 h-3" /> TARGET REACHED!
                      </span>
                    ) : (
                      <span className="text-gray-400 font-mono">
                        {proximityPct >= 0 ? `+${proximityPct.toFixed(1)}%` : `${proximityPct.toFixed(1)}%`} away
                      </span>
                    )}

                    <span className="text-[9px] text-gray-500">
                      Cloud Synced
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
