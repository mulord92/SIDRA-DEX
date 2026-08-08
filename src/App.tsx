import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DisclaimerFooter } from './components/DisclaimerFooter';
import { AndroidAppModal } from './components/AndroidAppModal';
import { AuthProvider } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { MarketsPage } from './pages/MarketsPage';
import { TokenDetailPage } from './pages/TokenDetailPage';
import { ScannerPage } from './pages/ScannerPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { AlertsPage } from './pages/AlertsPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { WhaleTrackerPage } from './pages/WhaleTrackerPage';
import { PricingPage } from './pages/PricingPage';
import { DeveloperApiPage } from './pages/DeveloperApiPage';
import { PricingModal } from './components/PricingModal';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [androidModalOpen, setAndroidModalOpen] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);

  // Register Service Worker for Android PWA offline support & WebAPK capabilities
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration skipped:', err);
      });
    }
  }, []);

  // Sync route on popstate or navigation
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handleLocationChange);

    // Override anchor clicks for SPA feel
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target &&
        target.getAttribute('href')?.startsWith('/') &&
        !target.getAttribute('target')
      ) {
        e.preventDefault();
        const href = target.getAttribute('href')!;
        window.history.pushState({}, '', href);
        setCurrentPath(href);
        setMobileMenuOpen(false);
        window.scrollTo(0, 0);
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  // Simple router matcher
  const renderCurrentPage = () => {
    if (currentPath === '/' || currentPath === '') {
      return <DashboardPage />;
    }
    if (currentPath.startsWith('/markets')) {
      return <MarketsPage />;
    }
    if (currentPath.startsWith('/token/')) {
      const symbol = currentPath.replace('/token/', '');
      return <TokenDetailPage symbolParam={symbol} />;
    }
    if (currentPath.startsWith('/scanner')) {
      return <ScannerPage />;
    }
    if (currentPath.startsWith('/calculator')) {
      return <CalculatorPage />;
    }
    if (currentPath.startsWith('/watchlist')) {
      return <WatchlistPage />;
    }
    if (currentPath.startsWith('/alerts')) {
      return <AlertsPage />;
    }
    if (currentPath.startsWith('/about')) {
      return <AboutPage />;
    }
    if (currentPath.startsWith('/admin')) {
      return <AdminPage />;
    }
    if (currentPath.startsWith('/whales')) {
      return <WhaleTrackerPage />;
    }
    if (currentPath.startsWith('/pricing')) {
      return <PricingPage />;
    }
    if (currentPath.startsWith('/developer')) {
      return <DeveloperApiPage />;
    }

    // Default fallback
    return <DashboardPage />;
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-[#050b1a] text-white font-sans selection:bg-yellow-500/30 selection:text-yellow-400">
        {/* Top Header */}
        <Header
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenAndroidModal={() => setAndroidModalOpen(true)}
          onUpgradeClick={() => setPricingModalOpen(true)}
        />

        <div className="flex flex-1 relative">
          {/* Left Navigation Sidebar */}
          <Sidebar
            activePath={currentPath}
            isOpenMobile={mobileMenuOpen}
            onCloseMobile={() => setMobileMenuOpen(false)}
            onOpenAndroidModal={() => setAndroidModalOpen(true)}
            onUpgradeClick={() => setPricingModalOpen(true)}
          />

          {/* Main Content Area */}
          <main className="flex-1 md:ml-64 p-4 md:p-8 max-w-7xl mx-auto w-full min-h-[calc(100vh-4rem)] flex flex-col justify-between">
            <div>{renderCurrentPage()}</div>

            {/* Persistent Disclaimer Footer */}
            <DisclaimerFooter />
          </main>
        </div>

        {/* Android App Launcher Modal */}
        <AndroidAppModal
          isOpen={androidModalOpen}
          onClose={() => setAndroidModalOpen(false)}
        />

        {/* Interactive Pricing Modal */}
        <PricingModal
          isOpen={pricingModalOpen}
          onClose={() => setPricingModalOpen(false)}
        />

        {/* Firebase Authentication Modal */}
        <AuthModal />
      </div>
    </AuthProvider>
  );
}
