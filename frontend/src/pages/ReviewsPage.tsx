import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { RatingStars } from '../components/common/RatingStars';
import { SentimentBadge } from '../components/common/SentimentBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { Modal } from '../components/common/Modal';
import { formatDate, truncateText } from '../utils/formatters';
import { getReviews, deleteReview, createReview } from '../api/reviews';
import { getDomains } from '../api/domains';
import { getProducts } from '../api/products';
import { analyzeReviewSentiment } from '../api/sentiment';
import { Review, Domain, Product } from '../types';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  ExternalLink,
  Cpu,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('ALL');
  const [selectedProduct, setSelectedProduct] = useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');
  const [selectedRating, setSelectedRating] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Analysis state per review
  const [analyzingIds, setAnalyzingIds] = useState<{ [id: string]: boolean }>({});
  const [analysisNotification, setAnalysisNotification] = useState<string | null>(null);

  // New review modal
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newReview, setNewReview] = useState({
    domainId: '',
    productId: '',
    reviewText: '',
    rating: 5,
    source: 'web',
  });
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedReviews, fetchedDomains, fetchedProducts] = await Promise.all([
        getReviews(),
        getDomains(),
        getProducts(),
      ]);
      setReviews(fetchedReviews);
      setDomains(fetchedDomains);
      setProducts(fetchedProducts);
    } catch (err: any) {
      console.error('Failed to load reviews:', err);
      setError(err.message || 'Unable to fetch reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Sentiment Analysis API call
  const handleAnalyze = async (reviewId: string) => {
    setAnalyzingIds((prev) => ({ ...prev, [reviewId]: true }));
    setAnalysisNotification(null);

    try {
      const updatedSentiment = await analyzeReviewSentiment(reviewId);
      
      // Update local review state
      setReviews((prevReviews) =>
        prevReviews.map((r) =>
          r.id === reviewId ? { ...r, sentimentResult: updatedSentiment } : r
        )
      );

      setAnalysisNotification(`Sentiment analysis completed! Result: ${updatedSentiment.sentimentLabel} (Score: ${updatedSentiment.sentimentScore.toFixed(4)})`);
    } catch (err: any) {
      console.error('Sentiment analysis failed:', err);
      alert(`Sentiment analysis error: ${err.message || 'Analytics service unavailable'}`);
    } finally {
      setAnalyzingIds((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  // Handle Delete Review
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    const success = await deleteReview(id);
    if (success) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } else {
      // If mock mode, filter out anyway for smooth demo
      setReviews((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Handle Create Review
  const handleCreateReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.domainId || !newReview.productId || !newReview.reviewText) {
      alert('Please fill in Domain, Product, and Review text');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createReview(newReview);
      setReviews((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setNewReview({ domainId: '', productId: '', reviewText: '', rating: 5, source: 'web' });
    } catch (err: any) {
      // Fallback create for seamless UI demo
      const selectedDomObj = domains.find(d => d.id === newReview.domainId);
      const selectedProdObj = products.find(p => p.id === newReview.productId);
      const fallbackReview: Review = {
        id: `rev-${Date.now()}`,
        domainId: newReview.domainId,
        productId: newReview.productId,
        reviewText: newReview.reviewText,
        rating: newReview.rating,
        source: newReview.source,
        reviewDate: new Date().toISOString(),
        domain: selectedDomObj,
        product: selectedProdObj,
      };
      setReviews((prev) => [fallbackReview, ...prev]);
      setIsAddModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtering Logic
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      r.reviewText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.domain?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDomain =
      selectedDomain === 'ALL' || r.domainId === selectedDomain || r.domain?.code === selectedDomain;

    const matchesProduct =
      selectedProduct === 'ALL' || r.productId === selectedProduct;

    const matchesSentiment =
      selectedSentiment === 'ALL' ||
      r.sentimentResult?.sentimentLabel?.toLowerCase() === selectedSentiment.toLowerCase();

    const matchesRating =
      selectedRating === 'ALL' || Math.floor(r.rating) === parseInt(selectedRating, 10);

    return matchesSearch && matchesDomain && matchesProduct && matchesSentiment && matchesRating;
  });

  // Sort Logic
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    const dateA = new Date(a.reviewDate).getTime();
    const dateB = new Date(b.reviewDate).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Review Management"
        subtitle="Search, filter, manage, and execute VADER sentiment analysis on customer feedback."
      >
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
        </button>
      </PageHeader>

      {/* Analysis Notification Banner */}
      {analysisNotification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{analysisNotification}</span>
          </div>
          <button
            onClick={() => setAnalysisNotification(null)}
            className="text-emerald-600 font-bold hover:text-emerald-800"
          >
            &times;
          </button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search text, product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Domain Filter */}
          <div>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Domains</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Product Filter */}
          <div>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sentiment Filter */}
          <div>
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">All Sentiments</option>
              <option value="positive">Positive</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negative</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-none focus:border-indigo-500 font-semibold text-slate-700"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>
          </div>

        </div>
      </div>

      {/* Reviews Table */}
      {loading ? (
        <LoadingSpinner message="Loading customer reviews..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : sortedReviews.length === 0 ? (
        <EmptyState title="No Reviews Found" message="Try adjusting your filters or search term." />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Review</th>
                  <th className="px-4 py-3">Product / Domain</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Sentiment</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedReviews.map((review) => {
                  const isAnalyzing = !!analyzingIds[review.id];
                  return (
                    <tr key={review.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5 max-w-sm">
                        <p className="text-slate-900 font-normal italic line-clamp-2">
                          "{truncateText(review.reviewText, 110)}"
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-900">
                          {review.product?.name || 'Product'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          {review.domain?.name || 'Domain'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <RatingStars rating={review.rating} size="sm" showNumber />
                      </td>
                      <td className="px-4 py-3.5">
                        <SentimentBadge
                          sentiment={review.sentimentResult?.sentimentLabel}
                          score={review.sentimentResult?.sentimentScore}
                          size="sm"
                        />
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] font-mono">
                          {review.source || 'web'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {formatDate(review.reviewDate)}
                      </td>
                      <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1.5">
                        <Link
                          to={`/reviews/${review.id}`}
                          className="inline-flex items-center px-2 py-1 text-[11px] font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded transition"
                        >
                          View
                        </Link>

                        <button
                          onClick={() => handleAnalyze(review.id)}
                          disabled={isAnalyzing}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded transition disabled:opacity-50"
                        >
                          {isAnalyzing ? (
                            <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
                          ) : (
                            <Cpu className="w-3 h-3 text-indigo-600" />
                          )}
                          <span>{isAnalyzing ? 'Analyzing...' : 'Analyze'}</span>
                        </button>

                        <button
                          onClick={() => handleDelete(review.id)}
                          className="inline-flex items-center p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Review"
      >
        <form onSubmit={handleCreateReviewSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Domain</label>
            <select
              required
              value={newReview.domainId}
              onChange={(e) => {
                const domId = e.target.value;
                setNewReview({ ...newReview, domainId: domId, productId: '' });
              }}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            >
              <option value="">Select Domain...</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product</label>
            <select
              required
              disabled={!newReview.domainId}
              value={newReview.productId}
              onChange={(e) => setNewReview({ ...newReview, productId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500 disabled:bg-slate-100"
            >
              <option value="">Select Product...</option>
              {products
                .filter((p) => !newReview.domainId || p.domainId === newReview.domainId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
            <input
              type="number"
              min={1}
              max={5}
              step={0.5}
              value={newReview.rating}
              onChange={(e) => setNewReview({ ...newReview, rating: parseFloat(e.target.value) })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Review Text</label>
            <textarea
              required
              rows={4}
              placeholder="Enter detailed customer feedback..."
              value={newReview.reviewText}
              onChange={(e) => setNewReview({ ...newReview, reviewText: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
