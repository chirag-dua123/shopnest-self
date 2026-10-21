import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package,
  MapPin,
  CreditCard,
  CheckCircle2,
  Clock,
  Truck,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import {
  getOrderDetails,
  createRazorpayPayment,
  verifyRazorpayPayment,
} from '../features/orders/orderSlice';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const OrderPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { currentOrder: order, loading, error, paymentLoading } = useSelector(
    (state) => state.orders
  );
  const { user } = useSelector((state) => state.auth);

  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(getOrderDetails(id));
  }, [dispatch, id]);

  const handleRazorpayPayment = async () => {
    setPaymentError('');
    try {
      const res = await dispatch(createRazorpayPayment(order._id));
      if (createRazorpayPayment.rejected.match(res)) {
        setPaymentError(res.payload || 'Failed to initialize payment gateway');
        return;
      }

      const { id: razorpayOrderId, currency, amount } = res.payload;

      // Check if Razorpay script is loaded
      if (typeof window.Razorpay === 'undefined') {
        setPaymentError('Razorpay SDK failed to load. Are you connected to the internet?');
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
        amount: amount,
        currency: currency,
        name: 'ShopNest E-Commerce',
        description: `Order #${order._id.substring(0, 8)}`,
        order_id: razorpayOrderId,
        handler: async function (response) {
          const verifyRes = await dispatch(
            verifyRazorpayPayment({
              orderId: order._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
          );

          if (verifyRazorpayPayment.fulfilled.match(verifyRes)) {
            setPaymentSuccessMsg('Payment received and verified successfully!');
            dispatch(getOrderDetails(id));
          } else {
            setPaymentError(verifyRes.payload || 'Payment verification failed');
          }
        },
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on('payment.failed', function (response) {
        setPaymentError(response.error.description || 'Payment failed');
      });
      razorpayInstance.open();
    } catch (err) {
      setPaymentError(err.message || 'Payment processing error');
    }
  };

  if (loading) {
    return <Loader message="Fetching order details..." size="large" />;
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12">
        <Message variant="error">{error}</Message>
        <Link
          to="/my-orders"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-indigo-600 mt-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>View My Orders</span>
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link
            to="/my-orders"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>My Orders</span>
          </Link>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Order #{order._id.substring(0, 10)}
            </h1>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                order.status === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'Shipped'
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {order.status || 'Processing'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Placed on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>
      </div>

      {paymentSuccessMsg && (
        <Message variant="success" onClose={() => setPaymentSuccessMsg('')}>
          {paymentSuccessMsg}
        </Message>
      )}

      {paymentError && (
        <Message variant="error" onClose={() => setPaymentError('')}>
          {paymentError}
        </Message>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm pb-2 border-b border-slate-100">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>Shipping Information</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Recipient: <span className="text-slate-900 font-bold">{order.userId?.name || user?.name}</span> ({order.userId?.email || user?.email})
            </p>
            <p className="text-xs text-slate-600">
              Address: {order.shippingAddress?.address}, {order.shippingAddress?.city},{' '}
              {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
            </p>
            <div className="pt-2">
              {order.isDelivered ? (
                <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl font-medium">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Delivery in progress</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Status Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm pb-2 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Payment Details</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Method: <span className="font-bold text-slate-800">{order.paymentMethod}</span>
            </p>
            <div className="pt-2">
              {order.isPaid ? (
                <div className="inline-flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Paid on {new Date(order.paidAt).toLocaleDateString()}</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl font-medium">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>Payment Pending</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 font-bold text-sm pb-2 border-b border-slate-100">
              <Package className="w-4 h-4 text-indigo-600" />
              <span>Order Items ({order.orderItems?.length})</span>
            </div>
            <div className="divide-y divide-slate-100">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image || 'https://res.cloudinary.com/demo/image/upload/sample.jpg'}
                      alt={item.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100"
                    />
                    <div>
                      <span className="font-bold text-slate-800 block">{item.name}</span>
                      <span className="text-slate-400">
                        {item.quantity} x ₹{item.price}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">
                    ₹{(item.quantity * item.price).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Cost Summary & Pay Button */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6 sticky top-24">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
              Payment Summary
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-800">₹{order.totalPrice?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Amount Due</span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{order.totalPrice?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Pay Button if unpaid */}
            {!order.isPaid && order.paymentMethod === 'Razorpay' && (
              <div className="space-y-3">
                <button
                  onClick={handleRazorpayPayment}
                  disabled={paymentLoading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center space-x-2"
                >
                  {paymentLoading ? (
                    <Loader message="" size="small" />
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>Pay with Razorpay</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {!order.isPaid && order.paymentMethod === 'CashOnDelivery' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 text-center">
                Payment will be collected upon delivery of your order.
              </div>
            )}

            {order.isPaid && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-semibold text-center flex items-center justify-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Order Paid in Full</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
