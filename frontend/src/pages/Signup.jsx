import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../utils/api';
import { FormInput, FormSelect, Alert, Spinner } from '../components/UI';

const ROLES = ['farmer', 'transporter', 'lab', 'manufacturer', 'government'];
const GENDERS = ['male', 'female', 'other'];

export default function Signup({ onSignIn }) {
  const [step, setStep] = useState(1); // 1: account, 2: details
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', age: '', gender: '',
    phoneNumber: '', password: '', confirmPassword: '',
    role: '', region: '', pincode: '',
    city: '', state: '',
    organizationName: '', licenseNumber: '',
  });

  const set = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (!form.name || !form.phoneNumber || !form.password || !form.role || !form.gender || !form.age) {
      return setError('Please fill all required fields');
    }
    if (!/^\d{10}$/.test(form.phoneNumber)) return setError('Phone number must be exactly 10 digits');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.region || !form.pincode) return setError('Region and Pincode are required');
    setLoading(true);
    setError('');
    try {
      const { confirmPassword, ...payload } = form;
      payload.age = Number(payload.age);
      const data = await authAPI.signup(payload);
      onSignIn(data.user, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const needsOrg = ['transporter', 'lab', 'manufacturer'].includes(form.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#133215] to-[#1a5c1e] flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-[#133215] px-8 py-6 text-white">
          <h1 className="text-2xl font-bold">🌿 Join Sanjeevani</h1>
          <p className="text-gray-300 text-sm mt-1">Create your account to get started</p>
          {/* Step indicator */}
          <div className="flex gap-2 mt-4">
            {[1, 2].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? 'bg-[#92B775]' : 'bg-white/20'}`} />
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">Step {step} of 2</p>
        </div>

        <div className="px-8 py-6">
          {error && <div className="mb-4"><Alert type="error" message={error} /></div>}

          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-4">
              <h2 className="font-semibold text-gray-700 text-lg">Account Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Full Name" name="name" value={form.name} onChange={set} placeholder="Your name" required />
                <FormInput label="Age" name="age" type="number" value={form.age} onChange={set} placeholder="Age" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormSelect label="Gender" name="gender" value={form.gender} onChange={set} options={GENDERS} required />
                <FormSelect label="Role" name="role" value={form.role} onChange={set} options={ROLES} required />
              </div>
              <FormInput label="Phone Number (10 digits)" name="phoneNumber" type="tel" value={form.phoneNumber} onChange={set} placeholder="9876543210" required />
              <FormInput label="Password" name="password" type="password" value={form.password} onChange={set} placeholder="Min 6 characters" required />
              <FormInput label="Confirm Password" name="confirmPassword" type="password" value={form.confirmPassword} onChange={set} placeholder="Repeat password" required />
              <button type="submit" className="w-full py-3 bg-[#133215] text-white font-bold rounded-xl hover:bg-[#1a431d] transition">
                Next →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-gray-700">← Back</button>
                <h2 className="font-semibold text-gray-700 text-lg">Location & Details</h2>
              </div>
              <FormInput label="Region / District" name="region" value={form.region} onChange={set} placeholder="e.g. Bhopal, Ujjain" required />
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="City" name="city" value={form.city} onChange={set} placeholder="City" />
                <FormInput label="State" name="state" value={form.state} onChange={set} placeholder="State" />
              </div>
              <FormInput label="Pincode" name="pincode" value={form.pincode} onChange={set} placeholder="6-digit pincode" required />
              {needsOrg && (
                <>
                  <FormInput
                    label={form.role === 'lab' ? 'Lab Name' : form.role === 'transporter' ? 'Transport Company Name' : 'Company Name'}
                    name="organizationName" value={form.organizationName} onChange={set}
                    placeholder="Organization name"
                  />
                  <FormInput label="License / Registration Number" name="licenseNumber" value={form.licenseNumber} onChange={set} placeholder="Optional" />
                </>
              )}
              <button type="submit" disabled={loading} className="w-full py-3 bg-[#133215] text-white font-bold rounded-xl hover:bg-[#1a431d] transition disabled:bg-gray-400 flex items-center justify-center gap-2">
                {loading && <Spinner size="sm" />}
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/signin" className="text-[#133215] font-semibold hover:underline">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
