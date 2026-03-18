import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

/* ── Spinner ── */
export const Spinner = ({ size = 'md' }) => {
  const s = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-12 h-12' : 'w-8 h-8';
  return (
    <div className={`${s} border-4 border-[#92B775] border-t-[#133215] rounded-full animate-spin`} />
  );
};

export const PageLoader = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <Spinner size="lg" />
  </div>
);

/* ── Alert ── */
export const Alert = ({ type = 'error', message }) => {
  if (!message) return null;
  const styles = {
    error: 'bg-red-50 border-red-400 text-red-800',
    success: 'bg-green-50 border-green-400 text-green-800',
    info: 'bg-blue-50 border-blue-400 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  };
  return (
    <div className={`border-l-4 p-4 rounded-r-lg ${styles[type]}`}>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

/* ── Form Input ── */
export const FormInput = ({ label, name, type = 'text', value, onChange, placeholder, required, readOnly, className = '' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} required={required} readOnly={readOnly}
      className={`w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#92B775] focus:border-transparent transition-all ${readOnly ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${className}`}
    />
  </div>
);

/* ── Form Select ── */
export const FormSelect = ({ label, name, value, onChange, options, required }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    <select
      name={name} value={value} onChange={onChange} required={required}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#92B775] bg-white"
    >
      <option value="">Select {label}</option>
      {options.map(o => (
        <option key={o.value || o} value={o.value || o}>{o.label || o}</option>
      ))}
    </select>
  </div>
);

/* ── Stat Card ── */
export const StatCard = ({ title, value, unit, icon, color = 'green' }) => {
  const colors = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
      <div className={`p-3 rounded-xl ${colors[color]}`}>{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value} <span className="text-base font-normal text-gray-500">{unit}</span></p>
      </div>
    </div>
  );
};

/* ── Badge ── */
export const Badge = ({ label, color = 'green' }) => {
  const c = {
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-700',
    orange: 'bg-orange-100 text-orange-800',
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${c[color]}`}>{label}</span>;
};

/* ── QR Code Display ── */
export const QRDisplay = ({ qrImage, qrPayload, title = 'QR Code Generated' }) => {
  if (!qrImage) return null;
  return (
    <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-xl flex flex-col items-center text-center">
      <h3 className="font-bold text-lg text-green-800 mb-3">✅ {title}</h3>
      <img src={qrImage} alt="QR Code" className="w-48 h-48 rounded-lg shadow-md mb-3 border-4 border-white" />
      <p className="text-xs text-gray-500 break-all max-w-xs">{qrPayload}</p>
      <a
        href={qrPayload} target="_blank" rel="noopener noreferrer"
        className="mt-2 text-blue-600 hover:underline text-sm"
      >Open Link ↗</a>
    </div>
  );
};

/* ── QR Scanner ── */
export const QRScanner = ({ onScan, onClose }) => {
  const scannerRef = useRef(null);
  const containerId = 'qr-scanner-container';

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(containerId, { fps: 10, qrbox: { width: 250, height: 250 } });
    scanner.render(
      (text) => { scanner.clear(); onScan(text); },
      () => {}
    );
    scannerRef.current = scanner;
    return () => { scanner.clear().catch(() => {}); };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-[#133215]">Scan QR Code</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <div id={containerId} />
        <p className="text-xs text-gray-400 text-center mt-3">Point camera at the QR code</p>
      </div>
    </div>
  );
};

/* ── Supply Chain Status Bar ── */
export const ChainStatus = ({ status }) => {
  const stages = [
    { key: 'registered', label: 'Farmer', icon: '🌿' },
    { key: 'transport_assigned', label: 'Transport', icon: '🚚' },
    { key: 'lab_verified', label: 'Lab', icon: '🔬' },
    { key: 'manufactured', label: 'Manufacture', icon: '🏭' },
    { key: 'dispatched', label: 'Dispatched', icon: '📦' },
  ];
  const order = stages.map(s => s.key);
  const currentIdx = order.indexOf(status);

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {stages.map((stage, i) => (
        <React.Fragment key={stage.key}>
          <div className={`flex flex-col items-center text-center ${i <= currentIdx ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${i <= currentIdx ? 'bg-green-100' : 'bg-gray-100'}`}>
              {stage.icon}
            </div>
            <span className="text-xs mt-1 text-gray-600 w-14">{stage.label}</span>
          </div>
          {i < stages.length - 1 && (
            <div className={`h-0.5 flex-1 min-w-[16px] ${i < currentIdx ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ── Section Card ── */
export const SectionCard = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 ${className}`}>
    {title && <h2 className="text-xl font-bold text-[#133215] mb-4">{title}</h2>}
    {children}
  </div>
);

/* ── Primary Button ── */
export const PrimaryBtn = ({ children, onClick, type = 'button', disabled, className = '' }) => (
  <button
    type={type} onClick={onClick} disabled={disabled}
    className={`px-6 py-2.5 bg-[#133215] text-white font-semibold rounded-lg hover:bg-[#1a431d] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 justify-center ${className}`}
  >
    {children}
  </button>
);

/* ── Info Row ── */
export const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{value || '—'}</span>
  </div>
);
