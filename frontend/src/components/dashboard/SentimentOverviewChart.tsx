import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SentimentOverviewProps {
  positiveCount: number;
  neutralCount: number;
  negativeCount: number;
}

export const SentimentOverviewChart: React.FC<SentimentOverviewProps> = ({
  positiveCount,
  neutralCount,
  negativeCount,
}) => {
  const total = positiveCount + neutralCount + negativeCount;

  const data = [
    { name: 'Positive', value: positiveCount, color: '#10b981', percent: total ? ((positiveCount / total) * 100).toFixed(1) : '0' },
    { name: 'Neutral', value: neutralCount, color: '#94a3b8', percent: total ? ((neutralCount / total) * 100).toFixed(1) : '0' },
    { name: 'Negative', value: negativeCount, color: '#f43f5e', percent: total ? ((negativeCount / total) * 100).toFixed(1) : '0' },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Sentiment Overview</h3>
            <p className="text-xs text-slate-500 mt-0.5">Overall customer sentiment based on analyzed reviews.</p>
          </div>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
            ASTMA VADER
          </span>
        </div>
      </div>

      <div className="my-4 h-52 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: any, name: any, item: any) => [
                `${value} reviews (${item.payload.percent}%)`,
                name,
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderColor: '#e2e8f0',
                borderRadius: '8px',
                fontSize: '12px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        
        <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
          <span className="text-2xl font-bold text-slate-900">{total}</span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">Total Analyzed</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
        {data.map((item) => (
          <div key={item.name} className="p-2 rounded-lg bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-center space-x-1.5 mb-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs font-medium text-slate-600">{item.name}</span>
            </div>
            <div className="text-sm font-bold text-slate-900">{item.percent}%</div>
            <div className="text-[10px] text-slate-400">{item.value} reviews</div>
          </div>
        ))}
      </div>
    </div>
  );
};
