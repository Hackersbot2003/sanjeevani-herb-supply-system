export const fetchLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          const addr = data.address || {};
          resolve({
            lat: latitude,
            long: longitude,
            city: addr.city || addr.town || addr.village || addr.state_district || '',
            state: addr.state || '',
            pincode: addr.postcode || '',
            address: data.display_name || '',
            country: addr.country || '',
          });
        } catch {
          resolve({ lat: latitude, long: longitude, city: '', state: '', pincode: '', address: '', country: '' });
        }
      },
      (err) => reject(new Error(err.message)),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};
