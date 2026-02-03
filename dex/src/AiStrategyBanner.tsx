import { useState, useEffect, type FC } from 'react';

export interface AiStrategyParams {
  side: string;
  entry: string;
  sl: string;
  tp: string;
}

function parseSearchParams(): AiStrategyParams | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const side = params.get('side') || '';
  const entry = params.get('entry') || '';
  const sl = params.get('sl') || '';
  const tp = params.get('tp') || '';
  if (!side && !entry && !sl && !tp) return null;
  return { side, entry, sl, tp };
}

const AiStrategyBanner: FC = () => {
  const [strategy, setStrategy] = useState<AiStrategyParams | null>(null);

  useEffect(() => {
    setStrategy(parseSearchParams());
  }, []);

  if (!strategy) return null;

  const isLong = strategy.side === 'long';
  const formatNum = (s: string) => {
    const n = parseFloat(s);
    return isNaN(n) ? s : n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div
      style={{
        margin: '0 20px 16px',
        padding: '12px 16px',
        background: isLong ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
        border: `1px solid ${isLong ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: '#fce7f3',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '6px', color: '#ec4899' }}>
        AI Strategy (from Pizza Club)
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px 20px' }}>
        <span>
          <strong>Side:</strong>{' '}
          <span style={{ color: isLong ? '#22c55e' : '#ef4444' }}>
            {strategy.side ? (strategy.side === 'long' ? 'Long' : 'Short') : '—'}
          </span>
        </span>
        <span><strong>Entry:</strong> ${strategy.entry ? formatNum(strategy.entry) : '—'}</span>
        <span><strong>Stop-loss:</strong> ${strategy.sl ? formatNum(strategy.sl) : '—'}</span>
        <span><strong>Take-profit:</strong> ${strategy.tp ? formatNum(strategy.tp) : '—'}</span>
      </div>
    </div>
  );
};

export default AiStrategyBanner;
