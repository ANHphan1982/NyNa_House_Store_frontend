// frontend/src/utils/api.js
const getApiUrl = () => {
  // Priority 1: Environment variable từ Vercel
  if (import.meta.env.VITE_API_URL) {
    console.log('📡 Using API from env:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Priority 2: Production backend
  if (import.meta.env.PROD) {
    console.log('📡 Using production backend');
    return 'https://nyna-house-store-backend-3.onrender.com';
  }
  
  // Priority 3: Local development
  console.log('📡 Using local backend');
  return 'http://localhost:5000';
};

export const API_URL = getApiUrl();

console.log('🔧 API Configuration:', {
  mode: import.meta.env.MODE,
  apiUrl: API_URL
});

export default API_URL;