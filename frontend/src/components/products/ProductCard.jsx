import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingCart, Check, Eye } from 'lucide-react';
import Rating from '../common/Rating';
import { addToCartLocal, addToServerCart } from '../../features/cart/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [added, setAdded] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const itemPayload = {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      countInStock: product.countInStock,
      quantity: 1,
    };

    if (user) {
      dispatch(addToServerCart({ productId: product._id, quantity: 1 }));
    } else {
      dispatch(addToCartLocal(itemPayload));
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const isOutOfStock = product.countInStock <= 0;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-slate-200/80 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-xl hover:border-indigo-100 transition-all duration-300 overflow-hidden">
      {/* Product Image */}
      <Link to={`/product/${product._id}`} className="relative block aspect-square bg-slate-100 overflow-hidden">
        <img
          src={product.image || 'https://res.cloudinary.com/demo/image/upload/sample.jpg'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 text-[11px] font-bold bg-rose-500/90 backdrop-blur-sm text-white rounded-full uppercase tracking-wider">
              Out of Stock
            </span>
          ) : product.countInStock < 5 ? (
            <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-500/90 backdrop-blur-sm text-white rounded-full uppercase tracking-wider">
              Only {product.countInStock} Left
            </span>
          ) : null}
        </div>

        {/* Category Pill */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-slate-700 rounded-full shadow-sm">
            {product.category}
          </span>
        </div>

        {/* Quick View Overlay Button */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-full shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all">
            <Eye className="w-3.5 h-3.5" />
            <span>View Details</span>
          </span>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        <div className="mb-2">
          <Rating value={product.rating || 4.5} text={`(${product.numReviews || 0})`} />
        </div>

        <Link
          to={`/product/${product._id}`}
          className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 text-base mb-1"
        >
          {product.name}
        </Link>

        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed flex-1">
          {product.description}
        </p>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Price</span>
            <span className="text-lg font-extrabold text-slate-900">
              ₹{Number(product.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
            }`}
          >
            {added ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                <span>{isOutOfStock ? 'Sold Out' : 'Add'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
