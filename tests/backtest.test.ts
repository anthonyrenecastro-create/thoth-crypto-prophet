import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runRealisticThothBacktest } from '../src/domain/crypto/backtest/thothBacktestEngine';
import { calculateWilderRsi } from '../src/domain/crypto/validation/candleValidator';

describe('Thoth backtest engine (synthetic path)', () => {
  it('produces a complete, well-formed result', () => {
    const r = runRealisticThothBacktest({ asset: 'BTC-USD', initialCapitalUsd: 100000 });
    assert.equal(r.asset, 'BTC-USD');
    assert.equal(r.initialCapitalUsd, 100000);
    assert.ok(r.totalPeriods > 0, 'should have evaluation periods');
    assert.ok(Array.isArray(r.equityCurve) && r.equityCurve.length === r.totalPeriods);
    assert.ok(Array.isArray(r.trades));
    assert.ok(typeof r.netReturnPct === 'number' && Number.isFinite(r.netReturnPct));
    assert.ok(typeof r.informationCoefficient === 'number');
    assert.ok(r.pValueVsRandomWalk >= 0 && r.pValueVsRandomWalk <= 1);
    assert.ok(r.testPeriodLabel.includes('SYNTHETIC'), 'synthetic runs must be labeled');
  });

  it('is deterministic for the same config', () => {
    const a = runRealisticThothBacktest({ asset: 'ETH-USD' });
    const b = runRealisticThothBacktest({ asset: 'ETH-USD' });
    assert.equal(a.netReturnPct, b.netReturnPct);
    assert.equal(a.totalTrades, b.totalTrades);
    assert.equal(a.finalCapitalNetUsd, b.finalCapitalNetUsd);
  });

  it('applies trading frictions (net <= gross)', () => {
    const r = runRealisticThothBacktest({ asset: 'BTC-USD' });
    assert.ok(r.feeDragPct >= 0, 'fee drag should be non-negative');
    assert.ok(r.totalFeeAndSlippageUsd >= 0);
    // Net return must not exceed gross return once frictions are modeled
    assert.ok(r.netReturnPct <= r.grossReturnPct + 1e-9);
  });

  it('reports honest statistical findings', () => {
    const r = runRealisticThothBacktest({ asset: 'BTC-USD' });
    assert.ok(r.statisticalFindingSummary.includes('NO statistically significant evidence'));
    assert.ok(r.limitationDisclosures.length >= 3);
    assert.equal(typeof r.isStatisticallyProfitable, 'boolean');
  });

  it('handles zero-friction edge config without crashing', () => {
    const r = runRealisticThothBacktest({ asset: 'SOL-USD', takerFeeBps: 0, slippageBps: 0 });
    assert.ok(Number.isFinite(r.netReturnPct));
  });
});

describe('Wilder RSI calculator', () => {
  it('returns 100 for flat prices (zero-loss convention)', () => {
    // No downward movement -> avgLoss === 0 -> RSI 100 by Wilder's convention.
    // Flat markets read as "no selling pressure" in this implementation.
    const closes = Array(20).fill(100);
    const { currentRsi: rsi } = calculateWilderRsi(closes, 14);
    assert.equal(rsi, 100);
  });

  it('returns high RSI for sustained uptrend', () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 + i * 2);
    const { currentRsi: rsi } = calculateWilderRsi(closes, 14);
    assert.ok(rsi > 70, `expected >70, got ${rsi}`);
  });

  it('returns low RSI for sustained downtrend', () => {
    const closes = Array.from({ length: 30 }, (_, i) => 100 - i * 2);
    const { currentRsi: rsi } = calculateWilderRsi(closes, 14);
    assert.ok(rsi < 30, `expected <30, got ${rsi}`);
  });

  it('stays within 0-100 bounds', () => {
    const closes = Array.from({ length: 50 }, (_, i) => 100 + Math.sin(i) * 10 + i * 0.5);
    const { currentRsi: rsi } = calculateWilderRsi(closes, 14);
    assert.ok(rsi >= 0 && rsi <= 100, `out of bounds: ${rsi}`);
  });
});
