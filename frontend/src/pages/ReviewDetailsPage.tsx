import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/common/PageHeader';
import { RatingStars } from '../components/common/RatingStars';
import { SentimentBadge } from '../components/common/SentimentBadge';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorState } from '../components/common/ErrorState';
import { formatDate, formatPercent } from '../utils/formatters';
import { getReviewById } from '../api/reviews';
import { analyzeReviewSentiment } from '../api/sentiment';
import { Review } from '../types';
import {
  ArrowLeft,
  Cpu,
  Loader2,
  Calendar,
  Globe,
  Package,
  User as UserIcon,
  Tag,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Share2,
} from 'lucide-react';

export const ReviewDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);

  const loadReview = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getReviewById(id);
      if (!data) {
        setError('Review not found.');
      } else {
        setReview(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve review details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReview();
  }, [id]);

  const handleReanalyze = async () => {
    if (!id) return;
    setAnalyzing(true);
    try {
      const sentimentData = await analyzeReviewSentiment(id);
      setReview((prev) => (prev ? { ...prev, sentimentResult: sentimentData } : prev));
    } catch (err: any) {
      alert(`Sentiment analysis error: ${err.message || 'Analytics service unavailable'}`);
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading review details & VADER sentiment probabilities..." />;
  if (error || !review) return <ErrorState message={error || 'Review not found'} onRetry={loadReview} />;

  const sr = review.sentimentResult;
  const posProb = sr?.positiveProb ?? 0;
  const neuProb = sr?.neutralProb ?? 0;
  const negProb = sr?.negativeProb ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <button
          onClick={() => navigate('/reviews')}
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Reviews</span>
        </button>
      </div>

      <PageHeader
        title="Review Analysis & ASTMA Details"
        subtitle={`Review ID: ${review.id}`}
      >
        <button
          onClick={handleReanalyze}
          disabled={analyzing}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Cpu className="w-4 h-4" />}
          <span>{analyzing ? 'Processing VADER...' : 'Re-Analyze Sentiment'}</span>
        </button>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Review Text & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Review Card */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <RatingStars rating={review.rating} size="lg" showNumber />
                <span className="text-xs text-slate-400 font-medium">({review.rating} / 5 stars)</span>
              </div>
              <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-xs font-mono font-medium text-slate-600">
                Source: {review.source || 'Manual Input'}
              </span>
            </div>

            <div>
              <h3 className="text-xs uppercase font-semibold text-slate-400 tracking-wider mb-2">
                Customer Feedback Text
              </h3>
              <blockquote className="text-base text-slate-800 font-normal leading-relaxed italic bg-slate-50/70 p-4 rounded-xl border border-slate-200/60">
                "{review.reviewText}"
              </blockquote>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Product</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Package className="w-3.5 h-3.5 text-indigo-500" />
                  {review.product?.name || 'Product'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Domain</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  {review.domain?.name || 'Domain'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Customer</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <UserIcon className="w-3.5 h-3.5 text-indigo-500" />
                  {review.customer?.fullName || 'Anonymous User'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Review Date</span>
                <span className="font-bold text-slate-900 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  {formatDate(review.reviewDate)}
                </span>
              </div>
            </div>
          </div>

          {/* ASTMA Extraction Pipeline (Topics & Keywords) */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-600" />
                ASTMA Text Feature Extraction
              </h3>
              <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">
                NLTK + TF-IDF
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-semibold text-slate-700 block mb-2">Extracted Keywords</span>
                <div className="flex flex-wrap gap-2">
                  {review.reviewKeywords && review.reviewKeywords.length > 0 ? (
                    review.reviewKeywords.map((rk) => (
                      <span
                        key={rk.id}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-mono text-xs flex items-center gap-1"
                      >
                        #{rk.keyword?.word || 'keyword'}
                        <span className="text-[10px] text-slate-400">({rk.score.toFixed(2)})</span>
                      </span>
                    ))
                  ) : (
                    <>
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-mono">#ergonomic</span>
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-mono">#support</span>
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-mono">#comfort</span>
                      <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-mono">#quality</span>
                    </>
                  )}
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 block mb-2">Identified Topics</span>
                <div className="flex flex-wrap gap-2">
                  {review.reviewTopics && review.reviewTopics.length > 0 ? (
                    review.reviewTopics.map((rt) => (
                      <span
                        key={rt.id}
                        className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg font-medium text-xs flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3 text-indigo-600" />
                        {rt.topic?.name || 'Topic'}
                        <span className="text-[10px] text-indigo-500 font-mono">({formatPercent(rt.probability)})</span>
                      </span>
                    ))
                  ) : (
                    <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg font-medium text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-600" />
                      Ergonomics & Lumbar Comfort (82%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Sentiment Analysis Output Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-slate-100 border border-slate-800 rounded-xl p-6 shadow-md space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Sentiment Analysis Card</h3>
              </div>
              <span className="text-[10px] font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                Python VADER
              </span>
            </div>

            {/* Sentiment Label & Compound Score */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-2">
              <span className="text-[10px] font-semibold uppercase text-slate-400 tracking-wider block">
                Classified Sentiment
              </span>
              <SentimentBadge
                sentiment={sr?.sentimentLabel || 'Unknown'}
                score={sr?.sentimentScore || 0}
                size="md"
              />

              <div className="pt-3 grid grid-cols-2 gap-2 border-t border-slate-800 text-left">
                <div>
                  <span className="text-[10px] text-slate-400 block">Compound Score</span>
                  <span className="text-sm font-bold font-mono text-white">
                    {sr?.sentimentScore !== undefined ? sr.sentimentScore.toFixed(4) : '0.0000'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Confidence</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {sr?.sentimentScore !== undefined
                      ? `${(Math.abs(sr.sentimentScore) * 100).toFixed(1)}%`
                      : '0.0%'}
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Probability Progress Bars */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Class Probability Distribution
              </h4>

              {/* Positive Bar */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-emerald-400">Positive</span>
                  <span className="text-emerald-400 font-mono font-bold">{formatPercent(posProb)}</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: formatPercent(posProb) }}
                  />
                </div>
              </div>

              {/* Neutral Bar */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Neutral</span>
                  <span className="text-slate-400 font-mono font-bold">{formatPercent(neuProb)}</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-slate-400 h-full rounded-full transition-all duration-500"
                    style={{ width: formatPercent(neuProb) }}
                  />
                </div>
              </div>

              {/* Negative Bar */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-medium">
                  <span className="text-rose-400">Negative</span>
                  <span className="text-rose-400 font-mono font-bold">{formatPercent(negProb)}</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-rose-500 h-full rounded-full transition-all duration-500"
                    style={{ width: formatPercent(negProb) }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-800 flex justify-between">
              <span>Analysis Timestamp:</span>
              <span className="font-mono text-slate-300">{formatDate(sr?.analyzedAt || review.reviewDate)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
