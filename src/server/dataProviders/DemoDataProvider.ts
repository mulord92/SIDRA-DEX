import { IDataProvider } from './IDataProvider.js';
import { Token, ScanResult, SwapEstimate, PricePoint, MarketGlobalStats } from '../../types/index.js';

export class DemoDataProvider implements IDataProvider {
  name = 'Sidra Demo Data Provider';
  type: 'demo' = 'demo';

  private mockTokens: Token[] = [
    {
      id: 'token-fbay',
      rank: 1,
      name: 'FalconBay',
      symbol: 'FBAY',
      logoUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=100&auto=format&fit=crop&q=80',
      priceSda: 42.15,
      priceUsd: 12.45,
      change24h: 12.4,
      volume24hSda: 1200000,
      volume24hUsd: 3540000,
      liquidityUsd: 5400000,
      holdersCount: 8420,
      verificationStatus: 'Verified',
      contractAddress: '0x3a92b109e23f8101742a98f12c3328e192fb1f3a',
      network: 'SidraChain Mainnet',
      isDemoData: true,
      dataSource: 'Demo Data',
      lastUpdated: new Date().toISOString(),
      totalSupply: 100000000,
      circulatingSupply: 10000000,
      marketCapUsd: 124500000,
      fdvUsd: 1245000000,
      description: 'FalconBay is a decentralized liquidity layer and asset bridge designed for fast cross-network transactions on SidraChain.',
      websiteUrl: 'https://falconbay.demo.sidraswap',
      explorerUrl: 'https://ledger.sidrachain.com/token/0x3a92b109e23f8101742a98f12c3328e192fb1f3a',
      recentTransactions: [
        {
          id: 'tx-1',
          type: 'Buy',
          amountSda: 1500,
          amountToken: 35.58,
          usdValue: 442.9,
          txHash: '0x8f2a...91ce',
          timestamp: '2 mins ago',
          fromAddress: '0x71a...829a',
          toAddress: '0x3a9...1f3a'
        },
        {
          id: 'tx-2',
          type: 'Sell',
          amountSda: 800,
          amountToken: 18.98,
          usdValue: 236.2,
          txHash: '0x4c11...28ba',
          timestamp: '5 mins ago',
          fromAddress: '0x3a9...1f3a',
          toAddress: '0x10b...920f'
        }
      ]
    },

    {
      id: 'token-sxd',
      rank: 3,
      name: 'Sidra Dex',
      symbol: 'SXD',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80',
      priceSda: 4.55,
      priceUsd: 1.34,
      change24h: 5.1,
      volume24hSda: 2100000,
      volume24hUsd: 6195000,
      liquidityUsd: 9800000,
      holdersCount: 12450,
      verificationStatus: 'Verified',
      contractAddress: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
      network: 'SidraChain Mainnet',
      isDemoData: true,
      dataSource: 'Demo Data',
      lastUpdated: new Date().toISOString(),
      totalSupply: 100000000,
      circulatingSupply: 10000000,
      marketCapUsd: 13400000,
      fdvUsd: 134000000,
      description: 'Official governance and utility token for Sidra DEX automated market maker pools.',
      websiteUrl: 'https://sidradex.demo.sidraswap',
      explorerUrl: 'https://ledger.sidrachain.com/token/0x1f9840a85d5af5bf1d1762f925bdaddc4201f984'
    },
    {
      id: 'token-gpc',
      rank: 4,
      name: 'Global Pay Coin',
      symbol: 'GPC',
      logoUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=100&auto=format&fit=crop&q=80',
      priceSda: 105.42,
      priceUsd: 31.15,
      change24h: -12.4,
      volume24hSda: 420000,
      volume24hUsd: 1239000,
      liquidityUsd: 1800000,
      holdersCount: 3100,
      verificationStatus: 'Pending Review',
      contractAddress: '0x99a22108d20394f10283c71049281a93810294c1',
      network: 'SidraChain Mainnet',
      isDemoData: true,
      dataSource: 'Demo Data',
      lastUpdated: new Date().toISOString(),
      totalSupply: 100000000,
      circulatingSupply: 10000000,
      marketCapUsd: 311500000,
      fdvUsd: 3115000000,
      description: 'Cross-border payment token designed for micro-settlements and remittance transfers.',
      websiteUrl: 'https://gpc.demo.sidraswap',
      explorerUrl: 'https://ledger.sidrachain.com/token/0x99a22108d20394f10283c71049281a93810294c1'
    },
    {
      id: 'token-ridex',
      rank: 5,
      name: 'Ride Exchange',
      symbol: 'RIDEX',
      logoUrl: 'https://images.unsplash.com/photo-1639762681057-408e52192e55?w=100&auto=format&fit=crop&q=80',
      priceSda: 3.10,
      priceUsd: 0.91,
      change24h: -7.8,
      volume24hSda: 2500000,
      volume24hUsd: 7375000,
      liquidityUsd: 800000,
      holdersCount: 1980,
      verificationStatus: 'Unverified',
      contractAddress: '0xef02189a01f22e84120938491028192a01f9284d',
      network: 'SidraChain Mainnet',
      isDemoData: true,
      dataSource: 'Demo Data',
      lastUpdated: new Date().toISOString(),
      totalSupply: 100000000,
      circulatingSupply: 10000000,
      marketCapUsd: 9100000,
      fdvUsd: 91000000,
      description: 'DeFi yield farming aggregator token operating on SidraChain liquidity vaults.',
      websiteUrl: 'https://ridex.demo.sidraswap',
      explorerUrl: 'https://ledger.sidrachain.com/token/0xef02189a01f22e84120938491028192a01f9284d'
    },
    {
      id: 'token-sda',
      rank: 0,
      name: 'Sidra Native Token',
      symbol: 'SDA',
      logoUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=100&auto=format&fit=crop&q=80',
      priceSda: 1.0,
      priceUsd: 1.2405,
      change24h: 0.8,
      volume24hSda: 15400000,
      volume24hUsd: 19103700,
      liquidityUsd: 45000000,
      holdersCount: 142080,
      verificationStatus: 'Verified',
      contractAddress: '0x0000000000000000000000000000000000000000',
      network: 'Sidra Chain',
      isDemoData: true,
      dataSource: 'Demo Data',
      lastUpdated: new Date().toISOString(),
      totalSupply: 2100000000,
      circulatingSupply: 1420000000,
      marketCapUsd: 1761510000,
      fdvUsd: 2605050000,
      description: 'The native gas and utility token powering the SidraChain proof-of-work/proof-of-stake hybrid blockchain.',
      websiteUrl: 'https://sidrachain.com',
      explorerUrl: 'https://ledger.sidrachain.com'
    }
  ];

  async getGlobalStats(): Promise<MarketGlobalStats> {
    return {
      tokensTracked: 14208,
      totalMarketValueUsd: 2400000000,
      volume24hUsd: 84500000,
      totalLiquidityUsd: 1100000000,
      marketSentiment: 'Bullish',
      sentimentPercent: 78,
      lastUpdated: new Date().toISOString(),
      isDemoData: true
    };
  }

  async getTokens(): Promise<Token[]> {
    return this.mockTokens;
  }

  async getTokenBySymbol(symbol: string): Promise<Token | null> {
    const found = this.mockTokens.find(
      t => t.symbol.toLowerCase() === symbol.toLowerCase()
    );
    return found || null;
  }

  async scanToken(contractAddress: string, network: string): Promise<ScanResult> {
    const cleanAddr = contractAddress.trim();
    const existing = this.mockTokens.find(
      t => t.contractAddress.toLowerCase() === cleanAddr.toLowerCase()
    );

    if (existing) {
      return {
        contractAddress: existing.contractAddress,
        network: existing.network,
        tokenName: existing.name,
        symbol: existing.symbol,
        verificationStatus: existing.verificationStatus,
        totalSupply: existing.totalSupply,
        circulatingSupply: existing.circulatingSupply,
        holdersCount: existing.holdersCount,
        liquidityUsd: existing.liquidityUsd,
        priceUsd: existing.priceUsd,
        priceSda: existing.priceSda,
        decimals: 18,
        createdAt: '2023-10-12T00:00:00Z',
        latestTxHash: '0x8f2a911a3b8271038e9182390a129ef3100234a9182931a982',
        securityChecks: {
          honeypotPassed: true,
          buyTaxPercent: 2,
          sellTaxPercent: 2,
          contractRenounced: true,
          mintFunctionRevoked: true,
          liquidityLockedPercent: 98,
          riskScore: 'LOW'
        },
        aiRiskSummary: `Token ${existing.symbol} displays low risk indicators. Contract source code is verified on ${network} with liquidity 98% locked for 365 days.`,
        isDemoData: true,
        dataSource: 'Demo Data Provider',
        scannedAt: new Date().toISOString()
      };
    }

    // Dynamic scan result for unmapped address
    const shortAddr = cleanAddr.slice(0, 6) + '...' + cleanAddr.slice(-4);
    return {
      contractAddress: cleanAddr,
      network: network || 'SidraChain Mainnet',
      tokenName: `Sidra Token (${shortAddr})`,
      symbol: `STK-${cleanAddr.slice(2, 5).toUpperCase()}`,
      verificationStatus: 'Pending Review',
      totalSupply: 100000000,
      circulatingSupply: 45000000,
      holdersCount: 1240,
      liquidityUsd: 350000,
      priceUsd: 0.85,
      priceSda: 0.68,
      decimals: 18,
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
      latestTxHash: '0x71a293f0012891238910283901a82930128390123890',
      securityChecks: {
        honeypotPassed: true,
        buyTaxPercent: 3,
        sellTaxPercent: 3,
        contractRenounced: false,
        mintFunctionRevoked: true,
        liquidityLockedPercent: 85,
        riskScore: 'MEDIUM'
      },
      aiRiskSummary: 'Address scanned successfully. Ownership is unrenounced, but liquidity is locked. Exercise standard caution when trading newly listed pools.',
      isDemoData: true,
      dataSource: 'Demo Data Provider',
      scannedAt: new Date().toISOString()
    };
  }

  async calculateSwap(baseSymbol: string, targetSymbol: string, amount: number): Promise<SwapEstimate> {
    const base = await this.getTokenBySymbol(baseSymbol) || this.mockTokens[5]; // SDA
    const target = await this.getTokenBySymbol(targetSymbol) || this.mockTokens[0]; // FBAY

    const baseInUsd = amount * base.priceUsd;
    const targetAmount = baseInUsd / target.priceUsd;
    const exchangeRate = base.priceUsd / target.priceUsd;
    const priceImpact = Math.min(0.5, (amount / (target.liquidityUsd / target.priceUsd)) * 100);

    return {
      baseToken: base.symbol,
      targetToken: target.symbol,
      amountIn: amount,
      estimatedOut: Number(targetAmount.toFixed(4)),
      amountInUsd: Number(baseInUsd.toFixed(2)),
      estimatedOutUsd: Number((targetAmount * target.priceUsd).toFixed(2)),
      exchangeRate: Number(exchangeRate.toFixed(4)),
      priceImpactPercent: Number((-priceImpact).toFixed(2)),
      rateTimestamp: new Date().toISOString(),
      isDemoData: true,
      disclaimer: 'Estimated values only. Actual market values may differ because of liquidity, price movement, and data availability.'
    };
  }

  async getHistoricalData(symbol: string, timeframe: string): Promise<PricePoint[]> {
    const token = await this.getTokenBySymbol(symbol) || this.mockTokens[0];
    const points: PricePoint[] = [];
    const count = timeframe === '1D' ? 24 : timeframe === '7D' ? 14 : timeframe === '1M' ? 30 : 60;
    const basePrice = token.priceSda;

    for (let i = count; i >= 0; i--) {
      const randomNoise = (Math.random() - 0.48) * (basePrice * 0.05);
      const priceSda = Math.max(0.001, basePrice + randomNoise);
      const priceUsd = priceSda * 1.2405;
      
      const now = new Date();
      if (timeframe === '1D') {
        now.setHours(now.getHours() - i);
      } else {
        now.setDate(now.getDate() - i);
      }

      points.push({
        timestamp: now.toISOString(),
        timeLabel: timeframe === '1D' 
          ? `${now.getHours()}:00` 
          : `${now.getMonth() + 1}/${now.getDate()}`,
        priceSda: Number(priceSda.toFixed(4)),
        priceUsd: Number(priceUsd.toFixed(4)),
        volumeUsd: Math.floor(Math.random() * 500000 + 100000)
      });
    }

    return points;
  }
}
