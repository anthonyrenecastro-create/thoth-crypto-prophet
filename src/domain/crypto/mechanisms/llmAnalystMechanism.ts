/**
 * @hrm/domain-crypto Mechanism: LLM Analyst
 * Synthesizes cross-mechanism evidence (Market Structure, On-Chain, Sentiment, Macro, Risk)
 * into structured explanations, forecasts, and time-oracle predictions WITHOUT directly modifying state.
 */

import { Contribution, HRMWorldState, PerceptualObservation } from '../../../types/hrm';
import { Mechanism } from '../../../engine/mechanisms';

export class LLMAnalystMechanism implements Mechanism {
  id = 'mech_crypto_llm_analyst';
  name = 'LLM Analyst Synthesis Mechanism';
  description = 'Synthesizes qualitative & quantitative market evidence across all mechanisms into a unified structured explanation and forecast without mutating state.';

  propose(state: HRMWorldState, observation?: PerceptualObservation): Contribution {
    const cryptoState = state.cryptoWorldState;
    let llmToUpdate = undefined;

    if (observation?.cryptoTransactions) {
      for (const tx of observation.cryptoTransactions) {
        if (tx.payload.llmAnalyst) {
          llmToUpdate = tx.payload.llmAnalyst;
        }
      }
    }

    const currentLlm = llmToUpdate || cryptoState?.llmAnalyst;
    if (!currentLlm && !cryptoState) {
      return {
        mechanismId: this.id,
        mechanismName: this.name,
        confidence: 0.92,
        activationStrength: 0.7,
        estimatedCost: 10,
        uncertainty: 0.08,
        rationale: 'LLM Analyst standby.',
        fieldDeltas: {},
        diagnostics: { summary: 'LLM Analyst standby' },
      };
    }

    const btc = cryptoState?.assets['BTC-USD'];
    const btcPrice = btc ? `$${btc.priceUsd.toLocaleString()}` : '$96,450';
    const trend = btc ? btc.trend : 'Strong Bullish';
    const netFlowM = cryptoState ? Math.round(cryptoState.onChain.netExchangeFlowUsd24h / 1000000) : -145;
    const appetite = cryptoState ? (cryptoState.sentiment.marketAppetiteIndex ?? cryptoState.sentiment.fearAndGreedIndex ?? 68) : 68;
    const macro = cryptoState ? cryptoState.macro.macroRegime : 'Dovish Easing';
    const stress = cryptoState ? cryptoState.risk.systemicStressIndex.toFixed(2) : '0.22';

    const confidence = currentLlm ? Math.max(0.70, Math.min(0.98, currentLlm.oracleConfidenceScore)) : 0.92;

    const summaryText = currentLlm?.narrativeSummary ||
      `LLM Synthesis: BTC ${btcPrice} (${trend}). Exchange net flow ${netFlowM}M USD. Market Appetite ${appetite}/100. Macro [${macro}]. Systemic Stress ${stress}.`;

    return {
      mechanismId: this.id,
      mechanismName: this.name,
      confidence,
      activationStrength: 0.88,
      estimatedCost: 20,
      uncertainty: 1 - confidence,
      rationale: summaryText,
      proposedCryptoStateUpdate: llmToUpdate ? { llmAnalyst: llmToUpdate } : undefined,
      fieldDeltas: {},
      diagnostics: {
        summary: summaryText,
        trend,
        macroRegime: macro,
        oracleConfidenceScore: confidence,
        forecastHours24: currentLlm?.timeHorizonForecast?.hours24 || 'N/A',
      },
    };
  }
}
