// frontend/src/components/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link, useOutletContext } from 'react-router-dom';
import { AlertCircle, Loader2, Eye, EyeOff, CheckCircle, XCircle, Phone, Mail } from 'lucide-react';
import API_URL from '../utils/api';

const Register = () => {
  const navigate = useNavigate();
  const context = useOutletContext();
  const handleLoginSuccess = context?.handleLoginSuccess;

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
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: []
  });

  // 🔒 VALIDATE NAME
  const validateName = (name) => {
    if (!name || name.trim().length < 2) {
      return 'Họ tên phải có ít nhất 2 ký tự';
    }
    if (name.trim().length > 100) {
      return 'Họ tên quá dài (tối đa 100 ký tự)';
    }
    return null;
  };

  // 🔒 VALIDATE EMAIL
  const validateEmail = (email) => {
    if (!email || !email.trim()) {
      return 'Email là bắt buộc';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Email không hợp lệ';
    }
    return null;
  };

  // 🔒 VALIDATE PHONE
  const validatePhone = (phone) => {
    if (!phone || !phone.trim()) {
      return 'Số điện thoại là bắt buộc';
    }
    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!phoneRegex.test(phone.trim())) {
      return 'Số điện thoại không hợp lệ (VD: 0901234567)';
    }
    return null;
  };

  // 🔒 VALIDATE PASSWORD STRENGTH
  const validatePasswordStrength = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const feedback = [];
    let score = 0;

    if (checks.length) score++;
    else feedback.push('Ít nhất 8 ký tự');

    if (checks.uppercase) score++;
    else feedback.push('Ít nhất 1 chữ hoa');

    if (checks.lowercase) score++;
    else feedback.push('Ít nhất 1 chữ thường');

    if (checks.number) score++;
    else feedback.push('Ít nhất 1 số');

    if (checks.special) score++;
    else feedback.push('Ít nhất 1 ký tự đặc biệt (!@#$...)');

    return { score, feedback, checks };
  };

  // 🔒 VALIDATE FORM
  const validateForm = () => {
    // Name
    const nameError = validateName(formData.name);
    if (nameError) {
      setError(nameError);
      return false;
    }

    // Phone or Email
    if (registerType === 'phone') {
      const phoneError = validatePhone(formData.phone);
      if (phoneError) {
        setError(phoneError);
        return false;
      }
    } else {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        setError(emailError);
        return false;
      }
    }

    // Password
    const strength = validatePasswordStrength(formData.password);
    if (strength.score < 5) {
      setError('Mật khẩu chưa đủ mạnh: ' + strength.feedback.join(', '));
      return false;
    }

    // Confirm Password
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
    console.log('📝 Register attempt:', registerType === 'phone' ? formData.phone : formData.email);

    try {
      const requestData = {
        name: formData.name.trim(),
        password: formData.password
      };

      if (registerType === 'phone') {
        requestData.phone = formData.phone.trim();
      } else {
        requestData.email = formData.email.trim();
      }

      console.log('📤 Sending registration data:', { ...requestData, password: '[HIDDEN]' });

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (response.ok && data.success) {
        // Ensure name field
        if (data.user && !data.user.name) {
          data.user.name = data.user.username || formData.name;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('✅ Registration successful');

        if (handleLoginSuccess) {
          handleLoginSuccess(data.user);
        }

        const userName = data.user?.name || data.user?.username || 'bạn';
        alert(`Đăng ký thành công! Xin chào ${userName}`);
        navigate('/');
      } else {
        setError(data.message || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time password strength check
    if (name === 'password') {
      const strength = validatePasswordStrength(value);
      setPasswordStrength(strength);
    }

    if (error) setError('');
  };

  const handleRegisterTypeChange = (type) => {
    setRegisterType(type);
    setError('');
    // Clear the opposite field
    if (type === 'phone') {
      setFormData(prev => ({ ...prev, email: '' }));
    } else {
      setFormData(prev => ({ ...prev, phone: '' }));
    }
  };

  // Password strength color
  const getStrengthColor = (score) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score) => {
    if (score <= 1) return 'Rất yếu';
    if (score <= 2) return 'Yếu';
    if (score <= 3) return 'Trung bình';
    if (score <= 4) return 'Mạnh';
    return 'Rất mạnh';
  };

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
              Đăng nhập
            </Link>
          </p>
        </div>
        
        {/* Error Message */}
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
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Họ và tên *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              placeholder="Nguyễn Văn A"
              disabled={loading}
            />
          </div>

          {/* Register Type Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đăng ký bằng *
            </label>
            <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
              <button
                type="button"
                onClick={() => handleRegisterTypeChange('phone')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                  registerType === 'phone'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                disabled={loading}
              >
                <Phone size={18} />
                <span>Số điện thoại</span>
              </button>
              <button
                type="button"
                onClick={() => handleRegisterTypeChange('email')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-all ${
                  registerType === 'email'
                    ? 'bg-white shadow-sm text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                disabled={loading}
              >
                <Mail size={18} />
                <span>Email</span>
              </button>
            </div>
          </div>

          {/* Phone or Email */}
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
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="0901234567"
                disabled={loading}
              />
              {formData.phone && !validatePhone(formData.phone) && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <XCircle size={14} />
                  Số điện thoại không hợp lệ
                </p>
              )}
              {formData.phone && validatePhone(formData.phone) === null && (
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle size={14} />
                  Số điện thoại hợp lệ
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
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="email@example.com"
                disabled={loading}
              />
              {formData.email && !validateEmail(formData.email) && (
                <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                  <XCircle size={14} />
                  Email không hợp lệ
                </p>
              )}
              {formData.email && validateEmail(formData.email) === null && (
                <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                  <CheckCircle size={14} />
                  Email hợp lệ
                </p>
              )}
            </div>
          )}
          
          {/* Password */}
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
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
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

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${getStrengthColor(passwordStrength.score)}`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-gray-600">
                    {getStrengthText(passwordStrength.score)}
                  </span>
                </div>
                
                {passwordStrength.feedback.length > 0 && (
                  <div className="space-y-1">
                    {passwordStrength.feedback.map((item, index) => (
                      <p key={index} className="text-xs text-gray-600 flex items-center gap-1">
                        <XCircle size={12} className="text-red-500" />
                        {item}
                      </p>
                    ))}
                  </div>
                )}

                {passwordStrength.score === 5 && (
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <CheckCircle size={12} />
                    Mật khẩu rất mạnh!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Confirm Password */}
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
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
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
              <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
                <XCircle size={14} />
                Mật khẩu không khớp
              </p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                <CheckCircle size={14} />
                Mật khẩu khớp
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || passwordStrength.score < 5}
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

        {/* Password Requirements */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">📋 Yêu cầu mật khẩu:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li className="flex items-center gap-2">
              {passwordStrength.checks?.length ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} />}
              Ít nhất 8 ký tự
            </li>
            <li className="flex items-center gap-2">
              {passwordStrength.checks?.uppercase ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} />}
              Ít nhất 1 chữ hoa (A-Z)
            </li>
            <li className="flex items-center gap-2">
              {passwordStrength.checks?.lowercase ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} />}
              Ít nhất 1 chữ thường (a-z)
            </li>
            <li className="flex items-center gap-2">
              {passwordStrength.checks?.number ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} />}
              Ít nhất 1 số (0-9)
            </li>
            <li className="flex items-center gap-2">
              {passwordStrength.checks?.special ? <CheckCircle size={14} className="text-green-600" /> : <XCircle size={14} />}
              Ít nhất 1 ký tự đặc biệt (!@#$%^&*)
            </li>
          </ul>
        </div>

        {import.meta.env.DEV && (
          <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
            <p className="font-semibold text-gray-700 mb-1">Debug Info:</p>
            <p className="text-gray-600">API URL: {API_URL}</p>
            <p className="text-gray-600">Register Type: {registerType}</p>
            <p className="text-gray-600">Password Strength: {passwordStrength.score}/5</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;