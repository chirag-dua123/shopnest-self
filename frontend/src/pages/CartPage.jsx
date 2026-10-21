import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ShoppingBag, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import CartItem from '../components/cart/CartItem';
import {
  removeFromCartLocal,
  updateQuantityLocal,
  removeFromServerCart,
  addToServerCart,
  fetchServerCart,
} from '../features/cart/cartSlice';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchServerCart());
    }
  }, [dispatch, user]);

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (user) {
      // Find diff or update server
      const currentItem = cartItems.find((i) => i.product === productId);
      const diff = newQuantity - (currentItem?.quantity || 0);
      dispatch(addToServerCart({ productId, quantity: diff }));
    } else {
      dispatch(updateQuantityLocal({ product: productId, quantity: newQuantity }));
    }
  };

  const handleRemove = (productId) => {
    if (user) {
      dispatch(removeFromServerCart(productId));
    } else {
      dispatch(removeFromCartLocal(productId));
    }
  };

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + shipping;

  const handleProceedToCheckout = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-20 h-20 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Your Cart is Empty</h2>
        <p className="text-sm text-slate-500 mt-2 mb-8 max-w-sm mx-auto">
          Explore our collection of authentic products and add your favorite items to begin.
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-md shadow-indigo-100 hover:bg-indigo-700 transition-all text-sm"
        >
          <span>Start Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            You have {cartItems.reduce((acc, i) => acc + (i.quantity || 1), 0)} items in your cart
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm divide-y divide-slate-100">
          {cartItems.map((item) => (
            <CartItem
              key={item.product}
              item={item}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemove}
            />
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold uppercase tracking-wider text-[11px]">
                      FREE
                    </span>
                  ) : (
                    <span className="font-semibold text-slate-800">₹{shipping.toFixed(2)}</span>
                  )}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-[11px] text-indigo-600 bg-indigo-50 p-2 rounded-lg">
                  Add ₹{(500 - subtotal).toFixed(2)} more to qualify for Free Shipping!
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total</span>
              <span className="text-2xl font-black text-slate-900">
                ₹{grandTotal.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Safe & Secure 256-Bit SSL Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
