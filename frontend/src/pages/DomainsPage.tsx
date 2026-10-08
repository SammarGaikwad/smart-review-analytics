import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/common/PageHeader';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';
import { RatingStars } from '../components/common/RatingStars';
import { getDomains, getProductsByDomain } from '../api/domains';
import { getReviews } from '../api/reviews';
import { Domain, Product, Review } from '../types';
import { Globe, Package, MessageSquare, Star, ArrowRight, ExternalLink } from 'lucide-react';

export const DomainsPage: React.FC = () => {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Selected domain modal state
  const [selectedDomainModal, setSelectedDomainModal] = useState<Domain | null>(null);
  const [modalProducts, setModalProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [domainsData, reviewsData] = await Promise.all([
        getDomains(),
        getReviews(),
      ]);
      setDomains(domainsData);
      setReviews(reviewsData);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch domains.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenProductsModal = async (domain: Domain) => {
    setSelectedDomainModal(domain);
    setLoadingProducts(true);
    try {
      const products = await getProductsByDomain(domain.id);
      setModalProducts(products);
    } catch (err) {
      console.error('Failed to load products for domain:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Domain Management"
        subtitle="Configure and analyze review intelligence across multi-industry domains."
      />

      {loading ? (
        <LoadingSpinner message="Fetching domain catalog..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {domains.map((domain) => {
            const productCount = domain.products?.length ?? domain._count?.products ?? 0;
            const reviewCount = domain._count?.reviews ?? 0;
            
            const domainReviews = reviews.filter((r) => r.domainId === domain.id || r.domain?.code === domain.code);
            
            let avgRatingDisplay = "—";
            let positiveSentimentDisplay = "—";

            if (reviewCount > 0 && domainReviews.length > 0) {
              const totalRating = domainReviews.reduce((sum, r) => sum + (r.rating || 0), 0);
              avgRatingDisplay = (totalRating / domainReviews.length).toFixed(1);

              const positiveReviews = domainReviews.filter((r) => r.sentimentResult?.sentimentLabel?.toLowerCase() === 'positive').length;
              const positivePercent = Math.round((positiveReviews / domainReviews.length) * 100);
              positiveSentimentDisplay = `${positivePercent}% Positive Sentiment`;
            }

            return (
              <div
                key={domain.id}
                className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Globe className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{domain.name}</h3>
                        <span className="text-[10px] font-mono font-semibold text-slate-400 uppercase">
                          Code: {domain.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed min-h-[40px]">
                    {domain.description || 'Enterprise domain analytics stream.'}
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Products</span>
                      <span className="text-sm font-bold text-slate-900">{productCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Reviews</span>
                      <span className="text-sm font-bold text-slate-900">{reviewCount}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Avg Rating</span>
                      <span className="text-sm font-bold text-indigo-600">{avgRatingDisplay}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    positiveSentimentDisplay === "—"
                      ? "text-slate-500 bg-slate-50 border-slate-200"
                      : "text-emerald-600 bg-emerald-50 border-emerald-200"
                  }`}>
                    {positiveSentimentDisplay}
                  </span>

                  <button
                    onClick={() => handleOpenProductsModal(domain)}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                  >
                    <span>Products</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Domain Products Modal */}
      <Modal
        isOpen={!!selectedDomainModal}
        onClose={() => setSelectedDomainModal(null)}
        title={`Products in ${selectedDomainModal?.name || 'Domain'}`}
        maxWidth="lg"
      >
        {loadingProducts ? (
          <LoadingSpinner message="Loading products..." />
        ) : modalProducts.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No products found in this domain.</p>
        ) : (
          <div className="space-y-3">
            <div className="divide-y divide-slate-100 text-xs">
              {modalProducts.map((prod) => {
                const prodReviews = reviews.filter((r) => r.productId === prod.id);
                const reviewCount = prodReviews.length;
                const prodRating = reviewCount > 0 
                  ? prodReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
                  : null;

                return (
                  <div key={prod.id} className="py-3 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900">{prod.name}</h4>
                      <p className="text-[11px] text-slate-500">{prod.category || 'General Category'}</p>
                    </div>
                    <div className="text-right">
                      {prodRating !== null ? (
                        <RatingStars rating={Number(prodRating.toFixed(1))} size="sm" showNumber />
                      ) : (
                        <span className="text-sm font-bold text-slate-400 block leading-none">—</span>
                      )}
                      <span className="text-[10px] text-slate-400 block mt-1">{reviewCount} reviews</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
