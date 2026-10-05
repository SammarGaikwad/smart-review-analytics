import React from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { FileText, Download, BarChart2, PieChart, Users, Award, ShieldAlert } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const reportTemplates = [
    {
      title: 'Executive Summary Report',
      description: 'Comprehensive high-level sentiment breakdown and KPI performance across all 5 domains.',
      format: 'PDF / JSON',
      icon: Award,
      status: 'Coming Soon',
    },
    {
      title: 'Sentiment Analysis Report',
      description: 'Detailed breakdown of VADER compound scores, positive/neutral/negative probability distributions.',
      format: 'CSV / PDF',
      icon: PieChart,
      status: 'Coming Soon',
    },
    {
      title: 'Domain Performance Report',
      description: 'Comparative metrics evaluating rating averages, customer satisfaction, and review volume by domain.',
      format: 'PDF / Excel',
      icon: BarChart2,
      status: 'Coming Soon',
    },
    {
      title: 'Product Review Intelligence Report',
      description: 'Product-level review aggregation with feature keyword mentions and sentiment trends.',
      format: 'CSV / PDF',
      icon: FileText,
      status: 'Coming Soon',
    },
    {
      title: 'Customer Feedback & Voice of Customer',
      description: 'Categorized qualitative customer feedback summaries for product management teams.',
      format: 'JSON / PDF',
      icon: Users,
      status: 'Coming Soon',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & Executive Intelligence"
        subtitle="Exportable enterprise review intelligence and analytics reports."
      />

      <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 flex items-center space-x-3 text-amber-800 text-xs">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-bold">Report Engine Integration Status: </span>
          <span>
            Automated PDF/CSV report generation endpoints are scheduled for ES Milestone 5. Interface layout baseline active.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportTemplates.map((report, idx) => {
          const Icon = report.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Icon className="w-5 h-5" />
                  </div>
                  <StatusBadge status={report.status} />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{report.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{report.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">Format: {report.format}</span>
                <button
                  disabled
                  className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold cursor-not-allowed"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
