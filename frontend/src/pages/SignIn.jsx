import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SignupImage from '../assets/farmerimage2.jpg';
import { authAPI } from '../utils/api';

const SignIn = ({ onSignIn }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("farmer");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authAPI.signin({ phoneNumber, password, role });
      if (onSignIn) onSignIn(data.user, data.token);
      navigate("/dashboard");
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-black/15 p-4 font-sans">
      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl grid lg:grid-cols-2">
        
        {/* Left Panel: Image */}
        <div className="hidden lg:block">
          <img
            src={SignupImage}
            alt="A farmer in a field"
            className="w-full h-[90vh] object-cover opacity-97 rounded-l-2xl"
          />
        </div>

        {/* Right Panel: Form */}
        <div className="p-8 flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto">
            
            <div className="text-right mb-4">
              <p className="text-sm text-gray-600">
                Need an account?{" "}
                <Link to="/signup" className="font-semibold text-[#133215] hover:underline">
                  Sign Up
                </Link>
              </p>
            </div>
            
            <h2 className="text-3xl font-bold text-[#133215] mb-2">Welcome Back!</h2>
            <p className="text-gray-600 mb-6">Sign in to continue to your dashboard.</p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="tel"
                  placeholder="Enter your 10-digit phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Your Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm capitalize focus:ring-[#92B775] focus:border-[#92B775]"
                >
                  <option value="farmer">Farmer</option>
                  <option value="transporter">Transporter</option>
                  <option value="lab">Lab</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="government">Government</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#92B775] focus:border-[#92B775]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-[#92B775] text-white font-semibold rounded-lg hover:bg-[#82a365] transition-colors duration-300 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed flex justify-center items-center"
                >
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                  ) : null}
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;