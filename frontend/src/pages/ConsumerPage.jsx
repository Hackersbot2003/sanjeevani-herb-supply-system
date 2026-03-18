import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { manufactureAPI } from '../utils/api';
import { PageLoader, Alert, Badge, ChainStatus } from '../components/UI';

const Stage = ({ emoji, title, color, children, date }) => (
  <div className={`border-l-4 ${color} pl-5 py-4 relative`}>
    <div className="absolute -left-4 w-7 h-7 rounded-full bg-white border-2 border-current flex items-center justify-center text-sm" style={{ borderColor: color.replace('border-', '') }}>
      {emoji}
    </div>
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 ml-2">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg text-gray-800">{emoji} {title}</h3>
        {date && <span className="text-xs text-gray-400">{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between text-sm border-b border-gray-50 pb-1.5 last:border-0">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 text-right max-w-[60%]">{value || '—'}</span>
  </div>
);

export default function ConsumerPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    manufactureAPI.getConsumer(id)
      .then(d => setData(d.product))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <PageLoader />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <Alert type="error" message={`Product not found: ${error}`} />
        <p className="text-center text-sm text-gray-400 mt-4">The QR code may be invalid or the product hasn't completed the supply chain yet.</p>
      </div>
    </div>
  );

  const { manufacture, herb, fullChain: fc } = data;

  const qualityColor = manufacture?.lab?.qualityAssurance === 'Passed' ? 'text-green-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#133215] to-[#1a5c1e] text-white px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-[#92B775] text-sm font-semibold mb-1">🌿 Sanjeevani — Product Transparency</p>
          <h1 className="text-3xl font-extrabold">{manufacture?.productName}</h1>
          <p className="text-gray-300 mt-2">{manufacture?.companyName} • Batch: {manufacture?.batchNumber || '—'}</p>
          <div className="flex gap-2 mt-3 flex-wrap">
            <Badge label={`🌿 ${manufacture?.herbName}`} color="green" />
            {manufacture?.lab?.qualityAssurance && (
              <Badge
                label={`Lab: ${manufacture.lab.qualityAssurance}`}
                color={manufacture.lab.qualityAssurance === 'Passed' ? 'green' : 'red'}
              />
            )}
            {manufacture?.lab?.rating && <Badge label={`Rating: ${manufacture.lab.rating}/10`} color="green" />}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Supply chain status */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <h2 className="font-bold text-gray-700 mb-4">Supply Chain Journey</h2>
          <ChainStatus status="manufactured" />
        </div>

        {/* Quick product summary */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
          <h2 className="font-bold text-gray-700 mb-4">Product Details</h2>
          <div className="space-y-2">
            <Row label="Product Name" value={manufacture?.productName} />
            <Row label="Company" value={manufacture?.companyName} />
            <Row label="Batch Number" value={manufacture?.batchNumber} />
            <Row label="Manufacture Date" value={manufacture?.manufactureDate ? new Date(manufacture.manufactureDate).toLocaleDateString('en-IN') : '—'} />
            <Row label="Expiry Date" value={manufacture?.expiryDate ? new Date(manufacture.expiryDate).toLocaleDateString('en-IN') : '—'} />
            <Row label="Raw Material" value={`${manufacture?.herbName} (${manufacture?.quantity} kg)`} />
            {manufacture?.processes?.length > 0 && (
              <Row label="Processes" value={manufacture.processes.join(', ')} />
            )}
          </div>
        </div>

        {/* Full chain timeline */}
        <div>
          <h2 className="font-bold text-xl text-gray-800 mb-6">Complete Journey</h2>
          <div className="space-y-6">
            {/* Stage 1 - Farmer */}
            <Stage emoji="🌿" title="Farmer" color="border-green-500" date={herb?.createdAt}>
              <Row label="Farmer" value={fc?.farmerStage?.farmerName} />
              <Row label="Location" value={`${fc?.farmerStage?.location || '—'}`} />
              <Row label="Crop" value={fc?.farmerStage?.cropName} />
              <Row label="Quantity" value={`${fc?.farmerStage?.quantity} kg`} />
              <Row label="Harvest Date" value={fc?.farmerStage?.harvestDate ? new Date(fc.farmerStage.harvestDate).toLocaleDateString('en-IN') : '—'} />
              {fc?.farmerStage?.coordinates?.lat && (
                <Row label="GPS" value={`${fc.farmerStage.coordinates.lat.toFixed(4)}, ${fc.farmerStage.coordinates.long.toFixed(4)}`} />
              )}
            </Stage>

            {/* Stage 2 - Transport */}
            <Stage emoji="🚚" title="Transport" color="border-blue-500" date={fc?.transportStage?.date}>
              <Row label="Driver" value={fc?.transportStage?.driverName} />
              <Row label="Vehicle" value={fc?.transportStage?.vehicleNumber} />
              <Row label="Destination" value={fc?.transportStage?.transportCity} />
            </Stage>

            {/* Stage 3 - Lab */}
            <Stage emoji="🔬" title="Lab Testing" color="border-purple-500" date={fc?.labStage?.date}>
              <Row label="Lab" value={fc?.labStage?.labName} />
              <Row label="Quality Result" value={<span className={qualityColor}>{fc?.labStage?.qualityAssurance}</span>} />
              <Row label="Rating" value={`${fc?.labStage?.rating}/10`} />
              <Row label="Moisture Content" value={`${fc?.labStage?.moistureContent}%`} />
              <Row label="Purity Level" value={`${fc?.labStage?.purityLevel}%`} />
              <Row label="Pesticide Level" value={`${fc?.labStage?.pesticideLevel} ppm`} />
              <Row label="Active Compound" value={`${fc?.labStage?.activeCompoundLevel} mg/g`} />
              {fc?.labStage?.certificates?.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-1.5">Certificates:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {fc.labStage.certificates.map(c => (
                      <span key={c} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </Stage>

            {/* Stage 4 - Manufacture */}
            <Stage emoji="🏭" title="Manufacturing" color="border-orange-500" date={manufacture?.createdAt}>
              <Row label="Company" value={fc?.manufactureStage?.companyName} />
              <Row label="Product" value={fc?.manufactureStage?.productName} />
              <Row label="Batch" value={fc?.manufactureStage?.batchNumber} />
              {fc?.manufactureStage?.processes?.length > 0 && (
                <Row label="Processes" value={fc.manufactureStage.processes.join(' → ')} />
              )}
            </Stage>
          </div>
        </div>

        {/* Trust badge */}
        <div className="bg-[#133215] text-white rounded-xl p-5 text-center">
          <div className="text-4xl mb-2">✅</div>
          <h3 className="font-bold text-lg">Verified by Sanjeevani</h3>
          <p className="text-gray-300 text-sm mt-1">
            This product's complete supply chain is recorded and tamper-proof.
          </p>
          <p className="text-gray-400 text-xs mt-3">ID: {id}</p>
        </div>
      </div>
    </div>
  );
}
