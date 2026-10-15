/**
 * @hrm/domain-crypto Observation Adapters Core Manager
 * Synthesizes Exchange APIs (Coinbase), On-Chain Metrics, News Feeds, Social Sentiment, Macroeconomic Data
 */

import { fetchCoinbaseMarketData } from './coinbaseAdapter';
import {
  CryptoObservationAdapterState,
  MacroeconomicData,
  OnChainMetrics,
  RiskAndDeFiMetrics,
  SentimentMetrics,
} from '../types';

export function getDefaultOnChainMetrics(): OnChainMetrics {
  return {
    netExchangeFlowUsd24h: -145000000, // -$145M net outflow (accumulation)
    whaleAlerts24hCount: 38,
    activeAddresses24h: 985200,
    hashRateEhs: 645.8,
    stakingYieldPct: 3.42,
    networkHealthIndex: 0.94,
    topWhaleMovementsUsd: [
      {
        txHash: '0x3aef...8910',
        fromLabel: 'Binance Hot Wallet',
        toLabel: 'Unknown Whale 0x9b2a',
        amountUsd: 142000000,
        asset: 'BTC',
        direction: 'exchange_withdrawal',
        timestamp: Date.now() - 3600000,
      },
      {
        txHash: '0x81bc...1244',
        fromLabel: 'Unknown Whale 0x14f1',
        toLabel: 'Coinbase Custody',
        amountUsd: 85000000,
        asset: 'ETH',
        direction: 'exchange_deposit',
        timestamp: Date.now() - 7200000,
      },
      {
        txHash: '0xef01...7742',
        fromLabel: 'Tether Treasury',
        toLabel: 'Kraken Institutional',
        amountUsd: 250000000,
        asset: 'USDT',
        direction: 'exchange_deposit',
        timestamp: Date.now() - 10800000,
      },
    ],
    dataSourceProvenance: 'PREDEFINED_BASELINE_EXAMPLE',
    isPredefinedExample: true,
    provenanceNotice: 'Predefined baseline example. Must never be mistaken for current market data.',
  };
}

export function getDefaultSentimentMetrics(): SentimentMetrics {
  return {
    marketAppetiteIndex: 68,
    socialSentimentScore: 0.42,
    newsSentimentScore: 0.38,
    socialMentionVelocity: 0.82,
    topNewsFeed: [
      {
        id: 'news_1',
        title: 'Institutional Inflows via Bitcoin ETFs Reach Record Weekly Momentum',
        source: 'CoinDesk',
        sentiment: 'positive',
        impactScore: 0.88,
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'news_2',
        title: 'Federal Reserve Signals Liquidity Alignment in Policy Minutes',
        source: 'Bloomberg Crypto',
        sentiment: 'positive',
        impactScore: 0.75,
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    dataSourceProvenance: 'PREDEFINED_BASELINE_EXAMPLE',
    isPredefinedExample: true,
    provenanceNotice: 'Predefined baseline example. Must never be mistaken for current market data.',
  };
}

export function getDefaultMacroeconomicData(): MacroeconomicData {
  return {
    fedInterestRatePct: 4.25,
    cpiInflationPct: 2.6,
    dxyDollarIndex: 102.4,
    globalLiquidityUsdTrillion: 108.5,
    yieldCurveInversionBps: 18,
    macroRegime: 'Dovish Easing',
    dataSourceProvenance: 'PREDEFINED_BASELINE_EXAMPLE',
    isPredefinedExample: true,
    provenanceNotice: 'Predefined baseline example. Must never be mistaken for current market data.',
  };
}

export function getDefaultRiskAndDeFiMetrics(): RiskAndDeFiMetrics {
  return {
    systemicStressIndex: 0.22,
    estimatedLiquidationRiskUsd: 1850000000,
    averageLeverageRatio: 12.8,
    stablecoinSupplyChangeUsd24h: 420000000,
    defiPegDeviationPct: 0.02,
    collateralRatioPct: 185,
    dataSourceProvenance: 'PREDEFINED_BASELINE_EXAMPLE',
    isPredefinedExample: true,
    provenanceNotice: 'Predefined baseline example. Must never be mistaken for current market data.',
  };
}

/**
 * Direct Client-Side Live Observation Ingestion
 * Fallback mechanism if proxy endpoint is not available
 */
async function fetchClientLiveObservations(): Promise<{
  onChain: OnChainMetrics;
  sentiment: SentimentMetrics;
  macro: MacroeconomicData;
  risk: RiskAndDeFiMetrics;
}> {
  let onChain = getDefaultOnChainMetrics();
  let sentiment = getDefaultSentimentMetrics();
  let macro = getDefaultMacroeconomicData();
  let risk = getDefaultRiskAndDeFiMetrics();

  try {
    // Market Appetite & Sentiment Index
    const fngRes = await fetch('https://api.alternative.me/fng/?limit=1');
    if (fngRes.ok) {
      const data = await fngRes.json();
      if (data?.data?.[0]?.value) {
        sentiment.marketAppetiteIndex = parseInt(data.data[0].value, 10);
      }
    }
  } catch (e) {
    console.warn('Client Market Appetite fetch error:', e);
  }

  try {
    // CryptoCompare News
    const newsRes = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN');
    if (newsRes.ok) {
      const data = await newsRes.json();
      if (Array.isArray(data?.Data) && data.Data.length > 0) {
        sentiment.topNewsFeed = data.Data.slice(0, 5).map((item: any, i: number) => ({
          id: item.id || `news_${i}`,
          title: item.title,
          source: item.source_info?.name || item.source || 'Crypto News',
          sentiment: item.title.toLowerCase().includes('bull') || item.title.toLowerCase().includes('surge') ? 'positive' : 'neutral',
          impactScore: 0.8,
          publishedAt: new Date((item.published_on || Date.now() / 1000) * 1000).toISOString(),
        }));
      }
    }
  } catch (e) {
    console.warn('Client CryptoCompare news fetch error:', e);
  }

  try {
    // Blockchain.info
    const statsRes = await fetch('https://blockchain.info/stats?format=json');
    if (statsRes.ok) {
      const stats = await statsRes.json();
      if (stats.n_unique_addresses) onChain.activeAddresses24h = stats.n_unique_addresses;
      if (stats.hash_rate) onChain.hashRateEhs = Math.round((stats.hash_rate / 1e9) * 10) / 10;
    }
  } catch (e) {
    console.warn('Client Blockchain stats fetch error:', e);
  }

  return { onChain, sentiment, macro, risk };
}

/**
 * Main Observation Adapter Pipeline
 * Synthesizes Coinbase Tickers + Server Live Observations
 */
export async function getCryptoObservationAdaptersState(): Promise<CryptoObservationAdapterState> {
  const coinbaseTickers = await fetchCoinbaseMarketData();

  let onChain = getDefaultOnChainMetrics();
  let sentiment = getDefaultSentimentMetrics();
  let macro = getDefaultMacroeconomicData();
  let risk = getDefaultRiskAndDeFiMetrics();

  try {
    const liveRes = await fetch('/api/observations/live');
    if (liveRes.ok) {
      const liveData = await liveRes.json();
      if (liveData.onChain) onChain = liveData.onChain;
      if (liveData.sentiment) sentiment = liveData.sentiment;
      if (liveData.macro) macro = liveData.macro;
      if (liveData.risk) risk = liveData.risk;
    } else {
      const clientFallback = await fetchClientLiveObservations();
      onChain = clientFallback.onChain;
      sentiment = clientFallback.sentiment;
      macro = clientFallback.macro;
      risk = clientFallback.risk;
    }
  } catch (err) {
    console.warn('Live observations proxy unreachable, using client fallback:', err);
    const clientFallback = await fetchClientLiveObservations();
    onChain = clientFallback.onChain;
    sentiment = clientFallback.sentiment;
    macro = clientFallback.macro;
    risk = clientFallback.risk;
  }

  return {
    coinbaseTickers,
    onChain,
    sentiment,
    macro,
    risk,
    timestamp: Date.now(),
  };
}
