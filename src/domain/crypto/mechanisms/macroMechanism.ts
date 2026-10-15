/**
 * @hrm/domain-crypto Mechanism: Macroeconomic Conditions
 * Incorporates interest rates, inflation data, US Dollar Index (DXY), and broader liquidity conditions.
 */

import { Contribution, HRMWorldState, PerceptualObservation } from '../../../types/hrm';
import { Mechanism } from '../../../engine/mechanisms';

export class MacroMechanism implements Mechanism {
  id = 'mech_crypto_macro';
  name = 'Macroeconomic Mechanism';
  description = 'Evaluates central bank interest rates, CPI inflation, DXY dollar strength, and global fiat liquidity flows.';

  propose(state: HRMWorldState, observation?: PerceptualObservation): Contribution {
    const cryptoState = state.cryptoWorldState;
    let macroToUpdate = undefined;

    if (observation?.cryptoTransactions) {
      for (const tx of observation.cryptoTransactions) {
        if (tx.payload.macro) {
          macroToUpdate = tx.payload.macro;
        }
      }
    }

    const currentMacro = macroToUpdate || cryptoState?.macro;
    if (!currentMacro) {
      return {
        mechanismId: this.id,
        mechanismName: this.name,
        confidence: 0.89,
        activationStrength: 0.7,
        estimatedCost: 10,
        uncertainty: 0.11,
        rationale: 'Macro Mechanism standby.',
        fieldDeltas: {},
        diagnostics: { summary: 'Macro Mechanism standby' },
      };
    }

    const regime = currentMacro.macroRegime;
    const isDovish = regime === 'Dovish Easing' || regime === 'Neutral Pivot';
    const dxy = currentMacro.dxyDollarIndex;

    // Dynamic confidence: Strong DXY trends or extreme inflation reduce asset valuation confidence
    let confidence = 0.92;
    if (dxy > 106.0) confidence -= 0.08;
    if (regime === 'Stagflationary Stress') confidence -= 0.12;
    confidence = Math.max(0.68, Math.min(0.97, confidence));

    const summary = `Macro: Regime [${regime}]. Fed Rate: ${currentMacro.fedInterestRatePct}%, CPI: ${currentMacro.cpiInflationPct}%, DXY: ${dxy}, Global Liquidity: $${currentMacro.globalLiquidityUsdTrillion}T.`;

    return {
      mechanismId: this.id,
      mechanismName: this.name,
      confidence,
      activationStrength: 0.8,
      estimatedCost: 10,
      uncertainty: 1 - confidence,
      rationale: summary,
      proposedCryptoStateUpdate: macroToUpdate ? { macro: macroToUpdate } : undefined,
      fieldDeltas: {
        node_2: isDovish ? 0.07 : -0.1, // Node 2: Macro Liquidity & Interest Rate Environment
      },
      predictedFieldValues: {
        node_2: Math.max(0, Math.min(1.0, (state.field.values['node_2'] || 0.5) + (isDovish ? 0.05 : -0.06))),
      },
      diagnostics: {
        summary,
        macroRegime: regime,
        fedInterestRatePct: currentMacro.fedInterestRatePct,
        dxyDollarIndex: dxy,
      },
    };
  }
}
