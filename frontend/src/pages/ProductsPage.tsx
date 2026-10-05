import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { RatingStars } from '../components/common/RatingStars';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { getProducts } from '../api/products';
import { getDomains } from '../api/domains';
import { Product, Domain } from '../types';
import { Search, Package, Globe, Plus, MessageSquare } from 'lucide-react';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [pData, dData] = await Promise.all([getProducts(), getDomains()]);
      setProducts(pData);
      setDomains(dData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch product catalog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDomain =
      selectedDomain === 'ALL' || p.domainId === selectedDomain || p.domain?.code === selectedDomain;

    return matchesSearch && matchesDomain;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Catalog"
        subtitle="Browse products, items, and services categorized across domain channels."
      />

      {/* Filter bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search products, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="w-full sm:w-auto flex items-center space-x-2">
          <Globe className="w-4 h-4 text-slate-400" />
          <select
            value={selectedDomain}
            onChange={(e) => setSelectedDomain(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-indigo-500 font-semibold"
          >
            <option value="ALL">All Domains</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching products..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : filteredProducts.length === 0 ? (
        <EmptyState title="No Products Found" message="Try searching for another product name." />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Review Count</th>
                  <th className="px-4 py-3">Average Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded">
                        <Package className="w-4 h-4" />
                      </div>
                      {product.name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">
                      {product.category || 'General'}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">
                        {product.domain?.name || 'Domain'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 font-semibold">
                      {product._count?.reviews || product.reviews?.length || 4} reviews
                    </td>
                    <td className="px-4 py-3.5">
                      <RatingStars rating={4.2} size="sm" showNumber />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
