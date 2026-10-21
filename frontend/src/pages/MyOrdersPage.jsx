import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Package, Eye, ArrowRight, Clock, CheckCircle2 } from 'lucide-react';
import { getMyOrders } from '../features/orders/orderSlice';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const MyOrdersPage = () => {
  const dispatch = useDispatch();
  const { myOrders, loading, error } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Order History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and view previous purchases placed with ShopNest
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
        >
          <span>Shop More</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {loading ? (
        <Loader message="Loading your orders..." />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : myOrders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No Orders Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't placed any orders with us yet. Start shopping and explore our curated catalog!
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-indigo-700 transition-colors"
          >
            <span>Start Shopping</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Order ID</th>
                  <th className="py-3.5 px-4 sm:px-6">Date</th>
                  <th className="py-3.5 px-4 sm:px-6">Items</th>
                  <th className="py-3.5 px-4 sm:px-6">Total</th>
                  <th className="py-3.5 px-4 sm:px-6">Payment</th>
                  <th className="py-3.5 px-4 sm:px-6">Delivery Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {myOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900">
                      #{order._id.substring(0, 8)}
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-semibold text-slate-800">
                        {order.orderItems?.length || 0} item(s)
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 font-extrabold text-slate-900">
                      ₹{order.totalPrice?.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      {order.isPaid ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Paid</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Unpaid</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 sm:px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          order.status === 'Delivered'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.status === 'Shipped'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.status || 'Processing'}
                      </span>
                    </td>
                    <td className="py-4 px-4 sm:px-6 text-right">
                      <Link
                        to={`/order/${order._id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
