// frontend/src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { Shield, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import API_URL from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const handleLoginSuccess = context?.handleLoginSuccess;

  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 🔒 SANITIZE INPUT
  const sanitizeInput = (value) => {
    return value.trim().replace(/[<>]/g, '');
  };

  // 🔒 VALIDATE FORM
  const validateForm = () => {
    const identifier = sanitizeInput(formData.identifier);
    
    if (!identifier) {
      setError('Vui lòng nhập email hoặc số điện thoại');
      return false;
    }

    if (identifier.length < 3) {
      setError('Email hoặc số điện thoại quá ngắn');
      return false;
    }

    if (!formData.password) {
      setError('Vui lòng nhập mật khẩu');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    console.log('🔐 Login attempt');

    try {
      // 🔒 SANITIZE before sending
      const sanitizedData = {
        identifier: sanitizeInput(formData.identifier),
        password: formData.password
      };

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // 🔥 NEW: Include cookies
        body: JSON.stringify(sanitizedData)
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok && data.success) {
        // Ensure name field
        if (data.user && !data.user.name) {
          data.user.name = data.user.username || data.user.email?.split('@')[0] || 'User';
        }

        // 🔥 UPDATED: Store token (backward compatible with cookie)
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Login successful');
        console.log('🍪 Cookies:', document.cookie ? 'Set' : 'Not set');

        if (handleLoginSuccess) {
          handleLoginSuccess(data.user);
        }

        const userName = data.user?.name || data.user?.username || 'bạn';
        alert(`Đăng nhập thành công! Xin chào ${userName}`);
        navigate('/');
        
      } else {
        setError(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin.');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.');
      } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
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
    if (error) setError('');
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng nhập
          </h2>
          <p className="text-sm text-gray-600">
            Hoặc{' '}
            <Link to="/register" className="font-medium text-rose-600 hover:text-rose-500">
              đăng ký tài khoản mới
            </Link>
          </p>
        </div>

        {/* Admin Link */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                Bạn là quản trị viên?
              </span>
            </div>
            <Link
              to="/admin"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Đăng nhập Admin →
            </Link>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
            <div className="flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-red-800">Lỗi đăng nhập</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
              Email hoặc Số điện thoại
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              required
              autoComplete="username"
              value={formData.identifier}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              placeholder="0902145018 hoặc email@example.com"
              disabled={loading}
              maxLength={255}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={loading}
                maxLength={128}
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

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                disabled={loading}
              />
              <span className="ml-2 text-gray-700">Ghi nhớ đăng nhập</span>
            </label>
            
            {/* 🔥 FIXED: Link to forgot password page */}
            <Link 
              to="/forgot-password"
              className="text-rose-600 hover:text-rose-700 font-medium transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Đang đăng nhập...
              </>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">Debug Info:</p>
            <p className="text-gray-600">API URL: {API_URL}</p>
            <p className="text-gray-600">Mode: {import.meta.env.MODE}</p>
            <p className="text-gray-600">Cookies: {document.cookie ? 'Enabled' : 'None'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;