import React from 'react';
import { Link } from 'react-router-dom';
import { Review } from '../../types';
import { RatingStars } from '../common/RatingStars';
import { SentimentBadge } from '../common/SentimentBadge';
import { formatDate, truncateText } from '../../utils/formatters';
import { ArrowRight, ExternalLink } from 'lucide-react';

interface RecentReviewsTableProps {
  reviews: Review[];
}

export const RecentReviewsTable: React.FC<RecentReviewsTableProps> = ({ reviews }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Recent Customer Reviews</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Latest incoming feedback across connected domain streams.
          </p>
        </div>
        <Link
          to="/reviews"
          className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition"
        >
          <span>View All ({reviews.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider border-y border-slate-200/60">
            <tr>
              <th className="px-4 py-3">Product / Domain</th>
              <th className="px-4 py-3">Rating</th>
              <th className="px-4 py-3">Sentiment</th>
              <th className="px-4 py-3">Review Excerpt</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <tr key={review.id} className="hover:bg-slate-50/80 transition">
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
                <td className="px-4 py-3.5 max-w-xs">
                  <p className="text-slate-700 font-normal italic line-clamp-2">
                    "{truncateText(review.reviewText, 90)}"
                  </p>
                </td>
                <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                  {formatDate(review.reviewDate)}
                </td>
                <td className="px-4 py-3.5 text-right whitespace-nowrap">
                  <Link
                    to={`/reviews/${review.id}`}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-md transition"
                  >
                    <span>Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
