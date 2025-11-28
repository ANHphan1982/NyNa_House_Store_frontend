// utils/baseURL.js

// Base URL cho API
const getBaseUrl = () => {
  return 'http://localhost:5000/api';
};

export default getBaseUrl;

// Export thêm API_BASE_URL string trực tiếp nếu cần
export const API_BASE_URL = 'http://localhost:5000/api';

// Helper function để gọi API với token
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  };

  // Thêm token nếu có
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API call failed');
  }

  return data;
};