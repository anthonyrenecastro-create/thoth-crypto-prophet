/**
 * @hrm/domain-crypto Domain Types & Schemas
 * Architecture:
 * Exchange APIs (Coinbase) | On-Chain Metrics | News Feeds | Social Sentiment | Macroeconomic Data
 *                                      ↓
 *                             Observation Adapters
 *                                      ↓
 *                              Crypto World State
 *                                      ↓
 *                                  Mechanisms
 *  • Market Structure • On-Chain Activity • Liquidity • Volatility • Sentiment • Whale Activity • DeFi Risk • Stablecoin Flows • LLM Analyst
 *                                      ↓
 *                                 Arbitration
 *                                      ↓
 *                            Committed Market State
 *                                      ↓
 *                       Memory • Consequences • Reputation
 *                                      ↓
 *                            Crypto Oracle Dashboard
 */

export type CryptoAssetSymbol = 'BTC-USD' | 'ETH-USD' | 'SOL-USD' | 'AVAX-USD' | 'DOGE-USD';

export type VolatilityRegime = 'Low Volatility Squeeze' | 'Moderate Expansion' | 'Extreme Volatility Spike' | 'Mean Reverting';
export type MarketTrend = 'Strong Bullish' | 'Bullish Consolidation' | 'Neutral Rangebound' | 'Bearish Distribution' | 'Severe Markdown';

export type DataSourceProvenance =
  | 'LIVE_EXCHANGE_REST_WS'
  | 'LIVE_PUBLIC_API'
  | 'PREDEFINED_BASELINE_EXAMPLE'
  | 'SYNTHESIZED_MECHANISM_SIM';

export interface AssetMarketData {
  symbol: CryptoAssetSymbol;
  name: string;
  priceUsd: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  volume24hUsd: number;
  bidUsd: number;
  askUsd: number;
  spreadBps: number;
  supportPrice: number;
  resistancePrice: number;
  rsi14: number;
  trend: MarketTrend;
  volatilityRegime: VolatilityRegime;
  lastUpdatedTimestamp: number;
  isLiveCoinbaseData?: boolean;
  priceHistory?: number[]; // Trailing price history buffer for Wilder's 14-period RSI
  // Data Provenance & Limitation Audit
  dataSourceProvenance?: DataSourceProvenance;
  isPredefinedExample?: boolean;
  provenanceNotice?: string;
  rsiCalculatedFromCandles?: boolean;
  rsiValidationDelta?: number;
}

export interface HistoricalCandle {
  timestamp: number; // Unix timestamp in seconds
  low: number;
  high: number;
  open: number;
  close: number;
  volume: number;
}

export interface IndicatorValidationAudit {
  symbol: CryptoAssetSymbol;
  granularitySeconds: number; // e.g. 3600 (1h) or 86400 (1d)
  candleCount: number;
  latestClose: number;
  exactWilderRsi14: number;
  simplifiedApproxRsi14: number;
  rsiDiscrepancyDelta: number;
  validationStatus: 'VALIDATED_EXACT_CANDLES' | 'DISCREPANCY_EXCEEDS_TOLERANCE' | 'PENDING_CANDLE_INGESTION';
  validationExplanation: string;
  calculatedAt: number;
  candles: HistoricalCandle[];
  atr14?: number;
  sma20?: number;
  bollingerUpper?: number;
  bollingerLower?: number;
}

export interface BacktestConfig {
  takerFeeBps: number; // e.g. 8 (0.08%)
  slippageBps: number; // e.g. 5 (0.05%)
  executionDelayCandles: number; // e.g. 1 (realistic 1-period latency)
  initialCapitalUsd: number;
  regime: 'Multi-Regime Out-of-Sample' | 'Bullish Expansion' | 'Bearish Capitulation' | 'Rangebound Chop';
  asset: CryptoAssetSymbol;
}

export interface TradeRecord {
  id: string;
  entryTimestamp: number;
  exitTimestamp: number;
  type: 'LONG' | 'SHORT' | 'CASH';
  entryPrice: number;
  exitPrice: number;
  grossReturnPct: number;
  netReturnPct: number;
  feePaidUsd: number;
  slippageCostUsd: number;
  holdingPeriods: number;
  signalConfidence: number;
  exitReason: 'STOP_LOSS' | 'SIGNAL_REVERSAL' | 'TAKE_PROFIT' | 'HORIZON_EXPIRY';
}

export interface OutOfSampleBacktestResult {
  strategyName: string;
  asset: CryptoAssetSymbol;
  testPeriodLabel: string;
  regime: string;
  totalPeriods: number;
  initialCapitalUsd: number;
  finalCapitalNetUsd: number;
  finalCapitalGrossUsd: number;
  netReturnPct: number;
  grossReturnPct: number;
  benchmarkBuyAndHoldReturnPct: number;
  feeDragPct: number;
  totalFeeAndSlippageUsd: number;
  annualizedSharpeNet: number;
  annualizedSharpeGross: number;
  maxDrawdownPct: number;
  winRatePct: number;
  profitFactor: number;
  totalTrades: number;
  averageTradeNetPct: number;
  informationCoefficient: number; // IC between forecast proposal and realized return
  pValueVsRandomWalk: number;
  isStatisticallyProfitable: boolean;
  statisticalFindingSummary: string;
  limitationDisclosures: string[];
  trades: TradeRecord[];
  equityCurve: Array<{
    time: string;
    step: number;
    netEquity: number;
    grossEquity: number;
    benchmarkEquity: number;
  }>;
}

export interface CryptoObservationTransaction {
  id: string;
  type: 'market_tickers' | 'on_chain_metrics' | 'sentiment_news' | 'macro_conditions' | 'risk_defi' | 'llm_analyst_synthesis' | 'full_observation_bundle';
  timestamp: number;
  source: string;
  payload: {
    coinbaseTickers?: Record<CryptoAssetSymbol, AssetMarketData>;
    onChain?: OnChainMetrics;
    sentiment?: SentimentMetrics;
    macro?: MacroeconomicData;
    risk?: RiskAndDeFiMetrics;
    llmAnalyst?: LLMAnalystSynthesis;
  };
}

export interface OnChainMetrics {
  netExchangeFlowUsd24h: number; // Positive = net inflow to exchanges (bearish), Negative = outflow (bullish)
  whaleAlerts24hCount: number;
  activeAddresses24h: number;
  hashRateEhs: number; // EH/s for BTC or gas health
  stakingYieldPct: number;
  networkHealthIndex: number; // [0, 1]
  topWhaleMovementsUsd: Array<{
    txHash: string;
    fromLabel: string;
    toLabel: string;
    amountUsd: number;
    asset: string;
    direction: 'exchange_deposit' | 'exchange_withdrawal' | 'wallet_transfer';
    timestamp: number;
  }>;
  dataSourceProvenance?: DataSourceProvenance;
  isPredefinedExample?: boolean;
  provenanceNotice?: string;
}

export interface SentimentMetrics {
  marketAppetiteIndex: number; // 0 to 100 (0 = Strong Risk Aversion, 100 = High Risk Appetite)
  fearAndGreedIndex?: number; // Backward compatibility alias
  socialSentimentScore: number; // -1.0 to +1.0
  newsSentimentScore: number; // -1.0 to +1.0
  socialMentionVelocity: number; // Mentions/hr normalized [0, 1]
  topNewsFeed: Array<{
    id: string;
    title: string;
    source: string;
    sentiment: 'positive' | 'negative' | 'neutral';
    impactScore: number; // [0, 1]
    publishedAt: string;
  }>;
  dataSourceProvenance?: DataSourceProvenance;
  isPredefinedExample?: boolean;
  provenanceNotice?: string;
}

export interface MacroeconomicData {
  fedInterestRatePct: number;
  cpiInflationPct: number;
  dxyDollarIndex: number;
  globalLiquidityUsdTrillion: number;
  yieldCurveInversionBps: number;
  macroRegime: 'Hawkish Tightening' | 'Neutral Pivot' | 'Dovish Easing' | 'Stagflationary Stress';
  dataSourceProvenance?: DataSourceProvenance;
  isPredefinedExample?: boolean;
  provenanceNotice?: string;
}

export interface RiskAndDeFiMetrics {
  systemicStressIndex: number; // [0, 1]
  estimatedLiquidationRiskUsd: number; // Total open leverage at risk
  averageLeverageRatio: number; // e.g. 15.4x
  stablecoinSupplyChangeUsd24h: number; // Minting (+) vs Burning (-)
  defiPegDeviationPct: number; // e.g. USDT/USDC peg stability
  collateralRatioPct: number;
  dataSourceProvenance?: DataSourceProvenance;
  isPredefinedExample?: boolean;
  provenanceNotice?: string;
}

export interface LLMAnalystSynthesis {
  lastUpdatedStep: number;
  narrativeSummary: string;
  bullishCatalysts: string[];
  bearishRiskFactors: string[];
  keySupportResistanceObservation: string;
  oracleConfidenceScore: number; // [0, 1]
  recommendedRegimeShift: string;
  timeHorizonForecast: {
    hours1: string;
    hours24: string;
    days7: string;
  };
  llmSource: string;
}

/**
 * Raw Observation Adapters Package
 */
export interface CryptoObservationAdapterState {
  coinbaseTickers: Record<CryptoAssetSymbol, AssetMarketData>;
  onChain: OnChainMetrics;
  sentiment: SentimentMetrics;
  macro: MacroeconomicData;
  risk: RiskAndDeFiMetrics;
  timestamp: number;
}

/**
 * Total Crypto World State
 */
export interface CryptoWorldState {
  assets: Record<CryptoAssetSymbol, AssetMarketData>;
  onChain: OnChainMetrics;
  sentiment: SentimentMetrics;
  macro: MacroeconomicData;
  risk: RiskAndDeFiMetrics;
  llmAnalyst: LLMAnalystSynthesis;
  indicators: {
    compositeMarketHealthIndex: number; // [0, 1]
    liquidityStressScore: number; // [0, 1]
    systemicRiskScore: number; // [0, 1]
    oracleConsensusConfidence: number; // [0, 1]
    activeVolatilityRegime: VolatilityRegime;
  };
  recentMechanismForecasts: Array<{
    mechanismId: string;
    mechanismType: string;
    summary: string;
    confidence: number;
    timestamp: number;
  }>;
}
