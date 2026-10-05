import React from 'react';
import { ThumbsUp, ThumbsDown, Minus } from 'lucide-react';
import { getSentimentColor } from '../../utils/formatters';

interface SentimentBadgeProps {
  sentiment?: string | null;
  score?: number | null;
  size?: 'sm' | 'md';
}

export const SentimentBadge: React.FC<SentimentBadgeProps> = ({
  sentiment = 'Unanalyzed',
  score,
  size = 'md',
}) => {
  if (!sentiment) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
        Not Analyzed
      </span>
    );
  }

  const { badgeClass, dotBg } = getSentimentColor(sentiment);
  const norm = sentiment.toLowerCase();

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center space-x-1.5 rounded-full border ${badgeClass} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotBg}`} />
      <span className="capitalize">{sentiment}</span>
      {typeof score === 'number' && (
        <span className="opacity-75 text-[10px] font-mono font-normal">
          ({score > 0 ? `+${score.toFixed(2)}` : score.toFixed(2)})
        </span>
      )}
    </span>
  );
};
