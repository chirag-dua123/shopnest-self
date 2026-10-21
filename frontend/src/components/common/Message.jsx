import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

const Message = ({ variant = 'info', children, onClose }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
      case 'error':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'success':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'warning':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'info':
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  const getIcon = () => {
    const iconClass = 'w-5 h-5 flex-shrink-0';
    switch (variant) {
      case 'danger':
      case 'error':
        return <AlertCircle className={iconClass} />;
      case 'success':
        return <CheckCircle2 className={iconClass} />;
      case 'warning':
        return <AlertTriangle className={iconClass} />;
      case 'info':
      default:
        return <Info className={iconClass} />;
    }
  };

  if (!children) return null;

  return (
    <div
      className={`flex items-start justify-between p-4 my-3 text-sm rounded-xl border ${getVariantStyles()} transition-all`}
      role="alert"
    >
      <div className="flex items-center space-x-3">
        {getIcon()}
        <div className="font-medium">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors ml-3"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Message;
