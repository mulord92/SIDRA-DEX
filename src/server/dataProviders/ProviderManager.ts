import { IDataProvider } from './IDataProvider.js';
import { DemoDataProvider } from './DemoDataProvider.js';
import { OfficialApiProvider } from './OfficialApiProvider.js';
import { IndexerProvider } from './IndexerProvider.js';
import { SidraDexWebProvider } from './SidraDexWebProvider.js';
import { Token, VerificationStatus, PriceAlert, AuditLog, DataProviderType } from '../../types/index.js';

export class ProviderManager {
  private activeProviderType: DataProviderType = 'sidradex_web';
  private providers: Record<DataProviderType, IDataProvider>;
  private customTokens: Map<string, Token> = new Map();
  private alerts: PriceAlert[] = [];
  private auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      action: 'SYSTEM_BOOT',
      details: 'SIDRA SWAP WATCH initialized with Demo Data Provider.',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      adminUser: 'System'
    }
  ];

  constructor() {
    this.providers = {
      demo: new DemoDataProvider(),
      official: new OfficialApiProvider(),
      indexer: new IndexerProvider(),
      sidradex_web: new SidraDexWebProvider()
    };

    const envProvider = process.env.SIDRA_DATA_PROVIDER as DataProviderType;
    if (envProvider && this.providers[envProvider]) {
      this.activeProviderType = envProvider;
    }
  }

  getActiveProvider(): IDataProvider {
    return this.providers[this.activeProviderType];
  }

  getActiveProviderType(): DataProviderType {
    return this.activeProviderType;
  }

  setActiveProvider(type: DataProviderType, adminUser = 'Admin'): void {
    if (this.providers[type]) {
      this.activeProviderType = type;
      this.addAuditLog(
        'CHANGE_DATA_PROVIDER',
        `Switched data provider to ${this.providers[type].name}`,
        adminUser
      );
    }
  }

  async getAllTokens(): Promise<Token[]> {
    const baseTokens = await this.getActiveProvider().getTokens();
    const customList = Array.from(this.customTokens.values());
    
    // Combine base and custom, avoiding duplicates by symbol
    const tokenMap = new Map<string, Token>();
    baseTokens.forEach(t => tokenMap.set(t.symbol.toUpperCase(), t));
    customList.forEach(t => tokenMap.set(t.symbol.toUpperCase(), t));

    return Array.from(tokenMap.values()).filter(t => !t.isDisabled);
  }

  async getTokenBySymbol(symbol: string): Promise<Token | null> {
    const upper = symbol.toUpperCase();
    if (this.customTokens.has(upper)) {
      const custom = this.customTokens.get(upper)!;
      return custom.isDisabled ? null : custom;
    }
    return this.getActiveProvider().getTokenBySymbol(symbol);
  }

  async addOrUpdateToken(tokenData: Partial<Token>, adminUser = 'Admin'): Promise<Token> {
    const symbol = tokenData.symbol?.toUpperCase() || `TKN-${Date.now().toString().slice(-4)}`;
    const existing = await this.getTokenBySymbol(symbol);

    const updatedToken: Token = {
      id: existing?.id || `token-${Date.now()}`,
      rank: existing?.rank || 99,
      name: tokenData.name || existing?.name || 'New Sidra Token',
      symbol,
      logoUrl: tokenData.logoUrl || existing?.logoUrl || 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=100&auto=format&fit=crop&q=80',
      priceSda: tokenData.priceSda ?? existing?.priceSda ?? 1.0,
      priceUsd: (tokenData.priceSda ?? existing?.priceSda ?? 1.0) * 1.2405,
      change24h: tokenData.change24h ?? existing?.change24h ?? 0.0,
      volume24hSda: tokenData.volume24hSda ?? existing?.volume24hSda ?? 100000,
      volume24hUsd: (tokenData.volume24hSda ?? existing?.volume24hSda ?? 100000) * 1.2405,
      liquidityUsd: tokenData.liquidityUsd ?? existing?.liquidityUsd ?? 500000,
      holdersCount: tokenData.holdersCount ?? existing?.holdersCount ?? 150,
      verificationStatus: tokenData.verificationStatus || existing?.verificationStatus || 'Pending Review',
      contractAddress: tokenData.contractAddress || existing?.contractAddress || '0x' + Math.random().toString(16).slice(2, 42),
      network: tokenData.network || existing?.network || 'SidraChain Mainnet',
      isDemoData: this.activeProviderType === 'demo',
      dataSource: this.getActiveProvider().name,
      lastUpdated: new Date().toISOString(),
      totalSupply: tokenData.totalSupply ?? existing?.totalSupply ?? 100000000,
      circulatingSupply: tokenData.circulatingSupply ?? existing?.circulatingSupply ?? 10000000,
      marketCapUsd: ((tokenData.circulatingSupply ?? existing?.circulatingSupply ?? 10000000) * (tokenData.priceSda ?? existing?.priceSda ?? 1.0) * 1.2405),
      fdvUsd: ((tokenData.totalSupply ?? existing?.totalSupply ?? 100000000) * (tokenData.priceSda ?? existing?.priceSda ?? 1.0) * 1.2405),
      description: tokenData.description || existing?.description || 'Custom token registered on SIDRA SWAP WATCH.',
      isDisabled: tokenData.isDisabled ?? existing?.isDisabled ?? false
    };

    this.customTokens.set(symbol, updatedToken);
    this.addAuditLog(
      existing ? 'EDIT_TOKEN' : 'ADD_TOKEN',
      `Token ${symbol} (${updatedToken.name}) ${existing ? 'updated' : 'added'} with status ${updatedToken.verificationStatus}`,
      adminUser
    );

    return updatedToken;
  }

  async updateVerificationStatus(symbol: string, status: VerificationStatus, adminUser = 'Admin'): Promise<Token | null> {
    const token = await this.getTokenBySymbol(symbol);
    if (!token) return null;

    return this.addOrUpdateToken({ ...token, verificationStatus: status }, adminUser);
  }

  async toggleTokenFeed(symbol: string, disabled: boolean, adminUser = 'Admin'): Promise<Token | null> {
    const token = await this.getTokenBySymbol(symbol);
    if (!token) return null;

    return this.addOrUpdateToken({ ...token, isDisabled: disabled }, adminUser);
  }

  // Alerts
  getAlerts(): PriceAlert[] {
    return this.alerts;
  }

  addAlert(alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isTriggered'>): PriceAlert {
    const newAlert: PriceAlert = {
      ...alert,
      id: `alert-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isTriggered: false
    };
    this.alerts.push(newAlert);
    return newAlert;
  }

  deleteAlert(id: string): boolean {
    const initLen = this.alerts.length;
    this.alerts = this.alerts.filter(a => a.id !== id);
    return this.alerts.length < initLen;
  }

  // Audit Logs
  getAuditLogs(): AuditLog[] {
    return this.auditLogs;
  }

  addAuditLog(action: string, details: string, adminUser = 'Admin'): AuditLog {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      details,
      timestamp: new Date().toISOString(),
      adminUser
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
    return log;
  }
}

export const providerManager = new ProviderManager();
