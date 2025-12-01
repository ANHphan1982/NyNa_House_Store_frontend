// frontend/src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { AlertCircle, Loader2, Eye, EyeOff, CheckCircle, Mail, Phone } from 'lucide-react';
import API_URL from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const handleLoginSuccess = context?.handleLoginSuccess;

  // 🔥 THÊM registerType để chọn phone hoặc email
  const [registerType, setRegisterType] = useState('phone'); // 'phone' or 'email'
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validatePhone = (phone) => {
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    return phoneRegex.test(phone);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Vui lòng nhập họ tên');
      return false;
    }

    if (formData.name.trim().length < 2) {
      setError('Họ tên phải có ít nhất 2 ký tự');
      return false;
    }

    // 🔥 VALIDATE theo registerType
    if (registerType === 'phone') {
      if (!formData.phone) {
        setError('Vui lòng nhập số điện thoại');
        return false;
      }
      if (!validatePhone(formData.phone)) {
        setError('Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng (VD: 0901234567)');
        return false;
      }
    } else {
      if (!formData.email) {
        setError('Vui lòng nhập email');
        return false;
      }
      if (!validateEmail(formData.email)) {
        setError('Email không hợp lệ. Vui lòng nhập đúng định dạng (VD: email@example.com)');
        return false;
      }
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
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
    console.log('🔐 Register attempt:', registerType === 'phone' ? formData.phone : formData.email);

    try {
      // 🔥 GỬI DATA THEO registerType
      const requestData = {
        name: formData.name,
        password: formData.password
      };

      if (registerType === 'phone') {
        requestData.phone = formData.phone;
      } else {
        requestData.email = formData.email;
      }

      console.log('📤 Sending data:', requestData);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await response.json();
      console.log('📦 Response:', data);

      if (response.ok && data.success) {
        // 🔥 ENSURE name field exists
        if (data.user && !data.user.name) {
          data.user.name = data.user.username || formData.name || data.user.email?.split('@')[0] || 'User';
        }

        // Lưu vào localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Registration successful');
        
        // Cập nhật state
        if (handleLoginSuccess) {
          handleLoginSuccess(data.user);
        }

        // 🔥 SAFE ACCESS với fallback
        const userName = data.user?.name || formData.name || 'bạn';
        alert(`Đăng ký thành công! Xin chào ${userName}`);
        navigate('/');
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('❌ Register error:', error);
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) {
      setError('');
    }
  };

  // 🔥 RESET FIELDS khi đổi registerType
  const handleRegisterTypeChange = (type) => {
    setRegisterType(type);
    setFormData({
      ...formData,
      phone: '',
      email: ''
    });
    setError('');
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: '', color: '', width: '0%' };
    
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength: 'Yếu', color: 'bg-red-500', width: '33%' };
    if (strength <= 3) return { strength: 'Trung bình', color: 'bg-yellow-500', width: '66%' };
    return { strength: 'Mạnh', color: 'bg-green-500', width: '100%' };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Đăng ký tài khoản
          </h2>
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link to="/login" className="font-medium text-rose-600 hover:text-rose-500">
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        {/* 🔥 TOGGLE REGISTER TYPE */}
        <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
          <button
            type="button"
            onClick={() => handleRegisterTypeChange('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-medium transition-all ${
              registerType === 'phone'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Phone size={18} />
            Số điện thoại
          </button>
          <button
            type="button"
            onClick={() => handleRegisterTypeChange('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-medium transition-all ${
              registerType === 'email'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail size={18} />
            Email
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
            <div className="flex gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <div>
                <p className="text-sm font-medium text-red-800">Lỗi đăng ký</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              placeholder="Nguyễn Văn A"
              disabled={loading}
            />
          </div>

          {/* 🔥 CONDITIONAL FIELD - PHONE HOẶC EMAIL */}
          {registerType === 'phone' ? (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="0901234567"
                disabled={loading}
              />
              {formData.phone && !validatePhone(formData.phone) && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  Số điện thoại không hợp lệ
                </p>
              )}
            </div>
          ) : (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="email@example.com"
                disabled={loading}
              />
              {formData.email && !validateEmail(formData.email) && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  Email không hợp lệ
                </p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu *
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
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
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-600">Độ mạnh mật khẩu:</span>
                  <span className={`text-xs font-medium ${
                    passwordStrength.strength === 'Mạnh' ? 'text-green-600' :
                    passwordStrength.strength === 'Trung bình' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {passwordStrength.strength}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: passwordStrength.width }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Xác nhận mật khẩu *
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                Mật khẩu không khớp
              </p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="mt-1 text-xs text-green-600 flex items-center gap-1">
                <CheckCircle size={14} />
                Mật khẩu khớp
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium"
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

        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">Debug Info:</p>
            <p className="text-gray-600">API URL: {API_URL}</p>
            <p className="text-gray-600">Register Type: {registerType}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;