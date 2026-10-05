import React from 'react';
import { Filter } from 'lucide-react';

interface DomainFilterProps {
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
  domains: { name: string; code: string }[];
}

export const DomainFilter: React.FC<DomainFilterProps> = ({
  selectedDomain,
  onDomainChange,
  domains,
}) => {
  return (
    <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs">
      <Filter className="w-4 h-4 text-slate-400" />
      <span className="text-xs font-medium text-slate-500 hidden sm:inline">Filter Domain:</span>
      <select
        value={selectedDomain}
        onChange={(e) => onDomainChange(e.target.value)}
        className="bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2"
      >
        <option value="ALL">All Domains</option>
        {domains.map((d) => (
          <option key={d.code} value={d.code}>
            {d.name}
          </option>
        ))}
      </select>
    </div>
  );
};
