import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Download, Printer, Search } from 'lucide-react';

import { getNetworkAnalytics } from '../api/analytics';
import { getDomains } from '../api/domains';
import { getReviews } from '../api/reviews';
import { getProducts } from '../api/products';
import { Domain } from '../types';

// MetricCard Component
const MetricCard = ({ title, value, valueColor = 'text-slate-900' }: { title: string, value: string | number, valueColor?: string }) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-center">
    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</h4>
    <p className={`text-2xl font-bold ${valueColor}`}>{value}</p>
  </div>
);

// ReportViewer Component
const ReportViewer: React.FC<{ report: any }> = ({ report }) => {
  const { type, data, timestamp, domainFilter } = report;
  const [productSearch, setProductSearch] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCSV = () => {
    let csv = '';
    let filename = 'report.csv';

    if (type === 'overall') {
      filename = 'Overall_Analytics_Report.csv';
      const { overview, reviewsByDomain } = data;
      csv = `Metric,Value\nTotal Reviews,${overview.totalReviews}\nAverage Rating,${overview.averageRating}\nTotal Domains,${overview.totalDomains}\nTotal Products,${overview.totalProducts}\nPositive Sentiment,${overview.sentimentBreakdown.positive}\nNeutral Sentiment,${overview.sentimentBreakdown.neutral}\nNegative Sentiment,${overview.sentimentBreakdown.negative}\n\n`;
      csv += 'Domain,Code,Reviews,Avg Rating\n';
      reviewsByDomain.forEach((d: any) => {
        csv += `"${d.name}","${d.code}",${d.reviewCount},${d.averageRating !== null ? d.averageRating.toFixed(1) : ''}\n`;
      });
    } else if (type === 'domain') {
      filename = 'Domain_Performance_Report.csv';
      csv = 'Domain,Code,Products,Reviews,Avg Rating,Positive %,Neutral %,Negative %\n';
      
      const filteredDomains = domainFilter === 'ALL' ? data.domains : data.domains.filter((d: any) => d.code === domainFilter || d.id === domainFilter);
      filteredDomains.forEach((domain: any) => {
          const domainReviews = data.reviews.filter((r: any) => r.domainId === domain.id || r.domain?.code === domain.code);
          const reviewCount = domainReviews.length;
          let avgRating = '—';
          let posPercent = '—';
          let neuPercent = '—';
          let negPercent = '—';
          
          if (reviewCount > 0) {
              const totalRating = domainReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
              avgRating = (totalRating / reviewCount).toFixed(1);
              
              const pos = domainReviews.filter((r: any) => r.sentimentResult?.sentimentLabel?.toLowerCase() === 'positive').length;
              const neu = domainReviews.filter((r: any) => r.sentimentResult?.sentimentLabel?.toLowerCase() === 'neutral').length;
              const neg = domainReviews.filter((r: any) => r.sentimentResult?.sentimentLabel?.toLowerCase() === 'negative').length;
              
              posPercent = Math.round((pos / reviewCount) * 100) + '%';
              neuPercent = Math.round((neu / reviewCount) * 100) + '%';
              negPercent = Math.round((neg / reviewCount) * 100) + '%';
          }
          csv += `"${domain.name}","${domain.code}",${domain.products?.length ?? domain._count?.products ?? 0},${reviewCount},${avgRating === '—' ? '' : avgRating},${posPercent === '—' ? '' : posPercent},${neuPercent === '—' ? '' : neuPercent},${negPercent === '—' ? '' : negPercent}\n`;
      });
    } else if (type === 'sentiment') {
      filename = 'Sentiment_Analysis_Report.csv';
      const filteredReviews = domainFilter === 'ALL' ? data.reviews : data.reviews.filter((r: any) => r.domain?.code === domainFilter || r.domainId === domainFilter);
      const total = filteredReviews.length;
      let pos = 0, neu = 0, neg = 0;
      filteredReviews.forEach((r: any) => {
          const label = r.sentimentResult?.sentimentLabel?.toLowerCase();
          if (label === 'positive') pos++;
          else if (label === 'negative') neg++;
          else neu++;
      });
      const posPercent = total > 0 ? Math.round((pos/total)*100) : 0;
      const neuPercent = total > 0 ? Math.round((neu/total)*100) : 0;
      const negPercent = total > 0 ? Math.round((neg/total)*100) : 0;
      
      csv = `Metric,Count,Percentage\nAnalyzed Reviews,${total},100%\nPositive,${pos},${posPercent}%\nNeutral,${neu},${neuPercent}%\nNegative,${neg},${negPercent}%\n`;
    } else if (type === 'product') {
      filename = 'Product_Review_Report.csv';
      csv = 'Product Name,Category,Domain,Reviews,Avg Rating\n';
      
      const filteredProducts = domainFilter === 'ALL' ? data.products : data.products.filter((p: any) => p.domainId === domainFilter || p.domain?.code === domainFilter);
      const searchedProducts = productSearch ? filteredProducts.filter((p: any) => p.name.toLowerCase().includes(productSearch.toLowerCase())) : filteredProducts;
      
      searchedProducts.forEach((product: any) => {
          const prodReviews = data.reviews.filter((r: any) => r.productId === product.id);
          const reviewCount = prodReviews.length;
          let avgRating = '—';
          if (reviewCount > 0) {
              avgRating = (prodReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewCount).toFixed(1);
          }
          const domainName = data.domains.find((d: any) => d.id === product.domainId)?.name || 'Unknown';
          csv += `"${product.name}","${product.category || 'General'}","${domainName}",${reviewCount},${avgRating === '—' ? '' : avgRating}\n`;
      });
    } else if (type === 'network') {
      filename = 'Network_Analytics_Report.csv';
      const { network, topNodes } = data;
      csv = `Metric,Value\nTotal Nodes,${network?.nodeCount || 0}\nTotal Edges,${network?.edgeCount || 0}\nAverage Degree,${network?.averageDegree?.toFixed(2) || '0'}\nConnected Components,${network?.connectedComponentsCount || 0}\nDensity,${network?.density?.toFixed(4) || '0'}\n\n`;
      csv += 'Label,Type,Degree,Centrality\n';
      if (topNodes) {
          topNodes.forEach((n: any) => {
              csv += `"${n.label}","${n.type}",${n.degree},${n.degreeCentrality?.toFixed(3) || 'N/A'}\n`;
          });
      }
    }
    
    downloadCSV(csv, filename);
  };

  const renderContent = () => {
    if (type === 'overall') {
      const { overview, reviewsByDomain } = data;
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard title="Total Reviews" value={overview.totalReviews} />
            <MetricCard title="Average Rating" value={overview.averageRating.toFixed(1)} />
            <MetricCard title="Total Domains" value={overview.totalDomains} />
            <MetricCard title="Total Products" value={overview.totalProducts} />
            <MetricCard title="Positive Reviews" value={overview.sentimentBreakdown.positive} valueColor="text-emerald-600" />
            <MetricCard title="Neutral Reviews" value={overview.sentimentBreakdown.neutral} valueColor="text-slate-600" />
            <MetricCard title="Negative Reviews" value={overview.sentimentBreakdown.negative} valueColor="text-rose-600" />
          </div>
          <div className="mt-6 border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">Reviews by Domain</h3>
            </div>
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Domain</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Code</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Reviews</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Avg Rating</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {reviewsByDomain.map((d: any) => (
                  <tr key={d.domainId} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-900 font-medium">{d.name}</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">{d.code}</td>
                    <td className="px-4 py-3 text-right text-slate-700 font-medium">{d.reviewCount}</td>
                    <td className="px-4 py-3 text-right text-indigo-600 font-medium">{d.averageRating !== null ? d.averageRating.toFixed(1) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (type === 'domain') {
      const domains = data.domains;
      const allReviews = data.reviews;
      const filteredDomains = domainFilter === 'ALL' ? domains : domains.filter((d: any) => d.code === domainFilter || d.id === domainFilter);

      const rows = filteredDomains.map((domain: any) => {
          const domainReviews = allReviews.filter((r: any) => r.domainId === domain.id || r.domain?.code === domain.code);
          const reviewCount = domainReviews.length;
          let avgRating = '—';
          let posPercent = '—';
          let neuPercent = '—';
          let negPercent = '—';
          
          if (reviewCount > 0) {
              const totalRating = domainReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0);
              avgRating = (totalRating / reviewCount).toFixed(1);
              
              const pos = domainReviews.filter((r: any) => r.sentimentResult?.sentimentLabel?.toLowerCase() === 'positive').length;
              const neu = domainReviews.filter((r: any) => r.sentimentResult?.sentimentLabel?.toLowerCase() === 'neutral').length;
              const neg = domainReviews.filter((r: any) => r.sentimentResult?.sentimentLabel?.toLowerCase() === 'negative').length;
              
              posPercent = Math.round((pos / reviewCount) * 100) + '%';
              neuPercent = Math.round((neu / reviewCount) * 100) + '%';
              negPercent = Math.round((neg / reviewCount) * 100) + '%';
          }
          
          return {
              id: domain.id,
              name: domain.name,
              products: domain.products?.length ?? domain._count?.products ?? 0,
              reviews: reviewCount,
              avgRating,
              posPercent,
              neuPercent,
              negPercent
          };
      });

      return (
        <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-800">Domain Performance Summary</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50">
                  <tr>
                      <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Domain</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Products</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Reviews</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Avg Rating</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Positive</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Neutral</th>
                      <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Negative</th>
                  </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                  {rows.map((row: any) => (
                      <tr key={row.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3 text-slate-900 font-medium">{row.name}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{row.products}</td>
                          <td className="px-4 py-3 text-right text-slate-700">{row.reviews}</td>
                          <td className="px-4 py-3 text-right font-medium text-indigo-600">{row.avgRating}</td>
                          <td className="px-4 py-3 text-right text-emerald-600 font-medium">{row.posPercent}</td>
                          <td className="px-4 py-3 text-right text-slate-600">{row.neuPercent}</td>
                          <td className="px-4 py-3 text-right text-rose-600 font-medium">{row.negPercent}</td>
                      </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    } else if (type === 'sentiment') {
      const filteredReviews = domainFilter === 'ALL' ? data.reviews : data.reviews.filter((r: any) => r.domain?.code === domainFilter || r.domainId === domainFilter);
      const total = filteredReviews.length;
      let pos = 0, neu = 0, neg = 0;
      filteredReviews.forEach((r: any) => {
          const label = r.sentimentResult?.sentimentLabel?.toLowerCase();
          if (label === 'positive') pos++;
          else if (label === 'negative') neg++;
          else neu++;
      });
      const posPercent = total > 0 ? Math.round((pos/total)*100) : 0;
      const neuPercent = total > 0 ? Math.round((neu/total)*100) : 0;
      const negPercent = total > 0 ? Math.round((neg/total)*100) : 0;

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard title="Analyzed Reviews" value={total} />
              <MetricCard title="Positive" value={`${posPercent}% (${pos})`} valueColor="text-emerald-600" />
              <MetricCard title="Neutral" value={`${neuPercent}% (${neu})`} valueColor="text-slate-600" />
              <MetricCard title="Negative" value={`${negPercent}% (${neg})`} valueColor="text-rose-600" />
          </div>
          
          {total > 0 && (
              <div className="mt-8 border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800">Recent Representative Reviews</h3>
                  </div>
                  <div className="p-4 space-y-4 bg-white">
                      {filteredReviews.slice(0, 10).map((r: any) => (
                          <div key={r.id} className="p-4 border border-slate-200/60 rounded-lg bg-slate-50/30 text-sm">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-slate-800 bg-white px-2 py-1 rounded border shadow-sm">Rating: {r.rating}/5</span>
                              <span className={`font-semibold px-2 py-1 rounded-full text-xs uppercase tracking-wider ${
                                r.sentimentResult?.sentimentLabel?.toLowerCase() === 'positive' ? 'bg-emerald-100 text-emerald-700' : 
                                r.sentimentResult?.sentimentLabel?.toLowerCase() === 'negative' ? 'bg-rose-100 text-rose-700' : 
                                'bg-slate-200 text-slate-700'
                              }`}>
                                  {r.sentimentResult?.sentimentLabel || 'Unknown'}
                              </span>
                            </div>
                            <p className="text-slate-600 italic">"{r.reviewText}"</p>
                          </div>
                      ))}
                  </div>
              </div>
          )}
        </div>
      );
    } else if (type === 'product') {
      const filteredProducts = domainFilter === 'ALL' ? data.products : data.products.filter((p: any) => p.domainId === domainFilter || p.domain?.code === domainFilter);
      const searchedProducts = productSearch ? filteredProducts.filter((p: any) => p.name.toLowerCase().includes(productSearch.toLowerCase())) : filteredProducts;

      const rows = searchedProducts.map((product: any) => {
          const prodReviews = data.reviews.filter((r: any) => r.productId === product.id);
          const reviewCount = prodReviews.length;
          let avgRating = '—';
          if (reviewCount > 0) {
              avgRating = (prodReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewCount).toFixed(1);
          }
          const domainName = data.domains.find((d: any) => d.id === product.domainId)?.name || 'Unknown';
          return {
              id: product.id,
              name: product.name,
              category: product.category || 'General',
              domain: domainName,
              reviews: reviewCount,
              avgRating
          };
      });

      return (
        <div className="space-y-4">
          <div className="print:hidden relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search products by name..." 
                value={productSearch}
                onChange={e => setProductSearch(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg w-full max-w-md text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
              />
          </div>
          
          <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50">
                      <tr>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Product Name</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Category</th>
                          <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Domain</th>
                          <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Reviews</th>
                          <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Avg Rating</th>
                      </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                      {rows.length > 0 ? rows.map((row: any) => (
                          <tr key={row.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 text-slate-900 font-medium">{row.name}</td>
                              <td className="px-4 py-3 text-slate-500">{row.category}</td>
                              <td className="px-4 py-3 text-slate-500 text-xs font-mono">{row.domain}</td>
                              <td className="px-4 py-3 text-right text-slate-700">{row.reviews}</td>
                              <td className="px-4 py-3 text-right text-indigo-600 font-medium">{row.avgRating}</td>
                          </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} className="px-4 py-6 text-center text-slate-500">No products match your search.</td>
                        </tr>
                      )}
                  </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    } else if (type === 'network') {
      const { network, topNodes, connectedComponentsCount } = data;
      if (!network) return <div className="p-6 bg-slate-50 rounded-lg text-slate-500 text-center">No network data available.</div>;

      return (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <MetricCard title="Total Nodes" value={network.nodeCount || 0} />
              <MetricCard title="Total Edges" value={network.edgeCount || 0} />
              <MetricCard title="Avg Degree" value={network.averageDegree ? network.averageDegree.toFixed(2) : '0'} />
              <MetricCard title="Connected Comps" value={network.connectedComponentsCount || connectedComponentsCount || 0} />
              <MetricCard title="Density" value={network.density ? network.density.toFixed(4) : '0'} />
          </div>

          {topNodes && topNodes.length > 0 && (
              <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-xs mt-6">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-sm font-bold text-slate-800">Top Nodes by Centrality</h3>
                  </div>
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-50">
                          <tr>
                              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Label</th>
                              <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Type</th>
                              <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Degree</th>
                              <th className="text-right px-4 py-3 font-semibold text-slate-600 text-xs tracking-wider uppercase">Centrality</th>
                          </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                          {topNodes.map((n: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3 text-slate-900 font-medium">{n.label}</td>
                                  <td className="px-4 py-3 text-slate-500 text-xs uppercase tracking-wider">{n.type}</td>
                                  <td className="px-4 py-3 text-right text-slate-700">{n.degree}</td>
                                  <td className="px-4 py-3 text-right text-indigo-600 font-medium">{n.degreeCentrality ? n.degreeCentrality.toFixed(3) : 'N/A'}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200/80 shadow-sm rounded-xl p-6 mt-6 print:border-none print:shadow-none print:p-0">
      <div className="flex items-center justify-between mb-6 border-b pb-4 print:border-b-2 print:border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {type === 'overall' && 'Overall Analytics Report'}
            {type === 'domain' && 'Domain Performance Report'}
            {type === 'sentiment' && 'Sentiment Analysis Report'}
            {type === 'product' && 'Product & Review Report'}
            {type === 'network' && 'Network Analytics Report'}
          </h2>
          <div className="flex items-center space-x-4 mt-2">
            <p className="text-xs text-slate-500 font-medium">Generated: {timestamp.toLocaleString()}</p>
            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
            <p className="text-xs text-slate-500 font-medium">Domain Filter: <span className="text-slate-800">{domainFilter === 'ALL' ? 'All Domains' : domainFilter}</span></p>
          </div>
        </div>
        <div className="flex space-x-2 print:hidden">
          <button onClick={handleDownloadCSV} className="flex items-center space-x-1 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-sm font-semibold transition border border-indigo-100">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button onClick={handlePrint} className="flex items-center space-x-1 px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold transition border border-slate-200">
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
};

export const ReportsPage: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [reportType, setReportType] = useState('overall');
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  useEffect(() => {
    getDomains().then(d => {
      setDomains(d);
      setLoading(false);
    }).catch(err => {
      setError(err.message || 'Failed to load domains.');
      setLoading(false);
    });
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedReport(null);
    try {
      if (reportType === 'overall') {
        const [d, r, p] = await Promise.all([getDomains(), getReviews(), getProducts()]);
        
        const totalReviews = r.length;
        const averageRating = totalReviews > 0 ? r.reduce((sum: number, review: any) => sum + (review.rating || 0), 0) / totalReviews : 0;
        
        const positive = r.filter((rev: any) => rev.sentimentResult?.sentimentLabel?.toLowerCase() === 'positive').length;
        const neutral = r.filter((rev: any) => rev.sentimentResult?.sentimentLabel?.toLowerCase() === 'neutral').length;
        const negative = r.filter((rev: any) => rev.sentimentResult?.sentimentLabel?.toLowerCase() === 'negative').length;
        
        const reviewsByDomain = d.map((domain: any) => {
          const domainReviews = r.filter((rev: any) => rev.domainId === domain.id || rev.domain?.code === domain.code);
          const reviewCount = domainReviews.length;
          const avgRating = reviewCount > 0 ? domainReviews.reduce((sum: number, rev: any) => sum + (rev.rating || 0), 0) / reviewCount : null;
          return {
            domainId: domain.id,
            name: domain.name,
            code: domain.code,
            reviewCount,
            averageRating: avgRating
          };
        });

        const data = {
          overview: {
            totalReviews,
            averageRating,
            totalDomains: d.length,
            totalProducts: p.length,
            sentimentBreakdown: { positive, neutral, negative }
          },
          reviewsByDomain
        };

        setGeneratedReport({ type: 'overall', data, timestamp: new Date(), domainFilter: selectedDomain });
      } else if (reportType === 'domain') {
        const [d, r] = await Promise.all([getDomains(), getReviews()]);
        setGeneratedReport({ type: 'domain', data: { domains: d, reviews: r }, timestamp: new Date(), domainFilter: selectedDomain });
      } else if (reportType === 'sentiment') {
        const [r, d] = await Promise.all([getReviews(), getDomains()]);
        setGeneratedReport({ type: 'sentiment', data: { reviews: r, domains: d }, timestamp: new Date(), domainFilter: selectedDomain });
      } else if (reportType === 'product') {
        const [p, r, d] = await Promise.all([getProducts(), getReviews(), getDomains()]);
        setGeneratedReport({ type: 'product', data: { products: p, reviews: r, domains: d }, timestamp: new Date(), domainFilter: selectedDomain });
      } else if (reportType === 'network') {
        const data = await getNetworkAnalytics();
        setGeneratedReport({ type: 'network', data, timestamp: new Date(), domainFilter: selectedDomain });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate report. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Initializing Reports Engine..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-6">
      <div className="print:hidden">
        <PageHeader
          title="Reports & Executive Intelligence"
          subtitle="Generate, export, and print dynamic analytics reports from real-time data."
        />

        <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm mt-6">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Report Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Report Type</label>
              <select 
                value={reportType} 
                onChange={(e) => setReportType(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
              >
                <option value="overall">Overall Analytics Report</option>
                <option value="domain">Domain Performance Report</option>
                <option value="sentiment">Sentiment Analysis Report</option>
                <option value="product">Product & Review Report</option>
                <option value="network">Network Analytics Report</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Domain Filter</label>
              <select 
                value={selectedDomain} 
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50"
              >
                <option value="ALL">All Domains</option>
                {domains.map(d => (
                  <option key={d.id} value={d.code}>{d.name} ({d.code})</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isGenerating && (
        <div className="mt-8">
            <LoadingSpinner message="Compiling real-time analytics data..." />
        </div>
      )}

      {!isGenerating && generatedReport && (
        <ReportViewer report={generatedReport} />
      )}
    </div>
  );
};
