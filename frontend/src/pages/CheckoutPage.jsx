import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, CreditCard, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { saveShippingAddress, savePaymentMethod, clearCart } from '../features/cart/cartSlice';
import { createOrder } from '../features/orders/orderSlice';
import Message from '../components/common/Message';
import Loader from '../components/common/Loader';

const CheckoutPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { cartItems, shippingAddress: savedAddress, paymentMethod: savedMethod } = useSelector(
    (state) => state.cart
  );
  const { loading, error } = useSelector((state) => state.orders);

  const [address, setAddress] = useState(savedAddress.address || '');
  const [city, setCity] = useState(savedAddress.city || '');
  const [postalCode, setPostalCode] = useState(savedAddress.postalCode || '');
  const [country, setCountry] = useState(savedAddress.country || 'India');
  const [paymentMethod, setPaymentMethod] = useState(savedMethod || 'Razorpay');
  const [formError, setFormError] = useState('');

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );
  const shipping = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const grandTotal = subtotal + shipping;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!address.trim() || !city.trim() || !postalCode.trim() || !country.trim()) {
      setFormError('Please complete all shipping address fields');
      return;
    }

    setFormError('');
    const shippingDetails = { address, city, postalCode, country };
    dispatch(saveShippingAddress(shippingDetails));
    dispatch(savePaymentMethod(paymentMethod));

    const orderPayload = {
      orderItems: cartItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
      shippingAddress: shippingDetails,
      paymentMethod,
    };

    const result = await dispatch(createOrder(orderPayload));
    if (createOrder.fulfilled.match(result)) {
      dispatch(clearCart());
      navigate(`/order/${result.payload._id}`);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <Message variant="info">Your cart is empty. Add products before checking out.</Message>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 mt-4 text-xs font-semibold text-indigo-600"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          to="/cart"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Cart</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Checkout</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your delivery details and choose your preferred payment option
        </p>
      </div>

      {(formError || error) && (
        <Message variant="error" onClose={() => setFormError('')}>
          {formError || error}
        </Message>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Shipping & Payment */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <MapPin className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Shipping Address</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 42 Park Avenue, Apartment 3B"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 400001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Country
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Payment Method</h2>
            </div>

            <div className="space-y-3">
              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'Razorpay'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="Razorpay"
                    checked={paymentMethod === 'Razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Razorpay Online Payment (UPI, Cards, NetBanking)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Instant verification and encrypted gateway
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-full">
                  Recommended
                </span>
              </label>

              <label
                className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'CashOnDelivery'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CashOnDelivery"
                    checked={paymentMethod === 'CashOnDelivery'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">
                      Cash on Delivery (COD)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Pay cash at doorstep upon delivery
                    </span>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Col: Summary & Confirmation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Items to Purchase ({cartItems.length})
            </h3>

            <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cartItems.map((item) => (
                <div key={item.product} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="truncate max-w-[150px]">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="text-slate-400 block text-[11px]">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span>
                  {shipping === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-100">
                <span>Grand Total</span>
                <span className="text-xl font-black text-slate-900">₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader message="" size="small" />
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Protected by ShopNest Buyer Guarantee</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
