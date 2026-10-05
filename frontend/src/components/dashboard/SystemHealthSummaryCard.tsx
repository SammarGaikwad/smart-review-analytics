import React from 'react';
import { Server, Activity, Cpu, Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { ServiceHealthStatus } from '../../types';

interface SystemHealthSummaryCardProps {
  backendStatus: ServiceHealthStatus;
  analyticsStatus: ServiceHealthStatus;
  loading: boolean;
  onRefresh: () => void;
}

export const SystemHealthSummaryCard: React.FC<SystemHealthSummaryCardProps> = ({
  backendStatus,
  analyticsStatus,
  loading,
  onRefresh,
}) => {
  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">System Architecture & Service Health</h3>
            <p className="text-xs text-slate-400">Real-time status of 3-tier enterprise nodes</p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Verify Health</span>
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {/* Frontend Tier */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Presentation Tier</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Online
            </span>
          </div>
          <div className="text-sm font-bold text-white">React 18 + Vite</div>
          <div className="text-[10px] text-slate-400 font-mono">Port 3000</div>
        </div>

        {/* Backend Tier */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Application Tier</span>
            <span className={backendStatus.online ? 'text-emerald-400 flex items-center gap-1' : 'text-amber-400 flex items-center gap-1'}>
              {backendStatus.online ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {backendStatus.online ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="text-sm font-bold text-white">Express REST API</div>
          <div className="text-[10px] text-slate-400 font-mono">Port 5000</div>
        </div>

        {/* Analytics Tier */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Analytics Tier</span>
            <span className={analyticsStatus.online ? 'text-emerald-400 flex items-center gap-1' : 'text-amber-400 flex items-center gap-1'}>
              {analyticsStatus.online ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {analyticsStatus.online ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="text-sm font-bold text-white">FastAPI Python VADER</div>
          <div className="text-[10px] text-slate-400 font-mono">Port 8000</div>
        </div>

        {/* Database */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span>Database Layer</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <Database className="w-3 h-3" />
              Connected
            </span>
          </div>
          <div className="text-sm font-bold text-white">PostgreSQL + Prisma</div>
          <div className="text-[10px] text-slate-400 font-mono">localhost:6009</div>
        </div>
      </div>
    </div>
  );
};
