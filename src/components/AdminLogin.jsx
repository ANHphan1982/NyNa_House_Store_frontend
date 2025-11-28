// frontend/src/components/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import API_URL from '../utils/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('🔐 Admin login attempt...');
      console.log('🌐 API URL:', API_URL);

      const response = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng nhập thất bại');
      }

      const data = await response.json();
      console.log('✅ Login response:', data);

      if (data.success) {
        // Save to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Admin logged in:', data.user);
        
        alert(`Đăng nhập admin thành công! Xin chào ${data.user.name}`);
        navigate('/dashboard');
      } else {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('❌ Admin login error:', error);
      
      if (error.message.includes('fetch')) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối.');
      } else {
        setError(error.message || 'Lỗi kết nối đến server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (error) {
      setError('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-md w-full mx-4">
        {/* Back to User Login */}
        <Link 
          to="/login"
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Quay lại đăng nhập thường</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-4 rounded-2xl shadow-lg">
                <Shield className="text-white" size={40} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Portal
            </h2>
            <p className="text-sm text-gray-600">
              Đăng nhập với quyền quản trị viên
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                Email hoặc Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                value={formData.identifier}
                onChange={handleChange}
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-4 py-3 pr-12 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-colors"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                'Đăng nhập Admin'
              )}
            </button>
          </form>

          {/* Test Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs font-semibold text-blue-900 mb-2">🔑 Thông tin đăng nhập test:</p>
            <div className="space-y-1">
              <p className="text-xs text-blue-800">
                Email: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">admin@example.com</code>
              </p>
              <p className="text-xs text-blue-800">
                Password: <code className="bg-blue-100 px-2 py-0.5 rounded font-mono">admin123</code>
              </p>
            </div>
          </div>

          {/* Debug Info - Development only */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
              <p className="font-semibold text-gray-700 mb-1">Debug Info:</p>
              <p className="text-gray-600">API URL: {API_URL}</p>
              <p className="text-gray-600">Mode: {import.meta.env.MODE}</p>
            </div>
          )}
        </div>

        {/* Link to Home */}
        <div className="text-center mt-6">
          <Link 
            to="/"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;