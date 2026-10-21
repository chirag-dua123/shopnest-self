import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, Package, ShoppingBag, Users, ArrowRight, PlusCircle, ListOrdered } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/common/Loader';
import Message from '../components/common/Message';

const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/analytics/admin-stats');
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch admin statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Admin Management Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
            Store Performance & Metrics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time analytics for revenue, orders, inventory, and registered users
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/products"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Manage Products</span>
          </Link>
          <Link
            to="/admin/orders"
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <ListOrdered className="w-4 h-4" />
            <span>Manage Orders</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <Loader message="Loading platform analytics..." size="large" />
      ) : error ? (
        <Message variant="error">{error}</Message>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Revenue
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-slate-900">
                  ₹{(stats?.totalRevenue || 0).toFixed(2)}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Aggregated across all completed orders</p>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Total Orders
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-slate-900">
                  {stats?.totalOrders || 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Total customer transactions</p>
              </div>
            </div>

            {/* Products in Inventory */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Catalog Products
                </span>
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-slate-900">
                  {stats?.totalProducts || 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Active items in database</p>
              </div>
            </div>

            {/* Registered Users */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Customers
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-black text-slate-900">
                  {stats?.totalUsers || 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Verified user accounts</p>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <Link
              to="/admin/products"
              className="group bg-gradient-to-br from-indigo-50 to-white rounded-3xl border border-indigo-100 p-8 hover:border-indigo-300 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Inventory Control
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Manage Products Catalog
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Add new products, upload images to Cloudinary, edit pricing, and update stock counts.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>

            <Link
              to="/admin/orders"
              className="group bg-gradient-to-br from-slate-50 to-white rounded-3xl border border-slate-200 p-8 hover:border-slate-300 transition-all shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Logistics & Fulfillment
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Fulfill Customer Orders
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Review incoming orders, view shipping destinations, and update delivery statuses.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-700 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </Link>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboardPage;
