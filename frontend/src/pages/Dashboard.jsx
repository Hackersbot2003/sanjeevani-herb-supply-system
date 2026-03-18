import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Truck, Microscope, Factory, Map } from 'lucide-react';
import { SectionCard, Badge } from '../components/UI';

const ROLE_INFO = {
  farmer: {
    greeting: 'Farmer Dashboard',
    icon: '🌿',
    color: 'green',
    links: [
      { to: '/upload-crop', label: 'Upload New Crop', icon: Leaf, desc: 'Register a new herb/crop batch' },
      { to: '/my-crops', label: 'My Crops', icon: Leaf, desc: 'View all your registered crops & QR codes' },
    ],
    tips: [
      'Upload your crop with GPS location enabled',
      'A unique QR code is generated for each batch',
      'Transporter in your area will pick it up',
    ],
  },
  transporter: {
    greeting: 'Transporter Dashboard',
    icon: '🚚',
    color: 'blue',
    links: [
      { to: '/transport', label: 'Transport Jobs', icon: Truck, desc: 'View pending farmer crops in your area & scan QR' },
    ],
    tips: [
      'You see farmer crop applications in your pincode',
      'Scan QR to start a transport job',
      'Fill transport details and generate next QR for lab',
    ],
  },
  lab: {
    greeting: 'Lab Dashboard',
    icon: '🔬',
    color: 'purple',
    links: [
      { to: '/lab', label: 'Lab Testing', icon: Microscope, desc: 'Scan transport QR and record quality tests' },
    ],
    tips: [
      'Scan the transport QR code',
      'Record moisture, purity, pesticide levels',
      'Issue quality certificate and generate lab QR',
    ],
  },
  manufacturer: {
    greeting: 'Manufacturer Dashboard',
    icon: '🏭',
    color: 'orange',
    links: [
      { to: '/manufacture', label: 'Manufacturing', icon: Factory, desc: 'Scan lab QR and record production details' },
    ],
    tips: [
      'Scan the lab-verified QR code',
      'Fill product and batch details',
      'Generate final consumer QR code',
    ],
  },
  government: {
    greeting: 'Government Dashboard',
    icon: '🏛️',
    color: 'blue',
    links: [
      { to: '/gov-map', label: 'India Supply Chain Map', icon: Map, desc: 'Live map with density of farmers, labs, etc.' },
      { to: '/gov-users', label: 'All Users', icon: Map, desc: 'Search and browse all registered users' },
    ],
    tips: [
      'View real-time stats across all roles',
      'See crop distribution by state and type',
      'Monitor quality assurance rates',
    ],
  },
};

export default function Dashboard({ user }) {
  if (!user) return null;
  const info = ROLE_INFO[user.role] || ROLE_INFO.farmer;

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="bg-gradient-to-r from-[#133215] to-[#1a5c1e] rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="text-5xl">{info.icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{info.greeting}</h1>
            <p className="text-gray-300 mt-1">Welcome back, <span className="text-[#92B775] font-semibold">{user.name}</span></p>
            <div className="flex gap-2 mt-2 flex-wrap">
              <Badge label={user.role.charAt(0).toUpperCase() + user.role.slice(1)} color="green" />
              {user.pincode && <Badge label={`Pincode: ${user.pincode}`} color="gray" />}
              {user.city && <Badge label={user.city} color="gray" />}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Links */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-700">Quick Actions</h2>
          {info.links.map(({ to, label, icon: Icon, desc }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-md border border-gray-100 hover:shadow-lg hover:border-[#92B775]/50 transition group"
            >
              <div className="w-12 h-12 bg-green-50 group-hover:bg-green-100 rounded-xl flex items-center justify-center transition">
                <Icon size={24} className="text-[#133215]" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-800">{label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
              </div>
              <span className="text-gray-300 group-hover:text-[#92B775] transition text-xl">→</span>
            </Link>
          ))}
        </div>

        {/* Profile + Tips */}
        <div className="space-y-4">
          <SectionCard title="Your Profile">
            <div className="space-y-3">
              {[
                ['Name', user.name],
                ['Phone', user.phoneNumber],
                ['Role', user.role],
                ['Region', user.region],
                ['Pincode', user.pincode],
                user.organizationName && ['Organization', user.organizationName],
              ].filter(Boolean).map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                  <span className="text-gray-500">{label}</span>
                  <span className="font-medium text-gray-800 capitalize">{value}</span>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="💡 How it works">
            <ul className="space-y-2">
              {info.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-600">
                  <span className="text-[#92B775] font-bold flex-shrink-0">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
