/**
 * @hrm/domain-crypto Observation Adapter: Coinbase API Integration
 * Fetches real live price tickers, bid/ask, and volume from Coinbase Public APIs
 */

import { AssetMarketData, CryptoAssetSymbol, MarketTrend, VolatilityRegime } from '../types';

const COINBASE_SPOT_API = 'https://api.coinbase.com/v2/prices';
const COINBASE_EXCHANGE_API = 'https://api.exchange.coinbase.com/products';

export interface CoinbaseTickerResponse {
  trade_id?: number;
  price: string;
  size?: string;
  bid: string;
  ask: string;
  volume?: string;
  time?: string;
}

export interface CoinbaseStatsResponse {
  open: string;
  high: string;
  low: string;
  volume: string;
  last: string;
  volume_30day?: string;
}

import { calculateWilderRsi, fetchCoinbaseHistoricalCandles } from '../validation/candleValidator';

export const DEFAULT_ASSETS: Record<CryptoAssetSymbol, Partial<AssetMarketData>> = {
  'BTC-USD': {
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
    dataSourceProvenance: 'PREDEFINED_BASELINE_EXAMPLE',
    isPredefinedExample: true,
    provenanceNotice: 'Predefined baseline example. Must never be mistaken for current market data.',
    isLiveCoinbaseData: false,
  },
  'ETH-USD': {
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
    dataSourceProvenance: 'PREDEFINED_BASELINE_EXAMPLE',
    isPredefinedExample: true,
    provenanceNotice: 'Predefined baseline example. Must never be mistaken for current market data.',
    isLiveCoinbaseData: false,
  },
  'SOL-USD': {
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
    dataSourceProvenance: 'PREDEFINED_BASELINE_EXAMPLE',
    isPredefinedExample: true,
    provenanceNotice: 'Predefined baseline example. Must never be mistaken for current market data.',
    isLiveCoinbaseData: false,
  },
  'AVAX-USD': {
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
    dataSourceProvenance: 'PREDEFINED_BASELINE_EXAMPLE',
    isPredefinedExample: true,
    provenanceNotice: 'Predefined baseline example. Must never be mistaken for current market data.',
    isLiveCoinbaseData: false,
  },
  'DOGE-USD': {
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
    dataSourceProvenance: 'PREDEFINED_BASELINE_EXAMPLE',
    isPredefinedExample: true,
    provenanceNotice: 'Predefined baseline example. Must never be mistaken for current market data.',
    isLiveCoinbaseData: false,
  },
};

/**
 * Direct Coinbase API Fetcher (Client / Backend Proxy)
 */
export async function fetchCoinbaseMarketData(): Promise<Record<CryptoAssetSymbol, AssetMarketData>> {
  const result: Record<string, AssetMarketData> = {};
  const symbols: CryptoAssetSymbol[] = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'AVAX-USD', 'DOGE-USD'];

  // 1. First try calling our backend proxy endpoint
  try {
    const res = await fetch('/api/coinbase/market');
    if (res.ok) {
      const data = await res.json();
      if (data && data.assets && Object.keys(data.assets).length > 0) {
        return data.assets;
      }
    }
  } catch (err) {
    console.warn('Backend Coinbase proxy fetch failed, falling back to direct public endpoints:', err);
  }

  // 2. Client-side fetch from public Coinbase Exchange endpoints
  await Promise.all(
    symbols.map(async (symbol) => {
      const defaults = DEFAULT_ASSETS[symbol];
      try {
        const [tickerRes, statsRes, candles] = await Promise.all([
          fetch(`${COINBASE_EXCHANGE_API}/${symbol}/ticker`),
          fetch(`${COINBASE_EXCHANGE_API}/${symbol}/stats`),
          fetchCoinbaseHistoricalCandles(symbol, 3600),
        ]);

        if (tickerRes.ok && statsRes.ok) {
          const ticker: CoinbaseTickerResponse = await tickerRes.json();
          const stats: CoinbaseStatsResponse = await statsRes.json();

          const price = parseFloat(ticker.price);
          const open = parseFloat(stats.open);
          const high = parseFloat(stats.high);
          const low = parseFloat(stats.low);
          const volume = parseFloat(stats.volume) * price;
          const bid = parseFloat(ticker.bid);
          const ask = parseFloat(ticker.ask);

          const change24hPct = open > 0 ? ((price - open) / open) * 100 : defaults.change24hPct!;
          const spreadBps = price > 0 ? ((ask - bid) / price) * 10000 : defaults.spreadBps!;

          // Calculate trend and regime heuristic
          let trend: MarketTrend = 'Neutral Rangebound';
          if (change24hPct > 4) trend = 'Strong Bullish';
          else if (change24hPct > 1) trend = 'Bullish Consolidation';
          else if (change24hPct < -4) trend = 'Severe Markdown';
          else if (change24hPct < -1) trend = 'Bearish Distribution';

          let volatilityRegime: VolatilityRegime = 'Moderate Expansion';
          const rangePct = open > 0 ? ((high - low) / open) * 100 : 3;
          if (rangePct > 8) volatilityRegime = 'Extreme Volatility Spike';
          else if (rangePct < 2) volatilityRegime = 'Low Volatility Squeeze';

          // Compute exact Wilder's RSI from historical candles if available
          const approxRsi = Math.round((50 + change24hPct * 2.5) * 10) / 10;
          let finalRsi = approxRsi;
          let rsiCalculatedFromCandles = false;
          let rsiValidationDelta = 0;

          if (candles && candles.length >= 15) {
            const closes = candles.map(c => c.close);
            const { currentRsi } = calculateWilderRsi(closes, 14);
            finalRsi = currentRsi;
            rsiCalculatedFromCandles = true;
            rsiValidationDelta = Math.round((finalRsi - approxRsi) * 10) / 10;
          }

          result[symbol] = {
            symbol,
            name: defaults.name || symbol,
            priceUsd: price,
            change24hPct: Math.round(change24hPct * 100) / 100,
            high24h: high,
            low24h: low,
            volume24hUsd: volume,
            bidUsd: bid,
            askUsd: ask,
            spreadBps: Math.round(spreadBps * 10) / 10,
            supportPrice: Math.round(low * 0.98 * 100) / 100,
            resistancePrice: Math.round(high * 1.02 * 100) / 100,
            rsi14: finalRsi,
            trend,
            volatilityRegime,
            lastUpdatedTimestamp: Date.now(),
            isLiveCoinbaseData: true,
            dataSourceProvenance: 'LIVE_EXCHANGE_REST_WS',
            isPredefinedExample: false,
            rsiCalculatedFromCandles,
            rsiValidationDelta,
          };
          return;
        }
      } catch (e) {
        console.warn(`Direct fetch for ${symbol} failed, using default state:`, e);
      }

      // Fallback to initial structured default state (Predefined Baseline Example)
      result[symbol] = {
        symbol,
        name: defaults.name || symbol,
        priceUsd: defaults.priceUsd!,
        change24hPct: defaults.change24hPct!,
        high24h: defaults.high24h!,
        low24h: defaults.low24h!,
        volume24hUsd: defaults.volume24hUsd!,
        bidUsd: defaults.bidUsd!,
        askUsd: defaults.askUsd!,
        spreadBps: defaults.spreadBps!,
        supportPrice: defaults.supportPrice!,
        resistancePrice: defaults.resistancePrice!,
        rsi14: defaults.rsi14!,
        trend: defaults.trend!,
        volatilityRegime: defaults.volatilityRegime!,
        lastUpdatedTimestamp: Date.now(),
        isLiveCoinbaseData: false,
        dataSourceProvenance: 'PREDEFINED_BASELINE_EXAMPLE',
        isPredefinedExample: true,
        provenanceNotice: 'Predefined baseline example. Must never be mistaken for current market data.',
        rsiCalculatedFromCandles: false,
      };
    })
  );

  return result as Record<CryptoAssetSymbol, AssetMarketData>;
}
