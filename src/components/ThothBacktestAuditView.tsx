import React, { useState, useEffect } from 'react';
import { CryptoAssetSymbol, OutOfSampleBacktestResult } from '../domain/crypto/types';
import { runRealisticThothBacktest, runBacktestOnRealHistory, BacktestDataProvenance } from '../domain/crypto/backtest/thothBacktestEngine';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Database,
  HelpCircle,
  Percent,
  Play,
  RotateCcw,
  ShieldAlert,
  Sliders,
  TrendingDown,
  TrendingUp,
  XCircle,
  Zap
} from 'lucide-react';

export const ThothBacktestAuditView: React.FC = () => {
  const [selectedAsset, setSelectedAsset] = useState<CryptoAssetSymbol>('BTC-USD');
  const [regime, setRegime] = useState<
    'Multi-Regime Out-of-Sample' | 'Bullish Expansion' | 'Bearish Capitulation' | 'Rangebound Chop'
  >('Multi-Regime Out-of-Sample');
  const [takerFeeBps, setTakerFeeBps] = useState<number>(8);
  const [slippageBps, setSlippageBps] = useState<number>(5);
  const [executionDelayCandles, setExecutionDelayCandles] = useState<number>(1);

  // Backtest result: prefers REAL Coinbase historical candles, falls back to
  // clearly-labeled synthetic data only when history is unreachable.
  const [backtestResult, setBacktestResult] = useState<OutOfSampleBacktestResult | null>(null);
  const [provenance, setProvenance] = useState<BacktestDataProvenance | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoadingHistory(true);
    runBacktestOnRealHistory(selectedAsset, {
      regime,
      takerFeeBps,
      slippageBps,
      executionDelayCandles,
      initialCapitalUsd: 100000,
    }).then((outcome) => {
      if (cancelled) return;
      if (outcome.ok && outcome.result) {
        setBacktestResult(outcome.result);
        setProvenance(outcome.provenance ?? null);
      } else {
        // Honest fallback: synthetic, clearly labeled as such.
        setBacktestResult(runRealisticThothBacktest({
          asset: selectedAsset,
          regime,
          takerFeeBps,
          slippageBps,
          executionDelayCandles,
          initialCapitalUsd: 100000,
        }));
        setProvenance({ kind: 'SYNTHETIC_FALLBACK', reason: outcome.error ?? 'real history unreachable' });
      }
      setIsLoadingHistory(false);
    });
    return () => { cancelled = true; };
  }, [selectedAsset, regime, takerFeeBps, slippageBps, executionDelayCandles]);

  if (isLoadingHistory || !backtestResult) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400">
        <Database className="w-8 h-8 text-amber-400 mx-auto mb-3 animate-pulse" />
        <p className="text-sm font-semibold text-slate-200">Fetching real market history…</p>
        <p className="text-xs text-slate-400 mt-1">Pulling Coinbase daily candles for {selectedAsset} to run the backtest on real data.</p>
      </div>
    );
  }

  const assets: CryptoAssetSymbol[] = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'AVAX-USD', 'DOGE-USD'];

  return (
    <div className="space-y-5">
      {/* Formal Research & Limitation #3 Disclosure Header */}
      <div className="bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-500/40 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-rose-500/20 rounded-xl text-rose-400 mt-0.5">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                AUDIT LIMITATION #3 ADDRESSED
              </span>
              <h3 className="text-sm font-extrabold text-slate-100">
                Empirical Out-of-Sample Backtesting & Alpha Audit
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-rose-300">Empirical Audit Finding:</strong> Rigorous quantitative evaluation across unseen historical regimes demonstrates that <span className="text-white font-semibold">Thoth's mechanism forecast signals do NOT produce profitable trading results</span> once realistic trading frictions (taker fees, orderbook slippage, and execution latency) are introduced.
            </p>
            <p className="text-[11px] text-slate-400">
              The Thoth cognitive architecture functions as a multi-mechanism world model and systemic stress monitoring substrate, not an algorithmic profit-generating trading system.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Backtest Parameter Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 font-mono">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            Execution Parameters & Friction Modeler
          </h4>
          <span className="text-[11px] text-slate-400 font-mono">
            Capital: $100,000 USD
          </span>
        </div>

        {/* Data provenance badge — real vs synthetic, always visible */}
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[11px] font-mono ${
          provenance?.kind === 'REAL_COINBASE_HISTORY'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
        }`}>
          <Database className="w-3.5 h-3.5" />
          {provenance?.kind === 'REAL_COINBASE_HISTORY' ? (
            <span>REAL MARKET DATA — Coinbase daily candles {provenance.fromDate} → {provenance.toDate} ({provenance.candleCount} candles)</span>
          ) : (
            <span>SYNTHETIC DATA — illustrative only ({provenance?.kind === 'SYNTHETIC_FALLBACK' ? provenance.reason : 'loading'}). Not empirical.</span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          {/* Asset Selection */}
          <div className="space-y-1.5">
            <label className="text-slate-400 block text-[11px]">Evaluation Asset</label>
            <select
              value={selectedAsset}
              onChange={e => setSelectedAsset(e.target.value as CryptoAssetSymbol)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {assets.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          {/* Out-of-Sample Regime */}
          <div className="space-y-1.5">
            <label className="text-slate-400 block text-[11px]">Out-of-Sample Test Window</label>
            <select
              value={regime}
              onChange={e => setRegime(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="Multi-Regime Out-of-Sample">Multi-Regime Out-of-Sample (180 periods)</option>
              <option value="Bullish Expansion">Bullish Expansion Regime</option>
              <option value="Bearish Capitulation">Bearish Capitulation Regime</option>
              <option value="Rangebound Chop">Rangebound Chop / High Whipsaw</option>
            </select>
          </div>

          {/* Taker Fee slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Taker Fee Tier:</span>
              <span className="text-amber-300 font-bold">{takerFeeBps} bps ({(takerFeeBps / 100).toFixed(2)}%)</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              step="1"
              value={takerFeeBps}
              onChange={e => setTakerFeeBps(parseInt(e.target.value, 10))}
              className="w-full accent-amber-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 bps (Free)</span>
              <span>8 bps (Coinbase)</span>
              <span>20 bps (Retail)</span>
            </div>
          </div>

          {/* Slippage & Latency */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Slippage & Latency:</span>
              <span className="text-sky-300 font-bold">{slippageBps} bps • {executionDelayCandles} lag</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={slippageBps}
                onChange={e => setSlippageBps(parseInt(e.target.value, 10))}
                className="w-full accent-sky-400"
              />
              <select
                value={executionDelayCandles}
                onChange={e => setExecutionDelayCandles(parseInt(e.target.value, 10))}
                className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[11px] text-slate-300"
              >
                <option value="0">0 lag (Cheating)</option>
                <option value="1">1 lag (Realistic)</option>
                <option value="2">2 lag (Delayed)</option>
              </select>
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0 bps</span>
              <span>Spread Crossing</span>
              <span>15 bps</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Empirical Result Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono">
        {/* Net Return */}
        <div className={`p-3.5 rounded-xl border ${
          backtestResult.netReturnPct >= 0
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
        }`}>
          <span className="text-slate-400 text-[10px] block">Net Strategy Return</span>
          <div className="text-xl font-extrabold mt-0.5">
            {backtestResult.netReturnPct > 0 ? '+' : ''}{backtestResult.netReturnPct.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400">
            ${backtestResult.finalCapitalNetUsd.toLocaleString()}
          </span>
        </div>

        {/* Gross Return (Before Fees) */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-slate-400 text-[10px] block">Gross Return (Frictionless)</span>
          <div className="text-xl font-extrabold text-amber-300 mt-0.5">
            {backtestResult.grossReturnPct > 0 ? '+' : ''}{backtestResult.grossReturnPct.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400">Theoretical Upper Bound</span>
        </div>

        {/* Fee & Slippage Drag */}
        <div className="bg-slate-900 border border-rose-500/20 p-3.5 rounded-xl">
          <span className="text-slate-400 text-[10px] block">Fee & Slippage Drag</span>
          <div className="text-xl font-extrabold text-rose-400 mt-0.5">
            -{backtestResult.feeDragPct.toFixed(1)}%
          </div>
          <span className="text-[10px] text-rose-400">
            -${backtestResult.totalFeeAndSlippageUsd.toLocaleString()} friction
          </span>
        </div>

        {/* Benchmark Buy & Hold */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-slate-400 text-[10px] block">Buy & Hold Benchmark</span>
          <div className={`text-xl font-extrabold mt-0.5 ${
            backtestResult.benchmarkBuyAndHoldReturnPct >= 0 ? 'text-sky-300' : 'text-slate-400'
          }`}>
            {backtestResult.benchmarkBuyAndHoldReturnPct > 0 ? '+' : ''}{backtestResult.benchmarkBuyAndHoldReturnPct.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400">Unmanaged Asset</span>
        </div>

        {/* Net Sharpe Ratio */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-slate-400 text-[10px] block">Annualized Net Sharpe</span>
          <div className={`text-xl font-extrabold mt-0.5 ${
            backtestResult.annualizedSharpeNet > 0.5 ? 'text-emerald-400' : 'text-slate-300'
          }`}>
            {backtestResult.annualizedSharpeNet.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400">
            Gross: {backtestResult.annualizedSharpeGross.toFixed(2)}
          </span>
        </div>

        {/* Max Drawdown */}
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
          <span className="text-slate-400 text-[10px] block">Max Drawdown (MDD)</span>
          <div className="text-xl font-extrabold text-rose-400 mt-0.5">
            -{backtestResult.maxDrawdownPct.toFixed(1)}%
          </div>
          <span className="text-[10px] text-slate-400">Peak-to-Trough Loss</span>
        </div>
      </div>

      {/* Statistical Hypothesis Test & Information Coefficient */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-bold text-slate-200 flex items-center gap-1.5 font-mono">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Statistical Significance Test vs Random Walk Null Hypothesis
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            backtestResult.isStatisticallyProfitable
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            {backtestResult.isStatisticallyProfitable ? 'PASSED ALPHA CRITERIA' : 'NULL HYPOTHESIS NOT REJECTED (NO ALPHA)'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-[11px]">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Information Coefficient (IC)</span>
            <span className="text-slate-200 font-bold text-sm">
              {backtestResult.informationCoefficient > 0 ? '+' : ''}{backtestResult.informationCoefficient.toFixed(3)}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">Correlation of signal proposal to forward returns.</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">P-Value vs Random Walk</span>
            <span className={`font-bold text-sm ${backtestResult.pValueVsRandomWalk > 0.05 ? 'text-rose-400' : 'text-emerald-400'}`}>
              p = {backtestResult.pValueVsRandomWalk.toFixed(2)}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">{backtestResult.pValueVsRandomWalk > 0.05 ? 'p > 0.05: Insignificant excess return.' : 'p <= 0.05: Statistically significant.'}</p>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-slate-400 block text-[10px]">Win Rate & Profit Factor</span>
            <span className="text-slate-200 font-bold text-sm">
              {backtestResult.winRatePct.toFixed(1)}% • PF: {backtestResult.profitFactor.toFixed(2)}
            </span>
            <p className="text-[10px] text-slate-400 mt-1">{backtestResult.totalTrades} round-trip simulated trades executed.</p>
          </div>
        </div>

        <p className="text-slate-300 text-[11px] leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800">
          {backtestResult.statisticalFindingSummary}
        </p>
      </div>

      {/* Interactive Equity Curve Inspection */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-200 font-mono flex items-center gap-2">
            <span>Simulated Out-of-Sample Equity Trajectory</span>
            <span className="text-[10px] text-slate-400 font-normal">({backtestResult.totalPeriods} Evaluation Steps)</span>
          </h4>
          <div className="flex items-center gap-3 text-[10px] font-mono">
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" /> Thoth Net (After Fees)
            </span>
            <span className="flex items-center gap-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Gross (No Fees)
            </span>
            <span className="flex items-center gap-1 text-sky-400">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Benchmark (Buy & Hold)
            </span>
          </div>
        </div>

        {/* ASCII / High-density sparkline trajectory */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto">
          <div className="min-w-[600px] h-36 flex items-end gap-1 relative pt-6 pb-2">
            {backtestResult.equityCurve.filter((_, idx) => idx % 4 === 0).map((pt, i) => {
              const maxVal = Math.max(
                ...backtestResult.equityCurve.map(p => Math.max(p.netEquity, p.grossEquity, p.benchmarkEquity))
              );
              const minVal = Math.min(
                ...backtestResult.equityCurve.map(p => Math.min(p.netEquity, p.grossEquity, p.benchmarkEquity))
              );
              const range = Math.max(1, maxVal - minVal);
              const netHeight = Math.max(5, ((pt.netEquity - minVal) / range) * 100);
              const grossHeight = Math.max(5, ((pt.grossEquity - minVal) / range) * 100);
              const benchHeight = Math.max(5, ((pt.benchmarkEquity - minVal) / range) * 100);

              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-0.5 group relative">
                  <div
                    style={{ height: `${benchHeight}%` }}
                    className="w-1 bg-sky-500/30 rounded-t"
                    title={`Benchmark: $${pt.benchmarkEquity.toLocaleString()}`}
                  />
                  <div
                    style={{ height: `${grossHeight}%` }}
                    className="w-1 bg-amber-500/50 rounded-t"
                    title={`Gross: $${pt.grossEquity.toLocaleString()}`}
                  />
                  <div
                    style={{ height: `${netHeight}%` }}
                    className="w-1.5 bg-rose-500 rounded-t group-hover:bg-rose-400 transition-colors"
                    title={`Net Equity (${pt.time}): $${pt.netEquity.toLocaleString()}`}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono border-t border-slate-800 pt-1">
            <span>T+0 (Start: $100,000)</span>
            <span>T+90 (Mid-Period)</span>
            <span>T+180 (End: ${backtestResult.finalCapitalNetUsd.toLocaleString()})</span>
          </div>
        </div>
      </div>

      {/* Detailed Architectural Disclosures */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
        <h4 className="font-bold text-slate-200 flex items-center gap-1.5 font-mono text-[11px]">
          <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
          Quantitative Analysis: Why Raw World Model Forecasts Do Not Yield Trading Alpha
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-slate-300 text-[11px]">
          {backtestResult.limitationDisclosures.map((disc, idx) => (
            <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
              <span className="text-rose-400 font-bold block mb-0.5 font-mono">Factor #{idx + 1}</span>
              {disc}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
