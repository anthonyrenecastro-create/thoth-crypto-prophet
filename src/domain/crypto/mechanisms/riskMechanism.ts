/**
 * @hrm/domain-crypto Mechanism: Risk & Systemic Stress
 * Estimates liquidation risk, leverage ratio build-ups, DeFi peg deviations, and systemic stress.
 */

import { Contribution, HRMWorldState, PerceptualObservation } from '../../../types/hrm';
import { Mechanism } from '../../../engine/mechanisms';

export class RiskMechanism implements Mechanism {
  id = 'mech_crypto_risk';
  name = 'Systemic Risk & DeFi Mechanism';
  description = 'Estimates total leverage at risk of cascade liquidation, collateral ratios, stablecoin peg stability, and systemic stress index.';

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
        confidence: 0.88,
        activationStrength: 0.7,
        estimatedCost: 10,
        uncertainty: 0.12,
        rationale: 'Risk Mechanism standby.',
        fieldDeltas: {},
        diagnostics: { summary: 'Risk Mechanism standby' },
      };
    }

    const stress = currentRisk.systemicStressIndex;
    const liqRiskB = (currentRisk.estimatedLiquidationRiskUsd / 1000000000).toFixed(2);
    const leverage = currentRisk.averageLeverageRatio;

    let alertSeverity = 'Low';
    if (stress > 0.6) alertSeverity = 'HIGH SYSTEMIC RISK';
    else if (stress > 0.35) alertSeverity = 'Moderate Leverage Stress';

    // Dynamic confidence: High stress index or peg deviation reduces confidence
    let confidence = 0.92 - (stress * 0.20) - (currentRisk.defiPegDeviationPct * 0.05);
    confidence = Math.max(0.60, Math.min(0.96, confidence));

    const summary = `Risk & DeFi: Stress Index ${stress.toFixed(2)} (${alertSeverity}). Estimated Liquidation Risk: $${liqRiskB}B. Average Leverage: ${leverage}x. Peg Deviation: ${currentRisk.defiPegDeviationPct}%.`;

    return {
      mechanismId: this.id,
      mechanismName: this.name,
      confidence,
      activationStrength: 0.82,
      estimatedCost: 10,
      uncertainty: 1 - confidence,
      rationale: summary,
      proposedCryptoStateUpdate: riskToUpdate ? { risk: riskToUpdate } : undefined,
      fieldDeltas: {
        node_3: stress > 0.5 ? -0.15 : 0.02, // Node 3: Systemic Stress & Derivatives Leverage Risk
      },
      predictedFieldValues: {
        node_3: Math.max(0, Math.min(1.0, (state.field.values['node_3'] || 0.5) - (stress * 0.1))),
      },
      diagnostics: {
        summary,
        systemicStressIndex: stress,
        estimatedLiquidationRiskUsd: currentRisk.estimatedLiquidationRiskUsd,
        defiPegDeviationPct: currentRisk.defiPegDeviationPct,
      },
    };
  }
}
