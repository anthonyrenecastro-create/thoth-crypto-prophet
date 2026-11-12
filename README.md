# Thoth Crypto Prophet — Market Intelligence Workbench

> **Not financial advice.** Experimental model outputs with no validated predictive edge.
> Cryptocurrency trading involves substantial risk of loss. Do your own research.

A crypto market-intelligence dashboard built on the HRM Ecology world-model architecture.
Live Coinbase market data flows through seven analysis mechanisms (sentiment, macro,
on-chain flows, market structure, risk, stablecoin flows, plus an optional Gemini LLM
analyst), with an honest, friction-modeled backtest auditor.

Part of the **Cryptocurrency Augury Prism** product line.

## What it does

- **Live market view** — real-time Coinbase spot data (BTC, ETH, SOL, AVAX, DOGE) with
  computed indicators (Wilder's RSI-14, ATR, Bollinger, SMA).
- **Mechanism arbitration** — seven independent market mechanisms propose signals;
  an arbitrator commits a single consensus view per cycle. No mechanism mutates state directly.
- **LLM analyst (optional)** — with `GEMINI_API_KEY` set, a Gemini analyst synthesizes
  narrative summaries. Without a key, the server serves clearly-labeled heuristic fallbacks.
- **Backtest auditor** — runs the strategy against **real Coinbase historical daily candles**
  (not synthetic data), modeling taker fees, slippage, and execution latency. Reports net
  vs gross return, Sharpe, max drawdown, information coefficient, and p-value vs a
  random-walk null hypothesis. Current finding: **no statistically significant alpha**
  after frictions. The audit says so, on screen, in plain language.

## Honest limitations

- Backtests show **no evidence** that these forecasts beat buy-and-hold or random walk
  once realistic trading frictions are applied. This is a research and monitoring
  workbench, not a profit-generating trading system.
- Signals are derived from price-action heuristics + mechanism consensus, not from a
  trained predictive model with validated out-of-sample edge.
- Do not trade on these outputs without independent validation.

## Run locally

Prerequisites: Node.js 20+

```bash
npm install
cp .env.example .env.local   # optional: add GEMINI_API_KEY
npm run dev                  # http://localhost:3000
```

## Production

```bash
npm run build
npm start                    # serves dist/ on $PORT
```

Environment variables:

| Variable | Required | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | No | Enables the LLM analyst; heuristic fallbacks otherwise |
| `COINBASE_API_KEY` | No | Authenticated Coinbase endpoints; public data otherwise |
| `STRIPE_SECRET_KEY` | Yes (prod) | Verifies checkout sessions for the paywall |
| `STRIPE_PRICE_ID` | Yes (prod) | The $49.99/mo subscription price |
| `PORT` | No | Defaults to 3000 |

## Tests

```bash
npm test
```

Covers the backtest engine (determinism, friction modeling, honest reporting)
and the Wilder's RSI calculator.

## API

| Endpoint | Description |
|---|---|
| `GET /api/health` | Liveness + key presence |
| `GET /api/coinbase/market` | Live ticker snapshot (proxied) |
| `GET /api/coinbase/candles?symbol=&granularity=` | Historical candles (proxied) |
| `POST /api/gemini/crypto-analyst` | LLM market synthesis (rate-limited) |
| `POST /api/gemini/reason|critique|interact` | Substrate reasoning endpoints (rate-limited) |

All `/api/*` routes are rate-limited (60/min/IP); LLM routes at 10/min/IP.
Every `/api/gemini/*` response carries the financial disclaimer.

## License

Licensed under the GNU AGPL-3.0. (c) Axiom Zeta Innovations LLC.
