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
    const maxRequests = 120; // 120 requests per minute

    const userLimit = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
    } else {
      userLimit.count++;
    }

    rateLimitMap.set(ip, userLimit);

    if (userLimit.count > maxRequests) {
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

    // Filter by verification status
    if (status && typeof status === 'string' && status !== 'All') {
      tokens = tokens.filter(t => t.verificationStatus.toLowerCase() === status.toLowerCase());
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

// Deep Contract Scanner
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

// Update verification status
app.post('/api/admin/tokens/:symbol/verify', verifyAdminAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { status } = req.body;

    if (!['Verified', 'Unverified', 'Pending Review', 'Data Unavailable'].includes(status)) {
      res.status(400).json({ error: 'Invalid verification status value' });
      return;
    }

    const updated = await providerManager.updateVerificationStatus(symbol, status, 'Admin');
    if (!updated) {
      res.status(404).json({ error: 'Token not found' });
      return;
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update token verification status' });
  }
});

// Disable / Enable Token Feed
app.post('/api/admin/tokens/:symbol/toggle-feed', verifyAdminAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { disabled } = req.body;

    const updated = await providerManager.toggleTokenFeed(symbol, Boolean(disabled), 'Admin');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle token feed' });
  }
});

// Set Provider
app.get('/api/admin/provider', verifyAdminAuth, (req, res) => {
  res.json({
    activeProvider: providerManager.getActiveProviderType(),
    providerName: providerManager.getActiveProvider().name
  });
});

app.post('/api/admin/provider', verifyAdminAuth, (req, res) => {
  const { providerType } = req.body;
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

// Audit Logs
app.get('/api/admin/logs', verifyAdminAuth, (req, res) => {
  res.json(providerManager.getAuditLogs());
});

// ================= VITE INTEGRATION =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIDRA SWAP WATCH server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
