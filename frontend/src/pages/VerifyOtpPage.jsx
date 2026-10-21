import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { KeyRound, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { verifyOtp, clearAuthError } from '../features/auth/authSlice';
import Message from '../components/common/Message';
import Loader from '../components/common/Loader';

const VerifyOtpPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user, loading, error, pendingVerificationEmail } = useSelector((state) => state.auth);

  const [email, setEmail] = useState(pendingVerificationEmail || '');
  const [otp, setOtp] = useState('');

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  useEffect(() => {
    dispatch(clearAuthError());
    if (user) {
      navigate(redirect);
    }
  }, [user, navigate, redirect, dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) return;

    const result = await dispatch(verifyOtp({ email, otp: otp.trim() }));
    if (verifyOtp.fulfilled.match(result)) {
      navigate(redirect);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-16">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-100">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Verify Your Email</h1>
          <p className="text-xs text-slate-500">
            Enter the 6-digit verification code sent to your email
          </p>
        </div>

        {error && (
          <Message variant="error" onClose={() => dispatch(clearAuthError())}>
            {error}
          </Message>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              6-Digit OTP Code
            </label>
            <input
              type="text"
              required
              maxLength={6}
              placeholder="e.g. 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full text-center tracking-[0.5em] text-lg font-bold py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1.5 text-center">
              The OTP code is valid for 10 minutes.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all disabled:opacity-50 pt-3"
          >
            {loading ? (
              <Loader message="" size="small" />
            ) : (
              <>
                <span>Verify Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <Link to="/login" className="inline-flex items-center space-x-1 text-slate-600 hover:text-indigo-600 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Login</span>
          </Link>
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-800">
            Use different email
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtpPage;
