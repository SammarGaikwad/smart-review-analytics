import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { getAuditLogsList } from '../api/audit';
import { AuditLogItem, PaginationMeta } from '../types';
import { ShieldCheck, CheckCircle2, AlertCircle, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>('ALL');

  const loadLogs = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditLogsList({
        page,
        limit: 20,
        action: actionFilter,
      });
      setLogs(data.items || []);
      setPagination(data.pagination);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Failed to retrieve audit log records from backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(1);
  }, [actionFilter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs & Compliance Trail"
        subtitle="Enterprise Systems Unit IV - Audit trailing, system event tracking, and regulatory governance."
      />

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700">Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
          >
            <option value="ALL">All Actions</option>
            <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
            <option value="LOGIN_FAILED">LOGIN_FAILED</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-mono">
          Total Recorded Events: {pagination.total}
        </span>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching audit logs from PostgreSQL..." />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadLogs(pagination.page)} />
      ) : logs.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200/80 rounded-xl text-slate-400 text-xs">
          No audit log records found for the selected filter.
        </div>
      ) : (
        /* Audit Logs Table */
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User / Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Target Resource</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">
                      {log.user?.fullName || log.userEmail || 'System / Anonymous'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold rounded border border-indigo-100">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">
                      {log.resource}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {log.status === 'SUCCESS' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        <span>{log.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-slate-400 text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.totalPages}
            </span>

            <div className="flex items-center space-x-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadLogs(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadLogs(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
