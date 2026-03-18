import React, { useEffect, useState } from 'react';
import { govAPI } from '../utils/api';
import { Alert, SectionCard, Badge, Spinner } from '../components/UI';
import { Search, Users } from 'lucide-react';

const ROLE_EMOJI = { farmer: '🌿', transporter: '🚚', lab: '🔬', manufacturer: '🏭', government: '🏛️' };
const ROLE_COLOR = { farmer: 'green', transporter: 'blue', lab: 'purple', manufacturer: 'orange', government: 'gray' };

export default function GovernmentUsers() {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = (p = 1, role = roleFilter) => {
    setLoading(true);
    govAPI.users({ role, page: p, limit: 50 })
      .then(d => {
        setUsers(d.users);
        setTotal(d.total);
        setPages(d.pages);
        setPage(p);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, []);

  const handleRoleChange = (r) => {
    setRoleFilter(r);
    load(1, r);
  };

  const filtered = search
    ? users.filter(u =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.phoneNumber?.includes(search) ||
        u.state?.toLowerCase().includes(search.toLowerCase()) ||
        u.city?.toLowerCase().includes(search.toLowerCase()) ||
        u.pincode?.includes(search)
      )
    : users;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Users size={20} className="text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#133215]">All Registered Users</h1>
          <p className="text-sm text-gray-500">{total.toLocaleString()} total users</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone, state, city, pincode..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#92B775] focus:outline-none"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['', 'farmer', 'transporter', 'lab', 'manufacturer'].map(r => (
            <button
              key={r}
              onClick={() => handleRoleChange(r)}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                roleFilter === r ? 'bg-[#133215] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-[#133215]'
              }`}
            >
              {r ? `${ROLE_EMOJI[r]} ${r}` : '🗂 All'}
            </button>
          ))}
        </div>
      </div>

      <SectionCard>
        {loading ? (
          <div className="flex justify-center py-10"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <div className="text-4xl mb-2">🔍</div>
            <p>No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Organization</th>
                    <th className="px-4 py-3 text-left">State</th>
                    <th className="px-4 py-3 text-left">City</th>
                    <th className="px-4 py-3 text-left">Pincode</th>
                    <th className="px-4 py-3 text-left">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((u, i) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-gray-400">{(page - 1) * 50 + i + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">{u.name}</td>
                      <td className="px-4 py-3">
                        <Badge label={`${ROLE_EMOJI[u.role] || ''} ${u.role}`} color={ROLE_COLOR[u.role] || 'gray'} />
                      </td>
                      <td className="px-4 py-3 text-gray-600">{u.phoneNumber}</td>
                      <td className="px-4 py-3 text-gray-600">{u.organizationName || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{u.state || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{u.city || '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{u.pincode || '—'}</td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pages > 1 && !search && (
              <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => load(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  ← Prev
                </button>
                <span className="px-4 py-2 text-sm text-gray-600">Page {page} of {pages}</span>
                <button
                  onClick={() => load(page + 1)}
                  disabled={page >= pages}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
}
