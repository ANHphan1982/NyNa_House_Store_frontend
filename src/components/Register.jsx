// src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { Mail, Phone, Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const handleLoginSuccess = context?.handleLoginSuccess;

  const [registerType, setRegisterType] = useState('email');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validateVietnamesePhone = (phone) => {
    const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
    return phoneRegex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate
    if (registerType === 'phone' && !validateVietnamesePhone(formData.phone)) {
      setError('Số điện thoại không hợp lệ!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu không khớp!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: registerType === 'email' ? formData.email : undefined,
          phone: registerType === 'phone' ? formData.phone : undefined,
          password: formData.password,
          registerType: registerType
        })
      });

      const data = await response.json();

      if (data.success) {
        // Lưu token và user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // 🔥 CẬP NHẬT STATE
        if (handleLoginSuccess) {
          handleLoginSuccess(data.user);
        }
        
        alert(`Đăng ký thành công! Xin chào ${data.user.name}`);
        navigate('/');
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Register error:', error);
      setError('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng ký tài khoản
          </h2>
          <p className="text-sm text-gray-600">
            Hoặc{' '}
            <Link to="/login" className="font-medium text-rose-600 hover:text-rose-500">
              đăng nhập nếu đã có tài khoản
            </Link>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Toggle */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setRegisterType('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all font-medium ${
              registerType === 'email'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <Mail size={18} />
            Email
          </button>
          <button
            type="button"
            onClick={() => setRegisterType('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all font-medium ${
              registerType === 'phone'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600'
            }`}
          >
            <Phone size={18} />
            Số điện thoại
          </button>
        </div>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="Nguyễn Văn A"
            />
          </div>

          {registerType === 'email' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="your@email.com"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setFormData({...formData, phone: value});
                }}
                maxLength="10"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="0912345678"
              />
              <p className="mt-1 text-xs text-gray-500">
                10 số, bắt đầu bằng 03, 05, 07, 08, 09
              </p>
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="••••••••"
              minLength="6"
            />
            <p className="mt-1 text-xs text-gray-500">Tối thiểu 6 ký tự</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="••••••••"
            />
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" required className="mt-1" />
            <span>
              Tôi đồng ý với{' '}
              <a href="#" className="text-rose-600 hover:text-rose-700">điều khoản dịch vụ</a>
              {' '}và{' '}
              <a href="#" className="text-rose-600 hover:text-rose-700">chính sách bảo mật</a>
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Đang đăng ký...
              </>
            ) : (
              'Đăng ký'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;