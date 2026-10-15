/**
 * @hrm/domain-crypto Mechanism: On-Chain Activity
 * Monitors wallet activity, exchange inflows/outflows, staking rates, and network health.
 */

import { Contribution, HRMWorldState, PerceptualObservation } from '../../../types/hrm';
import { Mechanism } from '../../../engine/mechanisms';

export class OnChainMechanism implements Mechanism {
  id = 'mech_crypto_onchain';
  name = 'On-Chain Activity Mechanism';
  description = 'Monitors exchange deposits/withdrawals, active wallet address velocity, network hash rate, and staking yield trends.';

  propose(state: HRMWorldState, observation?: PerceptualObservation): Contribution {
    const cryptoState = state.cryptoWorldState;
    let onChainToUpdate = undefined;

    if (observation?.cryptoTransactions) {
      for (const tx of observation.cryptoTransactions) {
        if (tx.payload.onChain) {
          onChainToUpdate = tx.payload.onChain;
        }
      }
    }

    const currentOnChain = onChainToUpdate || cryptoState?.onChain;
    if (!currentOnChain) {
      return {
        mechanismId: this.id,
        mechanismName: this.name,
        confidence: 0.88,
        activationStrength: 0.7,
        estimatedCost: 10,
        uncertainty: 0.12,
        rationale: 'On-Chain Mechanism standby.',
        fieldDeltas: {},
        diagnostics: { summary: 'On-Chain Mechanism standby' },
      };
    }

    const netFlowM = Math.round(currentOnChain.netExchangeFlowUsd24h / 1000000);
    const flowDirection = netFlowM < 0 ? 'net accumulation outflow' : 'exchange deposit inflow';
    const isBullishFlow = netFlowM < 0;

    // Dynamic confidence based on active addresses and network health index
    let confidence = 0.88 + (currentOnChain.networkHealthIndex * 0.08);
    confidence = Math.max(0.70, Math.min(0.97, confidence));

    const summary = `On-Chain: 24h Exchange Flow ${netFlowM > 0 ? '+' : ''}${netFlowM}M USD (${flowDirection}). Active addresses: ${currentOnChain.activeAddresses24h.toLocaleString()}. Network Health: ${Math.round(currentOnChain.networkHealthIndex * 100)}%.`;

    return {
      mechanismId: this.id,
      mechanismName: this.name,
      confidence,
      activationStrength: 0.82,
      estimatedCost: 10,
      uncertainty: 1 - confidence,
      rationale: summary,
      proposedCryptoStateUpdate: onChainToUpdate ? { onChain: onChainToUpdate } : undefined,
      fieldDeltas: {
        node_1: isBullishFlow ? 0.1 : -0.08, // Node 1: On-Chain Accumulation Momentum
        node_2: currentOnChain.networkHealthIndex > 0.9 ? 0.06 : -0.02,
      },
      predictedFieldValues: {
        node_1: Math.max(0, Math.min(1.0, (state.field.values['node_1'] || 0.5) + (isBullishFlow ? 0.06 : -0.05))),
      },
      diagnostics: {
        summary,
        netExchangeFlowUsd24h: currentOnChain.netExchangeFlowUsd24h,
        activeAddresses24h: currentOnChain.activeAddresses24h,
        whaleAlerts24hCount: currentOnChain.whaleAlerts24hCount,
      },
    };
  }
}
