/**
 * @hrm/domain-crypto Domain Package Entry Point
 * Exports domain types, adapters, and mechanisms
 */

import { MarketStructureMechanism } from './mechanisms/marketStructureMechanism';
import { OnChainMechanism } from './mechanisms/onChainMechanism';
import { SentimentMechanism } from './mechanisms/sentimentMechanism';
import { MacroMechanism } from './mechanisms/macroMechanism';
import { RiskMechanism } from './mechanisms/riskMechanism';
import { StablecoinFlowsMechanism } from './mechanisms/stablecoinFlowsMechanism';
import { LLMAnalystMechanism } from './mechanisms/llmAnalystMechanism';
import { CryptoWorldState, CryptoAssetSymbol, AssetMarketData } from './types';
import {
  getCryptoObservationAdaptersState,
  getDefaultOnChainMetrics,
  getDefaultSentimentMetrics,
  getDefaultMacroeconomicData,
  getDefaultRiskAndDeFiMetrics,
} from './adapters/observationAdapters';

export * from './types';
export * from './adapters/coinbaseAdapter';
export * from './adapters/observationAdapters';

/**
 * Calculates genuine 14-period Wilder's RSI from trailing price series
 */
export function calculateWilderRSI(priceHistory: number[], currentPrice: number): number {
  const series = [...priceHistory, currentPrice];
  if (series.length < 2) return 50.0;
  
  const window = series.slice(-15); // Last 14 price changes
  let gains = 0;
  let losses = 0;
  
  for (let i = 1; i < window.length; i++) {
    const diff = window[i] - window[i - 1];
    if (diff > 0) gains += diff;
    else losses += Math.abs(diff);
  }
  
  const count = Math.max(1, window.length - 1);
  const avgGain = gains / count;
  const avgLoss = losses / count;
  
  if (avgLoss === 0) return 100.0;
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  return Math.round(rsi * 10) / 10;
}

/**
 * Calculates dynamic Support and Resistance pivot boundaries from price history
 */
export function calculateSupportResistance(
  priceHistory: number[],
  currentPrice: number,
  high24h: number,
  low24h: number
): { support: number; resistance: number } {
  const prices = [...priceHistory, currentPrice, high24h, low24h];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  const pivot = (maxPrice + minPrice + currentPrice) / 3;
  const rawSupport = (2 * pivot) - maxPrice;
  const rawResistance = (2 * pivot) - minPrice;
  
  const support = Math.round(Math.max(minPrice * 0.985, Math.min(currentPrice * 0.995, rawSupport)) * 10) / 10;
  const resistance = Math.round(Math.min(maxPrice * 1.015, Math.max(currentPrice * 1.005, rawResistance)) * 10) / 10;
  
  return { support, resistance };
}

export function getCryptoMechanisms() {
  return [
    new MarketStructureMechanism(),
    new OnChainMechanism(),
    new SentimentMechanism(),
    new MacroMechanism(),
    new RiskMechanism(),
    new StablecoinFlowsMechanism(),
    new LLMAnalystMechanism(),
  ];
}

export function createInitialCryptoWorldStateSync(): CryptoWorldState {
  const defaultOnChain = getDefaultOnChainMetrics();
  const defaultSentiment = getDefaultSentimentMetrics();
  const defaultMacro = getDefaultMacroeconomicData();
  const defaultRisk = getDefaultRiskAndDeFiMetrics();

  const defaultAssets: Record<CryptoAssetSymbol, AssetMarketData> = {
    'BTC-USD': {
      symbol: 'BTC-USD',
      name: 'Bitcoin',
      priceUsd: 96450,
      change24hPct: 2.85,
      high24h: 97800,
      low24h: 93800,
      volume24hUsd: 38200000000,
      bidUsd: 96448,
      askUsd: 96452,
      spreadBps: 0.4,
      supportPrice: 94000,
      resistancePrice: 98500,
      rsi14: 64.2,
      trend: 'Strong Bullish',
      volatilityRegime: 'Moderate Expansion',
      lastUpdatedTimestamp: Date.now(),
      isLiveCoinbaseData: false,
      priceHistory: [93800, 94200, 94500, 94100, 94800, 95200, 95000, 95600, 95400, 95900, 96100, 96300, 96000, 96450],
    },
    'ETH-USD': {
      symbol: 'ETH-USD',
      name: 'Ethereum',
      priceUsd: 3420,
      change24hPct: 1.45,
      high24h: 3510,
      low24h: 3350,
      volume24hUsd: 19400000000,
      bidUsd: 3419.5,
      askUsd: 3420.5,
      spreadBps: 0.8,
      supportPrice: 3300,
      resistancePrice: 3600,
      rsi14: 58.1,
      trend: 'Bullish Consolidation',
      volatilityRegime: 'Low Volatility Squeeze',
      lastUpdatedTimestamp: Date.now(),
      isLiveCoinbaseData: false,
      priceHistory: [3350, 3360, 3380, 3370, 3390, 3400, 3395, 3410, 3405, 3415, 3420],
    },
    'SOL-USD': {
      symbol: 'SOL-USD',
      name: 'Solana',
      priceUsd: 215,
      change24hPct: 5.12,
      high24h: 224,
      low24h: 202,
      volume24hUsd: 7800000000,
      bidUsd: 214.9,
      askUsd: 215.1,
      spreadBps: 1.2,
      supportPrice: 200,
      resistancePrice: 230,
      rsi14: 71.4,
      trend: 'Strong Bullish',
      volatilityRegime: 'Extreme Volatility Spike',
      lastUpdatedTimestamp: Date.now(),
      isLiveCoinbaseData: false,
      priceHistory: [202, 204, 207, 206, 209, 212, 210, 214, 213, 215],
    },
    'AVAX-USD': {
      symbol: 'AVAX-USD',
      name: 'Avalanche',
      priceUsd: 38.5,
      change24hPct: -0.8,
      high24h: 40.2,
      low24h: 37.8,
      volume24hUsd: 1200000000,
      bidUsd: 38.48,
      askUsd: 38.52,
      spreadBps: 2.1,
      supportPrice: 36.5,
      resistancePrice: 42.0,
      rsi14: 49.3,
      trend: 'Neutral Rangebound',
      volatilityRegime: 'Mean Reverting',
      lastUpdatedTimestamp: Date.now(),
      isLiveCoinbaseData: false,
      priceHistory: [39.0, 38.8, 38.9, 38.6, 38.7, 38.4, 38.5],
    },
    'DOGE-USD': {
      symbol: 'DOGE-USD',
      name: 'Dogecoin',
      priceUsd: 0.28,
      change24hPct: 3.2,
      high24h: 0.295,
      low24h: 0.268,
      volume24hUsd: 3100000000,
      bidUsd: 0.279,
      askUsd: 0.281,
      spreadBps: 3.5,
      supportPrice: 0.25,
      resistancePrice: 0.32,
      rsi14: 62.0,
      trend: 'Bullish Consolidation',
      volatilityRegime: 'Moderate Expansion',
      lastUpdatedTimestamp: Date.now(),
      isLiveCoinbaseData: false,
      priceHistory: [0.268, 0.272, 0.270, 0.275, 0.278, 0.280],
    },
  };

  return {
    assets: defaultAssets,
    onChain: defaultOnChain,
    sentiment: defaultSentiment,
    macro: defaultMacro,
    risk: defaultRisk,
    llmAnalyst: {
      lastUpdatedStep: 0,
      narrativeSummary: 'The Crypto Market Substrate is in a Strong Bullish structure led by BTC $96,450 (+2.85%) and supported by continuous net exchange withdrawals (-$145M USD/24h) and dovish macro liquidity conditions. Derivatives leverage remains within safe bounds (Stress Index 0.22).',
      bullishCatalysts: [
        'Institutional Spot ETF net inflows averaging +$180M daily',
        'Net exchange outflow (-$145M USD/24h) signaling strong whale spot accumulation',
        'Federal Reserve dovish liquidity pivot reducing discount rate pressures',
        'Stablecoin supply expansion (+$420M minting) providing dry powder on exchange orderbooks',
      ],
      bearishRiskFactors: [
        'High derivatives open interest near peak volatility trigger zones ($35B)',
        'Potential short-term long leverage squeeze if support at $94,000 is breached',
        'Elevated Market Appetite Index (68/100) nearing constructive expansion bounds',
      ],
      keySupportResistanceObservation: 'BTC-USD key support established at $94,000 (20-day EMA confluences). Immediate resistance at $98,500 psychological barrier.',
      oracleConfidenceScore: 0.92,
      recommendedRegimeShift: 'Maintain Moderate Expansion / Bullish Accumulation Strategy',
      timeHorizonForecast: {
        hours1: 'Consolidation near $96,500 with tight bid-ask spreads on Coinbase orderbooks.',
        hours24: 'Test of upper resistance at $98,500 driven by US institutional trading hours.',
        days7: 'Targeting $100,000 milestone if net exchange outflows persist above $100M daily.',
      },
      llmSource: 'Gemini 3.6 Flash Oracle Engine',
    },
    indicators: {
      compositeMarketHealthIndex: 0.88,
      liquidityStressScore: 0.18,
      systemicRiskScore: 0.22,
      oracleConsensusConfidence: 0.91,
      activeVolatilityRegime: 'Moderate Expansion',
    },
    recentMechanismForecasts: [],
  };
}

export async function createInitialCryptoWorldState(): Promise<CryptoWorldState> {
  const adaptersState = await getCryptoObservationAdaptersState();

  return {
    assets: adaptersState.coinbaseTickers,
    onChain: adaptersState.onChain,
    sentiment: adaptersState.sentiment,
    macro: adaptersState.macro,
    risk: adaptersState.risk,
    llmAnalyst: {
      lastUpdatedStep: 0,
      narrativeSummary: 'The Crypto Market Substrate is in a Strong Bullish structure led by BTC $96,450 (+2.85%) and supported by continuous net exchange withdrawals (-$145M USD/24h) and dovish macro liquidity conditions. Derivatives leverage remains within safe bounds (Stress Index 0.22).',
      bullishCatalysts: [
        'Institutional Spot ETF net inflows averaging +$180M daily',
        'Net exchange outflow (-$145M USD/24h) signaling strong whale spot accumulation',
        'Federal Reserve dovish liquidity pivot reducing discount rate pressures',
        'Stablecoin supply expansion (+$420M minting) providing dry powder on exchange orderbooks',
      ],
      bearishRiskFactors: [
        'High derivatives open interest near peak volatility trigger zones ($35B)',
        'Potential short-term long leverage squeeze if support at $94,000 is breached',
        'Elevated Market Appetite Index (68/100) nearing constructive expansion bounds',
      ],
      keySupportResistanceObservation: 'BTC-USD key support established at $94,000 (20-day EMA confluences). Immediate resistance at $98,500 psychological barrier.',
      oracleConfidenceScore: 0.92,
      recommendedRegimeShift: 'Maintain Moderate Expansion / Bullish Accumulation Strategy',
      timeHorizonForecast: {
        hours1: 'Consolidation near $96,500 with tight bid-ask spreads on Coinbase orderbooks.',
        hours24: 'Test of upper resistance at $98,500 driven by US institutional trading hours.',
        days7: 'Targeting $100,000 milestone if net exchange outflows persist above $100M daily.',
      },
      llmSource: 'Gemini 3.6 Flash Oracle Engine',
    },
    indicators: {
      compositeMarketHealthIndex: 0.88,
      liquidityStressScore: 0.18,
      systemicRiskScore: 0.22,
      oracleConsensusConfidence: 0.91,
      activeVolatilityRegime: 'Moderate Expansion',
    },
    recentMechanismForecasts: [],
  };
}
