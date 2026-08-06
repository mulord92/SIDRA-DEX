import React, { useEffect, useState } from 'react';
import { Token, VerificationStatus, AuditLog } from '../types/index';
import { DemoDataBadge } from '../components/DemoDataBadge';
import { ShieldCheck, Lock, CheckCircle, XCircle, RefreshCw, Layers, Plus, Power } from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [adminToken, setAdminToken] = useState<string>('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [activeProvider, setActiveProvider] = useState<string>('demo');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  // New Token Form State
  const [newSymbol, setNewSymbol] = useState('');
  const [newName, setNewName] = useState('');
  const [newContract, setNewContract] = useState('');
  const [newNetwork, setNewNetwork] = useState('SidraChain Mainnet');
  const [newPrice, setNewPrice] = useState('10.0');
  const [newStatus, setNewStatus] = useState<VerificationStatus>('Verified');
  const [addMsg, setAddMsg] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminToken.trim()) {
      setIsAuthenticated(true);
      setLoginError(null);
      fetchAdminData(adminToken.trim());
    } else {
      setLoginError('Please enter admin secret key');
    }
  };

  const fetchAdminData = async (secret: string) => {
    setLoading(true);
    try {
      const [tokensRes, logsRes] = await Promise.all([
        fetch('/api/tokens?limit=100'),
        fetch('/api/admin/audit-logs', {
          headers: { Authorization: `Bearer ${secret}` }
        })
      ]);

      if (tokensRes.ok) {
        const d = await tokensRes.json();
        setTokens(d.tokens || []);
      }

      if (logsRes.ok) {
        const logs = await logsRes.json();
        setAuditLogs(logs);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchProvider = async (providerKey: string) => {
    try {
      const res = await fetch('/api/admin/provider', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ providerKey })
      });

      if (res.ok) {
        setActiveProvider(providerKey);
        fetchAdminData(adminToken);
      }
    } catch (err) {
      console.error('Error switching provider:', err);
    }
  };

  const handleUpdateStatus = async (symbol: string, status: VerificationStatus) => {
    try {
      const res = await fetch(`/api/admin/tokens/${symbol}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        fetchAdminData(adminToken);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSymbol || !newName || !newContract) return;

    try {
      const res = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          symbol: newSymbol.toUpperCase(),
          name: newName,
          contractAddress: newContract,
          network: newNetwork,
          priceSda: parseFloat(newPrice),
          verificationStatus: newStatus
        })
      });

      if (res.ok) {
        setAddMsg(`Token ${newSymbol.toUpperCase()} added successfully.`);
        setNewSymbol('');
        setNewName('');
        setNewContract('');
        fetchAdminData(adminToken);
      }
    } catch (err) {
      console.error('Error creating token:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-16">
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#f2ca50]" />
            <h2 className="text-lg font-bold text-[#e0e2e6] font-['Outfit']">Admin Verification Access</h2>
          </div>
          <p className="text-xs text-[#d0c5af]">
            Enter the admin authorization token to manage data providers, verify token contracts, and review system audit logs.
          </p>

          <form onSubmit={handleLogin} className="space-y-3 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Admin Secret Token</label>
              <input
                type="password"
                value={adminToken}
                onChange={(e) => setAdminToken(e.target.value)}
                placeholder="Enter secret (Default dev key: admin123)"
                className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-[#e0e2e6] focus:border-[#f2ca50] outline-none font-mono"
              />
            </div>

            {loginError && <p className="text-red-400 text-[11px]">{loginError}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold rounded-xl transition-colors"
            >
              Authenticate Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#e0e2e6] font-['Outfit'] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#f2ca50]" />
            Admin Verification Portal
          </h1>
          <p className="text-xs md:text-sm text-[#d0c5af] mt-1">
            Manage data provider instances, modify verification status badges, and inspect system logs.
          </p>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-semibold hover:bg-red-500/20 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Provider Switcher */}
      <div className="glass-panel rounded-2xl p-5 space-y-3">
        <h2 className="text-sm font-bold text-[#e0e2e6] uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#f2ca50]" /> Active Data Provider Instance
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => handleSwitchProvider('demo')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeProvider === 'demo'
                ? 'bg-[#f2ca50]/10 border-[#f2ca50] text-[#f2ca50]'
                : 'bg-[#1d2023] border-white/5 text-gray-400 hover:border-white/20'
            }`}
          >
            <p className="font-bold text-xs">Demo Data Provider</p>
            <p className="text-[10px] opacity-80 mt-1">Simulated volatile feed for testing</p>
          </button>

          <button
            onClick={() => handleSwitchProvider('official')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeProvider === 'official'
                ? 'bg-[#f2ca50]/10 border-[#f2ca50] text-[#f2ca50]'
                : 'bg-[#1d2023] border-white/5 text-gray-400 hover:border-white/20'
            }`}
          >
            <p className="font-bold text-xs">Official Sidra API</p>
            <p className="text-[10px] opacity-80 mt-1">Direct official API endpoint integration</p>
          </button>

          <button
            onClick={() => handleSwitchProvider('indexer')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeProvider === 'indexer'
                ? 'bg-[#f2ca50]/10 border-[#f2ca50] text-[#f2ca50]'
                : 'bg-[#1d2023] border-white/5 text-gray-400 hover:border-white/20'
            }`}
          >
            <p className="font-bold text-xs">Indexer Provider</p>
            <p className="text-[10px] opacity-80 mt-1">Decentralized contract indexer feed</p>
          </button>

          <button
            onClick={() => handleSwitchProvider('sidradex_web')}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeProvider === 'sidradex_web'
                ? 'bg-[#f2ca50]/10 border-[#f2ca50] text-[#f2ca50]'
                : 'bg-[#1d2023] border-white/5 text-gray-400 hover:border-white/20'
            }`}
          >
            <p className="font-bold text-xs">Sidra Dex Live</p>
            <p className="text-[10px] opacity-80 mt-1">Live on-chain pool pricing engine</p>
          </button>
        </div>
      </div>

      {/* Add New Token Section */}
      <div className="glass-panel rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-bold text-[#e0e2e6] uppercase tracking-wider flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#f2ca50]" /> Register New Token Asset
        </h2>

        {addMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
            {addMsg}
          </div>
        )}

        <form onSubmit={handleCreateToken} className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-gray-400 mb-1">Symbol</label>
            <input
              type="text"
              value={newSymbol}
              onChange={(e) => setNewSymbol(e.target.value)}
              placeholder="e.g. SDAO"
              className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-[#e0e2e6] font-mono focus:border-[#f2ca50] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Token Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sidra DAO"
              className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-[#e0e2e6] focus:border-[#f2ca50] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Contract Address</label>
            <input
              type="text"
              value={newContract}
              onChange={(e) => setNewContract(e.target.value)}
              placeholder="0x..."
              className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-[#e0e2e6] font-mono focus:border-[#f2ca50] outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Network</label>
            <input
              type="text"
              value={newNetwork}
              onChange={(e) => setNewNetwork(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-[#e0e2e6] focus:border-[#f2ca50] outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Price (SDA)</label>
            <input
              type="number"
              step="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-[#e0e2e6] font-mono focus:border-[#f2ca50] outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-1">Initial Verification Status</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as VerificationStatus)}
              className="w-full bg-[#0a0a0c] border border-white/10 rounded-xl px-3 py-2 text-[#e0e2e6] focus:border-[#f2ca50] outline-none"
            >
              <option value="Verified">Verified</option>
              <option value="Pending Review">Pending Review</option>
              <option value="Unverified">Unverified</option>
            </select>
          </div>

          <div className="md:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#f2ca50] hover:bg-[#ffe088] text-[#3c2f00] font-bold rounded-xl transition-colors"
            >
              Register Asset
            </button>
          </div>
        </form>
      </div>

      {/* Token Verification Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden space-y-3 p-5">
        <h2 className="text-sm font-bold text-[#e0e2e6] uppercase tracking-wider">
          Token Verification Management
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs text-[#e0e2e6]">
            <thead>
              <tr className="border-b border-white/10 bg-black/30 text-[11px] font-semibold text-[#d0c5af] uppercase">
                <th className="py-3 px-4">Asset</th>
                <th className="py-3 px-4">Contract</th>
                <th className="py-3 px-4 font-mono">Price (SDA)</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Verification Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {tokens.map((t) => (
                <tr key={t.id} className="hover:bg-white/5">
                  <td className="py-3.5 px-4 font-sans font-bold text-sm">
                    {t.name} <span className="text-xs text-gray-400">({t.symbol})</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-400">
                    {t.contractAddress.slice(0, 10)}...{t.contractAddress.slice(-6)}
                  </td>
                  <td className="py-3.5 px-4 font-bold">{t.priceSda.toFixed(2)} SDA</td>
                  <td className="py-3.5 px-4 font-sans">
                    <DemoDataBadge status={t.verificationStatus} isDemoData={false} />
                  </td>
                  <td className="py-3.5 px-4 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleUpdateStatus(t.symbol, 'Verified')}
                        className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-[10px] font-bold border border-emerald-500/20"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(t.symbol, 'Pending Review')}
                        className="px-2.5 py-1 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-[10px] font-bold border border-blue-500/20"
                      >
                        Pending
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(t.symbol, 'Unverified')}
                        className="px-2.5 py-1 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 rounded-lg text-[10px] font-bold border border-amber-500/20"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden p-5 space-y-3">
        <h2 className="text-sm font-bold text-[#e0e2e6] uppercase tracking-wider">
          System Audit Trail
        </h2>

        {auditLogs.length === 0 ? (
          <p className="text-xs text-gray-400 py-4">No audit logs recorded.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs text-[#e0e2e6]">
              <thead>
                <tr className="border-b border-white/10 bg-black/30 text-[11px] font-semibold text-[#d0c5af] uppercase">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Performed By</th>
                  <th className="py-2.5 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="py-2.5 px-4 text-gray-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-[#f2ca50]">{log.action}</td>
                    <td className="py-2.5 px-4 text-gray-300">{log.performedBy}</td>
                    <td className="py-2.5 px-4 text-gray-400">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
