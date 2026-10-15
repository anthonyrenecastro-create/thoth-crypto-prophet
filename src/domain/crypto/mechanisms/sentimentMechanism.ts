/**
 * @hrm/domain-crypto Mechanism: Market Sentiment
 * Analyzes news feeds and social media chatter velocity to estimate market sentiment.
 */

import { Contribution, HRMWorldState, PerceptualObservation } from '../../../types/hrm';
import { Mechanism } from '../../../engine/mechanisms';

export class SentimentMechanism implements Mechanism {
  id = 'mech_crypto_sentiment';
  name = 'Sentiment & Media Mechanism';
  description = 'Processes social sentiment velocity, headline polarity, and the Market Appetite & Risk Index to quantify crowd psychological momentum.';

  propose(state: HRMWorldState, observation?: PerceptualObservation): Contribution {
    const cryptoState = state.cryptoWorldState;
    let sentimentToUpdate = undefined;

    if (observation?.cryptoTransactions) {
      for (const tx of observation.cryptoTransactions) {
        if (tx.payload.sentiment) {
          sentimentToUpdate = tx.payload.sentiment;
        }
      }
    }

    const currentSentiment = sentimentToUpdate || cryptoState?.sentiment;
    if (!currentSentiment) {
      return {
        mechanismId: this.id,
        mechanismName: this.name,
        confidence: 0.85,
        activationStrength: 0.7,
        estimatedCost: 10,
        uncertainty: 0.15,
        rationale: 'Sentiment Mechanism standby.',
        fieldDeltas: {},
        diagnostics: { summary: 'Sentiment Mechanism standby' },
      };
    }

    const appetite = currentSentiment.marketAppetiteIndex ?? currentSentiment.fearAndGreedIndex ?? 68;
    let label = 'Balanced Neutral';
    if (appetite >= 75) label = 'High Growth Appetite';
    else if (appetite >= 55) label = 'Growth Optimism';
    else if (appetite <= 25) label = 'Strong Risk Aversion';
    else if (appetite <= 45) label = 'Cautious Positioning';

    const socialScore = currentSentiment.socialSentimentScore;
    let confidence = 0.86 + (Math.abs(socialScore) * 0.10);
    confidence = Math.max(0.70, Math.min(0.96, confidence));

    const summary = `Market Appetite & Sentiment: Index ${appetite}/100 (${label}). Headline Polarity: ${currentSentiment.newsSentimentScore > 0 ? '+' : ''}${currentSentiment.newsSentimentScore.toFixed(2)}. Social Velocity: ${Math.round(currentSentiment.socialMentionVelocity * 100)}%.`;

    return {
      mechanismId: this.id,
      mechanismName: this.name,
      confidence,
      activationStrength: 0.80,
      estimatedCost: 10,
      uncertainty: 1 - confidence,
      rationale: summary,
      proposedCryptoStateUpdate: sentimentToUpdate ? { sentiment: sentimentToUpdate } : undefined,
      fieldDeltas: {
        node_4: socialScore > 0 ? 0.09 : -0.09, // Node 4: Sentiment & Social Velocity
      },
      predictedFieldValues: {
        node_4: Math.max(0, Math.min(1.0, (state.field.values['node_4'] || 0.5) + (socialScore * 0.08))),
      },
      diagnostics: {
        summary,
        marketAppetiteIndex: appetite,
        socialSentimentScore: socialScore,
        newsCount: currentSentiment.topNewsFeed?.length || 0,
      },
    };
  }
}
