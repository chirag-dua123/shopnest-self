import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Package, ArrowLeft, CheckCircle2, Clock, Eye } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '../features/orders/orderSlice';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const AdminOrdersPage = () => {
  const dispatch = useDispatch();
  const { orders, loading, error } = useSelector((state) => state.orders);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    dispatch(getAllOrders());
  }, [dispatch]);

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await dispatch(updateOrderStatus({ orderId, status: newStatus }));
    if (updateOrderStatus.fulfilled.match(res)) {
      setSuccessMsg(`Order #${orderId.substring(0, 8)} status updated to ${newStatus}`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Orders Fulfillment</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review customer orders, verify payment status, and dispatch shipments
          </p>
        </div>
      </div>

      {successMsg && <Message variant="success">{successMsg}</Message>}
      {error && <Message variant="error">{error}</Message>}

      {loading ? (
        <Loader message="Loading customer orders..." />
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Package className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No orders placed yet</h3>
          <p className="text-xs text-slate-500">
            When customers place orders, they will appear here in real-time.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Order ID</th>
                  <th className="py-3.5 px-4 sm:px-6">Customer</th>
                  <th className="py-3.5 px-4 sm:px-6">Date</th>
                  <th className="py-3.5 px-4 sm:px-6">Total</th>
                  <th className="py-3.5 px-4 sm:px-6">Paid</th>
                  <th className="py-3.5 px-4 sm:px-6">Status</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900">
                      #{ord._id.substring(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="font-bold text-slate-800 block">
                        {ord.userId?.name || 'Customer'}
                      </span>
                      <span className="text-[11px] text-slate-400">{ord.userId?.email}</span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-slate-500">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-extrabold text-slate-900">
                      ₹{ord.totalPrice?.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6">
                      {ord.isPaid ? (
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
                    <td className="py-3.5 px-4 sm:px-6">
                      <select
                        value={ord.status || 'Processing'}
                        onChange={(e) => handleStatusChange(ord._id, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border border-slate-200 focus:outline-none cursor-pointer ${
                          ord.status === 'Delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : ord.status === 'Shipped'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right">
                      <Link
                        to={`/order/${ord._id}`}
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
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

export default AdminOrdersPage;
