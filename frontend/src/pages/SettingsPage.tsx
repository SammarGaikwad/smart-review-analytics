import React, { useState } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { Settings, Save, Server, Globe, Database, Shield } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [apiBaseUrl, setApiBaseUrl] = useState<string>(
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  );
  const [analyticsBaseUrl, setAnalyticsBaseUrl] = useState<string>(
    import.meta.env.VITE_ANALYTICS_BASE_URL || 'http://localhost:8000'
  );
  const [theme, setTheme] = useState<string>('light');
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Settings & Configuration"
        subtitle="Manage API endpoints, system parameters, and UI preferences."
      />

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg font-semibold animate-in fade-in">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs space-y-6 max-w-3xl">
        
        {/* Service Endpoint Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Server className="w-4 h-4 text-indigo-600" />
            Service Endpoints & Proxy Mapping
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Backend API Base URL (Express REST Service)
              </label>
              <input
                type="text"
                value={apiBaseUrl}
                onChange={(e) => setApiBaseUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default Node.js backend port is 5000</p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Analytics Engine Base URL (FastAPI Python Engine)
              </label>
              <input
                type="text"
                value={analyticsBaseUrl}
                onChange={(e) => setAnalyticsBaseUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default Python VADER engine port is 8000</p>
            </div>
          </div>
        </div>

        {/* UI & Theme Settings */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Globe className="w-4 h-4 text-indigo-600" />
            Appearance & Interface Theme
          </h3>

          <div className="text-xs space-y-2">
            <label className="block font-semibold text-slate-700">Visual Theme</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={theme === 'light'}
                  onChange={() => setTheme('light')}
                  className="text-indigo-600"
                />
                <span>Enterprise Light (Recommended)</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer opacity-60">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  disabled
                  className="text-indigo-600"
                />
                <span>Sleek Dark Mode (Coming Soon)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center space-x-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>

      </form>
    </div>
  );
};
