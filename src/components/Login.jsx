// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('🔐 Login attempt:', formData.identifier);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      console.log('📥 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (data.success) {
        // Lưu vào localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Saved to localStorage');
        console.log('👤 User:', data.user);
        
        // 🔥 CẬP NHẬT STATE - Đây là bước QUAN TRỌNG!
        if (handleLoginSuccess) {
          console.log('🎯 Calling handleLoginSuccess...');
          handleLoginSuccess(data.user);
        } else {
          console.warn('⚠️ handleLoginSuccess not found in context!');
        }

        // Hiển thị thông báo
        alert(`Đăng nhập thành công! Xin chào ${data.user.name}`);
        
        // Navigate về home
        navigate('/');
        
      } else {
        setError(data.message || 'Đăng nhập thất bại');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError('Lỗi kết nối đến server. Vui lòng kiểm tra backend đang chạy!');
    } finally {
      setLoading(false);
    }
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
              className="text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Đăng nhập Admin →
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-red-800">Lỗi</p>
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
              type="text"
              required
              value={formData.identifier}
              onChange={(e) => setFormData({...formData, identifier: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="0902145018 hoặc email@example.com"
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-gray-300 text-rose-600" />
              <span className="ml-2">Ghi nhớ</span>
            </label>
            <a href="#" className="text-rose-600 hover:text-rose-700">
              Quên mật khẩu?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
      </div>
    </div>
  );
};

export default Login;