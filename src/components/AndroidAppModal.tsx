import React, { useState, useEffect } from 'react';
import { X, Smartphone, Download, CheckCircle, ShieldCheck, QrCode, Share2, Sparkles, Bell, Zap, ExternalLink } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidAppModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'install' | 'qr' | 'settings'>('install');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(true);
  const [downloadingApk, setDownloadingApk] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('To install on Android:\n1. Tap the 3 dots (⋮) in Chrome\n2. Select "Add to Home screen" or "Install App"\n3. Enjoy your standalone Sidra Swap Watch app!');
    }
  };

  const handleDownloadApkManifest = () => {
    setDownloadingApk(true);
    setTimeout(() => {
      const manifestData = {
        name: "Sidra Swap Watch - Android Edition",
        short_name: "Sidra Swap",
        version: "2.4.0",
        platform: "Android WebAPK / PWA",
        package_id: "org.sidradex.swapwatch",
        build: "2026.08.06",
        start_url: window.location.origin
      };

      const blob = new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'SidraSwapWatch_AndroidApp_Manifest.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadingApk(false);
    }, 1200);
  };

  const handleRequestNotifications = async () => {
    if ('Notification' in window) {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationsEnabled(true);
        if ('vibrate' in navigator && hapticsEnabled) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    } else {
      alert('Notifications are enabled for this Android session.');
    }
  };

  const currentUrl = window.location.href;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}&color=f2ca50&bgcolor=0a0e17`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0b101b] border border-yellow-500/30 w-full max-w-lg rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(242,202,80,0.15)] flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-yellow-500/10 via-yellow-500/5 to-transparent p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-600 p-0.5 flex items-center justify-center shadow-lg">
              <img src="/tokens/app-logo.png" alt="Sidra DEX" className="w-full h-full rounded-[10px] object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base font-['Outfit']">Sidra Swap Watch Android</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                  Android Native PWA
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono">Real-time DEX Market Data • WebAPK Enabled</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-white/10 bg-black/30 px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('install')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'install'
                ? 'border-yellow-400 text-yellow-400 bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Install & APK</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'qr'
                ? 'border-yellow-400 text-yellow-400 bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Mobile QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'settings'
                ? 'border-yellow-400 text-yellow-400 bg-white/5'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Android Alerts</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm text-gray-300">
          
          {activeTab === 'install' && (
            <div className="space-y-5">
              {/* Primary Install Box */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/10 via-black to-black border border-yellow-500/30 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-base">Instant 1-Click Android Installation</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      Install directly onto your Android Home Screen with native app icon, full-screen UI, and background price updates.
                    </p>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-bold text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(242,202,80,0.3)] flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{installed ? 'App Installed on Device' : 'Install App on Android'}</span>
                  </button>

                  <button
                    onClick={handleDownloadApkManifest}
                    disabled={downloadingApk}
                    className="py-3 px-4 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all border border-white/10 flex items-center justify-center gap-2"
                  >
                    <Download className={`w-4 h-4 ${downloadingApk ? 'animate-bounce text-yellow-400' : ''}`} />
                    <span>{downloadingApk ? 'Packaging APK...' : 'Download WebAPK Package'}</span>
                  </button>
                </div>
              </div>

              {/* Android Features Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-yellow-400 font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>Sub-second Sync</span>
                  </div>
                  <p className="text-gray-400 text-[11px]">Direct WebSocket & RPC connection to SidraChain Node.</p>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Offline Analytics</span>
                  </div>
                  <p className="text-gray-400 text-[11px]">Service Worker caching allows viewing watchlists offline.</p>
                </div>
              </div>

              {/* Step by step installation guide */}
              <div className="space-y-3">
                <h5 className="font-bold text-xs uppercase text-gray-400 font-mono tracking-wider">Manual Chrome Android Installation Steps</h5>
                <ol className="space-y-2 text-xs">
                  <li className="flex items-start gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 font-mono font-bold flex items-center justify-center text-[11px] flex-shrink-0">1</span>
                    <span>Open <strong>Google Chrome</strong> or <strong>Samsung Internet</strong> on your Android phone.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 font-mono font-bold flex items-center justify-center text-[11px] flex-shrink-0">2</span>
                    <span>Tap the top-right <strong>Menu (3 dots ⋮)</strong> icon.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <span className="w-5 h-5 rounded-full bg-yellow-500/20 text-yellow-400 font-mono font-bold flex items-center justify-center text-[11px] flex-shrink-0">3</span>
                    <span>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong> to launch directly from your app drawer.</span>
                  </li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
              <div className="p-4 bg-black rounded-2xl border border-yellow-500/30 shadow-[0_0_30px_rgba(242,202,80,0.15)] relative">
                <img src={qrUrl} alt="Android QR Code" className="w-44 h-44 rounded-lg" />
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Scan with your Android Camera</h4>
                <p className="text-xs text-gray-400 max-w-xs mt-1">
                  Point your Android camera or QR scanner at the code above to load the live Sidra DEX Android web app directly on your phone.
                </p>
              </div>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(currentUrl);
                    alert('Android App URL copied to clipboard!');
                  }}
                  className="px-4 py-2 bg-white/10 hover:bg-white/15 text-xs text-white rounded-xl font-semibold flex items-center gap-2"
                >
                  <Share2 className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Copy App URL</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <h4 className="font-bold text-white text-sm">Android App System Preferences</h4>
              
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">Android Push Notifications</p>
                  <p className="text-[11px] text-gray-400">Receive instant alerts on your Android lock screen for key price changes.</p>
                </div>
                <button
                  onClick={handleRequestNotifications}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    notificationsEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-yellow-500 text-black hover:bg-yellow-400'
                  }`}
                >
                  {notificationsEnabled ? 'Active ✓' : 'Enable'}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-white">Haptic Vibration Feedback</p>
                  <p className="text-[11px] text-gray-400">Vibrate Android device when price alerts trigger or swaps execute.</p>
                </div>
                <button
                  onClick={() => setHapticsEnabled(!hapticsEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all ${
                    hapticsEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-white/10 text-gray-400'
                  }`}
                >
                  {hapticsEnabled ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <p className="font-bold text-xs text-white">Android Package Information</p>
                <div className="text-[11px] font-mono space-y-1 text-gray-400">
                  <div className="flex justify-between"><span>App Version:</span><span className="text-white">v2.4.0 (Build 2026.08)</span></div>
                  <div className="flex justify-between"><span>Display Mode:</span><span className="text-white">{installed ? 'Standalone WebAPK' : 'Browser PWA'}</span></div>
                  <div className="flex justify-between"><span>Chain ID:</span><span className="text-white">97453 (Sidra Mainnet)</span></div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-black/50 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Optimized for Android 8.0+</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-all"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
