import React from 'react';
import { Star } from 'lucide-react';

const Rating = ({ value = 0, text, size = 16 }) => {
  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              value >= star
                ? 'fill-amber-400 text-amber-400'
                : value >= star - 0.5
                ? 'fill-amber-300 text-amber-300'
                : 'text-slate-300'
            }`}
          />
        ))}
      </div>
      {text && <span className="text-xs text-slate-500 font-medium ml-1.5">{text}</span>}
    </div>
  );
};

export default Rating;
