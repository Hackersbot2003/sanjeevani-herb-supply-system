import React, { useEffect, useState, useCallback } from 'react';
import { manufactureAPI, labAPI } from '../utils/api';
import { generateManufactureQR } from '../utils/qr';
import { extractIdFromUrl } from '../utils/qr';
import {
  PageLoader, Alert, SectionCard, Badge, QRDisplay,
  QRScanner, FormInput, PrimaryBtn, Spinner, StatCard, InfoRow
} from '../components/UI';
import { Factory, QrCode, Package, CheckCircle } from 'lucide-react';

const PROCESS_OPTIONS = ['Cleaning', 'Drying', 'Grinding', 'Extraction', 'Distillation', 'Packaging', 'Quality Check'];

export default function ManufactureDashboard({ user }) {
  const [myRecords, setMyRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [error, setError] = useState('');

  const [showScanner, setShowScanner] = useState(false);
  const [scannedLab, setScannedLab] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [qrResult, setQrResult] = useState(null);
  const [selectedProcesses, setSelectedProcesses] = useState([]);
  const [form, setForm] = useState({
    companyName: '', productName: '', batchNumber: '',
    manufactureDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
  });

  const loadRecords = useCallback(() => {
    setLoadingRecords(true);
    manufactureAPI.getMy()
      .then(d => setMyRecords(d.records || []))
      .catch(e => setError(e.message))
      .finally(() => setLoadingRecords(false));
  }, []);

  useEffect(() => {
    setForm(p => ({ ...p, companyName: user.organizationName || user.name || '' }));
    loadRecords();
  }, []);

  const handleScan = async (url) => {
    setShowScanner(false);
    setError('');
    try {
      const labId = extractIdFromUrl(url);
      const data = await labAPI.getById(labId);
      setScannedLab(data.lab);
    } catch (err) {
      setError('Could not read lab record from QR: ' + err.message);
    }
  };

  const set = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const toggleProcess = (p) => {
    setSelectedProcesses(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.productName) return setError('Company name and product name are required');
    setFormLoading(true);
    setError('');
    try {
      const { manufacture } = await manufactureAPI.create({
        labId: scannedLab._id,
        ...form,
        processes: selectedProcesses,
      });

      const { qrPayload, qrImage } = await generateManufactureQR(manufacture._id);
      await manufactureAPI.updateQR(manufacture._id, { qrPayload, qrImage });

      setQrResult({ qrPayload, qrImage, manufacture });
      setScannedLab(null);
      setForm({ companyName: user.organizationName || '', productName: '', batchNumber: '', manufactureDate: new Date().toISOString().split('T')[0], expiryDate: '' });
      setSelectedProcesses([]);
      loadRecords();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <Factory size={20} className="text-orange-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#133215]">Manufacturer Dashboard</h1>
          <p className="text-sm text-gray-500">{user.organizationName || user.name} — {user.city}</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard title="Products Made" value={myRecords.length} icon={<Package size={22} />} color="orange" />
        <StatCard title="Dispatched" value={myRecords.filter(r => r.dispatched).length} icon={<CheckCircle size={22} />} color="green" />
        <div className="col-span-2 sm:col-span-1 bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center justify-center">
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-3 px-6 py-3 bg-[#133215] text-white font-bold rounded-xl hover:bg-[#1a431d] transition"
          >
            <QrCode size={20} /> Scan Lab QR
          </button>
        </div>
      </div>

      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}

      {scannedLab && !qrResult && (
        <SectionCard title="🏭 Manufacture Details">
          <div className="mb-5 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <h4 className="font-semibold text-purple-800 mb-3">Lab Verified Batch:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <InfoRow label="Herb" value={scannedLab.herbName} />
              <InfoRow label="Quantity" value={`${scannedLab.quantity} kg`} />
              <InfoRow label="Farmer" value={scannedLab.farmerName} />
              <InfoRow label="Lab" value={scannedLab.labName} />
              <InfoRow label="Quality" value={scannedLab.qualityAssurance} />
              <InfoRow label="Rating" value={`${scannedLab.rating}/10`} />
            </div>
            {scannedLab.certificates?.length > 0 && (
              <div className="flex gap-1.5 flex-wrap mt-2">
                {scannedLab.certificates.map(c => <Badge key={c} label={c} color="blue" />)}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Company Name" name="companyName" value={form.companyName} onChange={set} required />
              <FormInput label="Product Name" name="productName" value={form.productName} onChange={set} placeholder="e.g. Ashwagandha Extract 500mg" required />
              <FormInput label="Batch Number" name="batchNumber" value={form.batchNumber} onChange={set} placeholder="e.g. BATCH-2024-001" />
              <FormInput label="Manufacture Date" name="manufactureDate" type="date" value={form.manufactureDate} onChange={set} />
              <FormInput label="Expiry Date" name="expiryDate" type="date" value={form.expiryDate} onChange={set} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturing Processes</label>
              <div className="flex flex-wrap gap-2">
                {PROCESS_OPTIONS.map(p => (
                  <button
                    key={p} type="button"
                    onClick={() => toggleProcess(p)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                      selectedProcesses.includes(p)
                        ? 'bg-[#133215] text-white border-[#133215]'
                        : 'border-gray-300 text-gray-600 hover:border-[#133215]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <PrimaryBtn type="submit" disabled={formLoading}>
                {formLoading && <Spinner size="sm" />}
                {formLoading ? 'Processing...' : '✅ Complete & Generate Consumer QR'}
              </PrimaryBtn>
              <button type="button" onClick={() => setScannedLab(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
            </div>
          </form>
        </SectionCard>
      )}

      {qrResult && (
        <SectionCard>
          <QRDisplay
            qrImage={qrResult.qrImage}
            qrPayload={qrResult.qrPayload}
            title="🎉 Product Complete! Consumer QR Generated"
          />
          <p className="text-center text-sm text-gray-500 mt-3">
            Consumers can scan this QR to see the complete journey of this product — from farm to factory.
          </p>
          <div className="text-center mt-3">
            <a href={qrResult.qrImage} download="consumer-qr.png" className="text-sm text-[#133215] font-semibold hover:underline">
              ⬇ Download QR
            </a>
            <span className="mx-3 text-gray-300">|</span>
            <button onClick={() => setQrResult(null)} className="text-sm text-gray-500 hover:text-gray-700">Done</button>
          </div>
        </SectionCard>
      )}

      {/* My Records */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-4">My Products ({myRecords.length})</h2>
        {loadingRecords ? <PageLoader /> : myRecords.length === 0 ? (
          <SectionCard>
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">🏭</div>
              <p>No products manufactured yet. Scan a lab QR to begin.</p>
            </div>
          </SectionCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myRecords.map(rec => (
              <div key={rec._id} className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-[#133215]">{rec.productName}</h3>
                    <p className="text-sm text-gray-500">{rec.herbName} • {rec.quantity} kg • Batch: {rec.batchNumber || '—'}</p>
                  </div>
                  <Badge label={rec.dispatched ? 'Dispatched' : 'In Stock'} color={rec.dispatched ? 'green' : 'orange'} />
                </div>
                <div className="flex items-center gap-3">
                  {rec.lab?.qualityAssurance && (
                    <Badge label={`Lab: ${rec.lab.qualityAssurance}`} color={rec.lab.qualityAssurance === 'Passed' ? 'green' : 'red'} />
                  )}
                  {rec.lab?.rating && <Badge label={`Rating: ${rec.lab.rating}/10`} color="purple" />}
                </div>
                {rec.qrImage && (
                  <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                    <img src={rec.qrImage} alt="QR" className="w-12 h-12 rounded border border-gray-200" />
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Consumer QR Ready</p>
                      <a href={rec.qrImage} download={`product-qr-${rec._id}.png`} className="text-xs text-blue-600 hover:underline">Download</a>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400 mt-2">{new Date(rec.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
