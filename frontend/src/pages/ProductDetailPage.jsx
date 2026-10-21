import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Plus,
  Minus,
  Check,
} from 'lucide-react';
import { fetchProductById, clearProductDetails } from '../features/products/productSlice';
import { addToCartLocal, addToServerCart } from '../features/cart/cartSlice';
import Rating from '../components/common/Rating';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, loading, error } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);

  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    return () => {
      dispatch(clearProductDetails());
    };
  }, [dispatch, id]);

  const handleAddToCart = () => {
    if (!product) return;

    const itemPayload = {
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      countInStock: product.countInStock,
      quantity,
    };

    if (user) {
      dispatch(addToServerCart({ productId: product._id, quantity }));
    } else {
      dispatch(addToCartLocal(itemPayload));
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return <Loader message="Loading product information..." size="large" />;
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Message variant="error">{error}</Message>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const isOutOfStock = product.countInStock <= 0;

  return (
    <div className="space-y-8">
      {/* Breadcrumb / Back button */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
        {/* Left: Image Container */}
        <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 relative">
          <img
            src={product.image || 'https://res.cloudinary.com/demo/image/upload/sample.jpg'}
            alt={product.name}
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';
            }}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center">
              <span className="px-4 py-2 bg-rose-600 text-white font-bold text-sm rounded-full tracking-wider uppercase">
                Currently Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Right: Product Info & Purchase Actions */}
        <div className="flex flex-col space-y-6">
          <div>
            <span className="inline-block px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-600 rounded-full mb-3">
              {product.category}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>
            <div className="mt-3 flex items-center space-x-3">
              <Rating value={product.rating || 4.5} text={`(${product.numReviews || 0} reviews)`} size={18} />
              <span className="text-slate-300">•</span>
              <span className={`text-xs font-bold ${isOutOfStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                {isOutOfStock ? 'Out of Stock' : `In Stock (${product.countInStock} units left)`}
              </span>
            </div>
          </div>

          {/* Pricing */}
          <div className="py-4 border-y border-slate-100">
            <span className="text-xs text-slate-400 block font-medium">Inclusive of all taxes</span>
            <div className="flex items-baseline space-x-3 mt-1">
              <span className="text-3xl font-black text-slate-900">
                ₹{Number(product.price).toFixed(2)}
              </span>
              <span className="text-sm text-slate-400 line-through">
                ₹{(Number(product.price) * 1.2).toFixed(2)}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Save 20%
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <div className="flex items-center space-x-4 pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Quantity:
              </span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 hover:bg-slate-200 text-slate-600 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center text-sm font-bold text-slate-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.countInStock, quantity + 1))}
                  disabled={quantity >= product.countInStock}
                  className="p-2 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-40"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl text-sm font-bold shadow-md transition-all ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : added
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Cart</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className="flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-slate-200"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-100 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <Truck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-700">Free Delivery</p>
              <p className="text-[10px] text-slate-400">Orders over ₹500</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <RotateCcw className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-700">30 Days Return</p>
              <p className="text-[10px] text-slate-400">Money back guarantee</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-indigo-600 mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-700">100% Genuine</p>
              <p className="text-[10px] text-slate-400">Authentic guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
