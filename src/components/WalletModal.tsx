import React, { useState } from 'react';
import { X, Check, Shield, Wallet, Copy, Globe, ExternalLink, Network } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  connectedAddress: string | null;
  onConnect: (address: string) => void;
  onDisconnect: () => void;
}

export const WalletModal: React.FC<Props> = ({
  isOpen,
  onClose,
  connectedAddress,
  onConnect,
  onDisconnect
}) => {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [addChainStatus, setAddChainStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const NETWORK_SETTINGS = {
    chainName: 'Sidra Chain',
    rpcUrl: 'https://node.sidrachain.com',
    chainId: 97453,
    chainIdHex: '0x17cBF',
    currencySymbol: 'SDA',
    blockExplorerUrl: 'https://ledger.sidrachain.com'
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAddNetworkToMetaMask = async () => {
    setAddChainStatus('Requesting wallet...');
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        await (window as any).ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: NETWORK_SETTINGS.chainIdHex,
              chainName: NETWORK_SETTINGS.chainName,
              nativeCurrency: {
                name: 'Sidra Native Token',
                symbol: NETWORK_SETTINGS.currencySymbol,
                decimals: 18
              },
              rpcUrls: [NETWORK_SETTINGS.rpcUrl],
              blockExplorerUrls: [NETWORK_SETTINGS.blockExplorerUrl]
            }
          ]
        });
        setAddChainStatus('Successfully Added!');
      } else {
        setAddChainStatus('No Web3 wallet detected. Please copy settings manually.');
      }
    } catch (err: any) {
      setAddChainStatus(err.message || 'Error adding network');
    }
    setTimeout(() => setAddChainStatus(null), 4000);
  };

  const handleSimulateConnect = (walletName: string) => {
    setConnecting(walletName);
    setTimeout(() => {
      const mockAddr = '0x71a' + Math.random().toString(16).slice(2, 6) + '...' + Math.random().toString(16).slice(2, 6);
      onConnect(mockAddr);
      setConnecting(null);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-lg bg-black/90 border border-yellow-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-bold text-white">Connect Wallet & Network Settings</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {connectedAddress ? (
          <div className="py-6 space-y-4">
            <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center">
              <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-semibold mb-1">
                <Check className="w-4 h-4" /> Connected
              </div>
              <p className="font-mono text-sm text-white">{connectedAddress}</p>
            </div>
            <button
              onClick={() => {
                onDisconnect();
                onClose();
              }}
              className="w-full py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl font-medium hover:bg-red-500/20 transition-colors"
            >
              Disconnect Wallet
            </button>
          </div>
        ) : (
          <div className="py-4 space-y-5">
            {/* Network Quick Config Card */}
            <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Network className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider">
                    Official Network Settings
                  </span>
                </div>
                <button
                  onClick={handleAddNetworkToMetaMask}
                  className="px-2.5 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shadow-[0_0_10px_rgba(234,179,8,0.3)]"
                >
                  <Globe className="w-3 h-3" />
                  <span>Add to Wallet</span>
                </button>
              </div>

              {addChainStatus && (
                <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/30 text-[11px] text-yellow-300 font-mono">
                  {addChainStatus}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 rounded bg-black/50 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-sans">Network Name</p>
                    <p className="text-white font-bold">{NETWORK_SETTINGS.chainName}</p>
                  </div>
                  <button onClick={() => handleCopy(NETWORK_SETTINGS.chainName, 'name')} className="text-gray-400 hover:text-yellow-400">
                    {copiedField === 'name' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-2 rounded bg-black/50 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-sans">Chain ID</p>
                    <p className="text-yellow-400 font-bold">{NETWORK_SETTINGS.chainId}</p>
                  </div>
                  <button onClick={() => handleCopy(String(NETWORK_SETTINGS.chainId), 'chain')} className="text-gray-400 hover:text-yellow-400">
                    {copiedField === 'chain' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-2 rounded bg-black/50 border border-white/5 flex items-center justify-between col-span-1 sm:col-span-2">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-sans">RPC URL</p>
                    <p className="text-gray-200 text-[11px] font-bold truncate max-w-[220px] sm:max-w-[340px]">{NETWORK_SETTINGS.rpcUrl}</p>
                  </div>
                  <button onClick={() => handleCopy(NETWORK_SETTINGS.rpcUrl, 'rpc')} className="text-gray-400 hover:text-yellow-400 shrink-0">
                    {copiedField === 'rpc' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-2 rounded bg-black/50 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-sans">Currency Symbol</p>
                    <p className="text-white font-bold">{NETWORK_SETTINGS.currencySymbol}</p>
                  </div>
                  <button onClick={() => handleCopy(NETWORK_SETTINGS.currencySymbol, 'symbol')} className="text-gray-400 hover:text-yellow-400">
                    {copiedField === 'symbol' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="p-2 rounded bg-black/50 border border-white/5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase font-sans">Block Explorer</p>
                    <a href={NETWORK_SETTINGS.blockExplorerUrl} target="_blank" rel="noreferrer" className="text-yellow-400 hover:underline text-[11px] font-bold flex items-center gap-1">
                      ledger.sidrachain.com <ExternalLink className="w-3 h-3 inline" />
                    </a>
                  </div>
                  <button onClick={() => handleCopy(NETWORK_SETTINGS.blockExplorerUrl, 'explorer')} className="text-gray-400 hover:text-yellow-400">
                    {copiedField === 'explorer' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400">
              Select your wallet provider to sync watchlists and personalized price alert preferences.
            </p>

            <button
              onClick={() => handleSimulateConnect('SidraChain Native Wallet')}
              disabled={!!connecting}
              className="w-full p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/30 font-bold text-yellow-400 text-xs">
                  SDA
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-white group-hover:text-yellow-400 transition-colors">
                    Sidra Wallet
                  </p>
                  <p className="text-xs text-gray-400">Official SidraChain extension</p>
                </div>
              </div>
              {connecting === 'SidraChain Native Wallet' ? (
                <span className="text-xs text-yellow-400 animate-pulse">Connecting...</span>
              ) : (
                <span className="material-symbols-outlined text-gray-400 group-hover:text-yellow-400">chevron_right</span>
              )}
            </button>

            <button
              onClick={() => handleSimulateConnect('MetaMask')}
              disabled={!!connecting}
              className="w-full p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/30 text-amber-400 font-bold text-xs">
                  🦊
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-white group-hover:text-yellow-400 transition-colors">
                    MetaMask
                  </p>
                  <p className="text-xs text-gray-400">EVM compatible extension (Chain ID 97453)</p>
                </div>
              </div>
              {connecting === 'MetaMask' ? (
                <span className="text-xs text-yellow-400 animate-pulse">Connecting...</span>
              ) : (
                <span className="material-symbols-outlined text-gray-400 group-hover:text-yellow-400">chevron_right</span>
              )}
            </button>

            <button
              onClick={() => handleSimulateConnect('WalletConnect')}
              disabled={!!connecting}
              className="w-full p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-yellow-500/50 transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/30 text-blue-400 font-bold text-xs">
                  WC
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm text-white group-hover:text-yellow-400 transition-colors">
                    WalletConnect
                  </p>
                  <p className="text-xs text-gray-400">Scan with mobile wallet</p>
                </div>
              </div>
              {connecting === 'WalletConnect' ? (
                <span className="text-xs text-yellow-400 animate-pulse">Connecting...</span>
              ) : (
                <span className="material-symbols-outlined text-gray-400 group-hover:text-yellow-400">chevron_right</span>
              )}
            </button>

            <div className="p-3 rounded-lg bg-black/60 border border-white/5 flex items-start gap-2 text-[11px] text-gray-400 mt-4">
              <Shield className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
              <span>
                SIDRA SWAP WATCH never requests seed phrases or private keys. Connection is read-only for watchlists and platform preferences.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

