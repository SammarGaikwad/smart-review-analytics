import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { Users, Star, ThumbsUp, BarChart, Calendar, Box, Globe, Activity } from 'lucide-react';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';

export const CustomerInsightsPage: React.FC = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await apiClient.get('/customers/insights');
        setInsights(res.data || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch customer insights');
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  if (loading) return <LoadingSpinner message="Loading CRM Customer Insights..." />;
  if (error) return <ErrorState message={error} />;

  const totalCustomers = insights.length;
  const activeReviewers = insights.filter(c => c.reviewCount > 0).length;
  const avgRatingGlobal = insights.reduce((acc, curr) => acc + curr.averageRating, 0) / (totalCustomers || 1);
  const totalPositive = insights.reduce((acc, curr) => acc + curr.positiveCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 pb-4 border-b border-slate-200">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <Users className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Customer Insights</h1>
          <p className="text-sm font-medium text-slate-500">Enterprise CRM module mapping customer behaviors across domains.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 rounded-xl"><Users className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customers</p>
            <p className="text-2xl font-black text-slate-900">{totalCustomers}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 rounded-xl"><Activity className="w-6 h-6 text-emerald-600" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Reviewers</p>
            <p className="text-2xl font-black text-slate-900">{activeReviewers}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-amber-50 rounded-xl"><Star className="w-6 h-6 text-amber-500" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Rating Given</p>
            <p className="text-2xl font-black text-slate-900">{avgRatingGlobal.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-xl"><ThumbsUp className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Positive Interactions</p>
            <p className="text-2xl font-black text-slate-900">{totalPositive}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center space-x-2">
          <BarChart className="w-5 h-5 text-slate-600" />
          <h2 className="text-lg font-bold text-slate-800">Customer Behavior Analytics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Reviews</th>
                <th className="px-6 py-4">Avg Rating</th>
                <th className="px-6 py-4">Sentiment Distribution</th>
                <th className="px-6 py-4">Interactions</th>
                <th className="px-6 py-4">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {insights.map(c => (
                <tr key={c.customerId} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{c.customerName}</div>
                    <div className="text-xs text-slate-500 font-mono mt-1 text-[10px]">{c.customerId.substring(0, 8)}...</div>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-indigo-600">{c.reviewCount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-bold text-slate-700">{c.averageRating}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2 text-xs font-bold">
                      <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+{c.positiveCount}</span>
                      <span className="text-slate-500 bg-slate-100 px-2 py-1 rounded">={c.neutralCount}</span>
                      <span className="text-rose-600 bg-rose-50 px-2 py-1 rounded">-{c.negativeCount}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600 space-y-1">
                    <div className="flex items-center space-x-1"><Box className="w-3.5 h-3.5" /> <span>{c.productsReviewed} Products</span></div>
                    <div className="flex items-center space-x-1"><Globe className="w-3.5 h-3.5" /> <span>{c.domainsReviewed} Domains</span></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1.5 text-slate-500 text-xs">
                      <Calendar className="w-4 h-4" />
                      <span>{c.lastReviewDate ? new Date(c.lastReviewDate).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {insights.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No customer insights found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
