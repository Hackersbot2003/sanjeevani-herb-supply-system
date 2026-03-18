import QRCode from 'qrcode';

const FRONTEND = import.meta.env.VITE_FRONTEND_URL || window.location.origin;

export const generateQR = async (payload) => {
  const qrImage = await QRCode.toDataURL(payload, {
    width: 300,
    margin: 2,
    color: { dark: '#133215', light: '#ffffff' },
  });
  return { qrPayload: payload, qrImage };
};

export const generateHerbQR = async (herbId) => {
  const payload = `${FRONTEND}/consumer/herb/${herbId}`;
  return generateQR(payload);
};

export const generateTransportQR = async (transportId) => {
  const payload = `${FRONTEND}/consumer/transport/${transportId}`;
  return generateQR(payload);
};

export const generateLabQR = async (labId) => {
  const payload = `${FRONTEND}/consumer/lab/${labId}`;
  return generateQR(payload);
};

export const generateManufactureQR = async (manufactureId) => {
  const payload = `${FRONTEND}/consumer/${manufactureId}`;
  return generateQR(payload);
};

export const extractIdFromUrl = (url) => {
  try {
    return new URL(url).pathname.split('/').filter(Boolean).pop();
  } catch {
    return url.split('/').filter(Boolean).pop();
  }
};
