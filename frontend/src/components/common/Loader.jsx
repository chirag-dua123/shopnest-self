import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ message = 'Loading...', size = 'default' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2
        className={`animate-spin text-indigo-600 ${
          size === 'small' ? 'w-5 h-5' : size === 'large' ? 'w-12 h-12' : 'w-8 h-8'
        }`}
      />
      {message && <p className="text-sm font-medium text-slate-500">{message}</p>}
    </div>
  );
};

export default Loader;
