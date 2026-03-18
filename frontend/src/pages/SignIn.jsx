import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { FormInput, FormSelect, Alert, Spinner } from '../components/UI';

const ROLES = ['farmer', 'transporter', 'lab', 'manufacturer', 'government'];

export default function SignIn({ onSignIn }) {
  const [form, setForm] = useState({ phoneNumber: '', password: '', role: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phoneNumber || !form.password) return setError('Phone and password are required');
    setLoading(true);
    setError('');
    try {
      const data = await authAPI.signin(form);
      onSignIn(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#133215] to-[#1a5c1e] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#133215] px-8 py-8 text-white text-center">
            <div className="text-5xl mb-3">🌿</div>
            <h1 className="text-2xl font-bold">Welcome Back</h1>
            <p className="text-gray-300 text-sm mt-1">Sign in to continue to Sanjeevani</p>
          </div>

          {/* Form */}
          <div className="px-8 py-8">
            {error && <div className="mb-5"><Alert type="error" message={error} /></div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <FormInput
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={set}
                placeholder="10-digit phone number"
                required
              />
              <FormInput
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={set}
                placeholder="Your password"
                required
              />
              <FormSelect
                label="Role (optional — for verification)"
                name="role"
                value={form.role}
                onChange={set}
                options={ROLES}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#133215] text-white font-bold rounded-xl hover:bg-[#1a431d] transition disabled:bg-gray-400 flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Spinner size="sm" />}
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#133215] font-semibold hover:underline">Sign Up</Link>
            </p>
          </div>
        </div>

        {/* Demo accounts hint */}
        <div className="mt-4 bg-white/10 rounded-xl p-4 text-white text-xs text-center">
          <p className="font-semibold mb-1">Demo Roles Available:</p>
          <p className="text-gray-300">farmer • transporter • lab • manufacturer • government</p>
        </div>
      </div>
    </div>
  );
}
