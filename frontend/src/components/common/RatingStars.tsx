import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
}

export const RatingStars: React.FC<RatingStarsProps> = ({
  rating,
  maxStars = 5,
  size = 'md',
  showNumber = false,
}) => {
  const roundedRating = Math.round(rating * 2) / 2;

  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center space-x-0.5">
        {Array.from({ length: maxStars }).map((_, idx) => {
          const starValue = idx + 1;
          const isFull = roundedRating >= starValue;
          const isHalf = roundedRating >= starValue - 0.5 && !isFull;

          return (
            <Star
              key={idx}
              className={`${sizeClasses[size]} ${
                isFull
                  ? 'text-amber-400 fill-amber-400'
                  : isHalf
                  ? 'text-amber-400 fill-amber-200'
                  : 'text-slate-300 fill-slate-100'
              }`}
            />
          );
        })}
      </div>
      {showNumber && (
        <span className="text-xs font-semibold text-slate-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};
