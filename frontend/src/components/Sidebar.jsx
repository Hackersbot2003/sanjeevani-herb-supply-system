import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Leaf, Package, Truck, FlaskConical,
  Microscope, Factory, Map, LogOut, X, Building2
} from 'lucide-react';

const LINKS = {
  farmer: [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/upload-crop', icon: Leaf, text: 'Upload Crop' },
    { to: '/my-crops', icon: Package, text: 'My Crops' },
  ],
  transporter: [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/transport', icon: Truck, text: 'Transport Jobs' },
  ],
  lab: [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/lab', icon: Microscope, text: 'Lab Testing' },
  ],
  manufacturer: [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/manufacture', icon: Factory, text: 'Manufacturing' },
  ],
  government: [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/gov-map', icon: Map, text: 'India Map' },
    { to: '/gov-users', icon: Building2, text: 'All Users' },
  ],
};

const ROLE_COLORS = {
  farmer: '🌿 Farmer',
  transporter: '🚚 Transporter',
  lab: '🔬 Lab',
  manufacturer: '🏭 Manufacturer',
  government: '🏛️ Government',
};

const Sidebar = ({ user, onSignOut, isOpen, onClose }) => {
  const links = LINKS[user?.role] || [];

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      isActive
        ? 'bg-[#92B775] text-white font-semibold shadow'
        : 'text-gray-300 hover:bg-white/10 hover:text-white'
    }`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        w-64 h-screen bg-[#133215] text-white flex flex-col fixed top-0 left-0 z-30 shadow-2xl
        transition-transform duration-300 ease-in-out
        md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h1 className="text-xl font-bold text-[#92B775]">Sanjeevani</h1>
            <p className="text-xs text-gray-400 mt-0.5">Supply Chain Tracker</p>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* User info */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#92B775]/30 flex items-center justify-center text-[#92B775] font-bold text-lg">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white text-sm truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">{ROLE_COLORS[user?.role]}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {links.map(({ to, icon: Icon, text }) => (
            <NavLink key={to} to={to} className={navClass} onClick={onClose}>
              <Icon size={18} />
              <span>{text}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
