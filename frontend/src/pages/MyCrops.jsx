import React, { useEffect, useState } from 'react';
import { herbAPI } from '../utils/api';
import { PageLoader, Alert, SectionCard, Badge, ChainStatus, QRDisplay } from '../components/UI';
import { Package } from 'lucide-react';

const STATUS_COLOR = {
  registered: 'yellow',
  transport_assigned: 'blue',
  lab_verified: 'purple',
  manufactured: 'orange',
  dispatched: 'green',
};

export default function MyCrops({ user }) {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQR, setSelectedQR] = useState(null);

  useEffect(() => {
    herbAPI.getMy()
      .then(d => setCrops(d.herbs))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Package size={20} className="text-[#133215]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#133215]">My Crops</h1>
          <p className="text-sm text-gray-500">{crops.length} batch{crops.length !== 1 ? 'es' : ''} registered</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {crops.length === 0 ? (
        <SectionCard>
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🌱</div>
            <h3 className="text-lg font-semibold text-gray-600">No crops yet</h3>
            <p className="text-gray-400 mt-2">Upload your first crop to get started</p>
          </div>
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {crops.map(crop => (
            <div key={crop._id} className="bg-white rounded-xl shadow-md border border-gray-100 p-5 hover:shadow-lg transition">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#133215]">{crop.herbName}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {new Date(crop.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {crop.city && ` • ${crop.city}`}
                    {crop.state && `, ${crop.state}`}
                  </p>
                </div>
                <Badge label={crop.status.replace(/_/g, ' ')} color={STATUS_COLOR[crop.status] || 'gray'} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Quantity</p>
                  <p className="font-bold text-gray-800 mt-0.5">{crop.quantity} kg</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Pincode</p>
                  <p className="font-bold text-gray-800 mt-0.5">{crop.pincode || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">State</p>
                  <p className="font-bold text-gray-800 mt-0.5 truncate">{crop.state || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-gray-400 text-xs">Harvest Date</p>
                  <p className="font-bold text-gray-800 mt-0.5">{new Date(crop.date).toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <ChainStatus status={crop.status} />

              {crop.qrImage && (
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                  <img
                    src={crop.qrImage}
                    alt="QR"
                    className="w-14 h-14 rounded-lg border border-gray-200 cursor-pointer hover:scale-110 transition"
                    onClick={() => setSelectedQR(crop)}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-700">QR Code Available</p>
                    <button
                      onClick={() => setSelectedQR(crop)}
                      className="text-xs text-blue-600 hover:underline mt-0.5"
                    >
                      Click to enlarge & share →
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* QR Modal */}
      {selectedQR && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedQR(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#133215]">{selectedQR.herbName} — QR Code</h3>
              <button onClick={() => setSelectedQR(null)} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">×</button>
            </div>
            <QRDisplay qrImage={selectedQR.qrImage} qrPayload={selectedQR.qrPayload} title="Scan to track this batch" />
            <div className="mt-4 text-center">
              <a
                href={selectedQR.qrImage}
                download={`qr-${selectedQR.herbName}-${selectedQR._id}.png`}
                className="text-sm text-[#133215] font-semibold hover:underline"
              >
                ⬇ Download QR Image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
