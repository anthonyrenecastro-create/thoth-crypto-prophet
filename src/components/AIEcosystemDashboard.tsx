import React from 'react';
import { HRMWorldState } from '../types/hrm';
import { AISystemTwin } from '../types/aiEcosystem';
import { Cpu, ShieldAlert, Activity, Globe, Zap, Radio, Layers, Sparkles, Server } from 'lucide-react';

interface AIEcosystemDashboardProps {
  state: HRMWorldState;
}

function asPct(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

export const AIEcosystemDashboard: React.FC<AIEcosystemDashboardProps> = ({ state }) => {
  const cryptoState = state.cryptoWorldState;
  const eco = state.aiEcosystem;

  // Derive Crypto Ecosystem Indicators if crypto state is active
  const btcPrice = cryptoState?.assets['BTC-USD']?.priceUsd ?? 96450;
  const netFlowM = cryptoState ? Math.round(cryptoState.onChain.netExchangeFlowUsd24h / 1000000) : -145;
  const appetite = cryptoState?.sentiment.marketAppetiteIndex ?? cryptoState?.sentiment.fearAndGreedIndex ?? 68;
  const stress = cryptoState?.risk.systemicStressIndex ?? 0.12;

  // Crypto Protocol & Agent Twins
  const cryptoTwins = [
    {
      id: 'coinbase_engine',
      label: 'Coinbase Exchange Engine',
      type: 'Live Market Substrate',
      primaryMetric: `BTC $${btcPrice.toLocaleString()}`,
      secondaryMetric: 'REST / WS Live Stream',
      status: cryptoState?.isLiveCoinbaseData ? 'Live Feed Connected' : 'Simulated Ingestion',
      isLive: cryptoState?.isLiveCoinbaseData ?? false,
      indicators: [
        { label: 'Orderbook Depth', val: '$1.42B' },
        { label: 'Bid-Ask Spread', val: '0.01%' },
        { label: '24h Volume', val: '$4.8B' },
        { label: 'API Latency', val: '42ms' },
      ],
    },
    {
      id: 'btc_validator',
      label: 'Bitcoin Validator Substrate',
      type: 'Layer-1 On-Chain Twin',
      primaryMetric: `${netFlowM > 0 ? '+' : ''}${netFlowM}M USD Net Flow`,
      secondaryMetric: '742 EH/s Hash Rate',
      status: netFlowM < 0 ? 'Accumulation Outflow' : 'Exchange Deposit Inflow',
      isLive: true,
      indicators: [
        { label: 'Active Addresses', val: cryptoState ? cryptoState.onChain.activeAddresses24h.toLocaleString() : '1,042,000' },
        { label: 'Network Health', val: asPct(cryptoState?.onChain.networkHealthIndex ?? 0.94) },
        { label: 'Block Velocity', val: '9.8 min' },
        { label: 'Mempool Congestion', val: 'Low' },
      ],
    },
    {
      id: 'eth_staking_defi',
      label: 'Ethereum Staking & DeFi Protocol',
      type: 'Decentralized Capital Twin',
      primaryMetric: '3.2% Staking APR',
      secondaryMetric: 'Collateral Safety 185%',
      status: 'Stable Peg Alignment',
      isLive: true,
      indicators: [
        { label: 'Total Value Locked', val: '$88.5B' },
        { label: 'DeFi Peg Deviation', val: `${cryptoState?.risk.defiPegDeviationPct ?? 0.02}%` },
        { label: 'Stablecoin Flow', val: `+$${Math.round((cryptoState?.risk.stablecoinSupplyChangeUsd24h ?? 420000000) / 1000000)}M` },
        { label: 'Systemic Stress', val: stress.toFixed(2) },
      ],
    },
    {
      id: 'sol_oracle',
      label: 'Solana High-Speed Oracle',
      type: 'High-Frequency Substrate',
      primaryMetric: '2,850 TPS',
      secondaryMetric: 'Slot Time 400ms',
      status: 'High Throughput Active',
      isLive: true,
      indicators: [
        { label: 'SOL Price', val: `$${cryptoState?.assets['SOL-USD']?.priceUsd?.toFixed(2) ?? '188.40'}` },
        { label: 'Oracle Update Hz', val: '10 Hz' },
        { label: 'Validator Count', val: '1,540' },
        { label: 'Epoch Progress', val: '84%' },
      ],
    },
    {
      id: 'gemini_crypto_agent',
      label: 'Gemini Autonomous Crypto Analyst',
      type: 'AI Reasoner & Synthesizer',
      primaryMetric: 'Gemini 3.6 Flash',
      secondaryMetric: 'Multi-Mechanism Synthesis',
      status: 'Tri-Path Active',
      isLive: true,
      indicators: [
        { label: 'Oracle Confidence', val: '94%' },
        { label: 'Macro Regime', val: cryptoState?.macro.macroRegime ?? 'Dovish Easing' },
        { label: 'Market Appetite', val: `${appetite}/100` },
        { label: 'Forecast Horizon', val: '1h / 24h / 7d' },
      ],
    },
  ];

  // Mechanism Contributions
  const mechanismContributions = [
    { name: 'Market Structure Mechanism', confidence: 0.92, summary: `BTC $${btcPrice.toLocaleString()} support maintained. Volatility: ${cryptoState?.assets['BTC-USD']?.volatilityRegime ?? 'Moderate Expansion'}.` },
    { name: 'On-Chain Activity Mechanism', confidence: 0.90, summary: `24h Exchange Net Flow: ${netFlowM > 0 ? '+' : ''}${netFlowM}M USD (${netFlowM < 0 ? 'Accumulation Outflow' : 'Inflow'}).` },
    { name: 'Market Sentiment Mechanism', confidence: 0.88, summary: `Market Appetite Index: ${appetite}/100. News sentiment polarity positive.` },
    { name: 'Macroeconomic Mechanism', confidence: 0.91, summary: `Fed Rate: ${cryptoState?.macro.fedInterestRatePct ?? 4.25}%, CPI: ${cryptoState?.macro.cpiInflationPct ?? 2.7}%, DXY: ${cryptoState?.macro.dxyDollarIndex ?? 104.2}.` },
    { name: 'Systemic Risk & DeFi Mechanism', confidence: 0.89, summary: `Systemic Stress Index: ${stress.toFixed(2)}. Liquidation Risk: $${((cryptoState?.risk.estimatedLiquidationRiskUsd ?? 35000000000) / 1000000000).toFixed(1)}B.` },
    { name: 'Stablecoin Supply & Flows Mechanism', confidence: 0.92, summary: `24h Supply Minting: +$${Math.round((cryptoState?.risk.stablecoinSupplyChangeUsd24h ?? 420000000) / 1000000)}M USD dry powder.` },
    { name: 'LLM Analyst Mechanism', confidence: 0.94, summary: `Gemini synthesis confirms bullish structural expansion backed by spot ETF inflows and macro liquidity.` },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Crypto & AI Ecosystem World State */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Crypto Protocol & AI Ecosystem World State
                {cryptoState?.isLiveCoinbaseData && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Coinbase Live REST/WS
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Multi-actor digital twin ecosystem spanning markets, on-chain validators, DeFi protocols, and AI oracle agents
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
            Substrate Step #{state.metadata.step}
          </span>
        </div>

        {/* 5 High-Level Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <p className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              Oracle Depth Index
            </p>
            <p className="text-xl font-extrabold text-sky-300 font-mono">$4.8B</p>
            <p className="text-[10px] text-slate-500">24h Market Liquidity</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <p className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
              Validator Health Index
            </p>
            <p className="text-xl font-extrabold text-emerald-300 font-mono">
              {asPct(cryptoState?.onChain.networkHealthIndex ?? 0.94)}
            </p>
            <p className="text-[10px] text-slate-500">Consensus & Hashrate</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <p className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              Systemic Stress Index
            </p>
            <p className="text-xl font-extrabold text-amber-300 font-mono">
              {stress.toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-500">Derivatives & Leverage</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <p className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Macro Regime
            </p>
            <p className="text-lg font-extrabold text-cyan-300 font-mono truncate">
              {cryptoState?.macro.macroRegime ?? 'Dovish Easing'}
            </p>
            <p className="text-[10px] text-slate-500">Fed Interest Rate {cryptoState?.macro.fedInterestRatePct ?? 4.25}%</p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1">
            <p className="text-slate-400 font-medium text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              Market Appetite Score
            </p>
            <p className="text-xl font-extrabold text-rose-300 font-mono">
              {appetite}/100
            </p>
            <p className="text-[10px] text-slate-500">Crowd Sentiment Velocity</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Digital Twins & Mechanism Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Digital Twins Snapshot */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-sky-400" /> Protocol & Agent Digital Twins
            </h4>
            <span className="text-[10px] font-mono text-slate-400">5 Active Substrates</span>
          </div>

          <div className="space-y-3">
            {cryptoTwins.map(twin => (
              <div key={twin.id} className="bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h5 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                      {twin.label}
                      {twin.isLive && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-sky-950 border border-sky-800 text-sky-400">
                          {twin.status}
                        </span>
                      )}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-mono">{twin.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-sky-300 font-mono">{twin.primaryMetric}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{twin.secondaryMetric}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-900 text-[11px] font-mono">
                  {twin.indicators.map((ind, i) => (
                    <div key={i} className="bg-slate-900/60 rounded p-1.5 text-center">
                      <span className="text-[9px] text-slate-500 block">{ind.label}</span>
                      <span className="text-xs font-semibold text-slate-200">{ind.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Render any additional AI System twins if present */}
            {eco && Object.values(eco.aiSystems).map((sys: AISystemTwin) => (
              <div key={sys.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{sys.label}</span>
                  <span className="text-[10px] font-mono text-slate-500">{sys.modelFamily}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[11px] text-slate-400 font-mono">
                  <span>Reasoning: <strong className="text-sky-300">{asPct(sys.reasoningPerformance)}</strong></span>
                  <span>Autonomy: <strong className="text-emerald-300">{asPct(sys.autonomyLevel)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Multi-Mechanism Forecast Audit Trail */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" /> Multi-Mechanism Forecast Audit
            </h4>
            <span className="text-[10px] font-mono text-slate-400">Arbitrated Contributions</span>
          </div>

          <div className="space-y-3">
            {mechanismContributions.map((mech, i) => (
              <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-200 text-[11px]">{mech.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
                    Confidence: {(mech.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{mech.summary}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

