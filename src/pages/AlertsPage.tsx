import React, { useEffect, useState } from 'react';
import { PriceAlert } from '../types/index';
import { Bell, Plus, Trash2, CheckCircle, ArrowUpRight, ArrowDownRight, BellRing } from 'lucide-react';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form states
  const [symbol, setSymbol] = useState('FBAY');
  const [targetPrice, setTargetPrice] = useState('50');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [email, setEmail] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alerts');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (err) {
      console.error('Failed to fetch price alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !targetPrice) return;

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenSymbol: symbol,
          targetPriceSda: targetPrice,
          condition,
          userEmail: email
        })
      });

      if (res.ok) {
        setShowModal(false);
        fetchAlerts();
      }
    } catch (err) {
      console.error('Error creating alert:', err);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchAlerts();
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e0e2e6] font-['Outfit'] flex items-center gap-2">
            <BellRing className="w-6 h-6 text-[#f2ca50]" />
            Price Alerts & Volatility Signals
          </h1>
          <p className="text-xs md:text-sm text-[#d0c5af] mt-1">
            Configure automated telemetry threshold triggers for instant market shift notifications.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-[0_0_15px_rgba(242,202,80,0.2)]"
        >
          <Plus className="w-4 h-4" /> Create Alert
        </button>
      </div>

      {/* Alerts Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-gray-400">Loading price alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400 space-y-2">
            <Bell className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="font-bold text-[#e0e2e6]">No price alerts configured</p>
            <p>Set a threshold above or below target price in SDA to get notified.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-[#e0e2e6]">
              <thead>
                <tr className="border-b border-white/10 bg-black/30 text-[11px] font-semibold text-[#d0c5af] uppercase">
                  <th className="py-3.5 px-6">Asset</th>
                  <th className="py-3.5 px-6">Condition</th>
                  <th className="py-3.5 px-6 font-mono">Target Price (SDA)</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Created At</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {alerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-6 font-bold font-sans text-sm text-[#e0e2e6]">
                      {alert.tokenSymbol}
                    </td>
                    <td className="py-4 px-6 font-sans">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        alert.condition === 'ABOVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {alert.condition === 'ABOVE' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {alert.condition === 'ABOVE' ? 'Price Rises Above' : 'Price Drops Below'}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-sm text-[#f2ca50]">
                      {alert.targetPriceSda} SDA
                    </td>
                    <td className="py-4 px-6 font-sans">
                      <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Active Watching
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-400 font-sans">
                      {new Date(alert.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right font-sans">
                      <button
                        onClick={() => handleDeleteAlert(alert.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-[#101417] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-[#e0e2e6] font-['Outfit'] mb-4">
              Configure Price Threshold Alert
            </h3>

            <form onSubmit={handleCreateAlert} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 mb-1">Token Symbol</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="FBAY, GPC, RIDEX..."
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-[#e0e2e6] font-mono focus:border-[#f2ca50] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Trigger Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as 'ABOVE' | 'BELOW')}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-[#e0e2e6] focus:border-[#f2ca50] outline-none"
                >
                  <option value="ABOVE">Price Rises Above (&gt;)</option>
                  <option value="BELOW">Price Drops Below (&lt;)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Target Price (SDA)</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-[#e0e2e6] font-mono focus:border-[#f2ca50] outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-1">Notification Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="trader@domain.com"
                  className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-[#e0e2e6] focus:border-[#f2ca50] outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#f2ca50] text-[#3c2f00] font-bold"
                >
                  Save Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
