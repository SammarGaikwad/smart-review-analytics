import React, { useState, useEffect, useMemo } from 'react';
import { getTemporalNetworkAnalytics } from '../../api/analytics';
import { Clock, Network, Activity, Users, Box, BarChart2, GitMerge } from 'lucide-react';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ErrorState } from '../common/ErrorState';

export const TemporalNetworkLab: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getTemporalNetworkAnalytics();
        setData(res);
        if (res?.periods?.length > 0) {
          setSelectedPeriod(res.periods[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch temporal network analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentSnapshot = useMemo(() => {
    if (!data || !selectedPeriod) return null;
    return data.snapshots.find((s: any) => s.period === selectedPeriod);
  }, [data, selectedPeriod]);

  const currentEvolution = useMemo(() => {
    if (!data || !selectedPeriod) return null;
    return data.evolution.find((e: any) => e.period === selectedPeriod);
  }, [data, selectedPeriod]);

  if (loading) return <LoadingSpinner message="Loading Temporal Network Analysis..." />;
  if (error) return <ErrorState message={error} />;
  if (!data || !data.periods) return <div className="text-slate-500 text-sm">No temporal data available.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-200 pb-4">
        <Clock className="w-6 h-6 text-indigo-600" />
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase">Temporal Network & Community Evolution</h2>
          <p className="text-sm text-slate-500">Dynamic networks, semantic graph evolution, and tensor representations.</p>
          <p className="text-xs font-bold text-amber-600 mt-1 uppercase tracking-wider bg-amber-50 inline-block px-2 py-0.5 rounded">Academic Demonstration — Offline Simulated Dataset</p>
        </div>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2">
        {data.periods.map((p: string) => (
          <button
            key={p}
            onClick={() => setSelectedPeriod(p)}
            className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition ${
              selectedPeriod === p ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Network Timeline Stats */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1 space-y-6">
          <div className="flex items-center space-x-2 text-slate-800">
            <Network className="w-5 h-5" />
            <h3 className="font-bold">Network Snapshot: {selectedPeriod}</h3>
          </div>
          
          {currentSnapshot && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Nodes</span>
                <span className="text-xl font-black text-slate-900">{currentSnapshot.metrics.nodeCount}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Edges</span>
                <span className="text-xl font-black text-slate-900">{currentSnapshot.metrics.edgeCount}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Density</span>
                <span className="text-xl font-black text-indigo-600">{currentSnapshot.metrics.density}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase font-bold block mb-1">Components</span>
                <span className="text-xl font-black text-emerald-600">{currentSnapshot.metrics.connectedComponentsCount}</span>
              </div>
            </div>
          )}

          {currentEvolution && (
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Evolution from Previous</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center"><span className="text-slate-600">New Nodes:</span> <span className="font-bold text-emerald-600">+{currentEvolution.new_nodes}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-600">Removed Nodes:</span> <span className="font-bold text-rose-600">-{currentEvolution.removed_nodes}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-600">Persistent Nodes:</span> <span className="font-bold text-slate-800">{currentEvolution.persistent_nodes}</span></div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-50"><span className="text-slate-600">New Edges:</span> <span className="font-bold text-emerald-600">+{currentEvolution.new_edges}</span></div>
                <div className="flex justify-between items-center"><span className="text-slate-600">Removed Edges:</span> <span className="font-bold text-rose-600">-{currentEvolution.removed_edges}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Node Centrality Evolution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2 flex flex-col h-full max-h-[450px]">
          <div className="flex items-center space-x-2 text-slate-800 mb-4 flex-shrink-0">
            <Activity className="w-5 h-5" />
            <h3 className="font-bold">Node Centrality Evolution</h3>
          </div>
          <div className="overflow-y-auto flex-1 border border-slate-100 rounded-lg">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 sticky top-0 z-10">
                <tr>
                  <th className="p-3 font-semibold text-slate-600">Node</th>
                  <th className="p-3 font-semibold text-slate-600">Status</th>
                  <th className="p-3 font-semibold text-slate-600">Degree C.</th>
                  <th className="p-3 font-semibold text-slate-600">Betweenness</th>
                  <th className="p-3 font-semibold text-slate-600">Closeness</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.centralityEvolution.filter((ce: any) => ce.period === selectedPeriod).map((ce: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-mono font-bold text-slate-800">{ce.node}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                        ce.status === 'New' || ce.status === 'Emerging' ? 'bg-emerald-100 text-emerald-700' :
                        ce.status === 'Persistent' ? 'bg-blue-100 text-blue-700' :
                        'bg-rose-100 text-rose-700'
                      }`}>{ce.status}</span>
                    </td>
                    <td className="p-3 font-mono text-indigo-600">{ce.degree.toFixed(4)}</td>
                    <td className="p-3 font-mono text-indigo-600">{ce.betweenness.toFixed(4)}</td>
                    <td className="p-3 font-mono text-indigo-600">{ce.closeness.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Community Evolution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[400px]">
          <div className="flex items-center space-x-2 text-slate-800 mb-4 flex-shrink-0">
            <Users className="w-5 h-5" />
            <h3 className="font-bold">Community Evolution Events</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            <div className="space-y-3">
              {data.communityEvolution.filter((c: any) => c.period === selectedPeriod).map((c: any, idx: number) => (
                <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-900 mb-1">{c.community} <span className="text-xs font-normal text-slate-500">(Size: {c.size})</span></div>
                    {c.previous && <div className="text-xs text-slate-500">Evolved from: {c.previous} (Overlap: {c.overlap})</div>}
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    c.event === 'Birth' ? 'bg-emerald-100 text-emerald-700' :
                    c.event === 'Growth' ? 'bg-indigo-100 text-indigo-700' :
                    c.event === 'Continuation' ? 'bg-blue-100 text-blue-700' :
                    c.event === 'Shrinkage' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {c.event}
                  </span>
                </div>
              ))}
              {data.communityEvolution.filter((c: any) => c.period === selectedPeriod).length === 0 && (
                <div className="text-sm text-slate-500 p-4 text-center border border-dashed rounded-xl">No community events recorded for this period.</div>
              )}
            </div>
          </div>
        </div>

        {/* Temporal Semantic Network */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-md space-y-4">
          <div className="flex items-center space-x-2 mb-4 border-b border-slate-800 pb-4">
            <GitMerge className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold">Temporal Semantic Graph</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Topic → Product relationship mapped dynamically across {selectedPeriod}</p>
          
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
            {currentSnapshot && currentSnapshot.semantic.map((sem: any, idx: number) => (
              <div key={idx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="font-bold text-emerald-400 mb-2 uppercase tracking-wider text-xs flex items-center gap-2">
                  <Box className="w-4 h-4"/> {sem.topic}
                </div>
                <div className="ml-6 border-l-2 border-slate-700 pl-4 space-y-2">
                  {sem.products.map((p: string, p_idx: number) => (
                    <div key={p_idx} className="text-sm text-slate-300 relative">
                      <span className="absolute -left-[21px] top-1/2 w-4 border-t-2 border-slate-700"></span>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 bg-slate-950 p-3 rounded-lg font-mono">
            <div><span className="text-indigo-400">Tensor Dimensions:</span> {data.tensorSummary.dimensions.join(' × ')}</div>
            <div className="mt-1">{data.tensorSummary.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
