import React from 'react';
import { ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value propositions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-slate-800">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Free & Express Delivery</h4>
              <p className="text-xs text-slate-400 mt-0.5">Prompt delivery across all addresses</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Secure Online Payments</h4>
              <p className="text-xs text-slate-400 mt-0.5">Encrypted Razorpay checkout integration</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-indigo-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Easy Returns & Refunds</h4>
              <p className="text-xs text-slate-400 mt-0.5">Hassle-free 30-day return policy</p>
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">ShopNest</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              ShopNest is a modern full-stack e-commerce marketplace built on the MERN stack with high performance and seamless payment workflows.
            </p>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors">Catalog & Products</Link></li>
              <li><Link to="/cart" className="hover:text-indigo-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/my-orders" className="hover:text-indigo-400 transition-colors">Track Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">User Account</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/profile" className="hover:text-indigo-400 transition-colors">Account Profile</Link></li>
              <li><Link to="/login" className="hover:text-indigo-400 transition-colors">Sign In</Link></li>
              <li><Link to="/register" className="hover:text-indigo-400 transition-colors">Create Account</Link></li>
              <li><Link to="/forgot-password" className="hover:text-indigo-400 transition-colors">Reset Password</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-sm font-semibold mb-3">ShopNest Status</h4>
            <p className="text-xs text-slate-400 mb-3">
              MERN Stack E-Commerce Platform. Designed for scalability, security, and responsive UX.
            </p>
            <div className="inline-flex items-center space-x-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-full text-indigo-400 border border-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ShopNest. Crafted with care using React, Redux Toolkit & Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
