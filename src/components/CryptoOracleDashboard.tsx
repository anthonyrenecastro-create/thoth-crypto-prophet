import React, { useState } from 'react';
import { HRMWorldState } from '../types/hrm';
import { AssetMarketData, CryptoAssetSymbol } from '../domain/crypto/types';
import { IndicatorCandleValidationView } from './IndicatorCandleValidationView';
import { ThothBacktestAuditView } from './ThothBacktestAuditView';
import { FinancialDisclaimer } from './FinancialDisclaimer';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Database,
  Globe,
  ShieldAlert,
  Brain,
  RefreshCw,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Newspaper,
  Compass,
  Cpu,
  BarChart3,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Info
} from 'lucide-react';

interface CryptoOracleDashboardProps {
  state: HRMWorldState;
  onRefreshCoinbaseFeed?: () => void;
  onSynthesizeLLMAnalyst?: () => void;
  isSynthesizingLLM?: boolean;
}

export const CryptoOracleDashboard: React.FC<CryptoOracleDashboardProps> = ({
  state,
  onRefreshCoinbaseFeed,
  onSynthesizeLLMAnalyst,
  isSynthesizingLLM = false,
}) => {
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<CryptoAssetSymbol>('BTC-USD');
  const [activeTab, setActiveTab] = useState<'overview' | 'validation' | 'backtest' | 'mechanisms' | 'llm_analyst' | 'architecture'>('overview');

  const cryptoState = state.cryptoWorldState;

  if (!cryptoState) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Database className="w-10 h-10 text-amber-400 mx-auto mb-3 animate-pulse" />
        <h3 className="text-base font-semibold text-slate-200">Crypto World Model Substrate Initializing</h3>
        <p className="text-xs text-slate-400 mt-1">
          Switch active scenario to Crypto Oracle to observe real-time Coinbase feeds and mechanism arbitration.
        </p>
      </div>
    );
  }

  const assets = cryptoState.assets;
  const currentAsset: AssetMarketData = assets[selectedAssetSymbol] || Object.values(assets)[0];
  const onChain = cryptoState.onChain;
  const sentiment = cryptoState.sentiment;
  const macro = cryptoState.macro;
  const risk = cryptoState.risk;
  const llm = cryptoState.llmAnalyst;

  const netFlowM = Math.round(onChain.netExchangeFlowUsd24h / 1000000);
  const stableM = Math.round(risk.stablecoinSupplyChangeUsd24h / 1000000);

  return (
    <div className="space-y-5">
      <FinancialDisclaimer compact />
      {/* Top Architecture Pipeline Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                @hrm/domain-crypto
              </span>
              <span className="text-xs font-mono text-slate-400">
                Substrate Step #{state.metadata.step}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2.5 mt-1">
              Crypto Oracle & Market Substrate
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Coinbase Prices • Real-Time On-Chain & Whale Alerts • Live News & Sentiment • Federal Reserve & Macro Ingestion
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshCoinbaseFeed}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700 flex items-center gap-2 cursor-pointer shadow"
            >
              <RefreshCw className="w-3.5 h-3.5 text-sky-400" /> Refresh All Live Feeds
            </button>
            <button
              onClick={onSynthesizeLLMAnalyst}
              disabled={isSynthesizingLLM}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-purple-600/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Brain className={`w-4 h-4 text-purple-200 ${isSynthesizingLLM ? 'animate-spin' : ''}`} />
              {isSynthesizingLLM ? 'Synthesizing...' : 'Run Gemini Oracle Analyst'}
            </button>
          </div>
        </div>

        {/* Dashboard Section Sub-Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-3 text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" /> Coinbase Tickers & Market State
          </button>
          <button
            onClick={() => setActiveTab('validation')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'validation'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" /> Historical Candle & RSI Validation
          </button>
          <button
            onClick={() => setActiveTab('backtest')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'backtest'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> Out-of-Sample Backtest & Alpha Audit
          </button>
          <button
            onClick={() => setActiveTab('mechanisms')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'mechanisms'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Mechanism Pipeline (7 Mechanisms)
          </button>
          <button
            onClick={() => setActiveTab('llm_analyst')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'llm_analyst'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-purple-400" /> Gemini LLM Analyst Console
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'architecture'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" /> System Architecture Diagram
          </button>
        </div>
      </div>

      {/* Limitation #1 Notice & Data Provenance Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl mt-0.5 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                AUDIT LIMITATION #1 ADDRESSED
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Data Provenance Notice: Predefined Baseline vs. Real-Time Exchange Data
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Some initial market values, baseline asset prices, and simulated mechanism observations are <span className="text-amber-300 font-semibold">predefined illustrative examples</span> for system initialization. They must <strong className="text-white">NEVER be mistaken for current market quotes, execution prices, or financial advice</strong>. Real-time exchange values are explicitly marked with the green <span className="text-emerald-400 font-mono font-semibold">LIVE COINBASE</span> badge.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Verified Feed
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Predefined Example
          </span>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & COINBASE TICKERS */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Live Asset Ticker Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {(Object.values(assets) as AssetMarketData[]).map((asset) => {
              const isSelected = asset.symbol === selectedAssetSymbol;
              const isPositive = asset.change24hPct >= 0;
              return (
                <button
                  key={asset.symbol}
                  onClick={() => setSelectedAssetSymbol(asset.symbol)}
                  className={`p-3.5 rounded-xl text-left transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:bg-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-100 text-xs flex items-center gap-1">
                      {asset.name}
                    </span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                        asset.isLiveCoinbaseData
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                      title={asset.isLiveCoinbaseData ? 'Live verified Coinbase Exchange data' : 'Predefined example scenario'}
                    >
                      {asset.isLiveCoinbaseData ? 'LIVE' : 'PREDEFINED'}
                    </span>
                  </div>
                  <div className="text-base font-extrabold text-white font-mono">
                    ${asset.priceUsd < 10 ? asset.priceUsd.toFixed(3) : asset.priceUsd.toLocaleString()}
                  </div>
                  <div className={`text-[11px] font-medium font-mono flex items-center gap-0.5 mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isPositive ? '+' : ''}{asset.change24hPct}% 24h
                  </div>
                </button>
              );
            })}
          </div>

          {/* Asset Detailed Inspection Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Asset Market Structure Spec */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white font-mono">{currentAsset.symbol} Market Structure</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-sky-300 border border-slate-700">
                      {currentAsset.trend}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Orderbook Bid/Ask Spread: <span className="text-slate-200 font-mono">{currentAsset.spreadBps} bps</span> • Volatility: <span className="text-amber-300 font-mono">{currentAsset.volatilityRegime}</span>
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 mb-1">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      currentAsset.isLiveCoinbaseData
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {currentAsset.isLiveCoinbaseData ? '🟢 LIVE COINBASE QUOTE' : '🟠 PREDEFINED EXAMPLE (Static Baseline)'}
                    </span>
                  </div>
                  <p className="text-2xl font-black text-emerald-400 font-mono">
                    ${currentAsset.priceUsd < 10 ? currentAsset.priceUsd.toFixed(3) : currentAsset.priceUsd.toLocaleString()}
                  </p>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {currentAsset.isLiveCoinbaseData ? 'Verified Live Feed' : 'Initial Example — Not Market Quote'}
                  </span>
                </div>
              </div>

              {/* Price Range & Support/Resistance Bounds */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">Support Level</span>
                  <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                    ${currentAsset.supportPrice.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">Resistance Level</span>
                  <p className="text-sm font-bold text-rose-400 font-mono mt-0.5">
                    ${currentAsset.resistancePrice.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-400">24h High / Low</span>
                  <p className="text-xs font-bold text-slate-200 font-mono mt-0.5">
                    ${currentAsset.high24h.toLocaleString()} / ${currentAsset.low24h.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">RSI (14-period)</span>
                    <span className={`text-[8px] font-mono px-1 py-0.2 rounded font-semibold ${
                      currentAsset.rsiCalculatedFromCandles
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {currentAsset.rsiCalculatedFromCandles ? 'Candle' : 'Approx'}
                    </span>
                  </div>
                  <p className={`text-sm font-bold font-mono mt-0.5 ${currentAsset.rsi14 > 70 ? 'text-rose-400' : currentAsset.rsi14 < 30 ? 'text-emerald-400' : 'text-sky-300'}`}>
                    {currentAsset.rsi14}
                  </p>
                  <button
                    onClick={() => setActiveTab('validation')}
                    className="text-[10px] text-sky-400 hover:text-sky-300 hover:underline block mt-0.5 font-mono cursor-pointer"
                  >
                    Validate vs Candles →
                  </button>
                </div>
              </div>

              {/* Support / Resistance Range Visual Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>Support: ${currentAsset.supportPrice.toLocaleString()}</span>
                  <span className="text-amber-400 font-semibold">Current: ${currentAsset.priceUsd.toLocaleString()}</span>
                  <span>Resistance: ${currentAsset.resistancePrice.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800 flex">
                  {(() => {
                    const range = Math.max(1, currentAsset.resistancePrice - currentAsset.supportPrice);
                    const pos = Math.min(100, Math.max(0, ((currentAsset.priceUsd - currentAsset.supportPrice) / range) * 100));
                    return (
                      <div
                        className="bg-gradient-to-r from-emerald-500 via-sky-400 to-rose-500 h-full rounded-full transition-all duration-500 relative"
                        style={{ width: `${pos}%` }}
                      />
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Substrate Health & Macro Indicator Gauge */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" /> Substrate Market Health
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE STREAM
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-slate-300 font-semibold">
                    <span>Market Appetite Index</span>
                    <span className="font-mono text-amber-400">{sentiment.marketAppetiteIndex ?? sentiment.fearAndGreedIndex}/100</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full rounded-full transition-all"
                      style={{ width: `${sentiment.marketAppetiteIndex ?? sentiment.fearAndGreedIndex}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-slate-300 font-semibold">
                    <span>24h Net Exchange Flow</span>
                    <span className={`font-mono font-bold ${netFlowM < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {netFlowM > 0 ? '+' : ''}{netFlowM}M USD
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {netFlowM < 0 ? 'Outflow (Accumulation in progress)' : 'Inflow (Exchange deposit pressure)'}
                  </p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex justify-between text-slate-300 font-semibold">
                    <span>Systemic Stress Index</span>
                    <span className="font-mono text-emerald-400">{risk.systemicStressIndex.toFixed(2)} / 1.0</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full rounded-full transition-all"
                      style={{ width: `${risk.systemicStressIndex * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* REAL-TIME LIVE OBSERVATIONS GRID (13 CORE DIMENSIONS) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" /> Real-Time Live Observation Stream
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Continuously ingested live data across On-Chain, News, Sentiment, Federal Reserve & Macro, Derivatives & DeFi
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700/60 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                13 LIVE FEEDS INGESTED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              {/* Card 1: Live On-Chain & Network Health */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800/80 pb-2">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Database className="w-4 h-4" /> On-Chain & Health
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">MEMPOOL / BLOCKCHAIN</span>
                </div>
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Net Exchange Flow:</span>
                    <span className={netFlowM < 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {netFlowM > 0 ? '+' : ''}{netFlowM}M USD
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Active Addresses (24h):</span>
                    <span className="text-sky-300 font-bold">{onChain.activeAddresses24h.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Bitcoin Hashrate:</span>
                    <span className="text-slate-200 font-bold">{onChain.hashRateEhs} EH/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">ETH Staking Yield:</span>
                    <span className="text-amber-300 font-bold">{onChain.stakingYieldPct}% APY</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network Health Index:</span>
                    <span className="text-emerald-400 font-bold">{(onChain.networkHealthIndex * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Live Sentiment & Real News */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800/80 pb-2">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Newspaper className="w-4 h-4" /> Sentiment & News
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ALTERNATIVE.ME / RSS</span>
                </div>
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Market Appetite Index:</span>
                    <span className="text-amber-400 font-bold">{sentiment.marketAppetiteIndex ?? sentiment.fearAndGreedIndex} / 100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Social Sentiment Score:</span>
                    <span className="text-emerald-400 font-bold">+{sentiment.socialSentimentScore.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">News Sentiment Score:</span>
                    <span className="text-sky-300 font-bold">+{sentiment.newsSentimentScore.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mention Velocity:</span>
                    <span className="text-purple-300 font-bold">{sentiment.socialMentionVelocity}</span>
                  </div>
                </div>
              </div>

              {/* Card 3: Live Federal Reserve & Macro Data */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800/80 pb-2">
                  <span className="flex items-center gap-1.5 text-purple-400">
                    <Globe className="w-4 h-4" /> Federal Reserve & Macro
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">FRED / YAHOO DXY</span>
                </div>
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fed Interest Rate:</span>
                    <span className="text-purple-300 font-bold">{macro.fedInterestRatePct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CPI Inflation YoY:</span>
                    <span className="text-slate-200 font-bold">{macro.cpiInflationPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DXY Dollar Index:</span>
                    <span className="text-amber-300 font-bold">{macro.dxyDollarIndex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Global M2 Liquidity:</span>
                    <span className="text-emerald-400 font-bold">${macro.globalLiquidityUsdTrillion}T</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Macro Regime:</span>
                    <span className="text-sky-300 font-bold text-[10px]">{macro.macroRegime}</span>
                  </div>
                </div>
              </div>

              {/* Card 4: Live Liquidation Exposure & DeFi Stablecoins */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between font-bold text-slate-200 border-b border-slate-800/80 pb-2">
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <ShieldAlert className="w-4 h-4" /> Liquidation & DeFi
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">BINANCE / DEFILLAMA</span>
                </div>
                <div className="space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Liquidation Exposure:</span>
                    <span className="text-rose-400 font-bold">${(risk.estimatedLiquidationRiskUsd / 1e9).toFixed(2)}B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Average Leverage:</span>
                    <span className="text-amber-300 font-bold">{risk.averageLeverageRatio}x</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stablecoin 24h Mint:</span>
                    <span className="text-emerald-400 font-bold">+{stableM}M USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">DeFi Peg Deviation:</span>
                    <span className="text-slate-200 font-bold">{risk.defiPegDeviationPct}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Collateral Ratio:</span>
                    <span className="text-sky-300 font-bold">{risk.collateralRatioPct}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Live News Headlines Stream & Whale Transfers Stream */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
              {/* Live News Feed Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Newspaper className="w-4 h-4" /> Real-Time Live News Stream
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">UPDATED NOW</span>
                </h4>
                <div className="space-y-2.5">
                  {sentiment.topNewsFeed.slice(0, 3).map((item, idx) => (
                    <div key={`${item.id}_${idx}`} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span className="text-sky-400 font-bold">{item.source}</span>
                        <span>{new Date(item.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="font-semibold text-slate-200 leading-snug">{item.title}</p>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`px-1.5 py-0.5 rounded font-mono font-bold uppercase ${
                          item.sentiment === 'positive' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-slate-800 text-slate-300'
                        }`}>
                          {item.sentiment}
                        </span>
                        <span className="text-slate-400 font-mono">Impact Score: <span className="text-amber-300">{item.impactScore}</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Whale Movements Stream */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-slate-200 text-xs flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <Zap className="w-4 h-4" /> Live On-Chain Whale Transfers
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">MEMPOOL WATCH</span>
                </h4>
                <div className="space-y-2.5">
                  {onChain.topWhaleMovementsUsd.slice(0, 3).map((tx, idx) => (
                    <div key={`${tx.txHash}_${idx}`} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1 font-mono">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">{tx.txHash}</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-sky-300 font-bold uppercase">
                          {tx.direction.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between font-bold text-slate-100">
                        <span>{tx.fromLabel} → {tx.toLabel}</span>
                        <span className="text-emerald-400">${(tx.amountUsd / 1e6).toFixed(1)}M {tx.asset}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CANDLE & RSI VALIDATION (LIMITATION #2 ADDRESSED) */}
      {activeTab === 'validation' && (
        <IndicatorCandleValidationView
          currentSymbol={selectedAssetSymbol}
          approxRsi={currentAsset.rsi14}
          change24hPct={currentAsset.change24hPct}
          onSelectSymbol={setSelectedAssetSymbol}
        />
      )}

      {/* TAB: OUT-OF-SAMPLE BACKTEST & ALPHA AUDIT (LIMITATION #3 ADDRESSED) */}
      {activeTab === 'backtest' && (
        <ThothBacktestAuditView />
      )}

      {/* TAB 2: MECHANISMS PIPELINE */}
      {activeTab === 'mechanisms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* 1. Market Structure Mechanism */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4" /> Market Structure Mechanism
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-300 border border-sky-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Identifies price trends, orderbook spreads, support/resistance, and volatility regimes.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
              <div className="text-slate-400">BTC Trend: <span className="text-slate-100 font-bold">{currentAsset.trend}</span></div>
              <div className="text-slate-400">Regime: <span className="text-amber-300">{currentAsset.volatilityRegime}</span></div>
              <div className="text-slate-400">Support / Resist: <span className="text-emerald-400">${currentAsset.supportPrice}</span> / <span className="text-rose-400">${currentAsset.resistancePrice}</span></div>
            </div>
          </div>

          {/* 2. On-Chain Mechanism */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Database className="w-4 h-4" /> On-Chain Mechanism
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Monitors exchange inflows/outflows, active address velocity, and network health.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
              <div className="text-slate-400">Net Flow 24h: <span className={netFlowM < 0 ? 'text-emerald-400' : 'text-rose-400'}>{netFlowM > 0 ? '+' : ''}{netFlowM}M USD</span></div>
              <div className="text-slate-400">Active Addresses: <span className="text-sky-300">{onChain.activeAddresses24h.toLocaleString()}</span></div>
              <div className="text-slate-400">Hashrate: <span className="text-slate-200">{onChain.hashRateEhs} EH/s</span></div>
            </div>
          </div>

          {/* 3. Sentiment Mechanism */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Newspaper className="w-4 h-4" /> Sentiment & Media Mechanism
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Analyzes news polarity streams and social media crowd momentum.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
              <div className="text-slate-400">Market Appetite: <span className="text-amber-300">{sentiment.marketAppetiteIndex ?? sentiment.fearAndGreedIndex} / 100</span></div>
              <div className="text-slate-400">Social Polarity: <span className="text-emerald-400">+{sentiment.socialSentimentScore.toFixed(2)}</span></div>
              <div className="text-slate-400">Headline Impact: <span className="text-sky-300">+{sentiment.newsSentimentScore.toFixed(2)}</span></div>
            </div>
          </div>

          {/* 4. Macro Mechanism */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> Macroeconomic Mechanism
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Evaluates interest rates, CPI inflation, US Dollar Index DXY, and global liquidity.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
              <div className="text-slate-400">Fed Interest Rate: <span className="text-purple-300">{macro.fedInterestRatePct}%</span></div>
              <div className="text-slate-400">CPI Inflation: <span className="text-slate-200">{macro.cpiInflationPct}%</span></div>
              <div className="text-slate-400">Global Liquidity: <span className="text-emerald-400">${macro.globalLiquidityUsdTrillion}T</span></div>
            </div>
          </div>

          {/* 5. Risk & Systemic Stress Mechanism */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Systemic Risk & DeFi Mechanism
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Estimates liquidation exposure, leverage build-ups, and peg stability.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
              <div className="text-slate-400">Stress Index: <span className="text-emerald-400">{risk.systemicStressIndex.toFixed(2)}</span></div>
              <div className="text-slate-400">Liquidation Exposure: <span className="text-rose-400">${(risk.estimatedLiquidationRiskUsd / 1e9).toFixed(2)}B</span></div>
              <div className="text-slate-400">Average Leverage: <span className="text-amber-300">{risk.averageLeverageRatio}x</span></div>
            </div>
          </div>

          {/* 6. Stablecoin Flows Mechanism */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> Stablecoin Supply Mechanism
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Tracks USDT/USDC minting/burning cycles as exchange dry powder.
            </p>
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs space-y-1 font-mono">
              <div className="text-slate-400">24h Minting Delta: <span className="text-emerald-400">+{stableM}M USD</span></div>
              <div className="text-slate-400">Peg Deviation: <span className="text-slate-200">{risk.defiPegDeviationPct}%</span></div>
              <div className="text-slate-400">Collateral Ratio: <span className="text-sky-300">{risk.collateralRatioPct}%</span></div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: GEMINI LLM ANALYST CONSOLE */}
      {activeTab === 'llm_analyst' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-600/20 text-purple-300 border border-purple-500/30">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Gemini LLM Market Analyst & Time Oracle</h3>
                <p className="text-xs text-slate-400">
                  Synthesizes evidence across all 7 domain mechanisms without mutating state.
                </p>
              </div>
            </div>
            <span className="text-xs font-mono px-3 py-1 bg-slate-950 border border-slate-800 rounded-lg text-purple-300">
              Model: {llm.llmSource || 'gemini-3.6-flash'}
            </span>
          </div>

          {/* Narrative Summary Box */}
          <div className="bg-slate-950 border border-purple-900/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-300">
              <span>Synthesized Market Narrative</span>
              <span>Oracle Confidence: {Math.round(llm.oracleConfidenceScore * 100)}%</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {llm.narrativeSummary}
            </p>
          </div>

          {/* Bullish Catalysts & Bearish Risks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Bullish Catalysts */}
            <div className="bg-slate-950 border border-emerald-900/40 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-emerald-400 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Bullish Catalysts Identified
              </h4>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                {llm.bullishCatalysts.map((cat, idx) => (
                  <li key={idx}>{cat}</li>
                ))}
              </ul>
            </div>

            {/* Bearish Risks */}
            <div className="bg-slate-950 border border-rose-900/40 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-rose-400 flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4" /> Key Risk Factors & Hazards
              </h4>
              <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
                {llm.bearishRiskFactors.map((riskItem, idx) => (
                  <li key={idx}>{riskItem}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Time Oracle Forecast Cards */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Time Oracle Multi-Horizon Forecasts
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="font-mono text-sky-400 font-bold">+1 Hour Horizon</span>
                <p className="text-slate-300">{llm.timeHorizonForecast.hours1}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="font-mono text-amber-400 font-bold">+24 Hours Horizon</span>
                <p className="text-slate-300">{llm.timeHorizonForecast.hours24}</p>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-1">
                <span className="font-mono text-purple-400 font-bold">+7 Days Horizon</span>
                <p className="text-slate-300">{llm.timeHorizonForecast.days7}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ARCHITECTURE DIAGRAM */}
      {activeTab === 'architecture' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-400" /> System Architecture & Data Flow
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              End-to-End pipeline from Exchange & On-Chain observation sources to committed state and memory.
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-around gap-3 text-center text-slate-300">
              <span className="p-2 bg-slate-900 rounded border border-slate-800">Coinbase Price Websocket</span>
              <span className="p-2 bg-slate-900 rounded border border-slate-800">Mempool & Hashrate</span>
              <span className="p-2 bg-slate-900 rounded border border-slate-800">News Feeds</span>
              <span className="p-2 bg-slate-900 rounded border border-slate-800">Alternative.me Sentiment</span>
              <span className="p-2 bg-slate-900 rounded border border-slate-800">FRED & DXY Macro</span>
            </div>

            <div className="text-center text-amber-400 text-lg">↓</div>

            <div className="bg-amber-950/30 border border-amber-800/50 p-3 rounded-xl text-center font-bold text-amber-300">
              Observation Adapters → Typed Observation Transaction (CryptoObservationTransaction)
            </div>

            <div className="text-center text-amber-400 text-lg">↓</div>

            <div className="bg-sky-950/30 border border-sky-800/50 p-3 rounded-xl text-center font-bold text-sky-300">
              Substrate Runtime Queue (pendingCryptoObservations → PerceptualObservation)
            </div>

            <div className="text-center text-amber-400 text-lg">↓</div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl">
              <p className="text-slate-400 text-center mb-2 font-bold">Mechanisms Package (@hrm/domain-crypto) → Propose Contribution</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-center text-[11px]">
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-sky-300">Market Structure</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-emerald-300">On-Chain Activity</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-amber-300">Sentiment & News</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-purple-300">Macro Conditions</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-rose-300">Systemic Risk & DeFi</div>
                <div className="p-2 bg-slate-900 rounded border border-slate-800 text-cyan-300">Stablecoin Flows</div>
                <div className="p-2 bg-slate-900 rounded border border-purple-800/60 text-purple-200 col-span-2 md:col-span-3">LLM Analyst (Gemini Synthesis)</div>
              </div>
            </div>

            <div className="text-center text-amber-400 text-lg">↓</div>

            <div className="bg-emerald-950/30 border border-emerald-800/50 p-3 rounded-xl text-center font-bold text-emerald-300">
              Single-Commit Arbitration (commitNextState) → Apply Accepted proposedCryptoStateUpdate
            </div>

            <div className="text-center text-amber-400 text-lg">↓</div>

            <div className="bg-purple-950/30 border border-purple-800/50 p-3 rounded-xl text-center font-bold text-purple-300">
              Committed World State (X_t+1) • Ledger Entry • Reputation Update • State Hash
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
