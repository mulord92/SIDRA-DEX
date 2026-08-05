import { IDataProvider } from './IDataProvider.js';
import { DemoDataProvider } from './DemoDataProvider.js';
import { Token, ScanResult, SwapEstimate, PricePoint, MarketGlobalStats } from '../../types/index.js';

export class IndexerProvider implements IDataProvider {
  name = 'Verified Blockchain Indexer Provider';
  type: 'indexer' = 'indexer';
  private fallback = new DemoDataProvider();

  async getGlobalStats(): Promise<MarketGlobalStats> {
    const demoStats = await this.fallback.getGlobalStats();
    return {
      ...demoStats,
      isDemoData: true
    };
  }

  async getTokens(): Promise<Token[]> {
    const tokens = await this.fallback.getTokens();
    return tokens.map(t => ({
      ...t,
      dataSource: 'SidraChain Indexer (Verified Nodes)',
      isDemoData: true
    }));
  }

  async getTokenBySymbol(symbol: string): Promise<Token | null> {
    const token = await this.fallback.getTokenBySymbol(symbol);
    if (!token) return null;
    return {
      ...token,
      dataSource: 'SidraChain Indexer (Verified Nodes)',
      isDemoData: true
    };
  }

  async scanToken(contractAddress: string, network: string): Promise<ScanResult> {
    const result = await this.fallback.scanToken(contractAddress, network);
    return {
      ...result,
      dataSource: 'SidraChain Indexer (Verified Nodes)',
      isDemoData: true
    };
  }

  async calculateSwap(baseSymbol: string, targetSymbol: string, amount: number): Promise<SwapEstimate> {
    return this.fallback.calculateSwap(baseSymbol, targetSymbol, amount);
  }

  async getHistoricalData(symbol: string, timeframe: string): Promise<PricePoint[]> {
    return this.fallback.getHistoricalData(symbol, timeframe);
  }
}
