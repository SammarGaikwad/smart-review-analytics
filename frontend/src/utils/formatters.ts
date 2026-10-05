// Formatter utilities for UI components

export function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatPercent(value: number): string {
  if (value === undefined || value === null) return '0%';
  const num = value > 1 ? value : value * 100;
  return `${num.toFixed(1)}%`;
}

export function truncateText(text: string, maxLength: number = 80): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

export function getSentimentColor(label?: string): {
  bg: string;
  text: string;
  border: string;
  badgeClass: string;
  dotBg: string;
} {
  const norm = (label || '').toLowerCase();
  if (norm.includes('pos')) {
    return {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      dotBg: 'bg-emerald-500',
    };
  }
  if (norm.includes('neg')) {
    return {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
      dotBg: 'bg-rose-500',
    };
  }
  return {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    dotBg: 'bg-slate-400',
  };
}
