import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SignupImage from '../assets/farmerimage2.jpg';
import { authAPI } from '../utils/api';

const Signup = ({ onSignIn }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    region: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "",
    gender: "",
    pincode: "",
    city: "",
    state: "",
    organizationName: "",
  });

  const roles = ["farmer", "transporter", "lab", "manufacturer", "government"];
  const genders = ["male", "female", "other"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phoneNumber || !formData.password || !formData.role || !formData.gender || !formData.age || !formData.region || !formData.pincode) {
      return alert("Please fill all required fields");
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) return alert("Phone number must be 10 digits");
    if (formData.password.length < 6) return alert("Password must be at least 6 characters");
    if (formData.password !== formData.confirmPassword) return alert("Passwords do not match");

    try {
      setLoading(true);
      const { confirmPassword, ...payload } = formData;
      payload.age = Number(payload.age);
      const data = await authAPI.signup(payload);
      alert("✅ Registration successful! Welcome to Sanjeevani.");
      if (onSignIn) onSignIn(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const needsOrg = ["transporter", "lab", "manufacturer"].includes(formData.role);

  return (
    <div className="flex justify-center items-center min-h-screen bg-black/15 p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl grid lg:grid-cols-2">
        
        {/* Left Panel: Image */}
        <div className="hidden lg:block">
          <img
            src={SignupImage}
            alt="A farmer in a field"
            className="w-full h-full object-cover opacity-97 rounded-l-2xl"
          />
        </div>

        {/* Right Panel: Form */}
        <div className="p-8 flex flex-col justify-center overflow-y-auto max-h-screen">
          <div className="w-full max-w-sm mx-auto">

            <div className="text-right mb-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link to="/signin" className="font-semibold text-[#133215] hover:underline">
                  Sign In
                </Link>
              </p>
            </div>

            <h2 className="text-3xl font-bold text-[#133215] mb-2">Join Sanjeevani</h2>
            <p className="text-gray-600 mb-6">Create your account to get started.</p>

            <form onSubmit={submit} className="space-y-3">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input value={formData.name} name="name" onChange={handleChange} placeholder="Your full name"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Age <span className="text-red-500">*</span></label>
                  <input value={formData.age} name="age" type="number" onChange={handleChange} placeholder="Age"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                  <select name="gender" onChange={handleChange} value={formData.gender}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]" required>
                    <option value="">Select</option>
                    {genders.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role <span className="text-red-500">*</span></label>
                <select name="role" onChange={handleChange} value={formData.role}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]" required>
                  <option value="">Select Role</option>
                  {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
                <input value={formData.phoneNumber} name="phoneNumber" type="tel" onChange={handleChange} placeholder="10-digit phone number"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                  <input value={formData.password} name="password" type="password" onChange={handleChange} placeholder="Min 6 chars"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                  <input value={formData.confirmPassword} name="confirmPassword" type="password" onChange={handleChange} placeholder="Repeat"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region / District <span className="text-red-500">*</span></label>
                <input value={formData.region} name="region" onChange={handleChange} placeholder="e.g. Bhopal, Ujjain"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]" required />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input value={formData.city} name="city" onChange={handleChange} placeholder="City"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input value={formData.state} name="state" onChange={handleChange} placeholder="State"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode <span className="text-red-500">*</span></label>
                <input value={formData.pincode} name="pincode" onChange={handleChange} placeholder="6-digit pincode"
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]" required />
              </div>

              {needsOrg && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.role === "lab" ? "Lab Name" : formData.role === "transporter" ? "Transport Company" : "Company Name"}
                  </label>
                  <input value={formData.organizationName} name="organizationName" onChange={handleChange} placeholder="Organization name"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]" />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#92B775] text-white font-semibold rounded-lg hover:bg-[#82a365] transition-colors duration-300 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center mt-2"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                ) : null}
                {loading ? "Registering..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;