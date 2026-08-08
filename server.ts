import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { providerManager } from './src/server/dataProviders/ProviderManager.js';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Basic Rate Limiting simulation in-memory
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 1000; // 1000 requests per minute for reliable live polling

    const userLimit = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
    } else {
      userLimit.count++;
    }

    rateLimitMap.set(ip, userLimit);

    if (userLimit.count > maxRequests) {
      res.setHeader('Content-Type', 'application/json');
      res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
      return;
    }
  }
  next();
});

// Admin Auth Middleware helper
function verifyAdminAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'sidradmin2026';

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid token format.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (token !== adminSecret) {
    res.status(403).json({ error: 'Forbidden: Invalid admin credential passcode.' });
    return;
  }

  next();
}

// ================= API ROUTES =================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    appName: 'SIDRA SWAP WATCH',
    activeProvider: providerManager.getActiveProviderType(),
    providerName: providerManager.getActiveProvider().name,
    timestamp: new Date().toISOString()
  });
});

// Explicit static serving for PWA Android Manifest & Service Worker
app.get('/manifest.json', (req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json');
  res.sendFile(path.join(process.cwd(), 'public', 'manifest.json'));
});

app.get('/sw.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(process.cwd(), 'public', 'sw.js'));
});

// Global stats
app.get('/api/stats', async (req, res) => {
  try {
    const stats = await providerManager.getActiveProvider().getGlobalStats();
    res.json(stats);
  } catch (error: any) {
    res.status(503).json({ error: error?.message || 'SidraDEX market data is temporarily unavailable.' });
  }
});

// Tokens list (search, filter, sort, pagination)
app.get('/api/tokens', async (req, res) => {
  try {
    const { search, status, sortBy = 'rank', sortOrder = 'asc', page = '1', limit = '10' } = req.query;

    let tokens = await providerManager.getAllTokens();

    // Filter by search
    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      tokens = tokens.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.symbol.toLowerCase().includes(q) ||
        t.contractAddress.toLowerCase().includes(q)
      );
    }

    // Filter by verification status or Gainers / Losers
    if (status && typeof status === 'string' && status !== 'All') {
      if (status === 'Gainers') {
        tokens = tokens.filter(t => t.change24h > 0);
      } else if (status === 'Losers') {
        tokens = tokens.filter(t => t.change24h < 0);
      } else {
        tokens = tokens.filter(t => t.verificationStatus.toLowerCase() === status.toLowerCase());
      }
    }

    // Sorting
    tokens.sort((a, b) => {
      let valA: any = (a as any)[sortBy as string];
      let valB: any = (b as any)[sortBy as string];

      if (valA === undefined) valA = 0;
      if (valB === undefined) valB = 0;

      if (typeof valA === 'string') {
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    // Pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 10;
    const totalCount = tokens.length;
    const totalPages = Math.ceil(totalCount / limitNum) || 1;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedTokens = tokens.slice(startIndex, startIndex + limitNum);

    res.json({
      tokens: paginatedTokens,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages
      },
      providerInfo: {
        type: providerManager.getActiveProviderType(),
        name: providerManager.getActiveProvider().name
      }
    });
  } catch (error: any) {
    res.status(503).json({ error: error?.message || 'SidraDEX market data is temporarily unavailable.' });
  }
});

// Single token detail
app.get('/api/tokens/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const token = await providerManager.getTokenBySymbol(symbol);

    if (!token) {
      res.status(404).json({ error: `Token with symbol '${symbol}' not found` });
      return;
    }

    res.json(token);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch token details' });
  }
});

// Token price history for charts
app.get('/api/tokens/:symbol/history', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const timeframe = (req.query.timeframe as string) || '1D';

    const history = await providerManager.getActiveProvider().getHistoricalData(symbol, timeframe);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
});

// Market Intelligence API (AI momentum, volume, liquidity, support/resistance, RSI, MACD)
app.get('/api/market-intelligence/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const token = await providerManager.getTokenBySymbol(symbol);

    const price = token ? token.priceSda : 50;
    const change = token ? token.change24h : 3.5;
    const vol = token ? token.volume24hSda : 250000;

    const rsi = Math.min(85, Math.max(25, 52 + (change * 1.8)));
    const macdValue = +(change * 0.045).toFixed(3);
    const momentum = change > 5 ? 'Strong Bullish' : change > 0 ? 'Moderate Bullish' : change > -5 ? 'Consolidating' : 'Bearish Distribution';

    const intelligence = {
      tokenSymbol: symbol,
      tokenName: token ? token.name : symbol,
      aiSummary: `${symbol} is displaying ${momentum.toLowerCase()} price structure on Sidra DEX. Liquidity depth is healthy across pools with strong buyer defense near ${(price * 0.94).toFixed(3)} SDA.`,
      momentumScore: Math.min(96, Math.max(20, Math.round(65 + change * 2))),
      volumeAnomalyScore: vol > 200000 ? 82 : 45,
      liquidityDepthScore: token?.liquidityUsd && token.liquidityUsd > 100000 ? 88 : 60,
      supportPriceSda: +(price * 0.94).toFixed(4),
      resistancePriceSda: +(price * 1.08).toFixed(4),
      rsi14: +rsi.toFixed(1),
      macdSignal: {
        macd: macdValue,
        signal: +(macdValue * 0.8).toFixed(3),
        histogram: +(macdValue * 0.2).toFixed(3),
        interpretation: change > 0 ? 'Bullish Crossover' : 'Neutral-Bearish'
      },
      buySellPressure: {
        buyPercent: Math.min(88, Math.max(30, Math.round(55 + change * 1.2))),
        sellPercent: Math.max(12, Math.min(70, Math.round(45 - change * 1.2)))
      },
      updatedAt: new Date().toISOString()
    };

    res.json(intelligence);
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute market intelligence' });
  }
});

// Whale Tracker API (Large transfers, accumulation, whale wallet actions)
app.get('/api/whales', (req, res) => {
  const transactions = [
    {
      id: 'tx-1',
      tokenSymbol: 'FBAY',
      tokenName: 'FlashBay DEX',
      type: 'BUY',
      amountTokens: 450000,
      amountSda: 2250000,
      amountUsd: 112500,
      walletAddress: '0x8f3c...921a',
      walletLabel: 'Whale Accumulator #1',
      timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
      txHash: '0x3a91b2...9f81',
      tierRequired: 'free'
    },
    {
      id: 'tx-2',
      tokenSymbol: 'WPX',
      tokenName: 'Widpnix',
      type: 'BUY',
      amountTokens: 1200000,
      amountSda: 3600000,
      amountUsd: 180000,
      walletAddress: '0x71ab...442d',
      walletLabel: 'Institutional Market Maker',
      timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
      txHash: '0x81ca39...210f',
      tierRequired: 'free'
    },
    {
      id: 'tx-3',
      tokenSymbol: 'GLNS',
      tokenName: 'Galaxons Treasury',
      type: 'SELL',
      amountTokens: 180000,
      amountSda: 720000,
      amountUsd: 36000,
      walletAddress: '0x44fa...11bc',
      walletLabel: 'Early Seed Backer',
      timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      txHash: '0x55aa12...e490',
      tierRequired: 'elite'
    },
    {
      id: 'tx-4',
      tokenSymbol: 'SDA',
      tokenName: 'Sidra Chain Native',
      type: 'TRANSFER',
      amountTokens: 500000,
      amountSda: 500000,
      amountUsd: 25000,
      walletAddress: '0x99fe...3388',
      walletLabel: 'Arbitrage Vault',
      timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
      txHash: '0x12bb99...77ca',
      tierRequired: 'elite'
    }
  ];

  res.json(transactions);
});

// Sponsored Ads & Promoted Project Banner
app.get('/api/sponsored', (req, res) => {
  const sponsored = [
    {
      id: 'sp-1',
      tokenSymbol: 'FBAY',
      tokenName: 'FlashBay Swap DEX',
      tagline: 'High-speed automated liquidity engine natively built on SidraChain.',
      badgeText: 'Featured Project',
      ctaUrl: '/token/FBAY',
      ctaText: 'View Market Analytics',
      active: true
    },
    {
      id: 'sp-2',
      tokenSymbol: 'WPX',
      tokenName: 'Widpnix',
      tagline: 'High-performance decentralized liquidity protocol and ecosystem asset on SidraChain.',
      badgeText: 'Promoted Pool',
      ctaUrl: '/token/WPX',
      ctaText: 'Explore Deep Pools',
      active: true
    }
  ];

  res.json(sponsored);
});

// Contract Scanner
app.post('/api/scanner/scan', async (req, res) => {
  try {
    const { contractAddress, network = 'SidraChain Mainnet' } = req.body;

    if (!contractAddress || typeof contractAddress !== 'string') {
      res.status(400).json({ error: 'Valid contract address is required' });
      return;
    }

    const scanResult = await providerManager.getActiveProvider().scanToken(contractAddress, network);

    // If Gemini key is available, generate AI Security & Risk Analysis
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `Analyze this crypto smart contract metadata for risk assessment:
Token Name: ${scanResult.tokenName}
Symbol: ${scanResult.symbol}
Contract Address: ${scanResult.contractAddress}
Network: ${scanResult.network}
Holders: ${scanResult.holdersCount}
Liquidity: $${scanResult.liquidityUsd}
Honeypot Passed: ${scanResult.securityChecks.honeypotPassed}
Buy/Sell Tax: ${scanResult.securityChecks.buyTaxPercent}% / ${scanResult.securityChecks.sellTaxPercent}%
Contract Renounced: ${scanResult.securityChecks.contractRenounced}
Mint Function Revoked: ${scanResult.securityChecks.mintFunctionRevoked}

Provide a concise 2-sentence institutional security recommendation for traders.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        if (response.text) {
          scanResult.aiRiskSummary = response.text.trim();
        }
      } catch (geminiError) {
        console.warn('Gemini AI summary generation skipped:', geminiError);
      }
    }

    res.json(scanResult);
  } catch (error) {
    res.status(500).json({ error: 'Failed to scan contract address' });
  }
});

// SDA Calculator
app.post('/api/calculator/estimate', async (req, res) => {
  try {
    const { baseSymbol = 'SDA', targetSymbol = 'USDT', amount = 1000 } = req.body;
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json({ error: 'Amount must be a positive number' });
      return;
    }

    const estimate = await providerManager.getActiveProvider().calculateSwap(
      baseSymbol,
      targetSymbol,
      numAmount
    );

    res.json(estimate);
  } catch (error) {
    res.status(500).json({ error: 'Failed to compute swap estimate' });
  }
});

// Price Alerts
app.get('/api/alerts', (req, res) => {
  res.json(providerManager.getAlerts());
});

app.post('/api/alerts', (req, res) => {
  const { tokenSymbol, targetPriceSda, condition, userEmail } = req.body;

  if (!tokenSymbol || !targetPriceSda || !condition) {
    res.status(400).json({ error: 'Missing required fields: tokenSymbol, targetPriceSda, condition' });
    return;
  }

  const alert = providerManager.addAlert({
    tokenSymbol: tokenSymbol.toUpperCase(),
    targetPriceSda: parseFloat(targetPriceSda),
    condition: condition === 'BELOW' ? 'BELOW' : 'ABOVE',
    isActive: true,
    userEmail
  });

  res.json(alert);
});

app.delete('/api/alerts/:id', (req, res) => {
  const success = providerManager.deleteAlert(req.params.id);
  if (success) {
    res.json({ message: 'Alert deleted successfully' });
  } else {
    res.status(404).json({ error: 'Alert not found' });
  }
});

// ================= ADMIN ROUTES =================

// Admin Login
app.post('/api/admin/login', (req, res) => {
  const { passcode } = req.body;
  const adminSecret = process.env.ADMIN_SECRET_KEY || 'sidradmin2026';

  if (passcode === adminSecret) {
    providerManager.addAuditLog('ADMIN_LOGIN', 'Administrator authenticated successfully.', 'Admin');
    res.json({
      success: true,
      token: adminSecret,
      message: 'Authentication successful'
    });
  } else {
    res.status(401).json({ success: false, error: 'Invalid passcode' });
  }
});

// Add token
app.post('/api/admin/tokens', verifyAdminAuth, async (req, res) => {
  try {
    const token = await providerManager.addOrUpdateToken(req.body, 'Admin');
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save token' });
  }
});

// Edit token
app.put('/api/admin/tokens/:symbol', verifyAdminAuth, async (req, res) => {
  try {
    const symbol = req.params.symbol;
    const token = await providerManager.addOrUpdateToken({ ...req.body, symbol }, 'Admin');
    res.json(token);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update token' });
  }
});

// Update verification status (supports POST /verify, PATCH /status, POST /status)
const handleUpdateStatus = async (req: express.Request, res: express.Response) => {
  try {
    const { symbol } = req.params;
    const { status } = req.body;

    if (!['Verified', 'Unverified', 'Pending Review', 'Data Unavailable'].includes(status)) {
      res.status(400).json({ error: 'Invalid verification status value' });
      return;
    }

    const updated = await providerManager.updateVerificationStatus(symbol, status as any, 'Admin');
    if (!updated) {
      res.status(404).json({ error: 'Token not found' });
      return;
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update token verification status' });
  }
};

app.post('/api/admin/tokens/:symbol/verify', verifyAdminAuth, handleUpdateStatus);
app.post('/api/admin/tokens/:symbol/status', verifyAdminAuth, handleUpdateStatus);
app.patch('/api/admin/tokens/:symbol/status', verifyAdminAuth, handleUpdateStatus);

// Disable / Enable Token Feed
const handleToggleFeed = async (req: express.Request, res: express.Response) => {
  try {
    const { symbol } = req.params;
    const { disabled } = req.body;

    const updated = await providerManager.toggleTokenFeed(symbol, Boolean(disabled), 'Admin');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle token feed' });
  }
};

app.post('/api/admin/tokens/:symbol/toggle-feed', verifyAdminAuth, handleToggleFeed);
app.patch('/api/admin/tokens/:symbol/toggle-feed', verifyAdminAuth, handleToggleFeed);

// Set Provider
app.get('/api/admin/provider', verifyAdminAuth, (req, res) => {
  res.json({
    activeProvider: providerManager.getActiveProviderType(),
    providerName: providerManager.getActiveProvider().name
  });
});

app.post('/api/admin/provider', verifyAdminAuth, (req, res) => {
  const providerType = req.body.providerType || req.body.providerKey;
  if (!['demo', 'official', 'indexer', 'sidradex_web'].includes(providerType)) {
    res.status(400).json({ error: 'Invalid provider type' });
    return;
  }

  providerManager.setActiveProvider(providerType, 'Admin');
  res.json({
    success: true,
    activeProvider: providerManager.getActiveProviderType(),
    providerName: providerManager.getActiveProvider().name
  });
});

// Audit Logs (supports both /api/admin/logs and /api/admin/audit-logs)
app.get('/api/admin/logs', verifyAdminAuth, (req, res) => {
  res.json(providerManager.getAuditLogs());
});
app.get('/api/admin/audit-logs', verifyAdminAuth, (req, res) => {
  res.json(providerManager.getAuditLogs());
});

// Explicit API 404 handler to prevent API calls from returning index.html
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API endpoint ${req.method} ${req.originalUrl} not found` });
});

// Global API Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.path.startsWith('/api/')) {
    console.error('Unhandled API Error:', err);
    res.status(500).json({ error: err?.message || 'Internal server error occurred' });
    return;
  }
  next(err);
});

// ================= VITE INTEGRATION =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!process.env.VERCEL) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`SIDRA SWAP WATCH server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export default app;
