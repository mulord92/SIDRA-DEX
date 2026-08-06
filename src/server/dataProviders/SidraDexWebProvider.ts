import { IDataProvider } from './IDataProvider.js';
import { Token, ScanResult, SwapEstimate, PricePoint, MarketGlobalStats } from '../../types/index.js';
import { SidraDexLiveEngine } from './SidraDexLiveEngine.js';

export class SidraDexWebProvider implements IDataProvider {
  name = 'Sidra Dex Live';
  type = 'sidradex_web' as const;
  baseUrl = '';
  rpcUrl = 'https://node.sidrachain.com';

  private engine = SidraDexLiveEngine.getInstance();

  async getGlobalStats(): Promise<MarketGlobalStats> {
    return this.engine.getGlobalStats();
  }

  async getTokens(): Promise<Token[]> {
    return this.engine.getTokens();
  }

  async getTokenBySymbol(symbol: string): Promise<Token | null> {
    return this.engine.getTokenBySymbol(symbol);
  }

  async scanToken(contractAddress: string, network: string): Promise<ScanResult> {
    return this.engine.scanToken(contractAddress, network);
  }

  async calculateSwap(baseSymbol: string, targetSymbol: string, amount: number): Promise<SwapEstimate> {
    return this.engine.calculateSwap(baseSymbol, targetSymbol, amount);
  }

  async getHistoricalData(symbol: string, timeframe: string): Promise<PricePoint[]> {
    return this.engine.getPriceHistory(symbol, timeframe);
  }
}
