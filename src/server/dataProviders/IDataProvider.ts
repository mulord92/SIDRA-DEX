import { Token, ScanResult, SwapEstimate, PricePoint, MarketGlobalStats, DataProviderType } from '../../types/index.js';

export interface IDataProvider {
  name: string;
  type: DataProviderType;
  getGlobalStats(): Promise<MarketGlobalStats>;
  getTokens(): Promise<Token[]>;
  getTokenBySymbol(symbol: string): Promise<Token | null>;
  scanToken(contractAddress: string, network: string): Promise<ScanResult>;
  calculateSwap(baseSymbol: string, targetSymbol: string, amount: number): Promise<SwapEstimate>;
  getHistoricalData(symbol: string, timeframe: string): Promise<PricePoint[]>;
}
