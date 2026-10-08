import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DomainPerformanceChartProps {
  data: {
    domainName: string;
    code: string;
    reviewCount: number;
    averageRating: number;
    positivePercent: number;
  }[];
}

export const DomainPerformanceChart: React.FC<DomainPerformanceChartProps> = ({ data }) => {
  const [activeMetric, setActiveMetric] = useState<'rating' | 'positive' | 'count'>('rating');

  const chartData = data.map((d) => ({
    name: d.domainName,
    rating: Number(d.averageRating.toFixed(1)),
    positivePercent: Number(d.positivePercent.toFixed(1)),
    reviewCount: d.reviewCount,
  }));

  const validDomains = data.filter((d) => d.reviewCount > 0);
  const topDomain = validDomains.length > 0 
    ? [...validDomains].sort((a, b) => {
        if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
        if (b.positivePercent !== a.positivePercent) return b.positivePercent - a.positivePercent;
        return b.reviewCount - a.reviewCount;
      })[0]
    : null;

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Domain Performance</h3>
          <p className="text-xs text-slate-500 mt-0.5">Cross-domain rating and sentiment comparison.</p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveMetric('rating')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
              activeMetric === 'rating' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Avg Rating
          </button>
          <button
            onClick={() => setActiveMetric('positive')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
              activeMetric === 'positive' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Positive %
          </button>
          <button
            onClick={() => setActiveMetric('count')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
              activeMetric === 'count' ? 'bg-white text-slate-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Review Count
          </button>
        </div>
      </div>

      <div className="my-4 h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
              domain={activeMetric === 'rating' ? [0, 5] : activeMetric === 'positive' ? [0, 100] : [0, 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              formatter={(value: any) => [
                activeMetric === 'rating'
                  ? `${value} / 5.0`
                  : activeMetric === 'positive'
                  ? `${value}% Positive`
                  : `${value} reviews`,
                activeMetric === 'rating'
                  ? 'Average Rating'
                  : activeMetric === 'positive'
                  ? 'Positive Sentiment'
                  : 'Total Reviews',
              ]}
            />
            {activeMetric === 'rating' && (
              <Bar dataKey="rating" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={45} />
            )}
            {activeMetric === 'positive' && (
              <Bar dataKey="positivePercent" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45} />
            )}
            {activeMetric === 'count' && (
              <Bar dataKey="reviewCount" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={45} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex items-center justify-between">
        <span>Top Performing Domain: <strong className="text-slate-800 font-semibold">{topDomain ? topDomain.domainName : 'No reviewed domains'}</strong></span>
        <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">ES Analytics Aggregation</span>
      </div>
    </div>
  );
};
