import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement,
} from "chart.js";

// Chart.js Registration
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// --- Environment Variables ---
const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// --- Helper Components & Icons (No changes) ---
const UserIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LocationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657l-4.243 4.243a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const CheckBadgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>;
const CalendarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
const LeafIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;
const TruckIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>;
const FactoryIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m3-4h1m-1 4h1m-1-4h1"></path></svg>;

const StatCard = ({ title, value, icon, valueColor = 'text-gray-900' }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between">
        <div className="flex justify-between items-center">
            <span className="text-gray-500 font-medium">{title}</span>
            {icon}
        </div>
        <p className={`text-2xl font-bold mt-2 ${valueColor}`}>{value || 'N/A'}</p>
    </div>
);

const InfoCard = ({ title, icon, children }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-[#133215]">{icon}</div>
      <h3 className="text-xl font-bold text-gray-800">{title}</h3>
    </div>
    <div className="space-y-2 text-gray-600">{children}</div>
  </div>
);

const Tag = ({ children }) => <span className="inline-block bg-green-100 text-green-800 text-xs font-semibold mr-2 px-2.5 py-1 rounded-full">{children}</span>;


// --- Main Consumer Page Component ---
const ConsumerPage = () => {
  const { id } = useParams();
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("No product ID provided.");
      setLoading(false);
      return;
    };
    const fetchProductData = async () => {
      try {
        const res = await fetch(`${API}/manufacture/consumer/${id}`); 
        if (!res.ok) throw new Error("Product data not found.");
        const data = await res.json();
        if (!data.success) throw new Error(data.message || "Could not retrieve product information.");
        // Map new API response format to match original UI fields
        const m = data.product?.manufacture;
        const h = data.product?.herb;
        const fc = data.product?.fullChain;
        // Flatten all fields for original UI compatibility
        const flat = {
          ...m,
          // from herb
          herbName: h?.herbName || m?.herbName,
          date: h?.date || m?.manufactureDate,
          quantity: h?.quantity || m?.quantity,
          geoLocation: h?.geoLocation,
          city: h?.city,
          address: h?.address,
          pincode: h?.pincode,
          farmerName: fc?.farmerStage?.farmerName || m?.farmerName,
          // from transport
          driverName: fc?.transportStage?.driverName,
          vehicleNumber: fc?.transportStage?.vehicleNumber,
          // from lab
          labName: fc?.labStage?.labName,
          qualityAssurance: fc?.labStage?.qualityAssurance,
          moistureContent: fc?.labStage?.moistureContent,
          purityLevel: fc?.labStage?.purityLevel,
          pesticideLevel: fc?.labStage?.pesticideLevel,
          activeCompoundLevel: fc?.labStage?.activeCompoundLevel,
          certificates: fc?.labStage?.certificates || [],
          // from manufacture
          processingUnitName: m?.companyName,
          processes: m?.processes || [],
        };
        setProductData(flat);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
  }, [id]);

  if (loading) return <p className="text-center p-10 font-semibold">⏳ Loading Product History...</p>;
  if (error) return <p className="text-center p-10 text-red-600 font-bold">❌ {error}</p>;
  if (!productData) return <p className="text-center p-10 font-semibold">No product data available.</p>;

  // --- Chart Configurations ---
  const chartLabels = ["Moisture (%)", "Purity (%)", "Pesticide (%)", "Active Comp. (%)"];
  const chartValues = [
    productData.moistureContent || 0,
    productData.purityLevel || 0,
    productData.pesticideLevel || 0,
    productData.activeCompoundLevel || 0,
  ];
  const chartColors = [
    'rgba(167, 209, 167, 0.7)', // Green
    'rgba(159, 197, 232, 0.7)', // Blue
    'rgba(255, 229, 180, 0.7)', // Yellow
    'rgba(199, 186, 221, 0.7)', // Purple
  ];
  const chartBorderColors = [
    'rgba(167, 209, 167, 1)',
    'rgba(159, 197, 232, 1)',
    'rgba(255, 229, 180, 1)',
    'rgba(199, 186, 221, 1)',
  ];

  const pieChartData = {
    labels: chartLabels,
    datasets: [{
      data: chartValues,
      backgroundColor: chartColors,
      borderColor: '#ffffff',
      borderWidth: 2,
    }],
  };
  const pieChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } };

  const barChartData = {
    labels: chartLabels,
    datasets: [{
      label: 'Quality Metrics',
      data: chartValues,
      backgroundColor: chartColors,
      borderColor: chartBorderColors,
      borderWidth: 1,
      borderRadius: 5,
    }],
  };
  const barChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } };
  
  const fullAddress = `${productData.address}, ${productData.city}, ${productData.pincode}`;

  return (
    <div className="bg-gray-100 min-h-screen font-sans">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#133215]">{productData.herbName}</h1>
            <p className="text-gray-500 mt-1">Traceability & Quality Report</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Farmer" value={productData.farmerName} icon={<UserIcon />} />
            <StatCard title="Origin" value={`${productData.city}, ${productData.pincode}`} icon={<LocationIcon />} />
            <StatCard title="Quality Status" value={productData.qualityAssurance} icon={<CheckBadgeIcon />} valueColor="text-green-600" />
            <StatCard title="Harvest Date" value={new Date(productData.date).toLocaleDateString()} icon={<CalendarIcon />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Product Composition</h2>
                <div className="h-72"><Pie data={pieChartData} options={pieChartOptions} /></div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Lab Analysis Metrics</h2>
                <div className="h-72"><Bar options={barChartOptions} data={barChartData} /></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <h3 className="text-xl font-bold text-gray-800 mb-4 pl-4">Product Journey</h3>
                <ol className="relative border-l border-gray-200">
                    <li className="mb-10 ml-4"><div className="absolute w-3 h-3 bg-green-500 rounded-full mt-1.5 -left-1.5 border border-white"></div><h3 className="text-lg font-semibold text-gray-900">Collected</h3><p className="text-sm text-gray-500">From {productData.farmerName}'s farm</p></li>
                    <li className="mb-10 ml-4"><div className="absolute w-3 h-3 bg-green-500 rounded-full mt-1.5 -left-1.5 border border-white"></div><h3 className="text-lg font-semibold text-gray-900">Processed</h3><p className="text-sm text-gray-500">At {productData.processingUnitName}</p></li>
                    <li className="mb-10 ml-4"><div className="absolute w-3 h-3 bg-green-500 rounded-full mt-1.5 -left-1.5 border border-white"></div><h3 className="text-lg font-semibold text-gray-900">Lab Verified</h3><p className="text-sm text-gray-500">By {productData.labName}</p></li>
                    <li className="ml-4"><div className="absolute w-3 h-3 bg-green-500 rounded-full mt-1.5 -left-1.5 border border-white"></div><h3 className="text-lg font-semibold text-gray-900">Dispatched</h3><p className="text-sm text-gray-500">Ready for market</p></li>
                </ol>
            </div>
            <div className="lg:col-span-2 space-y-8">
                <InfoCard title="Origin & Farming Details" icon={<LeafIcon />}>
                    <p><strong>Farmer:</strong> {productData.farmerName}</p>
                    <p><strong>Address:</strong> {fullAddress}</p>
                    {/* MODIFIED: Replaced Google Maps with OpenStreetMap iframe */}
                    <div className="mt-2 h-48 bg-gray-200 rounded-md overflow-hidden">
                        {productData.geoLocation?.lat && productData.geoLocation?.long ? (
                            <iframe
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                loading="lazy"
                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${productData.geoLocation.long - 0.01},${productData.geoLocation.lat - 0.01},${productData.geoLocation.long + 0.01},${productData.geoLocation.lat + 0.01}&layer=mapnik&marker=${productData.geoLocation.lat},${productData.geoLocation.long}`}
                                title="Origin Map"
                            ></iframe>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                Location data not available.
                            </div>
                        )}
                    </div>
                </InfoCard>

                <InfoCard title="Logistics" icon={<TruckIcon />}>
                    <p><strong>Driver:</strong> {productData.driverName}</p>
                    <p><strong>Vehicle Number:</strong> {productData.vehicleNumber}</p>
                </InfoCard>

                <InfoCard title="Processing" icon={<FactoryIcon />}>
                    <p><strong>Unit Name:</strong> {productData.processingUnitName}</p>
                    {productData.processes?.length > 0 && (
                        <div><strong>Processes:</strong> {productData.processes.map(p => <Tag key={p}>{p}</Tag>)}</div>
                    )}
                    {productData.certificates?.length > 0 && (
                        <div className="mt-2"><strong>Certificates:</strong> {productData.certificates.map(c => <Tag key={c}>{c}</Tag>)}</div>
                    )}
                </InfoCard>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConsumerPage;