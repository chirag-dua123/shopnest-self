import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
  const handleDecrement = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.product, item.quantity - 1);
    } else {
      onRemove(item.product);
    }
  };

  const handleIncrement = () => {
    if (item.quantity < (item.countInStock || 99)) {
      onUpdateQuantity(item.product, item.quantity + 1);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-slate-100 last:border-none">
      {/* Product info */}
      <div className="flex items-center space-x-4 w-full sm:w-auto">
        <Link
          to={`/product/${item.product}`}
          className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200"
        >
          <img
            src={item.image || 'https://res.cloudinary.com/demo/image/upload/sample.jpg'}
            alt={item.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
            }}
          />
        </Link>
        <div>
          <Link
            to={`/product/${item.product}`}
            className="font-bold text-slate-800 text-sm hover:text-indigo-600 transition-colors line-clamp-1"
          >
            {item.name}
          </Link>
          <p className="text-xs text-slate-400 mt-0.5">Unit Price: ₹{Number(item.price).toFixed(2)}</p>
          <p className="text-xs font-semibold text-emerald-600 mt-1">In Stock</p>
        </div>
      </div>

      {/* Quantity & Actions */}
      <div className="flex items-center justify-between sm:justify-end space-x-6 w-full sm:w-auto">
        {/* Counter */}
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
          <button
            onClick={handleDecrement}
            className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="w-9 text-center text-xs font-bold text-slate-800">
            {item.quantity}
          </span>
          <button
            onClick={handleIncrement}
            disabled={item.quantity >= (item.countInStock || 99)}
            className="p-1.5 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Increase quantity"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Item Total */}
        <div className="text-right min-w-[80px]">
          <span className="text-sm font-extrabold text-slate-900">
            ₹{(item.price * item.quantity).toFixed(2)}
          </span>
        </div>

        {/* Trash */}
        <button
          onClick={() => onRemove(item.product)}
          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
