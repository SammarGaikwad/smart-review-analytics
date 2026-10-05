import React from 'react';
import { ShieldCheck, Cpu, Layers, GitBranch } from 'lucide-react';

export const AcademicMappingCard: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Academic Project Curriculum Alignment</h3>
            <p className="text-xs text-slate-500">Integrated architecture mapping across ASTMA, IPTM, and ES</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* ASTMA */}
        <div className="bg-blue-50/50 p-3.5 rounded-lg border border-blue-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-700 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              ASTMA Analytics
            </span>
            <span className="text-[10px] font-mono font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">Python VADER</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Social, text & media analytics. VADER sentiment scoring, NLTK preprocessing & probability mapping.
          </p>
        </div>

        {/* IPTM */}
        <div className="bg-purple-50/50 p-3.5 rounded-lg border border-purple-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-purple-700 flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-purple-600" />
              IPTM Management
            </span>
            <span className="text-[10px] font-mono font-semibold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">DevOps Baseline</span>
          </div>
          <p className="text-[11px] text-slate-600">
            WBS milestones, Git repository workflows, Dockerized services, Jenkins CI/CD readiness.
          </p>
        </div>

        {/* ES */}
        <div className="bg-emerald-50/50 p-3.5 rounded-lg border border-emerald-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-emerald-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              Enterprise Systems
            </span>
            <span className="text-[10px] font-mono font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">3-Tier SOA</span>
          </div>
          <p className="text-[11px] text-slate-600">
            Multi-domain catalog, RBAC access control, Prisma PostgreSQL ORM, audit trailing & reporting.
          </p>
        </div>
      </div>
    </div>
  );
};
