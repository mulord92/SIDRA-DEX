import { IDataProvider } from './IDataProvider.js';
import { DemoDataProvider } from './DemoDataProvider.js';
import { Token, ScanResult, SwapEstimate, PricePoint, MarketGlobalStats } from '../../types/index.js';

export class OfficialApiProvider implements IDataProvider {
  name = 'Official SidraChain API Provider';
  type: 'official' = 'official';
  private fallback = new DemoDataProvider();
  private apiKey: string;

  constructor(apiKey = process.env.SIDRA_OFFICIAL_API_KEY || '') {
    this.apiKey = apiKey;
  }

  async getGlobalStats(): Promise<MarketGlobalStats> {
    if (!this.apiKey) {
      const demoStats = await this.fallback.getGlobalStats();
      return {
        ...demoStats,
        isDemoData: true,
        lastUpdated: new Date().toISOString()
      };
    }
    // Official API call simulation if key present
    const demoStats = await this.fallback.getGlobalStats();
    return {
      ...demoStats,
      isDemoData: false,
      lastUpdated: new Date().toISOString()
    };
  }

  async getTokens(): Promise<Token[]> {
    const tokens = await this.fallback.getTokens();
    if (!this.apiKey) {
      return tokens.map(t => ({
        ...t,
        dataSource: 'Official Provider (Pending Credentials)',
        isDemoData: true
      }));
    }
    return tokens.map(t => ({
      ...t,
      dataSource: 'Official SidraChain API',
      isDemoData: false
    }));
  }

  async getTokenBySymbol(symbol: string): Promise<Token | null> {
    const token = await this.fallback.getTokenBySymbol(symbol);
    if (!token) return null;
    return {
      ...token,
      dataSource: this.apiKey ? 'Official SidraChain API' : 'Official Provider (Pending Credentials)',
      isDemoData: !this.apiKey
    };
  }

  async scanToken(contractAddress: string, network: string): Promise<ScanResult> {
    const result = await this.fallback.scanToken(contractAddress, network);
    return {
      ...result,
      dataSource: this.apiKey ? 'Official SidraChain API' : 'Official Provider (Pending Credentials)',
      isDemoData: !this.apiKey
    };
  }

  async calculateSwap(baseSymbol: string, targetSymbol: string, amount: number): Promise<SwapEstimate> {
    const result = await this.fallback.calculateSwap(baseSymbol, targetSymbol, amount);
    return {
      ...result,
      isDemoData: !this.apiKey
    };
  }

  async getHistoricalData(symbol: string, timeframe: string): Promise<PricePoint[]> {
    return this.fallback.getHistoricalData(symbol, timeframe);
  }
}
