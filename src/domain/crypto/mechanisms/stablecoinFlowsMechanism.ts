/**
 * @hrm/domain-crypto Mechanism: Stablecoin Flows
 * Tracks USDT / USDC supply minting, burning, and exchange reserve movements.
 */

import { Contribution, HRMWorldState, PerceptualObservation } from '../../../types/hrm';
import { Mechanism } from '../../../engine/mechanisms';

export class StablecoinFlowsMechanism implements Mechanism {
  id = 'mech_crypto_stablecoin_flows';
  name = 'Stablecoin Supply & Flows Mechanism';
  description = 'Monitors stablecoin minting/burning cycles (USDT/USDC) as a proxy for dry powder fiat capital entering exchange orderbooks.';

  propose(state: HRMWorldState, observation?: PerceptualObservation): Contribution {
    const cryptoState = state.cryptoWorldState;
    let riskToUpdate = undefined;

    if (observation?.cryptoTransactions) {
      for (const tx of observation.cryptoTransactions) {
        if (tx.payload.risk) {
          riskToUpdate = tx.payload.risk;
        }
      }
    }

    const currentRisk = riskToUpdate || cryptoState?.risk;
    if (!currentRisk) {
      return {
        mechanismId: this.id,
        mechanismName: this.name,
        confidence: 0.9,
        activationStrength: 0.7,
        estimatedCost: 10,
        uncertainty: 0.1,
        rationale: 'Stablecoin Mechanism standby.',
        fieldDeltas: {},
        diagnostics: { summary: 'Stablecoin Mechanism standby' },
      };
    }

    const flowM = Math.round(currentRisk.stablecoinSupplyChangeUsd24h / 1000000);
    const direction = flowM >= 0 ? 'Net Expansion (Minting)' : 'Net Contraction (Redemption)';

    let confidence = 0.92;
    if (flowM < -500) confidence -= 0.10; // Rapid redemptions indicate liquidity flight
    confidence = Math.max(0.70, Math.min(0.97, confidence));

    const summary = `Stablecoin Flows: 24h Supply Change ${flowM >= 0 ? '+' : ''}${flowM}M USD (${direction}). Dry powder reserve entering trading pairs.`;

    return {
      mechanismId: this.id,
      mechanismName: this.name,
      confidence,
      activationStrength: 0.8,
      estimatedCost: 10,
      uncertainty: 1 - confidence,
      rationale: summary,
      proposedCryptoStateUpdate: riskToUpdate ? { risk: riskToUpdate } : undefined,
      fieldDeltas: {
        node_5: flowM > 0 ? 0.08 : -0.06, // Node 5: Stablecoin Liquidity & Dry Powder
      },
      predictedFieldValues: {
        node_5: Math.max(0, Math.min(1.0, (state.field.values['node_5'] || 0.5) + (flowM > 0 ? 0.05 : -0.04))),
      },
      diagnostics: {
        summary,
        stablecoinSupplyChangeUsd24h: currentRisk.stablecoinSupplyChangeUsd24h,
      },
    };
  }
}
