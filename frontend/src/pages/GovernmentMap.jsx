import React, { useEffect, useState } from 'react';
import { govAPI } from '../utils/api';
import { PageLoader, Alert, SectionCard, Badge } from '../components/UI';
import { Map } from 'lucide-react';

const ROLE_COLOR = {
  farmer: '#22c55e',
  transporter: '#3b82f6',
  lab: '#a855f7',
  manufacturer: '#f97316',
};

const ROLE_EMOJI = { farmer: '🌿', transporter: '🚚', lab: '🔬', manufacturer: '🏭' };

// Simple India SVG map with state labels and clickable regions
// We overlay circles on a background map image for density
export default function GovernmentMap() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedState, setSelectedState] = useState(null);
  const [stateGroups, setStateGroups] = useState({});

  useEffect(() => {
    govAPI.stats()
      .then(d => {
        setStats(d.stats);
        setUsers(d.stats.allUsers || []);
        // Group users by state
        const groups = {};
        (d.stats.allUsers || []).forEach(u => {
          const state = u.state || u.region || 'Unknown';
          if (!groups[state]) groups[state] = [];
          groups[state].push(u);
        });
        setStateGroups(groups);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <Alert type="error" message={error} />;

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  // State density summary
  const stateSummary = Object.entries(stateGroups)
    .map(([state, us]) => ({
      state,
      farmers: us.filter(u => u.role === 'farmer').length,
      transporters: us.filter(u => u.role === 'transporter').length,
      labs: us.filter(u => u.role === 'lab').length,
      manufacturers: us.filter(u => u.role === 'manufacturer').length,
      total: us.length,
    }))
    .sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Map size={20} className="text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#133215]">India Supply Chain Map</h1>
          <p className="text-sm text-gray-500">Density of all registered users across India</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'farmer', 'transporter', 'lab', 'manufacturer'].map(r => (
          <button
            key={r}
            onClick={() => setFilter(r)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              filter === r ? 'bg-[#133215] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#133215]'
            }`}
          >
            {ROLE_EMOJI[r] || '🗺️'} {r.charAt(0).toUpperCase() + r.slice(1)}
            {' '}({r === 'all' ? users.length : users.filter(u => u.role === r).length})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map visual */}
        <div className="lg:col-span-2">
          <SectionCard title="Density Heatmap by State">
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-4 min-h-96 relative overflow-hidden">
              {/* India outline placeholder — in production use react-simple-maps */}
              <div className="text-center mb-4">
                <p className="text-xs text-gray-400">State-wise user density</p>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {stateSummary.slice(0, 20).map(({ state, farmers, transporters, labs, manufacturers, total }) => {
                  const maxSize = Math.max(...stateSummary.map(s => s.total));
                  const intensity = Math.round((total / maxSize) * 100);
                  const bgOpacity = Math.max(0.1, total / maxSize);
                  return (
                    <button
                      key={state}
                      onClick={() => setSelectedState(selectedState?.state === state ? null : { state, farmers, transporters, labs, manufacturers, total })}
                      className={`p-3 rounded-xl text-center transition hover:scale-105 border-2 ${
                        selectedState?.state === state ? 'border-[#133215]' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: `rgba(19, 50, 21, ${bgOpacity * 0.15})` }}
                    >
                      <div
                        className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: `rgba(19, 50, 21, ${bgOpacity})` }}
                      >
                        {total}
                      </div>
                      <p className="text-xs font-semibold text-gray-700 truncate">{state}</p>
                      <div className="flex justify-center gap-1 mt-1 flex-wrap">
                        {farmers > 0 && <span className="text-green-600 text-xs">🌿{farmers}</span>}
                        {transporters > 0 && <span className="text-blue-600 text-xs">🚚{transporters}</span>}
                        {labs > 0 && <span className="text-purple-600 text-xs">🔬{labs}</span>}
                        {manufacturers > 0 && <span className="text-orange-600 text-xs">🏭{manufacturers}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 flex-wrap justify-center text-xs text-gray-600">
                <span>🌿 Farmer</span>
                <span>🚚 Transporter</span>
                <span>🔬 Lab</span>
                <span>🏭 Manufacturer</span>
                <span className="text-gray-400">(darker = higher density)</span>
              </div>
            </div>

            {/* Selected state popup */}
            {selectedState && (
              <div className="mt-4 p-4 bg-[#133215] text-white rounded-xl">
                <h4 className="font-bold text-lg mb-3">{selectedState.state}</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white/10 rounded-lg p-2">
                    <p className="text-2xl font-bold text-green-300">{selectedState.farmers}</p>
                    <p className="text-xs text-gray-300">Farmers</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <p className="text-2xl font-bold text-blue-300">{selectedState.transporters}</p>
                    <p className="text-xs text-gray-300">Transporters</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <p className="text-2xl font-bold text-purple-300">{selectedState.labs}</p>
                    <p className="text-xs text-gray-300">Labs</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <p className="text-2xl font-bold text-orange-300">{selectedState.manufacturers}</p>
                    <p className="text-xs text-gray-300">Manufacturers</p>
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* Top states table */}
        <div>
          <SectionCard title="Top States by Users">
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {stateSummary.map(({ state, total, farmers, transporters, labs, manufacturers }, i) => (
                <div
                  key={state}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => setSelectedState({ state, farmers, transporters, labs, manufacturers, total })}
                >
                  <span className="w-6 text-center font-bold text-gray-400 text-sm">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{state}</p>
                    <p className="text-xs text-gray-400">
                      🌿{farmers} 🚚{transporters} 🔬{labs} 🏭{manufacturers}
                    </p>
                  </div>
                  <span className="font-bold text-[#133215] text-sm">{total}</span>
                </div>
              ))}
              {stateSummary.length === 0 && (
                <p className="text-center text-gray-400 py-8">No users registered yet</p>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* User list with filter */}
      <SectionCard title={`${filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Users (${filtered.length})`}>
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-8">No users found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">State</th>
                  <th className="px-4 py-3 text-left">City</th>
                  <th className="px-4 py-3 text-left">Pincode</th>
                  <th className="px-4 py-3 text-left">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.slice(0, 100).map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                    <td className="px-4 py-3">
                      <span className="capitalize">{ROLE_EMOJI[u.role]} {u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{u.state || u.region || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.city || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{u.pincode || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 100 && (
              <p className="text-center text-xs text-gray-400 pt-3">Showing first 100 of {filtered.length} users</p>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
