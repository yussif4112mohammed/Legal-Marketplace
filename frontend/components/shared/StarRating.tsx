import { Star } from 'lucide-react';
import clsx from 'clsx';

interface Props {
  rating: number;
  max?: number;
  size?: 'xs' | 'sm' | 'md';
  showValue?: boolean;
  totalReviews?: number;
}

export default function StarRating({ rating, max = 5, size = 'sm', showValue, totalReviews }: Props) {
  const sz = { xs: 'w-3 h-3', sm: 'w-4 h-4', md: 'w-5 h-5' }[size];
  const filled = Math.round(Number(rating));

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: max }).map((_, i) => (
          <Star
            key={i}
            className={clsx(sz, i < filled ? 'text-gold-400 fill-gold-400' : 'text-gray-200 fill-gray-200')}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-navy-900">{Number(rating).toFixed(1)}</span>
      )}
      {totalReviews !== undefined && (
        <span className="text-xs text-gray-400">
          ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
        </span>
      )}
    </div>
  );
}
