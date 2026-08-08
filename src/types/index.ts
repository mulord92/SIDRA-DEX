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
  openSda?: number;
  highSda?: number;
  lowSda?: number;
  closeSda?: number;
  openUsd?: number;
  highUsd?: number;
  lowUsd?: number;
  closeUsd?: number;
  tradesCount?: number;
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

// Subscription & Monetization Types
export type SubscriptionPlan = 'free' | 'pro' | 'elite';

export interface PlanFeature {
  name: string;
  free: boolean | string;
  pro: boolean | string;
  elite: boolean | string;
  highlight?: boolean;
}

export interface UserSubscription {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'annual';
  isTrialActive: boolean;
  trialDaysLeft: number;
  expiresAt: string;
  paymentMethod?: string;
}

// Whale Tracker
export interface WhaleTransaction {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  type: 'Accumulation' | 'Large Sale' | 'Whale Transfer' | 'LP Injection';
  amountToken: number;
  amountSda: number;
  usdValue: number;
  fromAddress: string;
  toAddress: string;
  walletTag: 'Whale Wallet' | 'Institutional Fund' | 'DEX Liquidity Pool' | 'Early Investor' | 'Smart Trader';
  timestamp: string;
  txHash: string;
}

// Token Risk Scorecard (0-100 analytics)
export interface TokenRiskScore {
  overallScore: number;
  liquidityScore: number;
  volumeScore: number;
  holderGrowthScore: number;
  contractRisk: 'Low' | 'Medium' | 'High';
  summaryVerdict: string;
  riskFactors: string[];
  safetyBadges: string[];
}

// Sidra Swap Watch AI Market Intelligence
export interface TokenAIMarketIntelligence {
  tokenSymbol: string;
  momentum: 'Strong' | 'Moderate' | 'Neutral' | 'Weak';
  volumeTrend: 'Increasing' | 'Stable' | 'Decreasing';
  liquidityHealth: 'Healthy' | 'Moderate' | 'Low';
  trend: 'Bullish' | 'Neutral' | 'Bearish';
  momentum24hPercent: number;
  aiSummary: string;
  supportPriceSda: number;
  resistancePriceSda: number;
  rsi: number;
  macd: string;
  sma20: number;
  ema50: number;
  buyPressurePercent: number;
  sellPressurePercent: number;
  lastUpdated: string;
}

// Sponsored Token & Promoted Pools
export interface SponsoredProject {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tagline: string;
  logoUrl: string;
  badge: 'Featured Project' | 'VIP Partner' | 'Promoted Pool' | 'Trending Sponsor';
  promotedUntil: string;
  ctaLink: string;
  priceSda: number;
  priceUsd: number;
  change24h: number;
  volume24hUsd: number;
  contractAddress: string;
}

// Smart Alert Rule
export type SmartAlertType =
  | 'PRICE_TARGET'
  | 'PERCENT_MOVEMENT'
  | 'VOLUME_SPIKE'
  | 'LIQUIDITY_CHANGE'
  | 'NEW_ATH_ATL'
  | 'TOP_GAINER_ENTRY'
  | 'WHALE_ACTIVITY';

export interface SmartAlertRule {
  id: string;
  tokenSymbol: string;
  type: SmartAlertType;
  thresholdValue: number | string;
  direction?: 'ABOVE' | 'BELOW' | 'ANY';
  tierRequired: SubscriptionPlan;
  isActive: boolean;
  createdAt: string;
  userEmail?: string;
  channel: 'In-App' | 'Email' | 'Webhook';
}

// Developer API Key
export interface DeveloperApiKey {
  id: string;
  apiKey: string;
  planName: 'Developer Starter' | 'Pro Data API' | 'Enterprise Feed';
  monthlyPrice: number;
  monthlyQuota: number;
  usedQuota: number;
  rateLimitPerSec: number;
  createdAt: string;
  status: 'Active' | 'Revoked';
}

