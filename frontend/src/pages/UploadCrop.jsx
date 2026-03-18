import React, { useState, useEffect, useCallback } from 'react';
import { herbAPI } from '../utils/api';
import { generateHerbQR } from '../utils/qr';
import { fetchLocation } from '../utils/location';
import { FormInput, Alert, Spinner, QRDisplay, SectionCard, PrimaryBtn } from '../components/UI';
import { MapPin, Leaf } from 'lucide-react';

export default function UploadCrop({ user }) {
  const [form, setForm] = useState({
    herbName: '', quantity: '', date: new Date().toISOString().split('T')[0],
    city: '', address: '', state: '', pincode: '',
  });
  const [coords, setCoords] = useState({ lat: '', long: '' });
  const [locLoading, setLocLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrData, setQrData] = useState(null);

  const set = (e) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError('');
  };

  const getLocation = useCallback(async () => {
    setLocLoading(true);
    setError('');
    try {
      const loc = await fetchLocation();
      setCoords({ lat: loc.lat, long: loc.long });
      setForm(p => ({
        ...p,
        city: loc.city || p.city,
        address: loc.address || p.address,
        state: loc.state || p.state,
        pincode: loc.pincode || p.pincode,
      }));
    } catch (err) {
      setError('Could not get location: ' + err.message + '. Please fill manually.');
    } finally {
      setLocLoading(false);
    }
  }, []);

  useEffect(() => { getLocation(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.herbName || !form.quantity) return setError('Herb name and quantity are required');
    setLoading(true);
    setError('');
    setQrData(null);
    try {
      const payload = {
        ...form,
        quantity: Number(form.quantity),
        geoLocation: coords.lat ? { lat: coords.lat, long: coords.long } : undefined,
      };
      const { herb } = await herbAPI.create(payload);

      // Generate QR
      const { qrPayload, qrImage } = await generateHerbQR(herb._id);
      await herbAPI.updateQR(herb._id, { qrPayload, qrImage });

      setQrData({ qrPayload, qrImage, herbId: herb._id });
      setForm({ herbName: '', quantity: '', date: new Date().toISOString().split('T')[0], city: '', address: '', state: '', pincode: '' });
      setCoords({ lat: '', long: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
          <Leaf size={20} className="text-[#133215]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#133215]">Upload Crop / Herb</h1>
          <p className="text-sm text-gray-500">Register your batch — a QR code will be generated</p>
        </div>
      </div>

      {error && <Alert type="error" message={error} />}

      <SectionCard title="Crop Details">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput label="Herb / Crop Name" name="herbName" value={form.herbName} onChange={set} placeholder="e.g. Ashwagandha, Tulsi" required />
            <FormInput label="Quantity (kg)" name="quantity" type="number" value={form.quantity} onChange={set} placeholder="e.g. 100" required />
            <FormInput label="Harvest Date" name="date" type="date" value={form.date} onChange={set} required />
            <FormInput label="Farmer Name" name="farmerName" value={user.name} readOnly />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                <MapPin size={16} className="text-[#133215]" /> Location Details
              </h3>
              <button
                type="button"
                onClick={getLocation}
                disabled={locLoading}
                className="flex items-center gap-2 text-sm px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 disabled:opacity-50 transition"
              >
                {locLoading ? <Spinner size="sm" /> : <MapPin size={14} />}
                {locLoading ? 'Fetching...' : 'Auto-detect Location'}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput label="Latitude" name="lat" value={coords.lat} onChange={e => setCoords(p => ({...p, lat: e.target.value}))} placeholder="Auto-detected" />
              <FormInput label="Longitude" name="long" value={coords.long} onChange={e => setCoords(p => ({...p, long: e.target.value}))} placeholder="Auto-detected" />
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="address" value={form.address}
                  onChange={e => setForm(p => ({...p, address: e.target.value}))}
                  rows={2} placeholder="Full address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#92B775] resize-none"
                />
              </div>
              <FormInput label="City / Village" name="city" value={form.city} onChange={set} placeholder="City" />
              <FormInput label="State" name="state" value={form.state} onChange={set} placeholder="State" />
              <FormInput label="Pincode" name="pincode" value={form.pincode} onChange={set} placeholder="Pincode" />
            </div>
          </div>

          <PrimaryBtn type="submit" disabled={loading} className="w-full">
            {loading && <Spinner size="sm" />}
            {loading ? 'Uploading & Generating QR...' : '🌿 Upload Crop & Generate QR'}
          </PrimaryBtn>
        </form>
      </SectionCard>

      {qrData && (
        <SectionCard>
          <QRDisplay
            qrImage={qrData.qrImage}
            qrPayload={qrData.qrPayload}
            title="Crop Registered! Share this QR with transporter"
          />
          <p className="text-center text-sm text-gray-500 mt-3">
            Transporters in your area will see this crop and can pick it up by scanning this QR.
          </p>
        </SectionCard>
      )}
    </div>
  );
}
