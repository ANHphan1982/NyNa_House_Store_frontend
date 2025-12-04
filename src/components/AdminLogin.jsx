// frontend/src/components/AdminLogin.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Shield, Loader2 } from 'lucide-react';
import API_URL from '../utils/api';
import OTPInput from './OTPInput';

const AdminLogin = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });
  
  const [step, setStep] = useState('login'); // 'login' | 'otp'
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpExpiresIn, setOtpExpiresIn] = useState(300);
  
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 🔒 SANITIZE INPUT
  const sanitizeInput = (value) => {
    return value.trim().replace(/[<>]/g, '');
  };

  // 🔒 VALIDATE LOGIN FORM
  const validateLoginForm = () => {
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

  // Handle login (Step 1)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    if (!validateLoginForm()) {
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Admin login attempt...');

      // 🔒 SANITIZE before sending
      const sanitizedData = {
        identifier: sanitizeInput(formData.identifier),
        password: formData.password
      };

      const response = await fetch(`${API_URL}/api/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sanitizedData),
      });

      console.log('📡 Response status:', response.status);

      const data = await response.json();
      console.log('📦 Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }

      if (data.success && data.requireOTP === true) {
        console.log('✅ OTP required, moving to OTP step');
        
        setMaskedEmail(data.email || formData.identifier);
        setOtpExpiresIn(data.expiresIn || 300);
        setStep('otp');
        setSuccessMessage(data.message || 'Mã xác thực đã được gửi đến email của bạn!');
      } 
      else if (data.success && data.token) {
        console.log('✅ Direct login (no 2FA)');
        
        if (!data.user) {
          const minimalUser = {
            id: data.userId || 'admin',
            email: formData.identifier,
            role: 'admin'
          };
          localStorage.setItem('user', JSON.stringify(minimalUser));
        } else {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        localStorage.setItem('token', data.token);
        navigate('/dashboard');
      } 
      else {
        throw new Error('Phản hồi không hợp lệ từ server');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification (Step 2)
  const handleOTPComplete = async (otp) => {
    setLoading(true);
    setError('');

    // 🔒 VALIDATE OTP
    if (!otp || otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Mã OTP không hợp lệ');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 Verifying OTP...');

      const response = await fetch(`${API_URL}/api/auth/admin/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizeInput(formData.identifier),
          otp: otp.trim(),
        }),
      });

      console.log('📡 OTP Response status:', response.status);

      const data = await response.json();
      console.log('📦 OTP Response data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Xác thực thất bại');
      }

      if (data.success && data.token) {
        console.log('✅ OTP verified successfully');
        
        if (!data.user) {
          throw new Error('Dữ liệu người dùng không hợp lệ');
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        navigate('/dashboard');
      } else {
        throw new Error('Token không hợp lệ');
      }
    } catch (error) {
      console.error('❌ OTP verification error:', error);
      setError(error.message || 'Xác thực thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('🔄 Resending OTP...');

      const response = await fetch(`${API_URL}/api/auth/admin/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: sanitizeInput(formData.identifier),
        }),
      });

      const data = await response.json();
      console.log('📦 Resend response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Không thể gửi lại mã');
      }

      if (data.success) {
        setSuccessMessage(data.message || 'Mã xác thực mới đã được gửi!');
      }
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      setError(error.message || 'Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="bg-blue-600 p-3 rounded-full">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            {step === 'login' ? 'Đăng Nhập Admin' : 'Xác Thực 2 Lớp'}
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {step === 'login' 
              ? 'Hệ thống quản trị NyNA House Store' 
              : 'Nhập mã xác thực đã được gửi đến email'}
          </p>
        </div>

        {/* Error & Success Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            ❌ {error}
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
            ✅ {successMessage}
          </div>
        )}

        {/* STEP 1: Login Form */}
        {step === 'login' && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-2xl">
            <div className="space-y-4">
              {/* Email/Phone Input */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  Email hoặc Số điện thoại
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    value={formData.identifier}
                    onChange={handleChange}
                    className="pl-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="admin@example.com"
                    disabled={loading}
                    maxLength={255}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    disabled={loading}
                    maxLength={128}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Đang xử lý...
                </>
              ) : (
                'Đăng nhập'
              )}
            </button>

            {/* Test Credentials Info */}
            {import.meta.env.DEV && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                <p className="font-semibold text-blue-700 mb-1">🧪 Test Admin Account:</p>
                <p className="text-blue-600">Email: admin@example.com</p>
                <p className="text-blue-600">Password: admin123</p>
              </div>
            )}
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 'otp' && (
          <div className="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-2xl">
            <OTPInput
              length={6}
              onComplete={handleOTPComplete}
              onResend={handleResendOTP}
              email={maskedEmail}
              expiresIn={otpExpiresIn}
            />

            {loading && (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="animate-spin" size={20} />
                <span className="text-sm">Đang xác thực...</span>
              </div>
            )}

            <button
              onClick={() => {
                setStep('login');
                setError('');
                setSuccessMessage('');
              }}
              disabled={loading}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors disabled:text-gray-400"
            >
              ← Quay lại đăng nhập
            </button>
          </div>
        )}

        {/* Debug Info */}
        {import.meta.env.DEV && (
          <div className="mt-6 p-4 bg-gray-800 rounded-lg text-xs">
            <p className="font-semibold text-gray-300 mb-1">Debug Info:</p>
            <p className="text-gray-400">API URL: {API_URL}</p>
            <p className="text-gray-400">Step: {step}</p>
            <p className="text-gray-400">Mode: {import.meta.env.MODE}</p>
            <p className="text-gray-400">Email: {maskedEmail || 'N/A'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;