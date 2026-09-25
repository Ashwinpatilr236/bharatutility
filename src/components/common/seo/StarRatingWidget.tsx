import React from 'react';
import { Star } from 'lucide-react';
import { Tool } from '../../../types';

interface StarRatingWidgetProps {
  tool: Tool;
}

export const StarRatingWidget: React.FC<StarRatingWidgetProps> = ({ tool }) => {
  // Use the same pseudo-random logic as seo.ts to ensure UI matches Schema
  const ratingValue = (4.5 + (tool.slug.length % 5) * 0.1).toFixed(1);
  const ratingCount = String(300 + (tool.slug.length * 47) % 2000);

  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 sm:w-5 sm:h-5 ${
              star <= Math.floor(Number(ratingValue))
                ? 'text-yellow-400 fill-yellow-400'
                : star - Number(ratingValue) <= 0.5
                ? 'text-yellow-400 fill-yellow-400 opacity-50'
                : 'text-neutral-300 dark:text-neutral-600'
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
        <span className="text-neutral-900 dark:text-white font-bold">{ratingValue}</span>
        <span className="text-neutral-500 dark:text-neutral-400">({ratingCount} reviews)</span>
      </div>
    </div>
  );
};
