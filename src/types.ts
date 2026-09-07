export type Timeframe = 'M1' | 'M5' | 'M15';

export type SignalDirection = 'CALL' | 'PUT';

export type MartingaleMode = 'NONE';

export interface AssetPair {
  id: string;
  name: string;
  symbol: string;
  type: 'FOREX' | 'OTC' | 'CRYPTO' | 'COMMODITIES';
  payout: number;
  basePrice: number;
  decimals: number;
  change24h: number;
  isHot?: boolean;
  activeId?: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BullBearAnalysis {
  bullPct: number;
  bearPct: number;
  dominant: 'bull' | 'bear' | null;
  force: number;
  statusText: string;
}

export interface Candle2MAnalysis {
  open: number;
  close: number;
  high: number;
  low: number;
  bodyPct: number;
  upperWickPct: number;
  lowerWickPct: number;
  pattern: 'STRONG_BULL_BODY' | 'STRONG_BEAR_BODY' | 'LOWER_REJECTION_HAMMER' | 'UPPER_REJECTION_STAR' | 'EXHAUSTION' | 'NEUTRAL_DOJI';
  trend2M: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  wickRejectionDetected: boolean;
  rejectionDirection?: 'CALL' | 'PUT';
  description: string;
  isConfirmedForSignal: boolean;
  warningAntiLoss?: string;
}

export type SupportedBroker = 'QUOTEX' | 'OPTGO' | 'POCKET_OPTION' | 'IQ_OPTION' | 'EXNOVA' | 'BINOMO';

export type BrokerIndicatorType = 
  | 'EMA_CROSS' 
  | 'BOLLINGER_BANDS' 
  | 'RSI_OSCILLATOR' 
  | 'SUPPORT_RESISTANCE' 
  | 'MACD' 
  | 'STOCHASTIC';

export interface BrokerIndicatorItem {
  id: string;
  name: string;
  shortName: string;
  type: BrokerIndicatorType;
  enabled: boolean;
  paramDescription: string;
  reading: {
    direction: 'CALL' | 'PUT' | 'NEUTRAL';
    valueStr: string;
    description: string;
    confluenceWeight: number; // Peso percentual
    isConfirmed: boolean;
  };
}

export interface BrokerChartScanResult {
  broker: SupportedBroker;
  brokerName: string;
  chartSynchronized: boolean;
  lastScannedTime: number;
  activeIndicatorsCount: number;
  matchingDirection: 'CALL' | 'PUT' | 'NEUTRAL';
  confluencePercent: number; // 0 - 100%
  indicators: BrokerIndicatorItem[];
  allIndicatorsAgreed: boolean;
  summary: string;
}

export interface SniperSignal {
  id: string;
  assetId: string;
  assetName: string;
  direction: SignalDirection;
  timeframe: Timeframe;
  entryTime: string;
  countdownSeconds: number;
  confidence: number;
  bullPct?: number;
  bearPct?: number;
  force?: number;
  candle2M?: Candle2MAnalysis;
  brokerName?: string;
  brokerIndicatorsConfluence?: string[];
  brokerIndicatorsCount?: number;
  entryPrice?: number;
  exitPrice?: number;
  diff?: number;
  confluenceFactors: string[];
  status: 'ANALYZING' | 'READY' | 'EXECUTING' | 'WIN' | 'LOSS';
  result?: 'WIN' | 'LOSS';
  payout: number;
  createdAt: number;
}

export interface AutoScannerState {
  enabled: boolean;
  scanning: boolean;
  currentScanningAsset?: string;
  lastScannedAt: number;
  cooldownMinutes: number;
  assetCooldowns: Record<string, number>;
}

export interface ServerNode {
  id: string;
  name: string;
  location: string;
  country: string;
  ping: number;
  status: 'ONLINE' | 'OPTIMAL' | 'SYNCING';
  ipMasked: string;
  role: string;
}

export type AccountMode = 'REAL' | 'DEMO';
export type BrokerExecutionMode = 'OFF' | 'DEMO' | 'REAL';

export interface BrokerExecutionResult {
  success: boolean;
  optionId?: number | string;
  activeId?: number;
  direction?: string;
  amount?: number;
  expired?: number;
  userBalanceId?: number;
  accountMode?: AccountMode;
  message?: string;
  error?: string;
}

export interface BrokerSession {
  ssid: string;
  email: string;
  password?: string;
  rememberCredentials?: boolean;
  accountMode: AccountMode;
  realBalance: number;
  demoBalance: number;
  isConnected: boolean;
  latencyMs: number;
  lastSync: number;
  serverUrl: string;
  userName?: string;
  currency?: string;
  userId?: number | string;
  realBalanceId?: number;
  demoBalanceId?: number;
  brokerExecutionMode?: BrokerExecutionMode;
  autoTradeEnabled?: boolean;
}

export interface TradeOrder {
  id: string;
  assetName: string;
  direction: SignalDirection;
  amount: number;
  entryPrice: number;
  exitPrice?: number;
  payout: number;
  timeframe: Timeframe;
  timestamp: number;
  status: 'OPEN' | 'WON' | 'LOST';
  profit?: number;
  accountMode?: AccountMode;
  brokerOptionId?: number | string;
  executedOnBroker?: boolean;
}
