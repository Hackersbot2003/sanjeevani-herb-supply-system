import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ShieldCheck, QrCode, BarChart3, ArrowRight } from 'lucide-react';

const features = [
  { icon: Leaf, title: 'Farmer Registration', desc: 'Farmers register their herbs/crops with GPS location and get a unique QR code instantly.' },
  { icon: QrCode, title: 'QR-Linked Supply Chain', desc: 'Each stage — transport, lab, manufacture — scans the QR and generates the next one.' },
  { icon: ShieldCheck, title: 'Lab Verified Quality', desc: 'Lab tests moisture, purity, pesticide levels and issues quality certificates.' },
  { icon: BarChart3, title: 'Government Dashboard', desc: 'Live India map showing farmers, transporters, labs and manufacturers by density.' },
];

const roles = [
  { role: 'Farmer', emoji: '🌿', desc: 'Upload your crops with GPS location' },
  { role: 'Transporter', emoji: '🚚', desc: 'Pick up crops in your area by scanning QR' },
  { role: 'Lab', emoji: '🔬', desc: 'Test herb quality and issue certificates' },
  { role: 'Manufacturer', emoji: '🏭', desc: 'Process and manufacture verified herbs' },
  { role: 'Government', emoji: '🏛️', desc: 'Monitor entire supply chain on live map' },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 shadow-sm">
        <h1 className="text-2xl font-bold text-[#133215]">🌿 Sanjeevani</h1>
        <div className="flex gap-3">
          <Link to="/signin" className="px-4 py-2 text-sm font-medium text-[#133215] border border-[#133215] rounded-lg hover:bg-gray-50 transition">Sign In</Link>
          <Link to="/signup" className="px-4 py-2 text-sm font-medium text-white bg-[#133215] rounded-lg hover:bg-[#1a431d] transition">Sign Up</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#133215] to-[#1a5c1e] text-white px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-block bg-[#92B775]/20 text-[#92B775] text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            Herb Supply Chain Tracker — SIH 2024
          </div>
          <h2 className="text-5xl font-extrabold mb-6 leading-tight">
            From Farm to<br />
            <span className="text-[#92B775]">Consumer</span>, Traceable
          </h2>
          <p className="text-lg text-gray-300 mb-10 max-w-xl mx-auto">
            A complete QR-based supply chain tracking system for medicinal herbs —
            ensuring quality, transparency, and trust at every step.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/signup" className="flex items-center gap-2 px-8 py-3 bg-[#92B775] text-white font-bold rounded-xl hover:bg-[#82a365] transition text-lg">
              Get Started <ArrowRight size={20} />
            </Link>
            <Link to="/signin" className="px-8 py-3 border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/10 transition text-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-[#133215] mb-12">How It Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={24} className="text-[#133215]" />
                </div>
                <h4 className="font-bold text-gray-800 mb-2">{title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-[#133215] mb-12">Who Uses Sanjeevani?</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {roles.map(({ role, emoji, desc }) => (
              <div key={role} className="text-center p-4 rounded-xl bg-gray-50 hover:bg-green-50 transition">
                <div className="text-4xl mb-3">{emoji}</div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">{role}</h4>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#133215] text-white text-center px-6">
        <h3 className="text-3xl font-bold mb-4">Ready to Join?</h3>
        <p className="text-gray-300 mb-8">Register now and start tracking your supply chain</p>
        <Link to="/signup" className="inline-flex items-center gap-2 px-10 py-3 bg-[#92B775] text-white font-bold rounded-xl hover:bg-[#82a365] transition text-lg">
          Register Now <ArrowRight size={20} />
        </Link>
      </section>

      <footer className="text-center py-6 text-sm text-gray-400 border-t">
        © 2024 Sanjeevani — SIH Project
      </footer>
    </div>
  );
}
