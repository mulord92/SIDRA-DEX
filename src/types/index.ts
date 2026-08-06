export type VerificationStatus = 'Verified' | 'Unverified' | 'Pending Review' | 'Data Unavailable';

export type DataProviderType = 'demo' | 'official' | 'indexer' | 'sidradex_web';

export interface SidraDexWebPriceRecord {
  symbol: string;
  contractAddress: string;
  priceSda: number;
  inputAmount: number;
  outputAmount: number;
  poolId: string;
  dataSource: string;
  timestamp: string;
  blockNumber?: number;
  quoteRef?: string;
}

export interface TokenTransaction {
  id: string;
  type: 'Buy' | 'Sell' | 'Transfer';
  amountSda: number;
  amountToken: number;
  usdValue: number;
  txHash: string;
  timestamp: string;
  fromAddress: string;
  toAddress: string;
}

export interface PricePoint {
  timestamp: string;
  timeLabel: string;
  priceSda: number;
  priceUsd: number;
  volumeUsd: number;
}

export interface Token {
  id: string;
  rank: number;
  name: string;
  symbol: string;
  logoUrl?: string;
  priceSda: number;
  priceUsd: number;
  change24h: number;
  volume24hSda: number;
  volume24hUsd: number;
  liquidityUsd: number;
  holdersCount: number;
  transfersCount?: number;
  verificationStatus: VerificationStatus;
  contractAddress: string;
  network: string;
  isDemoData: boolean;
  dataSource: string;
  lastUpdated: string;
  totalSupply: number;
  circulatingSupply: number;
  marketCapUsd?: number;
  fdvUsd?: number;
  description?: string;
  websiteUrl?: string;
  explorerUrl?: string;
  recentTransactions?: TokenTransaction[];
  isDisabled?: boolean;
  inputAmount?: number;
  outputAmount?: number;
  poolId?: string;
  blockNumber?: number;
  quoteRef?: string;
}

export interface SecurityCheck {
  honeypotPassed: boolean;
  buyTaxPercent: number;
  sellTaxPercent: number;
  contractRenounced: boolean;
  mintFunctionRevoked: boolean;
  liquidityLockedPercent: number;
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface ScanResult {
  contractAddress: string;
  network: string;
  tokenName: string;
  symbol: string;
  verificationStatus: VerificationStatus;
  totalSupply: number;
  circulatingSupply: number;
  holdersCount: number;
  liquidityUsd: number;
  priceUsd: number;
  priceSda: number;
  decimals: number;
  createdAt: string;
  latestTxHash: string;
  securityChecks: SecurityCheck;
  aiRiskSummary?: string;
  isDemoData: boolean;
  dataSource: string;
  scannedAt: string;
}

export interface SwapEstimate {
  baseToken: string;
  targetToken: string;
  amountIn: number;
  estimatedOut: number;
  amountInUsd: number;
  estimatedOutUsd: number;
  exchangeRate: number;
  priceImpactPercent: number;
  rateTimestamp: string;
  isDemoData: boolean;
  disclaimer: string;
}

export interface PriceAlert {
  id: string;
  tokenSymbol: string;
  targetPriceSda: number;
  condition: 'ABOVE' | 'BELOW';
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string;
  isTriggered: boolean;
  userEmail?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  adminUser: string;
  ipAddress?: string;
}

export interface MarketGlobalStats {
  tokensTracked: number;
  totalMarketValueUsd: number;
  volume24hUsd: number;
  totalLiquidityUsd: number;
  marketSentiment: 'Bullish' | 'Neutral' | 'Bearish';
  sentimentPercent: number;
  lastUpdated: string;
  isDemoData: boolean;
}
