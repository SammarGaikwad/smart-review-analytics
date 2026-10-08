import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { checkBackendHealth } from '../api/health';
import { ServiceHealthStatus } from '../types';
import {
  Server,
  Layers,
  Cpu,
  Database,
  RefreshCw,
  GitBranch,
  Box,
  Terminal,
  Activity,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';

export const SystemStatusPage: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<ServiceHealthStatus>({ online: false, message: 'Checking...' });
  const [analyticsStatus, setAnalyticsStatus] = useState<ServiceHealthStatus>({ online: false, message: 'Checking...' });
  const [loading, setLoading] = useState<boolean>(false);

  const checkAllServices = async () => {
    setLoading(true);
    const bHealth = await checkBackendHealth();
    setBackendStatus(bHealth);
    
    const isAnalyticsOnline = bHealth.details?.services?.analytics?.status === 'healthy';
    setAnalyticsStatus({
      online: isAnalyticsOnline,
      message: isAnalyticsOnline ? 'Python FastAPI Engine Online (VADER NLP)' : 'Analytics engine offline',
      details: bHealth.details?.services?.analytics
    });
    
    setLoading(false);
  };

  useEffect(() => {
    checkAllServices();
    const interval = setInterval(checkAllServices, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Architecture & IPTM Monitoring"
        subtitle="Live 3-tier service health verification, containerization, and CI/CD status."
      >
        <button
          onClick={checkAllServices}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Verify System Health</span>
        </button>
      </PageHeader>

      {/* 4-Tier Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Tier 1: Frontend */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <StatusBadge status="Online" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Presentation Tier</h3>
            <p className="text-xs text-slate-500">React 18 + TS + Vite + Tailwind</p>
          </div>
          <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div>Port: 3000</div>
            <div>ES Unit I Presentation Layer</div>
          </div>
        </div>

        {/* Tier 2: Backend REST API */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
              <Server className="w-5 h-5" />
            </div>
            <StatusBadge status={backendStatus.online ? 'Online' : 'Offline'} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Backend REST API</h3>
            <p className="text-xs text-slate-500">Node.js Express TypeScript</p>
          </div>
          <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div className="flex justify-between"><span>Port: 5000</span><span>GET /api/health</span></div>
            {backendStatus.details?.services?.backend?.uptime !== undefined && (
              <div className="mt-1 pt-1 border-t border-slate-200">
                Uptime: {Math.floor(backendStatus.details.services.backend.uptime)}s
              </div>
            )}
          </div>
        </div>

        {/* Tier 3: Python Analytics */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Cpu className="w-5 h-5" />
            </div>
            <StatusBadge status={backendStatus.details?.services?.analytics?.status === 'healthy' ? 'Online' : 'Offline'} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Analytics Engine</h3>
            <p className="text-xs text-slate-500">Python FastAPI + VADER NLP</p>
          </div>
          <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div className="flex justify-between"><span>Port: 8000</span><span>GET /analytics-api/health</span></div>
            {backendStatus.details?.services?.analytics?.responseTimeMs !== undefined && (
              <div className="mt-1 pt-1 border-t border-slate-200">
                Backend ↔ Analytics Ping: {backendStatus.details.services.analytics.responseTimeMs}ms
              </div>
            )}
          </div>
        </div>

        {/* Tier 4: Database */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <StatusBadge status={backendStatus.details?.services?.database?.status === 'healthy' ? 'Connected' : 'Degraded'} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Database Layer</h3>
            <p className="text-xs text-slate-500">PostgreSQL + Prisma ORM</p>
          </div>
          <div className="text-[11px] font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div className="flex justify-between"><span>Port: 6009</span><span>Prisma Client</span></div>
            {backendStatus.details?.services?.database?.responseTimeMs !== undefined && (
              <div className="mt-1 pt-1 border-t border-slate-200">
                Query Latency: {backendStatus.details.services.database.responseTimeMs}ms
              </div>
            )}
          </div>
        </div>

      </div>

      {/* IPTM DevOps / Project Monitoring Section */}
      <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-6 shadow-md space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <GitBranch className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white">IPTM DevOps & Deployment Dashboard</h3>
              <p className="text-xs text-slate-400">IT Project Management — Continuous Integration & Containerization</p>
            </div>
          </div>
          <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
            WBS Milestone 4
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
          
          {/* Jenkins CI/CD */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Jenkins CI/CD Pipeline
              </span>
              <StatusBadge status="Integration Pending" />
            </div>
            <p className="text-[11px] text-slate-400">
              Automated build, test, and release deployment pipeline.
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              Pipeline Script: Jenkinsfile in repo root
            </div>
          </div>

          {/* Docker Containerization */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sky-400 flex items-center gap-2">
                <Box className="w-4 h-4" />
                Docker Compose Stack
              </span>
              <StatusBadge status="Online" />
            </div>
            <p className="text-[11px] text-slate-400">
              Multi-container environment configured for frontend, backend, analytics, PostgreSQL.
            </p>
            <div className="text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
              Compose file: docker/docker-compose.yml
            </div>
          </div>

          {/* Project Progress */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                Development Roadmap
              </span>
              <span className="text-[10px] font-bold text-emerald-400">85% Complete</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Milestone 1 Baseline initialization & UI overhaul completed.
            </p>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[85%]" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
