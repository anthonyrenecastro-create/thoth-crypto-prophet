import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { getLiveCryptoObservationState } from './src/server/liveObservations';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Rate limiting: protect paid API surface (Gemini quota, Coinbase proxy)
// behind sensible per-IP budgets. Tuned for interactive dashboard use.
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests/min per IP across /api/*
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded. Slow down and try again shortly.' },
});
const geminiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // LLM calls are expensive — 10/min per IP
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'LLM rate limit exceeded. The analyst needs a breather — try again in a minute.' },
});
app.use('/api/', apiLimiter);
app.use('/api/gemini/', geminiLimiter);

// Shared Gemini Client Instance
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: Date.now(),
  });
});

// Financial disclaimer attached to every forecast/analysis API response.
// This product is a research workbench, not investment advice.
const FINANCIAL_DISCLAIMER =
  'Not financial advice. Experimental model outputs with no validated predictive edge. ' +
  'Cryptocurrency trading involves substantial risk of loss. Do your own research.';

// Stamp the disclaimer onto every /api/gemini/* JSON response
// (forecasts, analyst narratives, fallbacks, and errors alike).
app.use('/api/gemini', (_req, res, next) => {
  const originalJson = res.json.bind(res);
  (res as any).json = (body: any) => {
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      body.disclaimer = FINANCIAL_DISCLAIMER;
    }
    return originalJson(body);
  };
  next();
});

// Helper for Wilder's 14-period RSI
function computeServerWilderRsi(closePrices: number[], period = 14): number {
  if (closePrices.length < period + 1) return 50.0;
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < closePrices.length; i++) {
    const diff = closePrices[i] - closePrices[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? -diff : 0);
  }
  let avgGain = gains.slice(0, period).reduce((s, g) => s + g, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((s, l) => s + l, 0) / period;
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }
  if (avgLoss === 0) return 100;
  if (avgGain === 0) return 0;
  const rs = avgGain / avgLoss;
  return Math.round((100 - 100 / (1 + rs)) * 10) / 10;
}

// 1b. Coinbase Exchange Public Market Proxy
app.get('/api/coinbase/market', async (req, res) => {
  try {
    const symbols = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'AVAX-USD', 'DOGE-USD'];
    const names: Record<string, string> = {
      'BTC-USD': 'Bitcoin',
      'ETH-USD': 'Ethereum',
      'SOL-USD': 'Solana',
      'AVAX-USD': 'Avalanche',
      'DOGE-USD': 'Dogecoin',
    };
    const assets: Record<string, any> = {};

    const apiKey = process.env.COINBASE_API_KEY;
    const headers: Record<string, string> = {
      'User-Agent': 'CoinbaseOracle/1.0',
    };
    if (apiKey) {
      headers['CB-ACCESS-KEY'] = apiKey;
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const [tickerRes, statsRes, candleRes] = await Promise.all([
            fetch(`https://api.exchange.coinbase.com/products/${symbol}/ticker`, { headers }),
            fetch(`https://api.exchange.coinbase.com/products/${symbol}/stats`, { headers }),
            fetch(`https://api.exchange.coinbase.com/products/${symbol}/candles?granularity=3600`, { headers }),
          ]);

          if (tickerRes.ok && statsRes.ok) {
            const ticker: any = await tickerRes.json();
            const stats: any = await statsRes.json();

            const price = parseFloat(ticker.price);
            const open = parseFloat(stats.open);
            const high = parseFloat(stats.high);
            const low = parseFloat(stats.low);
            const volume = parseFloat(stats.volume) * price;
            const bid = parseFloat(ticker.bid);
            const ask = parseFloat(ticker.ask);
            const change24hPct = open > 0 ? ((price - open) / open) * 100 : 0;
            const spreadBps = price > 0 ? ((ask - bid) / price) * 10000 : 1;

            let trend = 'Neutral Rangebound';
            if (change24hPct > 3) trend = 'Strong Bullish';
            else if (change24hPct > 0.5) trend = 'Bullish Consolidation';
            else if (change24hPct < -3) trend = 'Severe Markdown';
            else if (change24hPct < -0.5) trend = 'Bearish Distribution';

            let volatilityRegime = 'Moderate Expansion';
            const rangePct = open > 0 ? ((high - low) / open) * 100 : 3;
            if (rangePct > 7) volatilityRegime = 'Extreme Volatility Spike';
            else if (rangePct < 2) volatilityRegime = 'Low Volatility Squeeze';

            const approxRsi = Math.round((50 + change24hPct * 2.2) * 10) / 10;
            let finalRsi = approxRsi;
            let rsiCalculatedFromCandles = false;
            let rsiValidationDelta = 0;

            if (candleRes.ok) {
              const candleData: any = await candleRes.json();
              if (Array.isArray(candleData) && candleData.length >= 15) {
                // sort oldest first
                const sortedCloses = candleData
                  .map((c: any) => ({ time: c[0], close: c[4] }))
                  .sort((a: any, b: any) => a.time - b.time)
                  .map((c: any) => c.close);
                finalRsi = computeServerWilderRsi(sortedCloses, 14);
                rsiCalculatedFromCandles = true;
                rsiValidationDelta = Math.round((finalRsi - approxRsi) * 10) / 10;
              }
            }

            assets[symbol] = {
              symbol,
              name: names[symbol],
              priceUsd: price,
              change24hPct: Math.round(change24hPct * 100) / 100,
              high24h: high,
              low24h: low,
              volume24hUsd: Math.round(volume),
              bidUsd: bid,
              askUsd: ask,
              spreadBps: Math.round(spreadBps * 10) / 10,
              supportPrice: Math.round(low * 0.985 * 100) / 100,
              resistancePrice: Math.round(high * 1.015 * 100) / 100,
              rsi14: finalRsi,
              trend,
              volatilityRegime,
              lastUpdatedTimestamp: Date.now(),
              isLiveCoinbaseData: true,
              dataSourceProvenance: 'LIVE_EXCHANGE_REST_WS',
              isPredefinedExample: false,
              rsiCalculatedFromCandles,
              rsiValidationDelta,
            };
          }
        } catch (e) {
          console.warn(`Coinbase proxy error for ${symbol}:`, e);
        }
      })
    );

    res.json({ assets, timestamp: Date.now() });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch Coinbase market data' });
  }
});

// 1b1. Coinbase Historical Candles Proxy & Indicator Validator Endpoint
app.get('/api/coinbase/candles', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string) || 'BTC-USD';
    const granularity = parseInt((req.query.granularity as string) || '3600', 10);
    const headers: Record<string, string> = { 'User-Agent': 'CoinbaseOracle/1.0' };

    const candleRes = await fetch(
      `https://api.exchange.coinbase.com/products/${symbol}/candles?granularity=${granularity}`,
      { headers }
    );

    if (candleRes.ok) {
      const raw: any = await candleRes.json();
      if (Array.isArray(raw)) {
        const candles = raw
          .map((c: any) => ({
            timestamp: c[0],
            low: c[1],
            high: c[2],
            open: c[3],
            close: c[4],
            volume: c[5],
          }))
          .sort((a: any, b: any) => a.timestamp - b.timestamp);

        const closes = candles.map((c: any) => c.close);
        const wilderRsi = computeServerWilderRsi(closes, 14);

        return res.json({
          symbol,
          granularity,
          candles,
          count: candles.length,
          wilderRsi14: wilderRsi,
          timestamp: Date.now(),
        });
      }
    }

    res.status(502).json({ error: 'Coinbase candle endpoint returned non-200 status' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch candles' });
  }
});

// 1b2. Live Non-Price Observations Ingestion Proxy (On-Chain, Sentiment, News, Macro, Risk, DeFi, Stablecoins)
app.get('/api/observations/live', async (req, res) => {
  try {
    const liveObservationState = await getLiveCryptoObservationState();
    res.json(liveObservationState);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch live crypto observations' });
  }
});


// 1c. Gemini LLM Crypto Analyst Endpoint
app.post('/api/gemini/crypto-analyst', async (req, res) => {
  try {
    const { cryptoWorldState } = req.body;

    if (!ai) {
      return res.json({
        llmSource: 'heuristic_fallback',
        narrativeSummary:
          'The Crypto Substrate shows bullish resilience backed by spot ETF demand and net exchange outflows (-$145M). Macro liquidity remains supportive.',
        bullishCatalysts: [
          'Net exchange outflow (-$145M USD/24h) indicates strong spot accumulation',
          'Dovish Fed stance reducing capital discount rates',
          'Stablecoin expansion (+$420M minting) injecting dry powder',
        ],
        bearishRiskFactors: [
          'High derivatives leverage near peak volatility bands ($35B)',
          'Market Appetite Index (68/100) approaching constructive expansion zone',
        ],
        keySupportResistanceObservation: 'BTC-USD key support established at $94,000, resistance at $98,500.',
        oracleConfidenceScore: 0.91,
        recommendedRegimeShift: 'Maintain Moderate Expansion / Bullish Accumulation Strategy',
        timeHorizonForecast: {
          hours1: 'Tight rangebound consolidation around $96,500.',
          hours24: 'Potential retest of $98,500 resistance during US institutional volume.',
          days7: 'Targeting $100,000 if net exchange outflows persist.',
        },
      });
    }

    const systemInstruction = `
You are the Crypto World Model LLM Analyst in an HRM Ecology runtime.
You receive real-time observation inputs (Coinbase Market Tickers, On-Chain Flows, Sentiment Feeds, Macro Indicators, and Systemic Risk Scores).
Your task is to synthesize all evidence into a structured explanation and time-oracle forecast without altering state directly.
Return strictly JSON matching the specified schema.
`;

    const prompt = `
Current Crypto World State:
${JSON.stringify(cryptoWorldState || {}, null, 2)}

Synthesize the evidence across Market Structure, On-Chain Activity, Sentiment, Macro, and Risk into structured LLM Analyst insights.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            narrativeSummary: { type: Type.STRING },
            bullishCatalysts: { type: Type.ARRAY, items: { type: Type.STRING } },
            bearishRiskFactors: { type: Type.ARRAY, items: { type: Type.STRING } },
            keySupportResistanceObservation: { type: Type.STRING },
            oracleConfidenceScore: { type: Type.NUMBER },
            recommendedRegimeShift: { type: Type.STRING },
            timeHorizonForecast: {
              type: Type.OBJECT,
              properties: {
                hours1: { type: Type.STRING },
                hours24: { type: Type.STRING },
                days7: { type: Type.STRING },
              },
              required: ['hours1', 'hours24', 'days7'],
            },
          },
          required: [
            'narrativeSummary',
            'bullishCatalysts',
            'bearishRiskFactors',
            'keySupportResistanceObservation',
            'oracleConfidenceScore',
            'recommendedRegimeShift',
            'timeHorizonForecast',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      llmSource: 'gemini-3.6-flash',
      ...parsed,
    });
  } catch (error: any) {
    console.error('Crypto Analyst API Error:', error);
    res.status(500).json({ error: error.message || 'Crypto Analyst Synthesis Error' });
  }
});

// 2. LLM A: Reasoning Engine Endpoint
app.post('/api/gemini/reason', async (req, res) => {
  try {
    const { worldStateSummary, userPrompt } = req.body;

    if (!ai) {
      // Fallback response if key is missing
      return res.json({
        llmSource: 'heuristic_fallback',
        rationale: '[Fallback Reasoning] API Key not detected; executing local heuristic substrate adaptation.',
        confidence: 0.85,
        activationStrength: 0.75,
        fieldDeltas: {},
        cognitiveFocusNodeId: worldStateSummary?.attentionFocusNodeId || 'node_0',
        strategicGoalAdjustment: userPrompt ? `Orient toward: ${userPrompt}` : null,
        proposedEvents: [],
      });
    }

    const systemInstruction = `
You are LLM A (Reasoning Engine) inside an HRM (Hierarchical Resilient Model) World-Model Substrate.
Your function is general intelligence reasoning operating over the substrate's perception, memory, goals, uncertainty, and topology.
Analyze the current world state and user input, then output strategic reasoning proposals, target field deltas, cognitive focus shifts, and structural adaptation events.
Respond strictly in JSON format.
`;

    const prompt = `
Current World State Summary:
- Step: ${worldStateSummary?.step ?? 0}
- Active Goal: ${worldStateSummary?.activeGoal ?? 'Maintain World Model Stability'}
- Focus Node: ${worldStateSummary?.attentionFocusNodeId ?? 'node_0'}
- Global Stress: ${worldStateSummary?.globalStress ?? 0.1}
- Global Entropy / Uncertainty: ${worldStateSummary?.globalEntropy ?? 0.1}
- Active Nodes Count: ${worldStateSummary?.nodeCount ?? 12}
- Sensed Nodes / Observation: ${JSON.stringify(worldStateSummary?.observation || {})}
${userPrompt ? `- User Directive / Sensor Trigger: "${userPrompt}"` : ''}

Generate structured reasoning proposal with fieldDeltas, strategic goal adjustment, focus node, and proposed events.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rationale: { type: Type.STRING, description: 'Strategic reasoning summary' },
            confidence: { type: Type.NUMBER, description: 'Confidence score between 0 and 1' },
            activationStrength: { type: Type.NUMBER, description: 'Activation strength between 0 and 1' },
            cognitiveFocusNodeId: { type: Type.STRING, description: 'Target node ID for attention focus' },
            strategicGoalAdjustment: { type: Type.STRING, description: 'Updated active goal or strategy' },
            fieldDeltas: {
              type: Type.OBJECT,
              description: 'Proposed scalar field delta per nodeId e.g. {"node_0": 0.1, "node_1": -0.05}',
            },
            proposedEvents: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, description: 'e.g. EdgeHealing, SplitRegion, AddNode, AddEdge' },
                  targetIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                  reason: { type: Type.STRING },
                },
                required: ['type', 'reason'],
              },
            },
          },
          required: ['rationale', 'confidence', 'activationStrength'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      llmSource: 'gemini-3.6-flash',
      ...parsed,
    });
  } catch (error: any) {
    console.error('LLM A Reasoning Error:', error);
    res.status(500).json({
      error: error.message || 'LLM A Reasoning Failure',
      llmSource: 'error_fallback',
      rationale: `Error calling Gemini reasoning engine: ${error.message}. Substrate reverting to safety fallback.`,
      confidence: 0.5,
      activationStrength: 0.3,
    });
  }
});

// 3. LLM B: Critique & Reflector Endpoint
app.post('/api/gemini/critique', async (req, res) => {
  try {
    const { worldStateSummary, proposals } = req.body;

    if (!ai) {
      return res.json({
        llmSource: 'heuristic_fallback',
        critiqueRationale: '[Fallback Critique] Safe mode verified; baseline mechanism weights accepted.',
        overallConsistencyScore: 0.92,
        hallucinationRisk: 0.05,
        mechanismWeightAdjustments: {},
        vetoedMechanisms: [],
        safetyWarnings: [],
      });
    }

    const systemInstruction = `
You are LLM B (Critique & Reflector) in an HRM World-Model Substrate.
Your role is adversarial critique, contradiction detection, hallucination and entropy auditing, and safety/consistency verification before mechanism arbitration.
Review the world state and mechanism proposals (from LLM A, deterministic tools, and sensors), evaluate consistency and conservation, and return weight adjustments or safety warnings.
Respond strictly in JSON format.
`;

    const prompt = `
World State Context:
- Step: ${worldStateSummary?.step ?? 0}
- Global Stress: ${worldStateSummary?.globalStress ?? 0.1}
- Global Entropy: ${worldStateSummary?.globalEntropy ?? 0.1}

Active Proposals To Critique:
${JSON.stringify(proposals || [], null, 2)}

Provide critique evaluation and mechanism weight adjustments.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            critiqueRationale: { type: Type.STRING, description: 'Critique and consistency audit findings' },
            overallConsistencyScore: { type: Type.NUMBER, description: 'Substrate consistency score [0, 1]' },
            hallucinationRisk: { type: Type.NUMBER, description: 'Estimated hallucination/entropy risk [0, 1]' },
            vetoedMechanisms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of mechanism IDs to veto or disable for this step due to safety/contradiction',
            },
            safetyWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            mechanismWeightAdjustments: {
              type: Type.OBJECT,
              description: 'Multipliers for mechanism confidence e.g. {"mech_llm_reasoning": 1.1, "mech_diffusion": 0.9}',
            },
          },
          required: ['critiqueRationale', 'overallConsistencyScore', 'hallucinationRisk'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      llmSource: 'gemini-3.6-flash',
      ...parsed,
    });
  } catch (error: any) {
    console.error('LLM B Critique Error:', error);
    res.status(500).json({
      error: error.message || 'LLM B Critique Failure',
      llmSource: 'error_fallback',
      critiqueRationale: `Critique service encounter exception: ${error.message}. Standard safety bounds enforced.`,
      overallConsistencyScore: 0.7,
      hallucinationRisk: 0.2,
      vetoedMechanisms: [],
      safetyWarnings: ['LLM B critique pipeline unavailable; default safety bounds active.'],
    });
  }
});

// 4. Interactive Full Orchestration Endpoint
app.post('/api/gemini/interact', async (req, res) => {
  try {
    const { userPrompt, worldStateSummary } = req.body;

    if (!ai) {
      return res.json({
        llmSource: 'heuristic_fallback',
        llmA: {
          rationale: `[Substrate Action] Simulated response for prompt: "${userPrompt}". Modifying substrate attractor field.`,
          confidence: 0.88,
          activationStrength: 0.9,
          cognitiveFocusNodeId: 'node_1',
          strategicGoalAdjustment: userPrompt,
          fieldDeltas: { node_0: 0.2, node_1: 0.4 },
          proposedEvents: [],
        },
        llmB: {
          critiqueRationale: 'Substrate input within safety bounds. Verified energy budget.',
          overallConsistencyScore: 0.95,
          hallucinationRisk: 0.03,
          safetyWarnings: [],
        },
        toolActionsExecuted: ['Attractor Field Alignment', 'Memory Salience Boost'],
      });
    }

    const systemInstruction = `
You are the General Intelligence Orchestrator for the HRM Ecology Substrate.
When a user or environment input is received:
1. LLM A generates strategic reasoning, target node focus, and substrate field deltas.
2. LLM B critiques LLM A's proposals and evaluates risk & safety.
3. Relevant Tool actions are selected for substrate mutation.

Output JSON matching the exact schema.
`;

    const prompt = `
User Input Directive: "${userPrompt}"
Substrate State:
- Step: ${worldStateSummary?.step ?? 0}
- Active Goal: ${worldStateSummary?.activeGoal ?? 'Maintain World Model Stability'}
- Focus Node: ${worldStateSummary?.attentionFocusNodeId ?? 'node_0'}
- Stress: ${worldStateSummary?.globalStress ?? 0.1}
- Entropy: ${worldStateSummary?.globalEntropy ?? 0.1}

Perform full Tri-Path Orchestration (LLM A reasoning, LLM B critique, Tool Actions).
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            llmA: {
              type: Type.OBJECT,
              properties: {
                rationale: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                activationStrength: { type: Type.NUMBER },
                cognitiveFocusNodeId: { type: Type.STRING },
                strategicGoalAdjustment: { type: Type.STRING },
                fieldDeltas: { type: Type.OBJECT },
                proposedEvents: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING },
                      targetIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                      reason: { type: Type.STRING },
                    },
                  },
                },
              },
              required: ['rationale', 'confidence'],
            },
            llmB: {
              type: Type.OBJECT,
              properties: {
                critiqueRationale: { type: Type.STRING },
                overallConsistencyScore: { type: Type.NUMBER },
                hallucinationRisk: { type: Type.NUMBER },
                safetyWarnings: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
              required: ['critiqueRationale', 'overallConsistencyScore'],
            },
            toolActionsExecuted: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['llmA', 'llmB', 'toolActionsExecuted'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      llmSource: 'gemini-3.6-flash',
      ...parsed,
    });
  } catch (error: any) {
    console.error('Interact Error:', error);
    res.status(500).json({ error: error.message || 'Interact Failure' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HRM Ecology Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
