import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend, LineElement, PointElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { govAPI } from '../utils/api';
import { PageLoader, Alert, StatCard, SectionCard } from '../components/UI';
import { Users, Truck, Microscope, Factory, Leaf, BarChart3, ShieldCheck } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, LineElement, PointElement);

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function GovernmentDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    govAPI.stats()
      .then(d => setStats(d.stats))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;
  if (error) return <Alert type="error" message={error} />;
  if (!stats) return null;

  const { counts, farmersByState, cropsByType, cropsByState, monthlyHerbs, labQualityStats, avgRating, chainCompletionRate } = stats;

  // Charts data
  const stateChartData = {
    labels: (farmersByState || []).slice(0, 10).map(s => s._id || 'Unknown'),
    datasets: [{
      label: 'Farmers by State',
      data: (farmersByState || []).slice(0, 10).map(s => s.count),
      backgroundColor: 'rgba(19, 50, 21, 0.7)',
      borderColor: '#133215',
      borderWidth: 1,
      borderRadius: 6,
    }]
  };

  const cropTypeChartData = {
    labels: (cropsByType || []).slice(0, 8).map(c => c._id || 'Unknown'),
    datasets: [{
      label: 'Crop Count',
      data: (cropsByType || []).slice(0, 8).map(c => c.count),
      backgroundColor: [
        '#133215','#1a5c1e','#92B775','#6ea054','#4d7a3c',
        '#b8d4a0','#2e7d32','#388e3c'
      ],
    }]
  };

  const monthlyData = {
    labels: (monthlyHerbs || []).map(m => `${MONTHS[(m._id?.month || 1) - 1]} ${m._id?.year || ''}`),
    datasets: [{
      label: 'Crops Registered',
      data: (monthlyHerbs || []).map(m => m.count),
      borderColor: '#92B775',
      backgroundColor: 'rgba(146, 183, 117, 0.2)',
      tension: 0.4,
      fill: true,
      pointBackgroundColor: '#133215',
    }]
  };

  const qualityData = {
    labels: (labQualityStats || []).map(q => q._id || 'Unknown'),
    datasets: [{
      data: (labQualityStats || []).map(q => q.count),
      backgroundColor: ['#22c55e', '#ef4444', '#f59e0b'],
    }]
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
    scales: { y: { beginAtZero: true, grid: { color: '#f0f0f0' } }, x: { grid: { display: false } } }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <BarChart3 size={20} className="text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#133215]">Government Dashboard</h1>
          <p className="text-sm text-gray-500">Live supply chain analytics across India</p>
        </div>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Total Farmers" value={counts.farmers.toLocaleString()} icon={<Leaf size={22} />} color="green" />
        <StatCard title="Transporters" value={counts.transporters.toLocaleString()} icon={<Truck size={22} />} color="blue" />
        <StatCard title="Labs" value={counts.labs.toLocaleString()} icon={<Microscope size={22} />} color="purple" />
        <StatCard title="Manufacturers" value={counts.manufacturers.toLocaleString()} icon={<Factory size={22} />} color="orange" />
        <StatCard title="Total Crops" value={counts.crops.toLocaleString()} icon={<Leaf size={22} />} color="green" />
        <StatCard title="Transport Jobs" value={counts.transports.toLocaleString()} icon={<Truck size={22} />} color="blue" />
        <StatCard title="Lab Tests" value={counts.labTests.toLocaleString()} icon={<ShieldCheck size={22} />} color="purple" />
        <StatCard title="Chain Completion" value={`${chainCompletionRate}%`} icon={<BarChart3 size={22} />} color="orange" />
      </div>

      {/* Quality summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <p className="text-4xl font-extrabold text-green-700">{avgRating}</p>
          <p className="text-sm text-green-600 mt-1 font-medium">Average Lab Quality Rating / 10</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
          <p className="text-4xl font-extrabold text-blue-700">{counts.manufactures.toLocaleString()}</p>
          <p className="text-sm text-blue-600 mt-1 font-medium">Products Manufactured</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 text-center">
          <p className="text-4xl font-extrabold text-orange-700">{chainCompletionRate}%</p>
          <p className="text-sm text-orange-600 mt-1 font-medium">Farm-to-Factory Completion Rate</p>
        </div>
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Farmers by State (Top 10)">
          {farmersByState?.length > 0 ? (
            <Bar data={stateChartData} options={chartOptions} />
          ) : (
            <p className="text-center text-gray-400 py-8">No data yet</p>
          )}
        </SectionCard>

        <SectionCard title="Crop Types Distribution">
          {cropsByType?.length > 0 ? (
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Pie data={cropTypeChartData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No data yet</p>
          )}
        </SectionCard>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard title="Monthly Crop Registrations (Last 6 Months)">
          {monthlyHerbs?.length > 0 ? (
            <Line data={monthlyData} options={{ ...chartOptions, scales: { y: { beginAtZero: true }, x: { grid: { display: false } } } }} />
          ) : (
            <p className="text-center text-gray-400 py-8">No data yet</p>
          )}
        </SectionCard>

        <SectionCard title="Lab Quality Results">
          {labQualityStats?.length > 0 ? (
            <div className="flex justify-center">
              <div className="w-56 h-56">
                <Pie data={qualityData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No data yet</p>
          )}
        </SectionCard>
      </div>

      {/* Crop by state table */}
      {cropsByState?.length > 0 && (
        <SectionCard title="Crops by State">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
                  <th className="px-4 py-3 text-left">State</th>
                  <th className="px-4 py-3 text-right">Crop Batches</th>
                  <th className="px-4 py-3 text-right">Total Qty (kg)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {cropsByState.slice(0, 15).map(row => (
                  <tr key={row._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-800">{row._id || 'Unknown'}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{row.count}</td>
                    <td className="px-4 py-3 text-right text-gray-600">{(row.totalQty || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
