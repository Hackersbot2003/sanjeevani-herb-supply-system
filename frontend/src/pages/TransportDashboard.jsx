import React, { useEffect, useState, useCallback } from 'react';
import { herbAPI, transportAPI } from '../utils/api';
import { generateTransportQR } from '../utils/qr';
import { extractIdFromUrl } from '../utils/qr';
import {
  PageLoader, Alert, SectionCard, Badge, QRDisplay,
  QRScanner, FormInput, PrimaryBtn, Spinner, StatCard
} from '../components/UI';
import { Truck, QrCode, Package, CheckCircle } from 'lucide-react';

export default function TransportDashboard({ user }) {
  const [pendingCrops, setPendingCrops] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loadingArea, setLoadingArea] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  // Scan + form state
  const [showScanner, setShowScanner] = useState(false);
  const [scannedHerb, setScannedHerb] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [qrResult, setQrResult] = useState(null);
  const [form, setForm] = useState({
    driverName: '', vehicleNumber: '', transportQuantity: '',
    transportCity: '', transportPincode: '',
  });

  const loadAreaCrops = useCallback(() => {
    setLoadingArea(true);
    herbAPI.getByArea()
      .then(d => setPendingCrops(d.herbs || []))
      .catch(e => setError(e.message))
      .finally(() => setLoadingArea(false));
  }, []);

  const loadMyJobs = useCallback(() => {
    setLoadingJobs(true);
    transportAPI.getMy()
      .then(d => setMyJobs(d.transports || []))
      .catch(e => setError(e.message))
      .finally(() => setLoadingJobs(false));
  }, []);

  useEffect(() => {
    loadAreaCrops();
    loadMyJobs();
  }, []);

  const handleScan = async (url) => {
    setShowScanner(false);
    setError('');
    try {
      const herbId = extractIdFromUrl(url);
      const data = await herbAPI.getById(herbId);
      setScannedHerb(data.herb);
      setForm(p => ({
        ...p,
        driverName: user.name,
        transportCity: user.city || '',
        transportPincode: user.pincode || '',
        transportQuantity: String(data.herb.quantity),
      }));
    } catch (err) {
      setError('Could not read crop from QR: ' + err.message);
    }
  };

  const handlePickFromList = (crop) => {
    setScannedHerb(crop);
    setForm(p => ({
      ...p,
      driverName: user.name,
      transportCity: user.city || '',
      transportPincode: user.pincode || '',
      transportQuantity: String(crop.quantity),
    }));
    setActiveTab('pending');
  };

  const set = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.driverName || !form.vehicleNumber || !form.transportQuantity) {
      return setError('Driver name, vehicle number and quantity are required');
    }
    if (Number(form.transportQuantity) > scannedHerb.quantity) {
      return setError(`Cannot exceed crop quantity of ${scannedHerb.quantity} kg`);
    }
    setFormLoading(true);
    setError('');
    try {
      const { transport } = await transportAPI.create({
        herbId: scannedHerb._id,
        ...form,
        transportQuantity: Number(form.transportQuantity),
      });

      // Generate transport QR for lab to scan
      const { qrPayload, qrImage } = await generateTransportQR(transport._id);
      await transportAPI.updateQR(transport._id, { qrPayload, qrImage });

      setQrResult({ qrPayload, qrImage, transport });
      setScannedHerb(null);
      setForm({ driverName: '', vehicleNumber: '', transportQuantity: '', transportCity: '', transportPincode: '' });
      loadAreaCrops();
      loadMyJobs();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Truck size={20} className="text-blue-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#133215]">Transport Dashboard</h1>
          <p className="text-sm text-gray-500">Pincode: {user.pincode} — {user.city}</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard title="Pending in Area" value={pendingCrops.length} icon={<Package size={22} />} color="orange" />
        <StatCard title="My Completed Jobs" value={myJobs.length} icon={<CheckCircle size={22} />} color="green" />
        <div className="col-span-2 sm:col-span-1 bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center justify-center">
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-3 px-6 py-3 bg-[#133215] text-white font-bold rounded-xl hover:bg-[#1a431d] transition"
          >
            <QrCode size={20} /> Scan Farmer QR
          </button>
        </div>
      </div>

      {/* QR Scanner modal */}
      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}

      {/* Transport form after scan */}
      {scannedHerb && !qrResult && (
        <SectionCard title="🚚 Fill Transport Details">
          <div className="mb-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Crop Loaded:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-gray-500">Herb:</span> <strong>{scannedHerb.herbName}</strong></div>
              <div><span className="text-gray-500">Qty:</span> <strong>{scannedHerb.quantity} kg</strong></div>
              <div><span className="text-gray-500">Farmer:</span> <strong>{scannedHerb.farmerName}</strong></div>
              <div><span className="text-gray-500">Location:</span> <strong>{scannedHerb.city}, {scannedHerb.state}</strong></div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Driver Name" name="driverName" value={form.driverName} onChange={set} required />
              <FormInput label="Vehicle Number" name="vehicleNumber" value={form.vehicleNumber} onChange={set} placeholder="MH-04-AB-1234" required />
              <FormInput label="Transport Quantity (kg)" name="transportQuantity" type="number" value={form.transportQuantity} onChange={set} required />
              <FormInput label="Destination City" name="transportCity" value={form.transportCity} onChange={set} placeholder="Delivery city" />
              <FormInput label="Destination Pincode" name="transportPincode" value={form.transportPincode} onChange={set} placeholder="Delivery pincode" />
            </div>
            <div className="flex gap-3">
              <PrimaryBtn type="submit" disabled={formLoading}>
                {formLoading && <Spinner size="sm" />}
                {formLoading ? 'Submitting...' : '✅ Confirm & Generate Lab QR'}
              </PrimaryBtn>
              <button type="button" onClick={() => setScannedHerb(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* QR result */}
      {qrResult && (
        <SectionCard>
          <QRDisplay
            qrImage={qrResult.qrImage}
            qrPayload={qrResult.qrPayload}
            title="Transport Complete! This QR is for the Lab to scan"
          />
          <div className="text-center mt-4">
            <button onClick={() => setQrResult(null)} className="text-sm text-gray-500 hover:text-gray-700">
              Done — view more crops
            </button>
          </div>
        </SectionCard>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['pending', 'myjobs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 transition -mb-px ${
              activeTab === tab ? 'border-[#133215] text-[#133215]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'pending' ? `Pending in Your Area (${pendingCrops.length})` : `My Jobs (${myJobs.length})`}
          </button>
        ))}
      </div>

      {activeTab === 'pending' && (
        loadingArea ? <PageLoader /> : pendingCrops.length === 0 ? (
          <SectionCard>
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">📭</div>
              <p>No pending crops in your area (pincode: {user.pincode})</p>
            </div>
          </SectionCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingCrops.map(crop => (
              <div key={crop._id} className="bg-white rounded-xl shadow-md border border-gray-100 p-5 flex flex-wrap gap-4 items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-bold text-lg text-[#133215]">{crop.herbName}</h3>
                    <Badge label={`${crop.quantity} kg`} color="green" />
                  </div>
                  <p className="text-sm text-gray-600">
                    👤 <strong>{crop.farmerName}</strong> — {crop.city}, {crop.state}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Registered: {new Date(crop.createdAt).toLocaleDateString('en-IN')} • Pincode: {crop.pincode}
                  </p>
                </div>
                <button
                  onClick={() => handlePickFromList(crop)}
                  className="px-4 py-2 bg-[#133215] text-white text-sm font-semibold rounded-lg hover:bg-[#1a431d] transition flex items-center gap-2"
                >
                  <Truck size={15} /> Pick Up
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === 'myjobs' && (
        loadingJobs ? <PageLoader /> : myJobs.length === 0 ? (
          <SectionCard>
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">🚛</div>
              <p>No transport jobs completed yet</p>
            </div>
          </SectionCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myJobs.map(job => (
              <div key={job._id} className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-[#133215]">{job.herbName}</h3>
                    <p className="text-sm text-gray-500">
                      {job.transportQuantity} kg • {job.driverName} • {job.vehicleNumber}
                    </p>
                  </div>
                  <Badge label="Transported" color="blue" />
                </div>
                {job.qrImage && (
                  <div className="flex items-center gap-3">
                    <img src={job.qrImage} alt="QR" className="w-12 h-12 rounded border border-gray-200" />
                    <p className="text-xs text-gray-400">Lab QR generated</p>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">{new Date(job.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
