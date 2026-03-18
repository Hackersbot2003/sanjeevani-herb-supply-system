import React, { useEffect, useState, useCallback } from 'react';
import { labAPI, transportAPI } from '../utils/api';
import { generateLabQR } from '../utils/qr';
import { extractIdFromUrl } from '../utils/qr';
import {
  PageLoader, Alert, SectionCard, Badge, QRDisplay,
  QRScanner, FormInput, FormSelect, PrimaryBtn, Spinner, StatCard, InfoRow
} from '../components/UI';
import { Microscope, QrCode, CheckCircle } from 'lucide-react';

const CERT_OPTIONS = ['ISO 9001', 'GMP Certified', 'Organic Certified', 'WHO-GMP', 'FSSAI Certified'];

export default function LabDashboard({ user }) {
  const [myRecords, setMyRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('scan');

  const [showScanner, setShowScanner] = useState(false);
  const [scannedTransport, setScannedTransport] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [qrResult, setQrResult] = useState(null);
  const [selectedCerts, setSelectedCerts] = useState([]);
  const [form, setForm] = useState({
    labName: '', qualityAssurance: '', rating: '',
    moistureContent: '', purityLevel: '',
    pesticideLevel: '', activeCompoundLevel: '',
  });

  const loadRecords = useCallback(() => {
    setLoadingRecords(true);
    labAPI.getMy()
      .then(d => setMyRecords(d.records || []))
      .catch(e => setError(e.message))
      .finally(() => setLoadingRecords(false));
  }, []);

  useEffect(() => {
    setForm(p => ({ ...p, labName: user.organizationName || user.name || '' }));
    loadRecords();
  }, []);

  const handleScan = async (url) => {
    setShowScanner(false);
    setError('');
    try {
      const transportId = extractIdFromUrl(url);
      const data = await transportAPI.getById(transportId);
      setScannedTransport(data.transport);
    } catch (err) {
      setError('Could not read transport record from QR: ' + err.message);
    }
  };

  const set = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const toggleCert = (cert) => {
    setSelectedCerts(p => p.includes(cert) ? p.filter(c => c !== cert) : [...p, cert]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.qualityAssurance || !form.rating) return setError('Quality assurance and rating are required');
    setFormLoading(true);
    setError('');
    try {
      const { lab } = await labAPI.create({
        transportId: scannedTransport._id,
        ...form,
        rating: Number(form.rating),
        moistureContent: Number(form.moistureContent),
        purityLevel: Number(form.purityLevel),
        pesticideLevel: Number(form.pesticideLevel),
        activeCompoundLevel: Number(form.activeCompoundLevel),
        certificates: selectedCerts,
      });

      const { qrPayload, qrImage } = await generateLabQR(lab._id);
      await labAPI.updateQR(lab._id, { qrPayload, qrImage });

      setQrResult({ qrPayload, qrImage, lab });
      setScannedTransport(null);
      setForm({ labName: user.organizationName || '', qualityAssurance: '', rating: '', moistureContent: '', purityLevel: '', pesticideLevel: '', activeCompoundLevel: '' });
      setSelectedCerts([]);
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
        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <Microscope size={20} className="text-purple-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#133215]">Lab Dashboard</h1>
          <p className="text-sm text-gray-500">{user.organizationName || user.name} — {user.city}</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard title="Tests Completed" value={myRecords.length} icon={<CheckCircle size={22} />} color="purple" />
        <StatCard title="Passed" value={myRecords.filter(r => r.qualityAssurance === 'Passed').length} icon={<CheckCircle size={22} />} color="green" />
        <div className="col-span-2 sm:col-span-1 bg-white rounded-xl shadow-md border border-gray-100 p-4 flex items-center justify-center">
          <button
            onClick={() => setShowScanner(true)}
            className="flex items-center gap-3 px-6 py-3 bg-[#133215] text-white font-bold rounded-xl hover:bg-[#1a431d] transition"
          >
            <QrCode size={20} /> Scan Transport QR
          </button>
        </div>
      </div>

      {showScanner && <QRScanner onScan={handleScan} onClose={() => setShowScanner(false)} />}

      {scannedTransport && !qrResult && (
        <SectionCard title="🔬 Lab Test Form">
          <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <h4 className="font-semibold text-blue-800 mb-2">Batch Info:</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <InfoRow label="Herb" value={scannedTransport.herbName} />
              <InfoRow label="Quantity" value={`${scannedTransport.transportQuantity} kg`} />
              <InfoRow label="Farmer" value={scannedTransport.farmerName} />
              <InfoRow label="Driver" value={scannedTransport.driverName} />
              <InfoRow label="Vehicle" value={scannedTransport.vehicleNumber} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Lab Name" name="labName" value={form.labName} onChange={set} required />
              <FormSelect
                label="Quality Assurance Result"
                name="qualityAssurance"
                value={form.qualityAssurance}
                onChange={set}
                options={['Passed', 'Failed', 'Pending']}
                required
              />
              <FormSelect
                label="Rating (1-10)"
                name="rating"
                value={form.rating}
                onChange={set}
                options={[1,2,3,4,5,6,7,8,9,10].map(n => ({ value: n, label: n }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Certificates Issued</label>
              <div className="flex flex-wrap gap-2">
                {CERT_OPTIONS.map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => toggleCert(c)}
                    className={`px-3 py-1.5 text-sm rounded-lg border transition ${
                      selectedCerts.includes(c)
                        ? 'bg-[#133215] text-white border-[#133215]'
                        : 'border-gray-300 text-gray-600 hover:border-[#133215]'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Test Parameters (%)</h4>
              <div className="grid grid-cols-2 gap-4">
                <FormInput label="Moisture Content (%)" name="moistureContent" type="number" value={form.moistureContent} onChange={set} placeholder="e.g. 12" />
                <FormInput label="Purity Level (%)" name="purityLevel" type="number" value={form.purityLevel} onChange={set} placeholder="e.g. 95" />
                <FormInput label="Pesticide Level (ppm)" name="pesticideLevel" type="number" value={form.pesticideLevel} onChange={set} placeholder="e.g. 0.5" />
                <FormInput label="Active Compound (mg/g)" name="activeCompoundLevel" type="number" value={form.activeCompoundLevel} onChange={set} placeholder="e.g. 8.2" />
              </div>
            </div>

            <div className="flex gap-3">
              <PrimaryBtn type="submit" disabled={formLoading}>
                {formLoading && <Spinner size="sm" />}
                {formLoading ? 'Submitting...' : '✅ Submit Test & Generate Manufacturer QR'}
              </PrimaryBtn>
              <button type="button" onClick={() => setScannedTransport(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition">
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
            title="Lab Test Saved! This QR is for the Manufacturer to scan"
          />
          <div className="text-center mt-4">
            <button onClick={() => setQrResult(null)} className="text-sm text-gray-500 hover:text-gray-700">Done</button>
          </div>
        </SectionCard>
      )}

      {/* My Records tab */}
      <div>
        <h2 className="text-lg font-bold text-gray-700 mb-4">My Lab Records ({myRecords.length})</h2>
        {loadingRecords ? <PageLoader /> : myRecords.length === 0 ? (
          <SectionCard>
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-2">🔬</div>
              <p>No lab tests recorded yet. Scan a transport QR to begin.</p>
            </div>
          </SectionCard>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {myRecords.map(rec => (
              <div key={rec._id} className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                <div className="flex flex-wrap justify-between items-start gap-2 mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-[#133215]">{rec.herbName}</h3>
                    <p className="text-sm text-gray-500">{rec.quantity} kg • Farmer: {rec.farmerName}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      label={rec.qualityAssurance}
                      color={rec.qualityAssurance === 'Passed' ? 'green' : rec.qualityAssurance === 'Failed' ? 'red' : 'yellow'}
                    />
                    <Badge label={`Rating: ${rec.rating}/10`} color="purple" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-3">
                  <div>Moisture: <strong>{rec.moistureContent}%</strong></div>
                  <div>Purity: <strong>{rec.purityLevel}%</strong></div>
                  <div>Pesticide: <strong>{rec.pesticideLevel} ppm</strong></div>
                  <div>Active: <strong>{rec.activeCompoundLevel} mg/g</strong></div>
                </div>
                {rec.certificates?.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    {rec.certificates.map(c => <Badge key={c} label={c} color="blue" />)}
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
