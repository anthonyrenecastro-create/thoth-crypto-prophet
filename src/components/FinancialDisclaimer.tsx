import React from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * Persistent financial disclaimer. Rendered on every crypto-facing view.
 * Nothing in this product is financial advice.
 */
export const FINANCIAL_DISCLAIMER_TEXT =
  'Not financial advice. Thoth Crypto Prophet is a market-intelligence research workbench, not a registered investment advisor. ' +
  'Forecasts are experimental model outputs with no validated predictive edge — backtests show no statistically significant alpha after trading frictions. ' +
  'Cryptocurrency trading involves substantial risk of loss. Do your own research and never trade money you cannot afford to lose.';

export const FinancialDisclaimer: React.FC<{ compact?: boolean }> = ({ compact = false }) => (
  <div className={`flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-950/30 ${compact ? 'p-2.5' : 'p-4'}`}>
    <ShieldAlert className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-amber-400 shrink-0 mt-0.5`} />
    <p className={`text-amber-200/90 leading-relaxed ${compact ? 'text-[11px]' : 'text-xs'}`}>
      <strong className="text-amber-300">Not financial advice.</strong>{' '}
      {compact
        ? 'Experimental model outputs. Crypto trading involves substantial risk of loss. DYOR.'
        : FINANCIAL_DISCLAIMER_TEXT}
    </p>
  </div>
);
