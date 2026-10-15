/**
 * @hrm/domain-crypto Mechanism: Market Structure
 * Identifies trends, support/resistance levels, orderbook bid/ask spreads, and volatility regimes.
 */

import { Contribution, HRMWorldState, PerceptualObservation } from '../../../types/hrm';
import { Mechanism } from '../../../engine/mechanisms';

export class MarketStructureMechanism implements Mechanism {
  id = 'mech_crypto_market_structure';
  name = 'Market Structure Mechanism';
  description = 'Analyzes price trends, orderbook spreads, support/resistance boundaries, and volatility regimes across exchange pairs.';

  propose(state: HRMWorldState, observation?: PerceptualObservation): Contribution {
    const cryptoState = state.cryptoWorldState;
    let tickersToUpdate = undefined;

    // 1. Process Observation Transactions if present
    if (observation?.cryptoTransactions) {
      for (const tx of observation.cryptoTransactions) {
        if (tx.payload.coinbaseTickers) {
          tickersToUpdate = tx.payload.coinbaseTickers;
        }
      }
    }

    const currentAssets = tickersToUpdate || cryptoState?.assets;
    if (!currentAssets) {
      return {
        mechanismId: this.id,
        mechanismName: this.name,
        confidence: 0.85,
        activationStrength: 0.7,
        estimatedCost: 10,
        uncertainty: 0.15,
        rationale: 'Market Structure Mechanism standby.',
        fieldDeltas: {},
        diagnostics: { summary: 'Market Structure Mechanism standby' },
      };
    }

    const btc = currentAssets['BTC-USD'];
    const trend = btc ? btc.trend : 'Strong Bullish';
    const regime = btc ? btc.volatilityRegime : 'Moderate Expansion';
    const btcPrice = btc ? btc.priceUsd : 96450;
    const support = btc ? btc.supportPrice : 94000;
    const resistance = btc ? btc.resistancePrice : 98500;
    const spreadBps = btc ? btc.spreadBps : 0.5;

    // Dynamic Confidence Calculation based on spread tightness & volatility
    let confidence = 0.94;
    if (spreadBps > 5.0) confidence -= 0.10; // Wide orderbook spread lowers confidence
    if (regime === 'Extreme Volatility Spike') confidence -= 0.12;
    confidence = Math.max(0.65, Math.min(0.98, confidence));

    const summary = `Market Structure: ${trend} (${regime}). BTC $${btcPrice.toLocaleString()} (Support: $${support.toLocaleString()}, Resistance: $${resistance.toLocaleString()}, Spread: ${spreadBps}bps).`;

    return {
      mechanismId: this.id,
      mechanismName: this.name,
      confidence,
      activationStrength: 0.88,
      estimatedCost: 10,
      uncertainty: 1 - confidence,
      rationale: summary,
      proposedCryptoStateUpdate: tickersToUpdate ? { assets: tickersToUpdate } : undefined,
      fieldDeltas: {
        node_0: btc && btc.change24hPct > 0 ? 0.08 : -0.05, // Node 0: Exchange Market Liquidity & Price Momentum
        node_1: regime === 'Low Volatility Squeeze' ? 0.12 : 0.02, // Node 1: Accumulation
      },
      predictedFieldValues: {
        node_0: Math.max(0, Math.min(1.0, (state.field.values['node_0'] || 0.5) + (btc && btc.change24hPct > 0 ? 0.05 : -0.04))),
      },
      diagnostics: {
        summary,
        trend,
        volatilityRegime: regime,
        support,
        resistance,
        orderbookSpreadBps: spreadBps,
      },
    };
  }
}
